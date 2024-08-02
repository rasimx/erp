import { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback } from 'react';

import { useOperation } from '../../api/operation/operation.hooks';
import { ProductBatchGroup } from '../../api/product-batch-group/product-batch-group.gql';
import { useProductBatchGroupMutations } from '../../api/product-batch-group/product-batch-group.hook';
import { toRouble } from '../../utils';
import { GroupProps } from '../KanbanBoard/types';
import OperationForm from '../OperationForm/OperationForm';

export interface Props extends GroupProps<ProductBatchGroup> {
  refetch: () => void;
}

export const Group = React.memo<Props>(props => {
  const { group, refetch, sortableData, children } = props;

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
    deleteProductBatchGroup(group.id).then(() => {
      handleClose();
      refetch();
    });
  };

  const operationFormModal = useModal(OperationForm);
  const showOperationFormModal = useCallback(() => {
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
  }, [handleClose, group]);

  return (
    <>
      <Box
        sx={{
          background: '#FAFAFA',
          // p: 1,
          textAlign: 'center',
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
            <IconButton
              ref={sortableData?.setActivatorNodeRef}
              {...sortableData?.listeners}
              sx={{
                cursor: 'grab',
              }}
            >
              <OpenWithIcon />
            </IconButton>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ flexGrow: 1 }}
            >
              {group.name}
            </Typography>
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
            С/с группы, р. -
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
            количество, шт. -
            {group.productBatchList.reduce((prev, data) => {
              return prev + data.count;
            }, 0)}
          </Box>
        </Box>
      </Box>
      <Box>{children}</Box>
    </>
  );
});

export default Group;
