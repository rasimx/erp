import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import omit from 'lodash/omit';
import { Button } from 'primereact/button';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import {
  Column,
  ColumnBodyOptions,
  ColumnEditorOptions,
} from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { FloatLabel } from 'primereact/floatlabel';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Row } from 'primereact/row';
import { Nullable } from 'primereact/ts-helpers';
import React, { type FC, ReactNode, useCallback, useState } from 'react';

import { Product } from '../../api/product/product.gql';
import { CREATE_PRODUCT_BATCH_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import { CreateProductBatchListDto } from '../../gql-types/graphql';
import { fromRouble, isDefined, isInteger, isNil, isNumber } from '../../utils';
import ProductSelect from '../Autocomplete/ProductSelect';
import withModal from '../withModal';
import classes from './CreateProductBatchForm.module.scss';
import {
  createProductBatchItemValidationSchema,
  createProductBatchValidationSchema,
  DataRow,
  DataRowKey,
  FormProps,
  FormValues,
} from './types';

export interface Props {
  closeModal: () => void;
  initialValues: FormValues;
  onSubmit: (
    values: FormValues,
    formikBag: FormikBag<Props, FormValues>,
  ) => Promise<unknown>;
}

const Form: FC<Props & FormProps> = props => {
  const {
    setValues,
    handleSubmit,
    values,
    setFieldValue,
    handleBlur,
    handleChange,
    touched,
    errors,
  } = props;

  const [lastChangedFields, setLastChangedFields] = useState<
    Array<Array<DataRowKey>>
  >([]);

  const updateLastChangedFields = useCallback(
    (rowIndex: number, fieldName: DataRowKey) => {
      setLastChangedFields(lastChangedFields => {
        if (lastChangedFields[rowIndex]) {
          const index = lastChangedFields[rowIndex].indexOf(fieldName);
          if (index > -1) {
            lastChangedFields[rowIndex].splice(index, 1);
          }
          lastChangedFields[rowIndex] = [
            ...lastChangedFields[rowIndex],
            fieldName,
          ];
        } else {
          lastChangedFields[rowIndex] = [fieldName];
        }

        return lastChangedFields;
      });
    },
    [lastChangedFields, setLastChangedFields],
  );
  const lastChangedFieldsOrder = useCallback(
    (rowIndex: number, fieldNameA: DataRowKey, fieldNameB: DataRowKey) =>
      lastChangedFields[rowIndex]?.indexOf(fieldNameA) >
      lastChangedFields[rowIndex]?.indexOf(fieldNameB),
    [lastChangedFields],
  );

  const getNumberValues = useCallback(
    (
      fieldName: DataRowKey,
      value: Nullable<number>,
      rowData: DataRow,
      rowIndex: number,
    ) => {
      if (value === rowData[fieldName]) return rowData;

      let result = rowData;

      switch (fieldName) {
        case 'currencyCostPricePerUnit':
          result = {
            currencyCostPricePerUnit: value,
            costPricePerUnit:
              isNumber(values.exchangeRate) && isNumber(value)
                ? Number((values.exchangeRate * value).toFixed(2))
                : null,
          };
          break;
        case 'costPricePerUnit':
          result = {
            costPricePerUnit: value as number,
            currencyCostPricePerUnit: null,
          };
          break;
        case 'operationsPricePerUnit':
          result = {
            operationsPricePerUnit: value,
            operationsPrice:
              isNumber(rowData.count) && isNumber(value)
                ? rowData.count * value
                : rowData.operationsPrice,
          };
          break;
        case 'operationsPrice': {
          const operationsPricePerUnit =
            isNumber(rowData.count) && isNumber(value)
              ? value / rowData.count
              : rowData.operationsPricePerUnit;
          result = {
            operationsPrice: value,
            operationsPricePerUnit: isNumber(operationsPricePerUnit)
              ? operationsPricePerUnit
              : 0,
          };
          break;
        }
        case 'count': {
          const operationsPricePerUnit =
            lastChangedFieldsOrder(
              rowIndex,
              'operationsPrice',
              'operationsPricePerUnit',
            ) &&
            isNumber(rowData.operationsPrice) &&
            isNumber(value)
              ? Number((rowData.operationsPrice / value).toFixed(2))
              : rowData.operationsPricePerUnit;

          const operationsPrice =
            lastChangedFieldsOrder(
              rowIndex,
              'operationsPricePerUnit',
              'operationsPrice',
            ) &&
            isNumber(rowData.operationsPricePerUnit) &&
            value
              ? Number((value * rowData.operationsPricePerUnit).toFixed(2))
              : rowData.operationsPrice;

          result = {
            count: value,
            operationsPrice,
            operationsPricePerUnit: isNumber(operationsPricePerUnit)
              ? operationsPricePerUnit
              : 0,
          };
          break;
        }

        default:
          return rowData;
      }

      updateLastChangedFields(rowIndex, fieldName);

      return result;
    },
    [values, updateLastChangedFields, lastChangedFieldsOrder],
  );

  console.log('errors', errors);

  const productBodyTemplate = useCallback(
    (rowData: DataRow, options: ColumnBodyOptions) => {
      return rowData.product?.sku;
    },
    [],
  );

  const getRowFieldValue = useCallback(
    ({ rowIndex, field }: ColumnEditorOptions) => {
      const row = values.items?.find(item => item.index == rowIndex);

      return row ? row[field as DataRowKey] : null;
    },

    [values],
  );

  const numberValueChangeHandle = useCallback(
    ({ rowIndex, field }: ColumnEditorOptions) =>
      (e: InputNumberValueChangeEvent) => {
        setValues(values => {
          const result = {
            ...values,
            items: values.items?.map(item =>
              item.index != rowIndex
                ? item
                : {
                    ...item,
                    ...getNumberValues(
                      field as DataRowKey,
                      e.value,
                      item,
                      rowIndex,
                    ),
                  },
            ),
          };
          return result;
        });
      },
    [setValues, getNumberValues],
  );

  const productEditor = useCallback(
    (options: ColumnEditorOptions): ReactNode => {
      const onChangeHandle = (product: Nullable<Product>) => {
        setValues(values => {
          const result = {
            ...values,
            items: values.items?.map(item =>
              item.index != options.rowIndex
                ? item
                : {
                    ...item,
                    product,
                    productId: product?.id,
                  },
            ),
          };
          return result;
        });
      };
      return (
        <ProductSelect
          value={getRowFieldValue(options) as Product}
          onChange={onChangeHandle}
        />
      );
    },
    [getRowFieldValue, numberValueChangeHandle],
  );

  const countBodyTemplate = useCallback(
    (rowData: DataRow, options: ColumnBodyOptions) => {
      return rowData.count;
    },
    [],
  );
  const countEditor = useCallback(
    (options: ColumnEditorOptions) => {
      return (
        <InputNumber
          required
          placeholder=" шт"
          suffix=" шт"
          maxFractionDigits={0}
          min={0}
          value={getRowFieldValue(options) as number}
          onValueChange={numberValueChangeHandle(options)}
          className={classes.input}
        />
      );
    },
    [values, numberValueChangeHandle, getRowFieldValue],
  );

  const priceBodyTemplate = useCallback(
    (currency: 'CNY' | 'RUB', field: DataRowKey) => (rowData: DataRow) => {
      const value = rowData[field];
      return isNumber(value)
        ? new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency,
          }).format(value)
        : '';
    },
    [],
  );

  const priceEditor = useCallback(
    (currency: 'CNY' | 'RUB') => (options: ColumnEditorOptions) => {
      return (
        <InputNumber
          required
          mode="currency"
          currency={currency}
          locale="ru-RU"
          value={getRowFieldValue(options) as number}
          minFractionDigits={2}
          maxFractionDigits={2}
          min={0}
          onValueChange={numberValueChangeHandle(options)}
          className={classes.input}
        />
      );
    },
    [values, numberValueChangeHandle, getRowFieldValue],
  );

  const removeBodyTemplate = useCallback(
    (rowData: DataRow) => {
      const onClick = () => {
        void setValues(values => ({
          ...values,
          items: values.items?.filter(item => item.index != rowData.index),
        }));
      };
      return <Button type="button" icon="pi pi-trash" onClick={onClick} />;
    },
    [setValues],
  );

  const [newItem, setNewItem] = React.useState<DataRow>({
    operationsPrice: 0,
    operationsPricePerUnit: 0,
  });

  const handleAddRow = useCallback(() => {
    const value = {
      ...newItem,
      productId: newItem.product?.id,
    };

    createProductBatchItemValidationSchema()
      .validate(value)
      .catch(e => console.log(e));

    if (createProductBatchItemValidationSchema().isValidSync(value)) {
      const items = values.items || [];
      void setFieldValue('items', [
        ...items,
        { ...newItem, index: values.items?.length || 0 },
      ]);

      setNewItem({ operationsPrice: 0, operationsPricePerUnit: 0 } as DataRow);
    }
  }, [newItem, setFieldValue, values]);

  const newItemProductChange = useCallback(
    (product: Nullable<Product>) => {
      setNewItem(newItem => ({
        ...newItem,
        product,
        productId: product?.id,
      }));
    },
    [setNewItem],
  );
  const newItemNumberChange = useCallback(
    (fieldName: DataRowKey) => (e: InputNumberValueChangeEvent) => {
      setNewItem(newItem => ({
        ...newItem,
        ...getNumberValues(
          fieldName,
          e.value,
          newItem,
          values.items?.length || 0,
        ),
      }));
    },
    [setNewItem, getNumberValues, values],
  );

  const exchangeRateChange = useCallback(
    (e: InputNumberValueChangeEvent) => {
      void setValues(values => ({
        ...values,
        exchangeRate: e.value,
        items: values.items?.map(item => ({
          ...item,
          costPricePerUnit:
            isNumber(item.currencyCostPricePerUnit) && isNumber(e.value)
              ? Number((item.currencyCostPricePerUnit * e.value).toFixed(2))
              : item.costPricePerUnit,
        })),
      }));
      setNewItem(newItem => ({
        ...newItem,
        costPricePerUnit:
          newItem.currencyCostPricePerUnit != null && e.value != null
            ? Number((newItem.currencyCostPricePerUnit * e.value).toFixed(2))
            : newItem.costPricePerUnit,
      }));
    },
    [setValues, setNewItem],
  );

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer={
            <ProductSelect
              value={newItem.product}
              onChange={newItemProductChange}
            />
          }
        />
        <Column
          footer={
            <InputNumber
              required
              placeholder=" шт"
              suffix=" шт"
              maxFractionDigits={0}
              min={0}
              value={newItem.count}
              onValueChange={newItemNumberChange('count')}
              className={classes.input}
            />
          }
        />
        <Column
          footer={
            <InputNumber
              required
              mode="currency"
              currency="CNY"
              locale="ru-RU"
              value={newItem.currencyCostPricePerUnit}
              min={0}
              minFractionDigits={2}
              onValueChange={newItemNumberChange('currencyCostPricePerUnit')}
              maxFractionDigits={2}
              className={classes.input}
            />
          }
        />
        <Column
          footer={
            <InputNumber
              required
              mode="currency"
              currency="RUB"
              locale="ru-RU"
              value={newItem.costPricePerUnit}
              min={0}
              minFractionDigits={2}
              maxFractionDigits={2}
              onValueChange={newItemNumberChange('costPricePerUnit')}
              className={classes.input}
            />
          }
        />
        <Column
          footer={
            <InputNumber
              required
              mode="currency"
              currency="RUB"
              locale="ru-RU"
              value={newItem.operationsPricePerUnit}
              min={0}
              minFractionDigits={2}
              maxFractionDigits={2}
              onValueChange={newItemNumberChange('operationsPricePerUnit')}
              className={classes.input}
            />
          }
        />
        <Column
          footer={
            <InputNumber
              required
              mode="currency"
              currency="RUB"
              locale="ru-RU"
              value={newItem.operationsPrice}
              min={0}
              minFractionDigits={2}
              maxFractionDigits={2}
              onValueChange={newItemNumberChange('operationsPrice')}
              className={classes.input}
            />
          }
        />
        <Column
          footer={
            <Button type="button" onClick={handleAddRow}>
              Добавить
            </Button>
          }
        />
      </Row>
    </ColumnGroup>
  );

  const groupCheckboxHandler = useCallback(
    (e: CheckboxChangeEvent) => {
      void setFieldValue('grouped', !!e.checked);
      if (!e.checked) setFieldValue('groupName', null);
    },
    [setFieldValue],
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
            onValueChange={exchangeRateChange}
            className={classes.input}
          />
          <label htmlFor="exchangeRate">Курс валют</label>
        </FloatLabel>
      </div>

      <DataTable
        value={values.items || []}
        editMode="cell"
        dataKey="index"
        // onRowEditChange={onRowEditChange}
        // onRowEditComplete={onRowEditComplete}
        tableStyle={{ maxWidth: '50rem' }}
        // rowEditValidator={rowEditValidator}
        // onRowEditCancel={onRowEditCancel}
        footerColumnGroup={footerGroup}
      >
        <Column
          field="product"
          header="Товар"
          style={{ width: '35%', minWidth: '200px' }}
          body={productBodyTemplate}
          editor={productEditor}
          // onCellEditComplete={onCellEditComplete}
        />
        <Column
          field="count"
          header="Кол-во"
          style={{ width: '5%' }}
          body={countBodyTemplate}
          editor={countEditor}
          // onCellEditComplete={onCellEditComplete}
        />
        <Column
          field="currencyCostPricePerUnit"
          header="С/С в валюте"
          style={{ width: '5%' }}
          body={priceBodyTemplate('CNY', 'currencyCostPricePerUnit')}
          editor={e => priceEditor('CNY')(e)}
          // onCellEditComplete={onCellEditComplete}
        />
        <Column
          field="costPricePerUnit"
          header="С/с в рублях"
          style={{ width: '25%' }}
          body={priceBodyTemplate('RUB', 'costPricePerUnit')}
          editor={e => priceEditor('RUB')(e)}
          // onCellEditComplete={onCellEditComplete}
        />
        <Column
          field="operationsPricePerUnit"
          header="С/расходы 1 шт"
          style={{ width: '25%' }}
          body={priceBodyTemplate('RUB', 'operationsPricePerUnit')}
          editor={e => priceEditor('RUB')(e)}
          // onCellEditComplete={onCellEditComplete}
        />
        <Column
          field="operationsPrice"
          header="С/расходы на все"
          style={{ width: '10%' }}
          body={priceBodyTemplate('RUB', 'operationsPrice')}
          editor={e => priceEditor('RUB')(e)}
          // onCellEditComplete={onCellEditComplete}
        />
        <Column
          // rowEditor={allowEdit}
          rowEditor={true}
          headerStyle={{ width: '10%', minWidth: '8rem' }}
          bodyStyle={{ textAlign: 'center' }}
          body={removeBodyTemplate}
        />
      </DataTable>
      <Button type="submit">Отправить</Button>

      <div className={classes.bottom}>
        <div>
          <Checkbox
            inputId="group"
            name="grouped"
            onBlur={handleBlur}
            onChange={groupCheckboxHandler}
            checked={!!values.grouped}
          />
          <label htmlFor="group" className="ml-2">
            Объединить в группу
          </label>
          {values.grouped && (
            <InputText
              value={values.groupName}
              name="groupName"
              onChange={handleChange}
              onBlur={handleBlur}
              className="p-inputtext-sm"
              placeholder="Название группы"
              invalid={touched.groupName && !!errors.groupName}
            />
          )}
        </div>
        <Button type="submit">Отправить</Button>
      </div>
    </form>
  );
};

export const CreateProductBatchForm = withFormik<Props, FormValues>({
  validationSchema: () => createProductBatchValidationSchema(),

  mapPropsToValues: props => {
    return {
      ...props.initialValues,
    };
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
    confirmDialog({
      message: 'Вы уверены?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => {
        const dto = {
          ...values,
          exchangeRate: isNumber(values.exchangeRate)
            ? fromRouble(values.exchangeRate)
            : null,
          items: [
            ...(values.items || []).map(dto => ({
              ...omit(dto, ['product', 'index']),
              currencyCostPricePerUnit: isNumber(dto.currencyCostPricePerUnit)
                ? fromRouble(dto.currencyCostPricePerUnit)
                : null,
              costPricePerUnit: fromRouble(dto.costPricePerUnit!),
              operationsPrice: dto.operationsPrice
                ? fromRouble(dto.operationsPrice)
                : 0,
              operationsPricePerUnit: dto.operationsPricePerUnit
                ? fromRouble(dto.operationsPricePerUnit)
                : 0,
            })),
          ],
        } as CreateProductBatchListDto;

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
              formikBag.props.onSubmit(values, formikBag);
            }
          })
          .catch(err => {
            alert('ERROR');
          });
      },
    });
  },
})(Form);

export const CreateProductBatchModal = NiceModal.create(
  withModal(CreateProductBatchForm, {
    header: 'Добавить партию',
  }),
);
