import { Box, Modal, Typography } from '@mui/material';
import React, { type FC, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks';

import {
  closeSplitProductBatchModal,
  selectSplitProductBatchForm,
} from '../product-batch.slice';
import SplitProductBatchForm from './SplitProductBatchForm';

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

export interface Props {
  // statusId: number;
}

const SplitProductBatchModal: FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const splitProductBatchForm = useAppSelector(selectSplitProductBatchForm);

  const handleClose = useCallback(() => {
    dispatch(closeSplitProductBatchModal());
  }, []);

  return (
    <Modal
      open={!!splitProductBatchForm}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Разбить партию
        </Typography>
        {splitProductBatchForm && (
          <SplitProductBatchForm
            productBatch={splitProductBatchForm.item}
            statusId={splitProductBatchForm.statusId}
            onSubmit={handleClose}
          />
        )}
      </Box>
    </Modal>
  );
};

export default SplitProductBatchModal;
