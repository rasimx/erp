import NiceModal, { useModal } from '@ebay/nice-modal-react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';
import { FormikErrors, FormikProps, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import React, { FC, useState } from 'react';
import { array, number, object, ObjectSchema, string } from 'yup';

import {
  CreateProductBatchGroupDto,
  StatusFragment,
} from '../../gql-types/graphql';
import CreateProductBatchForm, {
  createProductBatchValidationSchema,
  FormValues as CreateProductBatchFormValues,
} from '../CreateProductBatch/ProductBatchForm';
import withModal from '../withModal';
import SelectExistsProductBatchForm, {
  FormValues as SelectProductBatchFormValues,
  selectProductBatchValidationSchema,
} from './SelectExistsProductBatchForm';

const style = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

type FormValues = Omit<
  CreateProductBatchGroupDto,
  'existProductBatchIds' | 'newProductBatches'
> & {
  existProductBatches: SelectProductBatchFormValues[];
  newProductBatches: CreateProductBatchFormValues[];
};
type Props = {
  groupStatus: StatusFragment;
  closeModal: () => void;
  onSubmit: (
    values: FormValues,
    formikBag: FormikBag<Props, FormValues>,
  ) => Promise<unknown>;
};
const Form: FC<Props & FormikProps<FormValues>> = props => {
  const createProductBatchModal = useModal(CreateProductBatchForm);
  const selectProductBatchModal = useModal(SelectExistsProductBatchForm);
  const [date, setDate] = useState<string>();

  console.log(props.errors);
  return (
    <Box
      sx={style}
      component="form"
      onSubmit={props.handleSubmit}
      noValidate
      autoComplete="off"
    >
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Добавить группу в колонку {props.groupStatus.title}
      </Typography>
      <TextField
        required
        id="outlined-required"
        label="Название"
        name="name"
        value={props.values.name}
        onBlur={props.handleBlur}
        onChange={props.handleChange}
        sx={{ mb: 2, mt: 2 }}
      />
      <DatePicker
        sx={{ mb: 2 }}
        label="Дата"
        format="yyyy-MM-dd"
        value={date ? parse(date, 'yyyy-MM-dd', new Date()) : null}
        onChange={value => {
          setDate(value ? format(value, 'yyyy-MM-dd') : undefined);
        }}
      />
      <Button
        variant="contained"
        onClick={() =>
          createProductBatchModal.show({
            initialValues: {
              date,
            },
            onSubmit: async values => {
              void props.setFieldValue('newProductBatches', [
                ...(props.values.newProductBatches || []),
                values,
              ]);
            },
          })
        }
      >
        Добавить новую партию
      </Button>
      {!!props.values.newProductBatches?.length && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Существующие</TableCell>
                <TableCell align="right">цена покупки</TableCell>
                <TableCell align="right">кол-во</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.values.newProductBatches?.map((row, index) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.product.sku}
                  </TableCell>
                  <TableCell align="right">{row.costPricePerUnit}</TableCell>
                  <TableCell align="right">{row.count}</TableCell>
                  <TableCell align="right">
                    {' '}
                    <ButtonGroup variant="contained">
                      <Button
                        size="small"
                        onClick={() =>
                          createProductBatchModal.show({
                            initialValues: row,
                            onSubmit: async values => {
                              const newProductBatches = [
                                ...props.values.newProductBatches,
                              ];
                              newProductBatches.splice(index, 1, values);
                              void props.setFieldValue(
                                'newProductBatches',
                                newProductBatches,
                              );
                            },
                          })
                        }
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          const newProductBatches = [
                            ...props.values.newProductBatches,
                          ];
                          newProductBatches.splice(index, 1);
                          void props.setFieldValue(
                            'newProductBatches',
                            newProductBatches,
                          );
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() =>
          selectProductBatchModal.show({
            onSubmit: values =>
              props.setFieldValue('existProductBatches', [
                ...(props.values.existProductBatches || []),
                values,
              ]),
          })
        }
      >
        Добавить существующую партию
      </Button>
      {!!props.values.existProductBatches?.length && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Существующие</TableCell>
                <TableCell align="right">цена покупки</TableCell>
                <TableCell align="right">кол-во</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.values.existProductBatches?.map((row, index) => (
                <TableRow
                  key={row.product.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.product.sku}
                  </TableCell>
                  <TableCell align="right">
                    {row.productBatch.costPricePerUnit}
                  </TableCell>
                  <TableCell align="right">{row.productBatch.count}</TableCell>
                  <TableCell align="right">
                    <ButtonGroup variant="contained">
                      <Button
                        size="small"
                        onClick={() =>
                          selectProductBatchModal.show({
                            initialValues: row,
                            onSubmit: values => {
                              const existProductBatches = [
                                ...props.values.existProductBatches,
                              ];
                              existProductBatches.splice(index, 1, values);
                              void props.setFieldValue(
                                'existProductBatches',
                                existProductBatches,
                              );
                            },
                          })
                        }
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          const existProductBatches = [
                            ...props.values.existProductBatches,
                          ];
                          existProductBatches.splice(index, 1);
                          void props.setFieldValue(
                            'existProductBatches',
                            existProductBatches,
                          );
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Button variant="contained" type="submit" sx={{ mt: 2 }}>
        Добавить группу
      </Button>
    </Box>
  );
};

const ProductBatchGroupForm = withFormik<Props, FormValues>({
  validationSchema: () => {
    // @ts-expect-error здесь не нужна особая проверка existProductBatches. главное не null
    const schema: ObjectSchema<FormValues> = object({
      name: string().required(),
      statusId: number().required(),
      existProductBatches: array(
        selectProductBatchValidationSchema(),
      ).required(),
      newProductBatches: array(createProductBatchValidationSchema()).required(),
    });
    return schema;
  },
  mapPropsToValues: props => {
    return {
      name: '',
      statusId: props.groupStatus.id,
      existProductBatches: [],
      newProductBatches: [],
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

  handleSubmit: async (values, formikBag) => {
    return formikBag.props.onSubmit(values, formikBag);
  },
})(Form);

export default NiceModal.create(withModal(ProductBatchGroupForm));
