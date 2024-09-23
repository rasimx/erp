import { useQuery } from '@apollo/client';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import React, { useCallback, useMemo, useRef } from 'react';

import { useOperation } from '../../../api/operation/operation.hooks';
import { useProductBatchGroupMutations } from '../../../api/product-batch-group/product-batch-group.hook';
import {
  getProductBatchGroupDetailFragment,
  PRODUCT_BATCH_GROUP_DETAIL_QUERY,
} from '../../../api/product-batch-group/product-batch-group-detail.gql';
import { toRouble } from '../../../utils';
import OperationForm from '../../OperationForm/OperationForm';
import withDrawer from '../../withDrawer';
import EventListItem from '../EventListItem';
import classes from './ProductBatchGroupDetail.module.scss';

export interface Props {
  productBatchGroupId: number;
  closeDrawer: () => void;
}

export const ProductBatchGroupDetail = React.memo<Props>(props => {
  const { productBatchGroupId, closeDrawer } = props;

  const { data, refetch } = useQuery(PRODUCT_BATCH_GROUP_DETAIL_QUERY, {
    variables: { id: productBatchGroupId },
    fetchPolicy: 'network-only',
  });

  const group = useMemo(
    () =>
      data && getProductBatchGroupDetailFragment(data.productBatchGroupDetail),
    [data],
  );

  const { deleteProductBatchGroup } = useProductBatchGroupMutations();
  const { createOperation } = useOperation();

  const operationFormModal = useModal(OperationForm);

  const menu = useRef<Menu>(null);
  const toast = useRef(null);

  console.log(group?.productBatchList);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Добавить  сопутствующие расходы',
        icon: 'pi pi-plus',
        command: () =>
          operationFormModal.show({
            initialValues: {
              groupId: group?.id,
            },
            productBatches: group?.productBatchList,
            onSubmit: async values => {},
          }),
      },
      {
        label: 'Удалить',
        icon: 'pi pi-plus',
        command: () => {
          confirmDialog({
            message: 'Вы уверены?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: () => {
              deleteProductBatchGroup(productBatchGroupId).then(() => {
                closeDrawer();
              });
            },
          });
        },
      },
    ],
    [group, operationFormModal, deleteProductBatchGroup],
  );

  return group ? (
    <div className={classes.groupDetail}>
      <div>
        <div className={classes.header}>
          <div>{group.name}</div>

          <Button
            icon="pi pi-align-right"
            onClick={event => menu.current?.toggle(event)}
          />
          <Toast ref={toast}></Toast>
          <Menu model={menuItems} popup ref={menu} popupAlignment="right" />
        </div>
        <div style={{ display: 'flex' }}>
          id: {group.id} <br />
          order: {group.order} <br />
          С/с группы, р.:
          {toRouble(
            group.productBatchList.reduce((prev, data) => {
              return (
                prev +
                data.count *
                  (data.operationsPricePerUnit + data.costPricePerUnit)
              );
            }, 0),
          )}
          <br />
          сопутствующие траты, р.:
          {toRouble(
            group.productBatchList.reduce((prev, data) => {
              return data.count * data.operationsPricePerUnit + prev;
            }, 0),
          )}
          <br />
          количество, шт.
          {group.productBatchList.reduce((prev, data) => {
            return prev + data.count;
          }, 0)}
        </div>
      </div>
      <br />
      <div style={{ fontSize: 12 }}>
        {group.events.map((event, index) => (
          <EventListItem event={event} />
        ))}
      </div>
    </div>
  ) : (
    <ProgressSpinner />
  );
});

export default NiceModal.create(
  withDrawer(ProductBatchGroupDetail, { title: 'группа' }),
);
