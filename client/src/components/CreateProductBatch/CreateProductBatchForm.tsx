import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { Button } from 'primereact/button';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
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
import ProductSelect from '../Autocomplete/ProductSelect';
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

  const changeProduct = useCallback(
    (product: Product | null) => {
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
    (fieldName: keyof FormState) => (event: InputNumberValueChangeEvent) => {
      const value = event.value;
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
      <ProductSelect
        value={state.product ?? null}
        onChange={changeProduct}
        initialId={state.productId}
      />

      <InputNumber
        required
        placeholder=" шт"
        suffix=" шт"
        maxFractionDigits={0}
        value={state.count}
        onValueChange={changeNumberValue('count')}
      />

      <div className="flex-auto">
        <label htmlFor="operationsPrice">Себестоимость единицы</label>
        <InputNumber
          inputId="operationsPrice"
          required
          mode="currency"
          currency="RUB"
          locale="ru-RU"
          value={state.costPricePerUnit}
          minFractionDigits={2}
          maxFractionDigits={2}
          onValueChange={changeNumberValue('costPricePerUnit')}
        />
      </div>
      <div className="flex-auto">
        <label htmlFor="operationsPrice">
          Сопутствующие расходы на единицу
        </label>
        <InputNumber
          inputId="operationsPrice"
          required
          mode="currency"
          currency="RUB"
          locale="ru-RU"
          value={state.operationsPricePerUnit}
          minFractionDigits={2}
          maxFractionDigits={2}
          onValueChange={changeNumberValue('operationsPricePerUnit')}
        />
      </div>
      <div className="flex-auto">
        <label htmlFor="operationsPrice">
          Сопутствующие расходы на всю партию
        </label>
        <InputNumber
          inputId="operationsPrice"
          required
          mode="currency"
          currency="RUB"
          locale="ru-RU"
          value={state.operationsPrice}
          minFractionDigits={2}
          maxFractionDigits={2}
          onValueChange={changeNumberValue('operationsPrice')}
        />
      </div>

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
