import NiceModal from '@ebay/nice-modal-react';
import { Box, Typography } from '@mui/material';
import { FormikErrors, FormikProps, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
} from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber';
import React, { type FC, useCallback, useEffect, useState } from 'react';

import { Product } from '../../api/product/product.gql';
import { useProductSetList } from '../../api/product/product.hooks';
import { CREATE_PRODUCT_BATCH_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import { CreateProductBatchDto } from '../../gql-types/graphql';
import { fromRouble } from '../../utils';
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

  const { items: productList } = useProductSetList();

  const [autocompleteInput, setAutocompleteInput] = useState('');

  useEffect(() => {
    if (
      state.productId &&
      state.product?.id != state.productId &&
      productList.length
    ) {
      const product = productList.find(item => item.id === state.productId);
      if (product) setState(state => ({ ...state, product }));
    }
    if (!state.productId && !!state.product)
      setState(state => ({ ...state, productSet: null }));
  }, [productList, state]);

  const changeProduct = useCallback(
    (e: AutoCompleteSelectEvent) => {
      if (e.value.id) {
        setState(state => ({ ...state, productId: e.value.id }));
      } else setState(state => ({ ...state, productId: null }));
    },
    [setState],
  );

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([
    ...productList,
  ]);

  const search = useCallback(
    (event: AutoCompleteCompleteEvent) => {
      let _filteredProducts;
      if (!event.query.trim().length) {
        _filteredProducts = [...productList];
      } else {
        _filteredProducts = productList.filter(product => {
          return (
            product.name.toLowerCase().includes(event.query.toLowerCase()) ||
            product.sku.toLowerCase().includes(event.query.toLowerCase())
          );
        });
      }
      setFilteredProducts(
        _filteredProducts.map(item => ({
          ...item,
          name: `${item.sku}: ${item.name}`,
        })),
      );
    },
    [productList],
  );

  const changeNumberValue = useCallback(
    (fieldName: keyof FormState) => (e: InputNumberChangeEvent) => {
      switch (fieldName) {
        case 'operationsPricePerUnit':
          setState(state => ({
            ...state,
            operationsPricePerUnit: e.value,
            operationsPrice:
              state.count != null && e.value != null
                ? state.count * e.value
                : state.operationsPrice,
          }));
          break;
        case 'operationsPrice':
          setState(state => ({
            ...state,
            operationsPrice: e.value,
            operationsPricePerUnit:
              state.count != null && e.value != null
                ? e.value / state.count
                : state.operationsPricePerUnit,
          }));
          break;
        default:
          setState(state => ({
            ...state,
            [fieldName]: e.value,
          }));
      }
    },
    [setState],
  );

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off">
      <div className="w-30rem">
        <div className="p-float-label mt-5 field">
          <AutoComplete
            id="ac"
            field="name"
            onClear={e => {
              setState(state => ({ ...state, productId: null }));
            }}
            removeTokenIcon="pi pi-times"
            value={state.product ?? autocompleteInput}
            completeMethod={search}
            suggestions={filteredProducts}
            onChange={e => setAutocompleteInput(e.value)}
            onSelect={changeProduct}
            className="w-full block"
            inputClassName="w-full"
          />

          <label htmlFor="ac">Выбрать товар</label>
        </div>
        <div className="p-float-label mt-5 field">
          <InputNumber
            className="w-full"
            id="fullCount"
            value={state.count}
            min={0}
            onChange={changeNumberValue('count')}
          />
          <label>Количество</label>
        </div>
        <div className="p-float-label mt-5">
          <InputNumber
            className="w-full"
            id="costPricePerUnit"
            min={0}
            minFractionDigits={2}
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            value={state.costPricePerUnit}
            onChange={changeNumberValue('costPricePerUnit')}
          />
          <label>Себестоимость единицы</label>
        </div>
        <div className="p-float-label mt-5">
          <InputNumber
            className="w-full"
            id="operationsPricePerUnit"
            min={0}
            minFractionDigits={2}
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            value={state.operationsPricePerUnit}
            onChange={changeNumberValue('operationsPricePerUnit')}
          />
          <label>Сопутствующие расходы за единицу</label>
        </div>
        <div className="p-float-label mt-5">
          <InputNumber
            className="w-full"
            id="operationsPrice"
            min={0}
            minFractionDigits={2}
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            value={state.operationsPrice}
            onChange={changeNumberValue('operationsPrice')}
          />
          <label>Сопутствующие расходы на всю партию</label>
        </div>
        <Button
          className="mt-5"
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          type="submit"
          // disabled={!newBathes.length}
        />
      </div>
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
