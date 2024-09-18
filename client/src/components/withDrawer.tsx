import { useModal } from '@ebay/nice-modal-react';
import { Sidebar } from 'primereact/sidebar';
import React, { ComponentType } from 'react';

export default function withDrawer<P extends object>(
  WrappedComponent: ComponentType<P>,
  opts: { title?: string } = {},
) {
  const { title } = opts;
  return (props: P) => {
    const modal = useModal();
    return (
      <Sidebar
        visible={modal.visible}
        position="right"
        onHide={modal.hide}
        style={{ width: '600px' }}
      >
        <h2>{title}</h2>
        <WrappedComponent {...props} closeModal={() => modal.hide()} />
      </Sidebar>
    );
  };
}
