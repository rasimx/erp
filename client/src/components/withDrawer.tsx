import { useModal } from '@ebay/nice-modal-react';
import { Sidebar } from 'primereact/sidebar';
import React, { ComponentType, useCallback } from 'react';

export default function withDrawer<P extends object>(
  WrappedComponent: ComponentType<P>,
  opts: { title?: string } = {},
) {
  const { title } = opts;
  return (props: P & { onClose?: () => void }) => {
    const modal = useModal();

    const closeHandler = useCallback(() => {
      if (typeof props.onClose === 'function') props.onClose();
      modal.hide();
    }, []);

    return (
      <Sidebar
        visible={modal.visible}
        position="right"
        onHide={modal.hide}
        style={{ width: '600px' }}
      >
        <h2>{title}</h2>
        <WrappedComponent {...props} closeDrawer={closeHandler} />
      </Sidebar>
    );
  };
}
