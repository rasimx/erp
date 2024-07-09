import { useModal } from '@ebay/nice-modal-react';
import { Modal } from '@mui/material';
import React, { ComponentType } from 'react';

export default function withModal<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  return (props: P) => {
    const modal = useModal();
    return (
      <Modal
        open={modal.visible}
        onClose={() => modal.hide()}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {/* тут нужен <>Fragment, иначе ошибка ootRef.current.contains*/}
        <>
          <WrappedComponent {...props} />
        </>
      </Modal>
    );
  };
}
