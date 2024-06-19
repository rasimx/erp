import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import React, { type FC, useMemo } from 'react';
import * as Yup from 'yup';

import { StoreType } from '../../../gql-types/graphql';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useProductList } from '../product.hooks';
import { createProductBatchAsync } from '../product-batch.slice';
import { selectStatusList } from '../status-list.slice';

export interface Props {
  onSubmit: () => void;
  storeId?: number;
  storeType?: StoreType;
  productId?: number;
  maxCount?: number;
}

type FormData = {
  productId: number;
  name: string;
  costPrice: number;
  count: number;
  date: Date;
  statusId: number;
};

const AddProductBatchForm: FC<Props> = ({
  onSubmit,
  storeId,
  storeType,
  productId,
  maxCount,
}) => {
  const dispatch = useAppDispatch();

  const AddProductBatchSchema = useMemo(() => {
    let count = Yup.number().required('Required');
    if (maxCount) count = count.max(maxCount);
    return Yup.object().shape({
      name: Yup.string().required('Required'),
      productId: Yup.number().required('Required'),
      costPrice: Yup.number().required('Required'),
      count,
      date: Yup.string().required('Required'),
      // statusId: Yup.number().required('Required'),
      statusId: Yup.number(),
    });
  }, [maxCount]);

  const { items: productList } = useProductList();
  const statusList = useAppSelector(selectStatusList);

  const formik = useFormik<FormData>({
    initialValues: {
      productId: productId || '',
      name: '',
      costPrice: '',
      count: maxCount,
      date: new Date(),
      statusId: undefined,
    } as unknown as FormData,
    validationSchema: AddProductBatchSchema,
    onSubmit: async values => {
      await dispatch(
        createProductBatchAsync({
          ...values,
          storeId,
          storeType,
          costPrice: values.costPrice * 100,
          date: format(values.date, 'yyyy-MM-dd'),
        }),
      );
      onSubmit();
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        '& .MuiTextField-root': { width: '100%' },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        required
        id="outlined-required"
        label="Название"
        name="name"
        value={formik.values.name}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />
      {!productId && (
        <Autocomplete
          sx={{ mt: 2 }}
          fullWidth
          options={productList}
          getOptionLabel={option => `${option.sku}: ${option.name}`}
          value={
            productList.filter(item => item.id == formik.values.productId)[0] ??
            null
          }
          onChange={(e, obj) => {
            formik.handleChange('productId');
            formik.setFieldValue('productId', obj ? obj.id : '');
          }}
          onBlur={formik.handleBlur}
          renderInput={params => (
            <TextField
              {...params}
              name="name"
              label="Товар"
              inputProps={{
                ...params.inputProps,
              }}
              error={
                formik.touched.productId && Boolean(formik.errors.productId)
              }
              helperText={formik.touched.productId && formik.errors.productId}
            />
          )}
        />
      )}
      {!storeId && (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="demo-simple-select-label">Status</InputLabel>
          <Select
            id="statusId"
            label="Status"
            name="statusId"
            value={formik.values.statusId}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          >
            {statusList.map(item => (
              <MenuItem value={item.id} key={item.id}>
                {item.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        sx={{ mt: 2 }}
        fullWidth
        required
        id="outlined-required"
        type="number"
        label="Закупочная цена"
        name="costPrice"
        value={formik.values.costPrice}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />
      <TextField
        sx={{ mt: 2 }}
        fullWidth
        required
        id="outlined-required"
        type="number"
        label="Количество"
        name="count"
        value={formik.values.count}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        error={formik.touched.count && Boolean(formik.errors.count)}
      />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          sx={{ mt: 2 }}
          label="Дата"
          format="yyyy-MM-dd"
          defaultValue={formik.values.date}
          value={formik.values.date}
          // onBlur={formik.handleBlur}
          onChange={value => {
            formik.setFieldValue('date', value ? value : undefined);
          }}
        />
      </LocalizationProvider>
      <Button variant="contained" type="submit" sx={{ mt: 2 }}>
        Добавить партию
      </Button>
    </Box>
  );
};

export default AddProductBatchForm;
