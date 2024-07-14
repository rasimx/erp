import { useModal } from '@ebay/nice-modal-react';
import { Drawer } from '@mui/material';
import React, { ComponentType } from 'react';

export default function withDrawer<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  return (props: P) => {
    const modal = useModal();
    return (
      <Drawer anchor="right" open={modal.visible} onClose={modal.hide}>
        <>
          <WrappedComponent {...props} closeModal={() => modal.hide()} />
        </>
      </Drawer>
    );
  };
}
