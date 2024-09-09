import { useModal } from '@ebay/nice-modal-react';
import { Modal } from '@mui/material';
import { Dialog } from 'primereact/dialog';
import React, { ComponentType } from 'react';

export default function withModal<P extends object>(
  WrappedComponent: ComponentType<P>,
  opts: { header?: string } = {},
) {
  const { header } = opts;
  return (props: P) => {
    const modal = useModal();
    return (
      <Dialog
        header={header || 'HEADER IS NOT DEFINED'}
        closable
        closeOnEscape
        dismissableMask
        visible={modal.visible}
        onHide={() => modal.hide()}
        maximizable
      >
        <WrappedComponent {...props} closeModal={() => modal.hide()} />
      </Dialog>
      // <Modal
      //   open={modal.visible}
      //   onClose={() => modal.hide()}
      //   aria-labelledby="modal-modal-title"
      //   aria-describedby="modal-modal-description"
      // >
      //   {/* тут нужен <>Fragment, иначе ошибка ootRef.current.contains*/}
      //   <>
      //     <WrappedComponent {...props} closeModal={() => modal.hide()} />
      //   </>
      // </Modal>
    );
  };
}
