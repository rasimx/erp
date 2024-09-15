import { useModal } from '@ebay/nice-modal-react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { Toast } from 'primereact/toast';
import React, { useMemo, useRef } from 'react';

import { ProductBatch } from '../../../api/product-batch/product-batch.gql';
import { ProductBatchGroup } from '../../../api/product-batch-group/product-batch-group.gql';
import { StatusFragment } from '../../../gql-types/graphql';
import { CreateProductBatchModal } from '../../CreateProductBatch/CreateProductBatchForm';
import { CreateProductBatchesByAssemblingModal } from '../../CreateProductBatchesByAssembling/modal';
import { CreateProductBatchesFromSourcesModal } from '../../CreateProductBatchesFromSources/modal';
import CustomLink from '../../CustomLink';
import { ColumnProps } from '../../KanbanBoard/types';
import { StoreStateProvider } from '../../StoreState';
import classes from './ProductBatchColumn.module.scss';

export interface Props
  extends ColumnProps<StatusFragment, ProductBatchGroup, ProductBatch> {
  refetch: () => void;
}

export const ProductBatchColumn = React.memo<Props>(props => {
  const {
    column: status,
    refetch,
    sortableData,
    children,
    items,
    isActive,
  } = props;

  const createProductBatchModal = useModal(CreateProductBatchModal);
  const createProductBatchesByAssemblingModal = useModal(
    CreateProductBatchesByAssemblingModal,
  );
  const createProductBatchesFromSourcesModal = useModal(
    CreateProductBatchesFromSourcesModal,
  );

  const menu = useRef<Menu>(null);
  const toast = useRef(null);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Добавить партию товаров',
        icon: 'pi pi-plus',
        command: () =>
          createProductBatchModal.show({
            initialValues: {
              statusId: status.id,
            },
            onSubmit: async values => {},
          }),
      },
      {
        label: 'Перенос товаров',
        icon: 'pi pi-plus',
        command: () =>
          createProductBatchesFromSourcesModal.show({
            initialValues: {
              statusId: status.id,
            },
            onSubmit: async values => {},
          }),
      },
      {
        label: 'Собрать комбо-товары',
        icon: 'pi pi-plus',
        command: () =>
          createProductBatchesByAssemblingModal.show({
            initialValues: {
              statusId: status.id,
            },
            onSubmit: async values => {},
          }),
      },
    ],
    [],
  );

  return (
    <StoreStateProvider status={status} items={items} skip={isActive}>
      <div className={classes.column}>
        <div className={classes.header}>
          <div className={classes.headerInner}>
            <Button
              icon="pi pi-arrows-alt"
              // @ts-ignore
              ref={sortableData?.setActivatorNodeRef}
              {...sortableData?.listeners}
              className={classes.move}
            />

            <div>
              <CustomLink to={`/status/${status.id}`} className={classes.link}>
                {status.title}
              </CustomLink>
            </div>

            <Button
              icon="pi pi-align-right"
              onClick={event => menu.current?.toggle(event)}
            />

            <Toast ref={toast}></Toast>
            <Menu model={menuItems} popup ref={menu} popupAlignment="right" />

            {/*<Menu*/}
            {/*  shadow="md"*/}
            {/*  width={200}*/}
            {/*  trigger="hover"*/}
            {/*  openDelay={100}*/}
            {/*  closeDelay={400}*/}
            {/*  position="bottom-end"*/}
            {/*>*/}
            {/*  <Menu.Target>*/}
            {/*    <ActionIcon onClick={handleClick} variant="light">*/}
            {/*      <FontAwesomeIcon icon={faEllipsisV} />*/}
            {/*    </ActionIcon>*/}
            {/*  </Menu.Target>*/}

            {/*  <Menu.Dropdown>*/}
            {/*    <Menu.Item onClick={showCreateProductBatchModal}>*/}
            {/*      Добавить партию товаров*/}
            {/*    </Menu.Item>*/}
            {/*    <Menu.Item onClick={showCreateProductBatchesFromSourcesModal}>*/}
            {/*      Перенос товаров*/}
            {/*    </Menu.Item>*/}
            {/*    <Menu.Item onClick={showCreateProductBatchesByAssemblingModal}>*/}
            {/*      Собрать комбо-товары*/}
            {/*    </Menu.Item>*/}
            {/*  </Menu.Dropdown>*/}
            {/*</Menu>*/}
          </div>
        </div>
        <div className={classes.inner}>{children}</div>
      </div>
    </StoreStateProvider>
  );
});

export default ProductBatchColumn;
