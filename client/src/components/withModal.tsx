import { useModal } from '@ebay/nice-modal-react';
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
        visible={modal.visible}
        onHide={modal.hide}
        header={header || 'HEADER IS NOT DEFINED'}
      >
        <WrappedComponent {...props} closeModal={() => modal.hide()} />
      </Dialog>
    );
  };
}
