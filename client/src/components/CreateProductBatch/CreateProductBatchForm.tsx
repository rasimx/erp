import NiceModal from '@ebay/nice-modal-react';
import { Autocomplete, Button, NumberInput } from '@mantine/core';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Product } from '../../api/product/product.gql';
import { useProductList } from '../../api/product/product.hooks';
import { CREATE_PRODUCT_BATCH_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import { CreateProductBatchDto } from '../../gql-types/graphql';
import { fromRouble } from '../../utils';
import AutocompleteObject from '../AutocompleteObject/AutocompleteObject';
import withModal from '../withModal';
import {
  createProductBatchValidationSchema,
  FormProps,
  FormState,
  FormValues,
} from './types';

export interface Props {
  closeModal: () => void;
  initialValues: Partial<FormValues>;
  onSubmit: (
    values: FormValues,
    formikBag: FormikBag<Props, FormValues>,
  ) => Promise<unknown>;
}

const Form: FC<Props & FormProps> = props => {
  const { setValues, handleSubmit } = props;
  const [state, setState] = useState<FormState>({});
  const [lastCountField, setLastCountField] = useState<
    'operationsPricePerUnit' | 'operationsPrice'
  >();

  useEffect(() => {
    setValues(values => ({
      ...values,
      count: state.count,
      productId: state.productId,
      operationsPrice: state.operationsPrice,
      costPricePerUnit: state.costPricePerUnit,
      operationsPricePerUnit: state.operationsPricePerUnit,
    }));
  }, [state]);

  const { items: productList } = useProductList();

  const autocompleteValue = useCallback(
    (item: Product) => `${item.sku}: ${item.name}`,
    [],
  );

  useEffect(() => {
    if (
      state.productId &&
      state.product?.id != state.productId &&
      productList.length
    ) {
      const product = productList.find(item => item.id === state.productId);
      if (product) setState(state => ({ ...state, product }));
    }
  }, [productList, state]);

  const changeProduct = useCallback(
    (product: Product | undefined) => {
      if (product) {
        setState(state => ({ ...state, productId: product.id, product }));
      } else
        setState(state => ({
          ...state,
          productId: undefined,
          product: undefined,
        }));
    },
    [setState],
  );

  const changeNumberValue = useCallback(
    (fieldName: keyof FormState) => (value: number | string) => {
      value = Number(value);
      switch (fieldName) {
        case 'operationsPricePerUnit':
          setState(state => ({
            ...state,
            operationsPricePerUnit: value,
            operationsPrice:
              state.count != null && value != null
                ? state.count * value
                : state.operationsPrice,
          }));
          setLastCountField(fieldName);
          break;
        case 'operationsPrice':
          setState(state => ({
            ...state,
            operationsPrice: value,
            operationsPricePerUnit:
              state.count != null && value != null
                ? value / state.count
                : state.operationsPricePerUnit,
          }));
          setLastCountField(fieldName);
          break;
        case 'count':
          setState(state => ({
            ...state,
            count: value,
            operationsPrice:
              lastCountField == 'operationsPricePerUnit' &&
              !!state.operationsPricePerUnit &&
              value
                ? Number((value * state.operationsPricePerUnit).toFixed(2))
                : state.operationsPrice,
            operationsPricePerUnit:
              lastCountField == 'operationsPrice' &&
              !!state.operationsPrice &&
              value
                ? Number((state.operationsPrice / value).toFixed(2))
                : state.operationsPricePerUnit,
          }));
          break;
        default:
          setState(state => ({
            ...state,
            [fieldName]: value,
          }));
      }
    },
    [setState, state],
  );

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off">
      <AutocompleteObject
        label="Товар"
        placeholder="Выберите товар"
        objDataList={productList}
        valueObj={state.product}
        onChangeObj={changeProduct}
        getValue={autocompleteValue}
      />

      <NumberInput
        required
        label="Количество"
        placeholder="шт"
        allowNegative={false}
        suffix=" шт"
        decimalScale={0}
        value={state.count ?? undefined}
        onChange={changeNumberValue('count')}
        hideControls
      />
      <NumberInput
        required
        label="Себестоимость единицы"
        placeholder="₽"
        allowNegative={false}
        fixedDecimalScale
        suffix="₽"
        decimalScale={2}
        value={state.costPricePerUnit ?? ''}
        onChange={changeNumberValue('costPricePerUnit')}
        hideControls
      />
      <NumberInput
        required
        label="Сопутствующие расходы за единицу"
        placeholder="₽"
        allowNegative={false}
        fixedDecimalScale
        suffix="₽"
        decimalScale={2}
        value={state.operationsPricePerUnit ?? ''}
        onChange={changeNumberValue('operationsPricePerUnit')}
        hideControls
      />
      <NumberInput
        required
        label="Сопутствующие расходы на всю партию"
        placeholder="₽"
        allowNegative={false}
        fixedDecimalScale
        suffix="₽"
        decimalScale={2}
        value={state.operationsPrice ?? ''}
        onChange={changeNumberValue('operationsPrice')}
        hideControls
      />
      <Button
        type="submit"
        // disabled={!newBathes.length}
      >
        Добавить
      </Button>
    </form>
  );
};

export const CreateProductBatchForm = withFormik<Props, FormValues>({
  validationSchema: () => createProductBatchValidationSchema(),
  mapPropsToValues: props => {
    return {
      ...props.initialValues,
    } as FormValues;
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {};
    // if (!values.email) {
    //   errors.email = 'Required';
    // } else if (!isValidEmail(values.email)) {
    //   errors.email = 'Invalid email address';
    // }
    return errors;
  },

  handleSubmit: (values, formikBag) => {
    const dto = values as CreateProductBatchDto;
    apolloClient
      .mutate({
        mutation: CREATE_PRODUCT_BATCH_MUTATION,
        variables: {
          dto: {
            ...dto,
            costPricePerUnit: fromRouble(dto.costPricePerUnit),
            operationsPrice: dto.operationsPrice
              ? fromRouble(dto.operationsPrice)
              : 0,
            operationsPricePerUnit: dto.operationsPricePerUnit
              ? fromRouble(dto.operationsPricePerUnit)
              : 0,
          },
        },
      })
      .then(result => {
        console.log(result);
      });

    // return formikBag.props
    //   .onSubmit(
    //     { ...values, costPricePerUnit: fromRouble(values.costPricePerUnit) },
    //     formikBag,
    //   )
    //   .then(() => {
    //     formikBag.props.closeModal();
    //   });
  },
})(Form);

export const CreateProductBatchModal = NiceModal.create(
  withModal(CreateProductBatchForm, {
    header: 'Добавить партию',
  }),
);
