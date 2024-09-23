import { useModal } from '@ebay/nice-modal-react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { Toast } from 'primereact/toast';
import React, { FC, useCallback, useMemo, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { CreateProductBatchGroupModal } from '../CreateProductBatchGroup/CreateProductBatchGroupForm';
import OperationForm from '../OperationForm/OperationForm';
import {
  selectIsSelectingMode,
  selectSelectedProductBatches,
  toggleSelecting,
} from './product-batch-page.slice';

export const ProductBatchPageControl: FC = () => {
  const dispatch = useAppDispatch();
  const isSelecting = useAppSelector(selectIsSelectingMode);
  const selectedProductBatches = useAppSelector(selectSelectedProductBatches);

  const selectingHandle = useCallback(() => dispatch(toggleSelecting()), []);

  const createProductBatchGroupModal = useModal(CreateProductBatchGroupModal);
  const operationFormModal = useModal(OperationForm);

  const menu = useRef<Menu>(null);
  const toast = useRef(null);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Объединить в группу',
        icon: 'pi pi-plus',
        command: () =>
          createProductBatchGroupModal.show({
            initialValues: {},
            onSubmit: async values => {},
          }),
      },
      {
        label: 'Добавить  сопутствующие расходы',
        icon: 'pi pi-plus',
        command: () =>
          operationFormModal.show({
            initialValues: {},
            productBatches: selectedProductBatches,
            onSubmit: async values => {},
          }),
      },
    ],
    [operationFormModal, createProductBatchGroupModal, selectedProductBatches],
  );

  return (
    <div>
      <Button
        onClick={selectingHandle}
        size="small"
        label={isSelecting ? 'Отмена' : 'Выбрать партии'}
      />
      <Button
        onClick={event => menu.current?.toggle(event)}
        size="small"
        label="Меню"
        disabled={selectedProductBatches.length === 0}
      />

      <Toast ref={toast}></Toast>
      <Menu model={menuItems} popup ref={menu} popupAlignment="right" />
    </div>
  );
};
