import { useQuery } from '@apollo/client';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import React, { useMemo, useRef } from 'react';

import { useProductBatchMutations } from '../../../api/product-batch/product-batch.hook';
import {
  getProductBatchDetailFragment,
  PRODUCT_BATCH_DETAIL_QUERY,
} from '../../../api/product-batch/product-batch-detail.gql';
import { toRouble } from '../../../utils';
import { EditProductBatchModal } from '../../EditProductBatch/EditProductBatchForm';
import OperationForm from '../../OperationForm/OperationForm';
import withDrawer from '../../withDrawer';
import EventListItem from '../EventListItem';
import classes from './ProductBatchDetail.module.scss';

export interface Props {
  productBatchId: number;
  closeDrawer: () => void;
}

export const ProductBatchDetail = React.memo<Props>(props => {
  const { productBatchId, closeDrawer } = props;

  const { data, refetch } = useQuery(PRODUCT_BATCH_DETAIL_QUERY, {
    variables: { id: productBatchId },
    fetchPolicy: 'network-only',
  });

  const productBatch = useMemo(
    () => data && getProductBatchDetailFragment(data.productBatchDetail),
    [data],
  );

  const { deleteProductBatch } = useProductBatchMutations();
  const editProductBatchModal = useModal(EditProductBatchModal);

  const operationFormModal = useModal(OperationForm);

  const menu = useRef<Menu>(null);
  const toast = useRef(null);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: 'Добавить  сопутствующие расходы',
        icon: 'pi pi-plus',
        command: () =>
          operationFormModal.show({
            initialValues: {
              productBatchId,
            },
            onSubmit: async values => {
              refetch();
            },
          }),
      },
      {
        label: 'Изменить количество',
        icon: 'pi pi-plus',
        command: () =>
          editProductBatchModal.show({
            initialValues: {
              id: productBatchId,
            },
            onSubmit: async values => {
              refetch();
            },
          }),
      },
      {
        label: 'Удалить',
        icon: 'pi pi-plus',
        command: () =>
          confirmDialog({
            message: 'Вы уверены?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: () => {
              deleteProductBatch(productBatchId).then(() => {
                closeDrawer();
              });
            },
          }),
      },
    ],
    [operationFormModal, productBatch, deleteProductBatch],
  );

  const listItems = productBatch
    ? [
        // {
        //   label: 'order',
        //   value: card.order,
        // },
        // { label: 'ID', value: card.id },
        // { label: 'productID', value: card.product.id },
        { label: 'SKU', value: productBatch.product.sku },
        { label: 'количество, шт', value: productBatch.count },
        {
          label: 'цена закупки 1 шт, р.',
          value: toRouble(productBatch.costPricePerUnit),
        },
        {
          label: 'сопутствующие траты за 1шт, р.',
          value: toRouble(productBatch.operationsPricePerUnit),
        },
        {
          label: 'себестоимость за 1шт, р.',
          value: toRouble(
            productBatch.operationsPricePerUnit + productBatch.costPricePerUnit,
          ),
        },
        {
          label: 'себестоимость партии, р.',
          value: toRouble(
            (productBatch.operationsPricePerUnit +
              productBatch.costPricePerUnit) *
              productBatch.count,
          ),
        },
        // {
        //   label: 'продано',
        //   value: aa?.count ?? 0,
        // },
      ]
    : [];

  return productBatch ? (
    <div>
      <div className={classes.header}>
        <div style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
          {productBatch.product.name}
        </div>

        <Button
          icon="pi pi-align-right"
          onClick={event => menu.current?.toggle(event)}
        />
        <Toast ref={toast}></Toast>
        <Menu model={menuItems} popup ref={menu} popupAlignment="right" />
      </div>
      <div style={{ fontSize: 12 }}>
        {listItems.map((item, index) => (
          <div
            style={{ display: 'flex', justifyContent: 'space-between' }}
            key={index}
          >
            <div>{item.label}</div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>
      <br />
      <div style={{ fontSize: 12 }}>
        {productBatch.events.map((event, index) => (
          <EventListItem event={event} />
        ))}
      </div>
    </div>
  ) : (
    <ProgressSpinner />
  );
});

export default NiceModal.create(
  withDrawer(ProductBatchDetail, { title: 'партия' }),
);
