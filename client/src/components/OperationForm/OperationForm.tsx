import NiceModal from '@ebay/nice-modal-react';
import { format, parse } from 'date-fns';
import { FormikErrors, FormikProps, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { confirmDialog } from 'primereact/confirmdialog';
import { FloatLabel } from 'primereact/floatlabel';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import React, { type FC, useCallback } from 'react';
import { number, object, ObjectSchema, string } from 'yup';

import { CREATE_OPERATION_MUTATION } from '../../api/operation/operation.gql';
import apolloClient from '../../apollo-client';
import { CreateOperationDto } from '../../gql-types/graphql';
import { fromRouble } from '../../utils';
import withModal from '../withModal';
import classes from './OperationForm.module.scss';

export interface Props {
  closeModal: () => void;
  initialValues: Partial<CreateOperationDto>;
  onSubmit: (
    values: CreateOperationDto,
    formikBag: FormikBag<Props, CreateOperationDto>,
  ) => Promise<unknown>;
}

const Form: FC<Props & FormikProps<CreateOperationDto>> = props => {
  const {
    setFieldValue,
    setValues,
    handleSubmit,
    values,
    handleChange,
    handleBlur,
    errors,
  } = props;

  const changeNumberValue = useCallback(
    (fieldName: keyof CreateOperationDto) =>
      (event: InputNumberValueChangeEvent) => {
        if (event.value === values[fieldName]) return;
        const value = event.value;
        switch (fieldName) {
          case 'exchangeRate':
            setValues({
              ...values,
              exchangeRate: value,
              // @ts-ignore
              cost:
                values.currencyCost != null && value != null
                  ? Number((values.currencyCost * value).toFixed(2))
                  : null,
            });
            break;
          case 'currencyCost':
            setValues({
              ...values,
              currencyCost: value,
              // @ts-ignore
              cost:
                values.exchangeRate != null && value != null
                  ? Number((values.exchangeRate * value).toFixed(2))
                  : null,
            });
            break;
          case 'cost':
            setValues({
              ...values,
              // @ts-ignore
              cost: value,
              currencyCost: null,
              exchangeRate: null,
            });
            break;
          default:
            // skip
            setValues({ ...values });
        }
      },
    [values, setValues],
  );

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off">
      <div className={classes.field}>
        <FloatLabel>
          <InputText
            value={values.name}
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            className="p-inputtext-sm"
            id="formName"
          />
          <label htmlFor="formName">Название</label>
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
            value={values.exchangeRate}
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
            currency="CNY"
            locale="ru-RU"
            value={values.currencyCost}
            minFractionDigits={2}
            maxFractionDigits={2}
            name="currencyCost"
            onValueChange={changeNumberValue('currencyCost')}
            className={classes.input}
          />
          <label htmlFor="currencyCostPricePerUnit">Цена в валюте</label>
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <FloatLabel>
          <label htmlFor="operationsPrice">Цена</label>
          <InputNumber
            inputId="operationsPrice"
            required
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            value={values.cost}
            minFractionDigits={2}
            maxFractionDigits={2}
            onValueChange={changeNumberValue('cost')}
          />
        </FloatLabel>
      </div>
      <div className={classes.field}>
        <FloatLabel>
          <Calendar
            value={
              values.date ? parse(values.date, 'yyyy-MM-dd', new Date()) : null
            }
            onChange={e =>
              setFieldValue(
                'date',
                e.value ? format(e.value, 'yyyy-MM-dd') : undefined,
              )
            }
            dateFormat="yy-mm-dd"
          />
          <label htmlFor="operationsPrice">Дата</label>
        </FloatLabel>
      </div>

      <Button type="submit" style={{ marginTop: '10px' }}>
        Добавить
      </Button>
    </form>
  );
};

export const createOperationValidationSchema =
  (): ObjectSchema<CreateOperationDto> => {
    return object().shape({
      name: string().required(),
      cost: number().required(),
      currencyCost: number().nullable(),
      exchangeRate: number().nullable(),
      date: string().required(),
      productBatchId: number().required(),
    });
  };

const OperationForm = withFormik<Props, CreateOperationDto>({
  validationSchema: createOperationValidationSchema(),
  mapPropsToValues: props => {
    return {
      ...props.initialValues,
    } as CreateOperationDto;
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: CreateOperationDto) => {
    const errors: FormikErrors<CreateOperationDto> = {};
    // if (!values.email) {
    //   errors.email = 'Required';
    // } else if (!isValidEmail(values.email)) {
    //   errors.email = 'Invalid email address';
    // }
    return errors;
  },

  handleSubmit: (values, formikBag) => {
    confirmDialog({
      message: 'Вы уверены?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => {
        const dto = {
          ...values,
          cost: fromRouble(values.cost),
          exchangeRate: values.exchangeRate
            ? fromRouble(values.exchangeRate)
            : null,
          currencyCost: values.currencyCost
            ? fromRouble(values.currencyCost)
            : null,
        };
        apolloClient
          .mutate({
            mutation: CREATE_OPERATION_MUTATION,
            variables: {
              dto,
            },
          })
          .then(result => {
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
    });
  },
})(Form);

export default NiceModal.create(withModal(OperationForm));
