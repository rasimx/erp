import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import React, { FC, ReactNode, useCallback } from 'react';

export type Props = {
  accept: () => void;
  reject?: () => void;
  children: (props: { onClick: () => void }) => ReactNode;
};

const Confirm: FC<Props> = (props: Props) => {
  const { accept, reject, children } = props;

  const onClick = useCallback(() => {
    confirmDialog({
      message: 'Вы уверены?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      accept,
      reject,
    });
  }, []);

  return (
    <>
      <ConfirmDialog />
      {children({ onClick })}
    </>
  );
};

export default Confirm;
