import { Box, Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { type FC, useCallback } from 'react';

import { ProductBatch } from '../../../gql-types/graphql';
import { useAppDispatch } from '../../../hooks';
import {
  splitProductBatchAsync,
  updateProductBatchAsync,
} from '../product-batch.slice';

export interface Props {
  productBatch: ProductBatch;
  statusId: number;
  onSubmit: () => void;
}

const SplitProductBatchForm: FC<Props> = ({
  statusId,
  productBatch,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();

  const [count, setCount] = React.useState<number>(productBatch.count);
  const [date, setDate] = React.useState<Date | null>(null);

  const onClickCreateBtn = useCallback(() => {
    if (productBatch.count > count) {
      void dispatch(
        splitProductBatchAsync({
          id: productBatch.id,
          count,
          statusId,
        }),
      );
    } else {
      void dispatch(updateProductBatchAsync({ id: productBatch.id, statusId }));
    }

    onSubmit();
  }, [count, date]);

  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '40ch' },
      }}
      noValidate
      autoComplete="off"
    >
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
      <Button variant="contained" onClick={onClickCreateBtn}>
        {productBatch.count > count ? 'Перенести часть' : 'Перенести все'}
      </Button>
    </Box>
  );
};

export default SplitProductBatchForm;
