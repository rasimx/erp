import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities/useSyntheticListeners';
import { useModal } from '@ebay/nice-modal-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback } from 'react';

import { Product } from '../../api/product/product.gql';
import { useProductBatchMutations } from '../../api/product-batch/product-batch.hook';
import { ProductBatchFragment, StatusFragment } from '../../gql-types/graphql';
// import CreateProductBatchForm from '../CreateProductBatch/ProductBatchForm';
import ProductBatchModal from '../CreateProductBatch/SelectProductBatch';

export interface Props {
  status: StatusFragment;
  product: Product;
  sortableData?: {
    listeners?: SyntheticListenerMap;
    setActivatorNodeRef: (element: HTMLElement | null) => void;
  };
  refetch?: () => void;
}

export const ColumnHeader = React.memo<Props>(props => {
  const { createProductBatch } = useProductBatchMutations();
  const { status, product, refetch, sortableData } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // const createProductBatchModal = useModal(CreateProductBatchForm);
  const showCreateProductBatchModal = useCallback(() => {
    // createProductBatchModal.show({
    //   initialValues: {
    //     product,
    //   },
    //   onSubmit: async values => {
    //     createProductBatch({
    //       ...omit(values, ['product']),
    //       productId: values.product.id,
    //       statusId: status.id,
    //       groupId: null,
    //     })
    //       .then(result => {
    //         // refetch();
    //       })
    //       .catch(err => {
    //         alert('ERROR');
    //       });
    //   },
    // });
    handleClose();
  }, [status]);

  const productBatchModal = useModal(ProductBatchModal);
  const showProductBatchModal = useCallback(() => {
    productBatchModal.show({
      productId: product.id,
      onSelect: (data: ProductBatchFragment) => {
        //   todo: move
      },
    });
    handleClose();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography
        id="modal-modal-title"
        variant="h6"
        fontSize={14}
        component="h2"
        sx={{ flexGrow: 1 }}
      >
        {product.name}
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
        <MenuItem onClick={showProductBatchModal}>
          Переместить сюда партию
        </MenuItem>
        <MenuItem onClick={showCreateProductBatchModal}>
          Добавить партию
        </MenuItem>
      </Menu>
    </Box>
  );
});

export default ColumnHeader;
