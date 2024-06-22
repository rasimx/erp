import { Box, Button, Modal, Typography } from '@mui/material';
import React, { type FC, useCallback, useState } from 'react';

import { useAppSelector } from '@/hooks';

import { selectCheckedProductBatchList } from '../../api/product-batch/product-batch.slice';
import AddOperationForm from './AddOperationForm';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  // width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export interface Props {}

const AddOperation: FC<Props> = () => {
  const selectedProductBatches = useAppSelector(selectCheckedProductBatchList);

  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpenModal(false);
  }, []);
  const handleOpen = useCallback(() => {
    if (selectedProductBatches.length) {
      setIsOpenModal(true);
    } else {
      alert('Выбери партии');
    }
  }, [selectedProductBatches]);

  return (
    <>
      {/*<IconButton*/}
      {/*  aria-label="delete"*/}
      {/*  onClick={() => {*/}
      {/*    setIsOpenModal(true);*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <AddCardIcon />*/}
      {/*</IconButton>*/}
      <Button variant="contained" onClick={handleOpen}>
        Добавить операцию
      </Button>
      <Modal
        open={isOpenModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Добавить операцию к партии
          </Typography>
          <AddOperationForm onSubmit={handleClose} />
        </Box>
      </Modal>
    </>
  );
};

export default AddOperation;
