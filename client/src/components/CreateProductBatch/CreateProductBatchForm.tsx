import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { Button } from 'primereact/button';
import { FloatLabel } from 'primereact/floatlabel';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
import React, { type FC, useCallback, useEffect, useState } from 'react';

import { Product } from '../../api/product/product.gql';
import { CREATE_PRODUCT_BATCH_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import { CreateProductBatchDto } from '../../gql-types/graphql';
import { fromRouble } from '../../utils';
import ProductSelect from '../Autocomplete/ProductSelect';
import withModal from '../withModal';
import classes from './CreateProductBatchForm.module.scss';
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
  const [lastChangedFields, setLastChangedFields] = useState<
    Array<keyof FormValues>
  >([]);

  const updateLastChangedFields = useCallback(
    (fieldName: keyof FormValues) => {
      setLastChangedFields(lastChangedFields => {
        const index = lastChangedFields.indexOf(fieldName);
        if (index > -1) {
          lastChangedFields.splice(index, 1);
        }
        return [...lastChangedFields, fieldName];
      });
    },
    [lastChangedFields, setLastChangedFields],
  );
  const lastChangedFieldsOrder = useCallback(
    (fieldNameA: keyof FormValues, fieldNameB: keyof FormValues) =>
      lastChangedFields.indexOf(fieldNameA) >
      lastChangedFields.indexOf(fieldNameB),
    [lastChangedFields],
  );

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
      if (event.value === state[fieldName]) return;
      console.log('aaaa');
      const value = event.value;
      switch (fieldName) {
        case 'exchangeRate':
          setState(state => ({
            ...state,
            exchangeRate: value,
            costPricePerUnit:
              state.currencyCostPricePerUnit != null && value != null
                ? state.currencyCostPricePerUnit * value
                : null,
          }));
          updateLastChangedFields(fieldName);
          break;
        case 'currencyCostPricePerUnit':
          setState(state => ({
            ...state,
            currencyCostPricePerUnit: value,
            costPricePerUnit:
              state.exchangeRate != null && value != null
                ? state.exchangeRate * value
                : null,
          }));
          updateLastChangedFields(fieldName);
          break;
        case 'costPricePerUnit':
          setState(state => ({
            ...state,
            costPricePerUnit: value,
            exchangeRate: null,
            currencyCostPricePerUnit: null,
          }));
          updateLastChangedFields(fieldName);
          break;
        case 'operationsPricePerUnit':
          setState(state => ({
            ...state,
            operationsPricePerUnit: value,
            operationsPrice:
              state.count != null && value != null
                ? state.count * value
                : state.operationsPrice,
          }));
          updateLastChangedFields(fieldName);
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
          updateLastChangedFields(fieldName);
          break;
        case 'count':
          setState(state => ({
            ...state,
            count: value,
            operationsPrice:
              lastChangedFieldsOrder(
                'operationsPricePerUnit',
                'operationsPrice',
              ) &&
              !!state.operationsPricePerUnit &&
              value
                ? Number((value * state.operationsPricePerUnit).toFixed(2))
                : state.operationsPrice,
            operationsPricePerUnit:
              lastChangedFieldsOrder(
                'operationsPrice',
                'operationsPricePerUnit',
              ) &&
              !!state.operationsPrice &&
              value
                ? Number((state.operationsPrice / value).toFixed(2))
                : state.operationsPricePerUnit,
          }));
          updateLastChangedFields(fieldName);
          break;
        default:
          setState(state => ({
            ...state,
            [fieldName]: value,
          }));
      }
    },
    [setState, state, lastChangedFieldsOrder],
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      className={classes.form}
    >
      <div className={classes.field}>
        <FloatLabel>
          <ProductSelect
            value={state.product ?? null}
            onChange={changeProduct}
            initialId={state.productId}
          />
          <label>Продукт</label>
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <FloatLabel>
          <InputNumber
            required
            placeholder=" шт"
            suffix=" шт"
            maxFractionDigits={0}
            value={state.count}
            name="count"
            onValueChange={changeNumberValue('count')}
            className={classes.input}
          />
          <label>Количество</label>
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <FloatLabel>
          <InputNumber
            inputId="exchangeRate"
            required
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            value={state.exchangeRate}
            minFractionDigits={2}
            maxFractionDigits={2}
            name="exchangeRate"
            onValueChange={changeNumberValue('exchangeRate')}
            className={classes.input}
          />
          <label htmlFor="exchangeRate">Курс валют</label>
        </FloatLabel>
      </div>
      <div className={classes.field}>
        <FloatLabel>
          <InputNumber
            inputId="currencyCostPricePerUnit"
            required
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            value={state.currencyCostPricePerUnit}
            minFractionDigits={2}
            maxFractionDigits={2}
            name="currencyCostPricePerUnit"
            onValueChange={changeNumberValue('currencyCostPricePerUnit')}
            className={classes.input}
          />
          <label htmlFor="currencyCostPricePerUnit">
            Себестоимость в валюте
          </label>
        </FloatLabel>
      </div>
      <div className={classes.field}>
        <FloatLabel>
          <InputNumber
            inputId="operationsPrice"
            required
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            value={state.costPricePerUnit}
            minFractionDigits={2}
            maxFractionDigits={2}
            name="costPricePerUnit"
            onValueChange={changeNumberValue('costPricePerUnit')}
            className={classes.input}
          />
          <label htmlFor="operationsPrice">Себестоимость единицы</label>
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <FloatLabel>
          <InputNumber
            inputId="operationsPrice"
            required
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            value={state.operationsPricePerUnit}
            minFractionDigits={2}
            maxFractionDigits={2}
            name="operationsPricePerUnit"
            onValueChange={changeNumberValue('operationsPricePerUnit')}
            className={classes.input}
          />
          <label htmlFor="operationsPrice">
            Сопутствующие расходы на единицу
          </label>
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <FloatLabel>
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
            name="operationsPrice"
            onValueChange={changeNumberValue('operationsPrice')}
            className={classes.input}
          />
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <Button
          type="submit"
          // disabled={!newBathes.length}
        >
          Добавить
        </Button>
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
    const dto = {
      ...values,
      costPricePerUnit: fromRouble(values.costPricePerUnit!),
      operationsPrice: values.operationsPrice
        ? fromRouble(values.operationsPrice)
        : 0,
      operationsPricePerUnit: values.operationsPricePerUnit
        ? fromRouble(values.operationsPricePerUnit)
        : 0,
    } as CreateProductBatchDto;

    apolloClient
      .mutate({
        mutation: CREATE_PRODUCT_BATCH_MUTATION,
        variables: {
          dto,
        },
      })
      .then(result => {
        console.log(result);
        if (result.errors?.length) {
          alert('ERROR');
        } else {
          formikBag.props.closeModal();
          formikBag.props.onSubmit(dto, formikBag);
        }
      })
      .catch(err => {
        alert('ERROR');
      });
  },
})(Form);

export const CreateProductBatchModal = NiceModal.create(
  withModal(CreateProductBatchForm, {
    header: 'Добавить партию',
  }),
);
