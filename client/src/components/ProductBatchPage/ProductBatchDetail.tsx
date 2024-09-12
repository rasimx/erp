import { useQuery } from '@apollo/client';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Menu } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { useOperation } from '../../api/operation/operation.hooks';
import { useProductBatchMutations } from '../../api/product-batch/product-batch.hook';
import {
  getProductBatchDetailFragment,
  PRODUCT_BATCH_DETAIL_QUERY,
} from '../../api/product-batch/product-batch-detail.gql';
import { toRouble } from '../../utils';
import OperationForm from '../OperationForm/OperationForm';
import withDrawer from '../withDrawer';
import EventListItem from './EventListItem';

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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    deleteProductBatch(productBatchId).then(() => {
      handleClose();
      refetch();
    });
  };
  const operationFormModal = useModal(OperationForm);
  const showOperationFormModal = useCallback(() => {
    operationFormModal.show({
      initialValues: {
        groupId: null,
      },
      productBatches: productBatch ? [productBatch] : [],
      onSubmit: async values => {
        createOperation(values)
          .then(result => {
            refetch();
          })
          .catch(err => {
            alert('ERROR');
          });
      },
    });
    handleClose();
  }, [handleClose, productBatch]);

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

  console.log(productBatch);

  return (
    productBatch && (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: 'rgba(0,0,0,.1)',
          }}
        >
          <div style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
            {productBatch.product.name}
          </div>

          <Menu
            shadow="md"
            width={200}
            trigger="hover"
            openDelay={100}
            closeDelay={400}
            position="bottom-end"
          >
            <Menu.Target>
              <ActionIcon variant="light" onClick={handleClick}>
                <FontAwesomeIcon icon={faEllipsisV} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={showOperationFormModal}>
                Добавить операцию
              </Menu.Item>
              <Menu.Item onClick={handleDelete}>Удалить</Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
    )
  );
});

export default NiceModal.create(withDrawer(ProductBatchDetail));
