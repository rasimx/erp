import { useModal } from '@ebay/nice-modal-react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { Collapse, IconButton, Menu, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback } from 'react';

import { useOperation } from '../../api/operation/operation.hooks';
import { ProductBatchGroup } from '../../api/product-batch-group/product-batch-group.gql';
import { useProductBatchGroupMutations } from '../../api/product-batch-group/product-batch-group.hook';
import { toRouble } from '../../utils';
import { GroupProps } from '../KanbanBoard/types';
import OperationForm from '../OperationForm/OperationForm';
import ProductBatchGroupInfo from './ProductBatchGroupDetail';

export interface Props extends GroupProps<ProductBatchGroup> {
  refetch: () => void;
}

export const Group = React.memo<Props>(props => {
  const { group, refetch, sortableData, children } = props;

  const [openCollapse, setOpenCollapse] = React.useState(false);

  const handleClickCollapse = () => {
    setOpenCollapse(!openCollapse);
  };

  const productBatchGroupInfoDrawer = useModal(ProductBatchGroupInfo);
  const showProductBatchGroupInfoDrawer = useCallback(() => {
    productBatchGroupInfoDrawer.show({
      productBatchGroupId: group.id,
    });
  }, [productBatchGroupInfoDrawer, group]);

  return (
    <>
      <Box
        sx={{
          background: '#FAFAFA',
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

            <Box
              onClick={showProductBatchGroupInfoDrawer}
              sx={{ cursor: 'pointer', fontWeight: 600 }}
            >
              {group.name} #{group.productBatchList.length}
            </Box>

            <IconButton
              sx={{
                cursor: 'pointer',
              }}
              onClick={handleClickCollapse}
            >
              {openCollapse ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Collapse in={openCollapse} timeout="auto" unmountOnExit>
        <Box>{children}</Box>
      </Collapse>
    </>
  );
});

export default Group;
