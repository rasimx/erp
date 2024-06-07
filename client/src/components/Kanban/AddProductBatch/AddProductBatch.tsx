import { Box, Button, Modal, Typography } from '@mui/material';
import React, { type FC, useCallback, useState } from 'react';

import { useAppDispatch } from '../../../hooks';
import AddProductBatchForm from './AddProductBatchForm';

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

export interface Props {}

const AddProductBatch: FC<Props> = () => {
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
          <AddProductBatchForm onSubmit={handleClose} />
        </Box>
      </Modal>
    </>
  );
};

export default AddProductBatch;
