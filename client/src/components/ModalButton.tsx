import { Button, Modal } from '@mui/material';
import Box from '@mui/material/Box';
import React, { type FC, useCallback, useState } from 'react';

export interface Props {
  children: (handleClose: () => void) => React.ReactElement;
  label: string;
}

const ModalButton: FC<Props> = ({ children, label }) => {
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
        {label}
      </Button>
      <Modal
        open={isOpenModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>{children(handleClose)}</Box>
      </Modal>
    </>
  );
};

export default ModalButton;
