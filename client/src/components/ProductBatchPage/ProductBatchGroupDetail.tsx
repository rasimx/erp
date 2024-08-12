import { useQuery } from '@apollo/client';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
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
      <Box
        sx={{
          width: '500px',
          backgroundColor: 'white',
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
              {group.name}
            </Box>

            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={open ? 'long-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={showOperationFormModal}>
                Добавить операцию
              </MenuItem>
              <MenuItem onClick={handleDelete}>Удалить группу</MenuItem>
            </Menu>
          </Box>
          <Box sx={{ display: 'flex', p: 1 }}>
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
          </Box>
        </Box>
        <br />
        <Box sx={{ fontSize: 12 }}>
          {group.events.map((event, index) => (
            <EventListItem event={event} />
          ))}
        </Box>
      </Box>
    )
  );
});

export default NiceModal.create(withDrawer(ProductBatchGroupDetail));
