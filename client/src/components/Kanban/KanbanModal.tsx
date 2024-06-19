import { Box, Button, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  selectProductBatchShowModal,
  updateProductBatchAsync,
} from './product-batch.slice';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const KanbanModal = () => {
  // const dispatch = useAppDispatch();
  //
  // const modalIsOpen = useAppSelector(selectProductBatchShowModal);
  // dispatch(updateProductBatchAsync({ id: item.id, statusId: status.id }));

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        Выбрать
      </Button>
      <Modal
        open={modalIsOpen}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Добавить операции
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default KanbanModal;
