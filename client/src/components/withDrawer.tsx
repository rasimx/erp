import { useModal } from '@ebay/nice-modal-react';
import { Drawer } from '@mantine/core';
import React, { ComponentType } from 'react';

export default function withDrawer<P extends object>(
  WrappedComponent: ComponentType<P>,
  opts: { title?: string } = {},
) {
  const { title } = opts;
  return (props: P) => {
    const modal = useModal();
    return (
      <Drawer
        opened={modal.visible}
        onClose={modal.hide}
        title={title}
        position="right"
      >
        <WrappedComponent {...props} closeModal={() => modal.hide()} />
      </Drawer>
    );
  };
}
