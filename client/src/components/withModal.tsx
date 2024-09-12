import { useModal } from '@ebay/nice-modal-react';
import { Modal } from '@mantine/core';
import React, { ComponentType } from 'react';

export default function withModal<P extends object>(
  WrappedComponent: ComponentType<P>,
  opts: { header?: string } = {},
) {
  const { header } = opts;
  return (props: P) => {
    const modal = useModal();
    return (
      <Modal
        opened={modal.visible}
        onClose={modal.hide}
        title={header || 'HEADER IS NOT DEFINED'}
        size="auto"
      >
        <WrappedComponent {...props} closeModal={() => modal.hide()} />
      </Modal>
    );
  };
}
