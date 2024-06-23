import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Yup from 'yup';

import { useAppDispatch, useAppSelector } from '@/hooks';

import { useProductList } from '../../api/product/product.hooks';
import {
  createProductBatchAsync,
  selectCheckedProductBatchList,
} from '../../api/product-batch/product-batch.slice';
import { selectStatusList } from '../../api/status/status.slice';
import { SourceProductBatchFragment } from '../../gql-types/graphql';
import SelectParentProductBatch from './SelectParentProductBatch';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

export interface Props {
  onSubmit: () => void;
  statusId: number;
  productId: number;
  maxCount?: number;
  parentBatch?: SourceProductBatchFragment;
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
  statusId,
  productId,
  parentBatch,
}) => {
  const dispatch = useAppDispatch();
  const [parent, setParent] = useState<SourceProductBatchFragment | undefined>(
    parentBatch,
  );

  const AddProductBatchSchema = useMemo(() => {
    let count = Yup.number().required('Required');
    if (parent) count = count.max(parent.count);
    return Yup.object().shape({
      name: Yup.string(),
      productId: Yup.number(),
      costPrice: Yup.number(),
      count,
      date: Yup.string().required('Required'),
      // statusId: Yup.number().required('Required'),
      statusId: Yup.number(),
    });
  }, [parent]);

  const { items: productList } = useProductList();
  const statusList = useAppSelector(selectStatusList);

  const formik = useFormik<FormData>({
    initialValues: {
      productId,
      statusId,
      name: '',
      costPrice: '',
      count: parent?.count,
      date: new Date(),
    } as unknown as FormData,
    validationSchema: AddProductBatchSchema,
    onSubmit: async values => {
      await dispatch(
        createProductBatchAsync({
          ...values,
          statusId,
          costPrice: values.costPrice * 100,
          date: format(values.date, 'yyyy-MM-dd'),
        }),
      );
      onSubmit();
    },
  });

  useEffect(() => {
    formik.setFieldValue('parentId', parent?.id);
    if (parent) formik.setFieldValue('count', parent.count);
  }, [parent]);

  return (
    <Box sx={style}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Добавить партию
      </Typography>
      <SelectParentProductBatch onChange={parent => setParent(parent)} />
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          '& .MuiTextField-root': { width: '100%' },
        }}
        noValidate
        autoComplete="off"
      >
        {!parent && (
          <>
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
                  productList.filter(
                    item => item.id == formik.values.productId,
                  )[0] ?? null
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
                      formik.touched.productId &&
                      Boolean(formik.errors.productId)
                    }
                    helperText={
                      formik.touched.productId && formik.errors.productId
                    }
                  />
                )}
              />
            )}
            {!statusId && (
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
          </>
        )}

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
        <Button variant="contained" type="submit" sx={{ mt: 2 }}>
          Добавить партию
        </Button>
      </Box>
    </Box>
  );
};

export default AddProductBatchForm;
