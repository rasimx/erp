import NiceModal from '@ebay/nice-modal-react';
import {
  Button,
  NumberInput,
  Radio,
  Table,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DateInput, DateInputProps } from '@mantine/dates';
import { format, parse } from 'date-fns';
import dayjs from 'dayjs';
import { FormikErrors, FormikProps, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import pick from 'lodash/pick';
import React, { type FC, useCallback, useEffect, useMemo } from 'react';
import { array, mixed, number, object, ObjectSchema, string } from 'yup';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { ProductBatchDetail } from '../../api/product-batch/product-batch-detail.gql';
// import { ProportionType } from '@/gql-types/graphql';
import { CreateOperationDto, ProportionType } from '../../gql-types/graphql';
import { fromRouble, toRouble } from '../../utils';
import withModal from '../withModal';
import classes from './OperationForm.module.scss';

// import {
//   ProductBatchStateItem,
//   selectCheckedProductBatchList,
// } from '../../api/product-batch/product-batch.slice';
// import { createOperation } from './operation.api';

export interface Props {
  productBatches: ProductBatch[] | ProductBatchDetail[];
  closeModal: () => void;
  initialValues: Partial<CreateOperationDto>;
  onSubmit: (
    values: CreateOperationDto,
    formikBag: FormikBag<Props, CreateOperationDto>,
  ) => Promise<unknown>;
}

export type ProductBatchOperationInputItem = {
  productBatchId: number;
  date: string;
  proportion: number | null;
};

type A = {
  productBatchId: number;
  proportion: number;
  cost: number;
  value: number;
};

type B = {
  [key in ProportionType]: Map<number, A>;
};

type DataCellProps = {
  type: ProportionType;
  row: ProductBatch | ProductBatchDetail;
  items: B;
  label: string;
  getValue?: (value: number) => number;
};

const DataCell: FC<DataCellProps> = ({ type, row, items, label, getValue }) => {
  const item = items[type].get(row.id);
  if (!item) throw new Error();

  return (
    <Table.Td style={{ padding: 0, border: '1px solid gray' }}>
      <Tooltip
        withArrow
        label={
          <div>
            Цена за единицу товара - {(item.cost / row.count).toFixed(2)} р
          </div>
        }
      >
        <div className={classes.value}>
          <div>
            {getValue ? getValue(item.value) : item.value} {label}
          </div>
          <div>{item.proportion} %</div>
          <div>{Number.isNaN(item.cost) ? '—' : toRouble(item.cost)} р</div>
        </div>
      </Tooltip>
    </Table.Td>
  );
};

const Form: FC<Props & FormikProps<CreateOperationDto>> = props => {
  const {
    productBatches,
    setFieldValue,
    handleSubmit,
    values,
    handleChange,
    handleBlur,
    touched,
    errors,
  } = props;
  console.log(errors);

  const percentages = useCallback(
    (
      field: keyof Pick<
        ProductBatch | ProductBatchDetail,
        'volume' | 'weight' | 'costPricePerUnit'
      >,
    ) => {
      const getValue = (item: ProductBatch | ProductBatchDetail) =>
        field == 'costPricePerUnit'
          ? Number(toRouble(item.costPricePerUnit * item.count))
          : item[field];
      const totalSum = productBatches.reduce(
        (acc, item) => acc + getValue(item),
        0,
      );

      const percentages = productBatches.map(item => ({
        ...item,
        proportion: Math.floor((getValue(item) / totalSum) * 1000) / 10,
      }));

      const remainder =
        100 - percentages.reduce((acc, val) => acc + val.proportion, 0);

      percentages.sort((a, b) => b.proportion - a.proportion);

      if (remainder !== 0) {
        percentages[0].proportion = Number(
          (percentages[0].proportion + remainder).toFixed(2),
        );
      }

      percentages.sort((a, b) => a.id - b.id);
      return new Map(
        percentages.map(item => [
          item.id,
          {
            productBatchId: item.id,
            proportion: item.proportion,
            cost: Number((values.cost * item.proportion).toFixed(0)),
            value: getValue(item),
          },
        ]),
      );
    },
    [productBatches, values.cost],
  );

  const items = useMemo<B>(() => {
    return {
      [ProportionType.weight]: percentages('weight'),
      [ProportionType.volume]: percentages('volume'),
      [ProportionType.costPrice]: percentages('costPricePerUnit'),
      [ProportionType.manual]: percentages('costPricePerUnit'), // временно
      [ProportionType.equal]: new Map(
        productBatches.map(item => [
          item.id,
          {
            productBatchId: item.id,
            proportion: 100,
            cost: Number((values.cost * 100).toFixed(0)),
            value: values.cost,
          },
        ]),
      ), // временно
    };
  }, [percentages, values.cost]);

  useEffect(() => {
    if (items && values.proportionType) {
      setFieldValue(
        'productBatchProportions',
        [...items[values.proportionType].values()].map(item =>
          pick(item, ['productBatchId', 'proportion', 'cost']),
        ),
      );
    }
  }, [items, values.proportionType]);

  const dateParser: DateInputProps['dateParser'] = input => {
    if (input === 'WW2') {
      return new Date(1939, 8, 1);
    }

    return dayjs(input, 'YYYY-MM-DD').toDate();
  };

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off">
      <TextInput
        required
        label="Название"
        name="name"
        value={values.name}
        onBlur={handleBlur}
        onChange={handleChange}
        error={touched.name && Boolean(errors.name)}
      />
      <NumberInput
        required
        id="outlined-required"
        label="стоимость за партию"
        allowNegative={false}
        fixedDecimalScale
        suffix="₽"
        decimalScale={2}
        value={values.cost ?? ''}
        onBlur={handleBlur}
        onChange={val => {
          setFieldValue('cost', val);
        }}
        error={touched.cost && Boolean(errors.cost)}
      />
      <DateInput
        dateParser={dateParser}
        valueFormat="YYYY-MM-DD"
        label="Дата"
        value={
          values.date ? parse(values.date, 'yyyy-MM-dd', new Date()) : null
        }
        // error={touched.date && Boolean(errors.date)}
        // onBlur={handleBlur}
        onChange={value => {
          setFieldValue(
            'date',
            value ? format(value, 'yyyy-MM-dd') : undefined,
          );
        }}
      />

      <div>
        {productBatches.length > 1 && (
          <div style={{ marginTop: '10px' }}>
            <Table style={{ minWidth: 650 }}>
              <Table.Thead>
                <Table.Tr style={{ textWrap: 'nowrap' }}>
                  <Table.Th>Распределить стоимость</Table.Th>
                  <Table.Th>
                    <Radio
                      label="По весу"
                      variant="outline"
                      name="proportionType"
                      checked={values.proportionType == ProportionType.weight}
                      value={ProportionType.weight}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                  </Table.Th>
                  <Table.Th>
                    <Radio
                      label="По объему"
                      name="proportionType"
                      checked={values.proportionType == ProportionType.volume}
                      value={ProportionType.volume}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                  </Table.Th>
                  <Table.Th>
                    <Radio
                      label="По с/с"
                      name="proportionType"
                      checked={
                        values.proportionType == ProportionType.costPrice
                      }
                      value={ProportionType.costPrice}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                  </Table.Th>
                  {/*<TableCell>*/}
                  {/*  <Radio*/}
                  {/*    size="small"*/}
                  {/*    checked={proportionType == ProportionType.manual}*/}
                  {/*    onChange={handleRadio}*/}
                  {/*    value={ProportionType.manual}*/}
                  {/*  />*/}
                  {/*  <span>Произвольно</span>*/}
                  {/*</TableCell>*/}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {productBatches.map(row => (
                  <Table.Tr key={row.id}>
                    <Table.Td component="th" scope="row">
                      {row.id}
                    </Table.Td>
                    <DataCell
                      items={items}
                      type={ProportionType.weight}
                      row={row}
                      label="кг"
                      getValue={value => value / 1000}
                    />
                    <DataCell
                      items={items}
                      type={ProportionType.volume}
                      row={row}
                      label="л"
                    />
                    <DataCell
                      items={items}
                      type={ProportionType.costPrice}
                      row={row}
                      label="руб"
                    />
                    {/*<TableCell sx={{ padding: '0 10px' }}>*/}
                    {/*  <Input />*/}
                    {/*</TableCell>*/}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        )}
      </div>
      <Button variant="contained" type="submit" style={{ marginTop: '10px' }}>
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
      date: string().required(),
      proportionType: mixed<ProportionType>()
        .oneOf(Object.values(ProportionType))
        .when('groupId', {
          is: (val: number | null) => !!val,
          then: schema => schema.required(),
        }),
      groupId: number().nullable(),
      productBatchProportions: array(
        object().shape({
          productBatchId: number().required(),
          cost: number().required(),
          proportion: number().required(),
        }),
      ).required(),
    });
  };

const OperationForm = withFormik<Props, CreateOperationDto>({
  validationSchema: () => createOperationValidationSchema(),
  mapPropsToValues: props => {
    return {
      proportionType:
        props.productBatches.length == 1 ? ProportionType.equal : undefined,
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
    return formikBag.props
      .onSubmit({ ...values, cost: fromRouble(values.cost) }, formikBag)
      .then(() => {
        formikBag.props.closeModal();
      });
  },
})(Form);

export default NiceModal.create(withModal(OperationForm));
