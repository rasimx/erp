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
import { RadioButton } from 'primereact/radiobutton';
import React, { type FC, useCallback } from 'react';
import { array, mixed, number, object, ObjectSchema, string } from 'yup';

import { CREATE_GROUP_OPERATION_MUTATION } from '../../api/operation/operation.gql';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { ProductBatchDetail } from '../../api/product-batch/product-batch-detail.gql';
import apolloClient from '../../apollo-client';
import {
  CreateGroupOperationDto,
  CreateOperationDto,
  ProportionType,
} from '../../gql-types/graphql';
import { fromRouble } from '../../utils';
import withModal from '../withModal';
import DataCell from './DataCell';
import classes from './GroupOperationForm.module.scss';
import { OperationFormContextProvider } from './GroupOperationFormContext';

export interface Props {
  productBatches: ProductBatch[] | ProductBatchDetail[];
  closeModal: () => void;
  initialValues: Partial<CreateGroupOperationDto>;
  onSubmit: (
    values: CreateGroupOperationDto,
    formikBag: FormikBag<Props, CreateGroupOperationDto>,
  ) => Promise<unknown>;
}

const Form: FC<Props & FormikProps<CreateGroupOperationDto>> = props => {
  const {
    productBatches,
    setFieldValue,
    setValues,
    handleSubmit,
    values,
    handleChange,
    handleBlur,
    errors,
  } = props;

  const changeNumberValue = useCallback(
    (fieldName: keyof CreateGroupOperationDto) =>
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

  console.log(errors);

  return (
    <OperationFormContextProvider {...props}>
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
                values.date
                  ? parse(values.date, 'yyyy-MM-dd', new Date())
                  : null
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

        <div>
          {productBatches.length > 1 && (
            <div style={{ marginTop: '10px' }}>
              <table style={{ minWidth: 650 }}>
                <thead>
                  <tr style={{ textWrap: 'nowrap' }}>
                    <th>Распределить стоимость</th>
                    <th>
                      <RadioButton
                        inputId="weightRadio"
                        name="proportionType"
                        value={ProportionType.weight}
                        onChange={e => setFieldValue('proportionType', e.value)}
                        checked={values.proportionType == ProportionType.weight}
                      />
                      <label htmlFor="weightRadio">По весу</label>
                    </th>
                    <th>
                      <RadioButton
                        inputId="volumeRadio"
                        name="proportionType"
                        value={ProportionType.volume}
                        onChange={e => setFieldValue('proportionType', e.value)}
                        checked={values.proportionType == ProportionType.volume}
                      />
                      <label htmlFor="volumeRadio">По объему</label>
                    </th>
                    <th>
                      <RadioButton
                        inputId="costPriceRadio"
                        name="proportionType"
                        value={ProportionType.costPricePerUnit}
                        onChange={e => setFieldValue('proportionType', e.value)}
                        checked={
                          values.proportionType ==
                          ProportionType.costPricePerUnit
                        }
                      />
                      <label htmlFor="costPriceRadio">По с/с единицы</label>
                    </th>
                    <th>
                      <RadioButton
                        inputId="costPriceRadio"
                        name="proportionType"
                        value={ProportionType.costPrice}
                        onChange={e => setFieldValue('proportionType', e.value)}
                        checked={
                          values.proportionType == ProportionType.costPrice
                        }
                      />
                      <label htmlFor="costPriceRadio">По с/с партии</label>
                    </th>
                    {/*<TableCell>*/}
                    {/*  <Radio*/}
                    {/*    size="small"*/}
                    {/*    checked={proportionType == ProportionType.manual}*/}
                    {/*    onChange={handleRadio}*/}
                    {/*    value={ProportionType.manual}*/}
                    {/*  />*/}
                    {/*  <span>Произвольно</span>*/}
                    {/*</TableCell>*/}
                  </tr>
                </thead>
                <tbody>
                  {productBatches.map(row => (
                    <tr key={row.id}>
                      <td>
                        {row.id}: {row.product.sku}
                      </td>
                      <DataCell
                        type={ProportionType.weight}
                        row={row}
                        label="кг"
                        getValue={value => value / 1000}
                      />
                      <DataCell
                        type={ProportionType.volume}
                        row={row}
                        label="л"
                      />
                      <DataCell
                        type={ProportionType.costPricePerUnit}
                        row={row}
                        label="руб"
                      />
                      <DataCell
                        type={ProportionType.costPrice}
                        row={row}
                        label="руб"
                      />
                      {/*<TableCell sx={{ padding: '0 10px' }}>*/}
                      {/*  <Input />*/}
                      {/*</TableCell>*/}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Button type="submit" style={{ marginTop: '10px' }}>
          Добавить
        </Button>
      </form>
    </OperationFormContextProvider>
  );
};

// export const createOperationValidationSchema =
//   (): ObjectSchema<CreateOperationDto> => {
//     return object().shape({
//       name: string().required(),
//       cost: number().required(),
//       currencyCost: number().nullable(),
//       exchangeRate: number().nullable(),
//       date: string().required(),
//       productBatchId: number().required(),
//     });
//   };

export const createGroupOperationValidationSchema =
  (): ObjectSchema<CreateGroupOperationDto> => {
    return object().shape({
      name: string().required(),
      cost: number().required(),
      currencyCost: number().nullable(),
      exchangeRate: number().nullable(),
      date: string().required(),
      proportionType: mixed<ProportionType>()
        .oneOf(Object.values(ProportionType))
        .when('groupId', {
          is: (val: number | null) => !!val,
          then: schema => schema.required(),
        }),
      groupId: number().nullable(),
      items: array(
        object().shape({
          productBatchId: number().required(),
          cost: number().required(),
          proportion: number().required(),
        }),
      ).required(),
    });
  };

const GroupOperationForm = withFormik<Props, CreateGroupOperationDto>({
  validationSchema: createGroupOperationValidationSchema(),
  mapPropsToValues: props => {
    return {
      proportionType:
        props.productBatches.length == 1 ? ProportionType.equal : undefined,
      ...props.initialValues,
    } as CreateGroupOperationDto;
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: CreateGroupOperationDto) => {
    const errors: FormikErrors<CreateGroupOperationDto> = {};
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
          items: values.items.map(item => ({
            ...item,
            cost: fromRouble(item.cost),
          })),
        };
        apolloClient
          .mutate({
            mutation: CREATE_GROUP_OPERATION_MUTATION,
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

export default NiceModal.create(withModal(GroupOperationForm));
