import { useQuery } from '@apollo/client';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import React, { useCallback, useMemo, useRef } from 'react';

import { useOperation } from '../../../api/operation/operation.hooks';
import { useProductBatchMutations } from '../../../api/product-batch/product-batch.hook';
import {
  getProductBatchDetailFragment,
  PRODUCT_BATCH_DETAIL_QUERY,
} from '../../../api/product-batch/product-batch-detail.gql';
import { toRouble } from '../../../utils';
import OperationForm from '../../OperationForm/OperationForm';
import withDrawer from '../../withDrawer';
import EventListItem from '../EventListItem';
import classes from './ProductBatchDetail.module.scss';

export interface Props {
  productBatchId: number;
}

export const ProductBatchDetail = React.memo<Props>(props => {
  const { productBatchId } = props;

  const { data, refetch } = useQuery(PRODUCT_BATCH_DETAIL_QUERY, {
    variables: { id: productBatchId },
    fetchPolicy: 'network-only',
  });

  const productBatch = useMemo(
    () => data && getProductBatchDetailFragment(data.productBatchDetail),
    [data],
  );

  const { deleteProductBatch } = useProductBatchMutations();
  const { createOperation } = useOperation();

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
              groupId: null,
            },
            productBatches: productBatch ? [productBatch] : [],
            onSubmit: async values => {},
          }),
      },
      {
        label: 'Удалить',
        icon: 'pi pi-plus',
        command: () =>
          deleteProductBatch(productBatchId).then(() => {
            refetch();
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
