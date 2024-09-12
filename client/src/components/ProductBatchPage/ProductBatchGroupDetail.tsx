import { useQuery } from '@apollo/client';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Menu } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { useOperation } from '../../api/operation/operation.hooks';
import { useProductBatchGroupMutations } from '../../api/product-batch-group/product-batch-group.hook';
import {
  getProductBatchGroupDetailFragment,
  PRODUCT_BATCH_GROUP_DETAIL_QUERY,
} from '../../api/product-batch-group/product-batch-group-detail.gql';
import { toRouble } from '../../utils';
import OperationForm from '../OperationForm/OperationForm';
import withDrawer from '../withDrawer';
import EventListItem from './EventListItem';

export interface Props {
  productBatchGroupId: number;
}

export const ProductBatchGroupDetail = React.memo<Props>(props => {
  const { productBatchGroupId } = props;

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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    deleteProductBatchGroup(productBatchGroupId).then(() => {
      handleClose();
      // refetch();
    });
  };

  const operationFormModal = useModal(OperationForm);
  const showOperationFormModal = useCallback(() => {
    if (group) {
      operationFormModal.show({
        initialValues: {
          groupId: group.id,
        },
        productBatches: group.productBatchList,
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
    }
  }, [handleClose, group]);

  return (
    group && (
      <div
        style={{
          width: '500px',
          backgroundColor: 'white',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
              {group.name}
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
                <Menu.Item onClick={handleDelete}>Удалить группу</Menu.Item>
              </Menu.Dropdown>
            </Menu>
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
    )
  );
});

export default NiceModal.create(withDrawer(ProductBatchGroupDetail));
