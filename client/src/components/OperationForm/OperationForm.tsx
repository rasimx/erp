import NiceModal from '@ebay/nice-modal-react';
import styled from '@emotion/styled';
import {
  Box,
  Button,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parse } from 'date-fns';
import { FormikErrors, FormikProps, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import pick from 'lodash/pick';
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { array, mixed, number, object, ObjectSchema, string } from 'yup';

// import { ProportionType } from '@/gql-types/graphql';
import {
  CreateOperationDto,
  ProductBatchFragment,
  ProportionType,
} from '../../gql-types/graphql';
import { toRouble } from '../../utils';
import withModal from '../withModal';

const style = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

// import {
//   ProductBatchStateItem,
//   selectCheckedProductBatchList,
// } from '../../api/product-batch/product-batch.slice';
// import { createOperation } from './operation.api';

const Value = styled('div')`
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  text-wrap: nowrap;
  height: 40px;
  line-height: 40px;
  width: 100%;

  div {
    flex-grow: 1;
    box-sizing: border-box;
    padding: 0 15px;

    &:nth-of-type(1) {
      background: antiquewhite;
      position: relative;
      padding-right: 10px;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        border-left: 10px solid transparent;
        border-bottom: 40px solid #eede93;
      }
    }

    &:nth-of-type(2) {
      background: #eede93;
      position: relative;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        border-left: 10px solid transparent;
        border-bottom: 40px solid #efefef;
      }
    }

    &:nth-of-type(3) {
      font-weight: bold;
      background: #efefef;
    }
  }
`;

export interface Props {
  groupId: number | null;
  productBatches: ProductBatchFragment[];
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
  row: ProductBatchFragment;
  items: B;
  label: string;
  getValue?: (value: number) => number;
};

const DataCell: FC<DataCellProps> = ({ type, row, items, label, getValue }) => {
  const item = items[type].get(row.id);
  if (!item) throw new Error();

  return (
    <TableCell sx={{ padding: 0, border: '1px solid gray' }}>
      <Tooltip
        arrow
        title={
          <div>
            <div>
              Цена за единицу товара - {(item.cost / row.count).toFixed(2)} р
            </div>
          </div>
        }
      >
        <Value>
          <div>
            {getValue ? getValue(item.value) : item.value} {label}
          </div>
          <div>{item.proportion} %</div>
          <div>{Number.isNaN(item.cost) ? '—' : toRouble(item.cost)} р</div>
        </Value>
      </Tooltip>
    </TableCell>
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

  const percentages = useCallback(
    (
      field: keyof Pick<
        ProductBatchFragment,
        'volume' | 'weight' | 'costPricePerUnit'
      >,
    ) => {
      const getValue = (item: ProductBatchFragment) =>
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

  return (
    <Box
      sx={style}
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
    >
      <TextField
        required
        id="outlined-required"
        label="Название"
        name="name"
        value={values.name}
        onBlur={handleBlur}
        onChange={handleChange}
        error={touched.name && Boolean(errors.name)}
      />

      <TextField
        required
        id="outlined-required"
        sx={{ mt: 1 }}
        type="number"
        label="стоимость за партию"
        name="cost"
        value={values.cost || ''}
        onBlur={handleBlur}
        onChange={handleChange}
        error={touched.cost && Boolean(errors.cost)}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          format="yyyy-MM-dd"
          sx={{ mt: 1 }}
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
      </LocalizationProvider>
      <div>
        {productBatches.length > 1 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow sx={{ textWrap: 'nowrap' }}>
                  <TableCell>Распределить стоимость</TableCell>
                  <TableCell>
                    <Radio
                      size="small"
                      name="proportionType"
                      checked={values.proportionType == ProportionType.weight}
                      value={ProportionType.weight}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    <span>По весу</span>
                  </TableCell>
                  <TableCell>
                    <Radio
                      size="small"
                      name="proportionType"
                      checked={values.proportionType == ProportionType.volume}
                      value={ProportionType.volume}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    <span>По объему</span>
                  </TableCell>
                  <TableCell>
                    <Radio
                      size="small"
                      name="proportionType"
                      checked={
                        values.proportionType == ProportionType.costPrice
                      }
                      value={ProportionType.costPrice}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    <span>По с/с</span>
                  </TableCell>
                  {/*<TableCell>*/}
                  {/*  <Radio*/}
                  {/*    size="small"*/}
                  {/*    checked={proportionType == ProportionType.manual}*/}
                  {/*    onChange={handleRadio}*/}
                  {/*    value={ProportionType.manual}*/}
                  {/*  />*/}
                  {/*  <span>Произвольно</span>*/}
                  {/*</TableCell>*/}
                </TableRow>
              </TableHead>
              <TableBody>
                {productBatches.map(row => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
      <Button variant="contained" type="submit" sx={{ mt: 1 }}>
        Добавить
      </Button>
    </Box>
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
      groupId: number(),
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
      proportionType: ProportionType.equal,
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
    return formikBag.props.onSubmit(values, formikBag).then(() => {
      formikBag.props.closeModal();
    });
  },
})(Form);

export default NiceModal.create(withModal(OperationForm));
