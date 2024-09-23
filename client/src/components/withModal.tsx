import { useModal } from '@ebay/nice-modal-react';
import { Dialog } from 'primereact/dialog';
import React, { ComponentType, useCallback } from 'react';

export default function withModal<P extends object>(
  WrappedComponent: ComponentType<P>,
  opts: { header?: string } = {},
) {
  const { header } = opts;
  return (props: P & { onClose?: () => void }) => {
    const modal = useModal();

    const closeHandler = useCallback(() => {
      if (typeof props.onClose === 'function') props.onClose();
      modal.hide();
    }, []);

    return (
      <Dialog
        visible={modal.visible}
        onHide={modal.hide}
        header={header || 'HEADER IS NOT DEFINED'}
      >
        <WrappedComponent {...props} closeModal={closeHandler} />
      </Dialog>
    );
  };
}
