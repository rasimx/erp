import { Button, Modal } from '@mui/material';
import React, { type FC, ReactElement, useCallback, useState } from 'react';

export interface Props {
  children: (handleClose: () => void) => ReactElement;
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
        {children(handleClose)}
      </Modal>
    </>
  );
};

export default ModalButton;
