import { Box, Button, Modal, Typography } from '@mui/material';
import React, { type FC, useCallback, useState } from 'react';

import { StoreType } from '@/gql-types/graphql';
import { useAppDispatch } from '@/hooks';

import { ProductBatchStateItem } from '../product-batch.slice';
import AddProductBatchForm from './AddProductBatchForm';

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
  storeId?: number;
  storeType?: StoreType;
  productId?: number;
  maxCount?: number;
  parent?: ProductBatchStateItem;
}

const AddProductBatch: FC<Props> = ({
  storeId,
  storeType,
  productId,
  maxCount,
  parent,
}) => {
  const dispatch = useAppDispatch();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpenModal(false);
  }, []);

  return (
    <>
      <Button
        variant="contained"
        onClick={() => {
          setIsOpenModal(true);
        }}
      >
        Добавить партию
      </Button>
      <Modal
        open={isOpenModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Добавить партию
          </Typography>
          <AddProductBatchForm
            parent={parent}
            onSubmit={handleClose}
            storeId={storeId}
            storeType={storeType}
            productId={productId}
            maxCount={maxCount}
          />
        </Box>
      </Modal>
    </>
  );
};

export default AddProductBatch;
