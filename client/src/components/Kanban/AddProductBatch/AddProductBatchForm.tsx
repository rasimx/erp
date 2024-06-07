import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import React, { type FC, useCallback } from 'react';

import { type Product } from '../../../gql-types/graphql';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useProductList } from '../product.hooks';
import { createProductBatchAsync } from '../product-batch.slice';
import { selectStatusList } from '../status-list.slice';

export interface Props {
  onSubmit: () => void;
}

const AddProductBatchForm: FC<Props> = ({ onSubmit }) => {
  const dispatch = useAppDispatch();

  const { items } = useProductList();
  const statusList = useAppSelector(selectStatusList);

  const defaultProps = {
    options: items,
    getOptionLabel: (option: Product) => option.name,
  };

  const [product, setProduct] = React.useState<Product | null>(null);
  const [costPrice, setCostPrice] = React.useState<number | null>(null);
  const [statusId, setStatusId] = React.useState<number | null>(null);
  const [count, setCount] = React.useState<number | null>(null);
  const [date, setDate] = React.useState<Date | null>(null);

  const onClickCreateBtn = useCallback(() => {
    if (!product || !costPrice || !count || !date || !statusId) {
      throw new Error('invalid');
    }
    void dispatch(
      createProductBatchAsync({
        productId: product.id,
        costPrice: costPrice * 100,
        count,
        date: format(date, 'yyyy-MM-dd'),
        statusId,
      }),
    );

    onSubmit();
  }, [product, costPrice, count, date]);

  const statusIdChangeHandler = useCallback((event: SelectChangeEvent) => {
    setStatusId(Number(event.target.value));
  }, []);

  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '40ch' },
      }}
      noValidate
      autoComplete="off"
    >
      <Autocomplete
        {...defaultProps}
        value={product}
        onChange={(event: any, newValue: Product | null) => {
          setProduct(newValue);
        }}
        clearOnEscape
        renderInput={params => (
          <TextField {...params} label="Товар" variant="standard" />
        )}
      />
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={statusId?.toString()}
        label="Age"
        onChange={statusIdChangeHandler}
      >
        {statusList.map(item => (
          <MenuItem value={item.id}>{item.title}</MenuItem>
        ))}
      </Select>
      <TextField
        required
        id="outlined-required"
        type="number"
        label="Цена"
        value={costPrice}
        onChange={event => {
          setCostPrice(Number(event.target.value));
        }}
      />
      <TextField
        required
        id="outlined-required"
        type="number"
        label="Количество"
        value={count}
        onChange={event => {
          setCount(Number(event.target.value));
        }}
      />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          value={date}
          format="yyyy-MM-dd"
          onChange={value => {
            setDate(value);
          }}
        />
      </LocalizationProvider>
      <Button variant="contained" onClick={onClickCreateBtn}>
        Добавить партию
      </Button>
    </Box>
  );
};

export default AddProductBatchForm;
