import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities/useSyntheticListeners';
import { useModal } from '@ebay/nice-modal-react';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Menu, Title } from '@mantine/core';
import React, { useCallback } from 'react';

import { Product } from '../../api/product/product.gql';
import { useProductBatchMutations } from '../../api/product-batch/product-batch.hook';
import { ProductBatchFragment, StatusFragment } from '../../gql-types/graphql';
// import CreateProductBatchForm from '../CreateProductBatch/ProductBatchForm';
import { SelectProductBatchModal } from '../CreateProductBatch/SelectProductBatch';

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

  const productBatchModal = useModal(SelectProductBatchModal);
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Title style={{ flexGrow: 1 }}>{product.name}</Title>

      <Menu
        shadow="md"
        width={200}
        trigger="hover"
        openDelay={100}
        closeDelay={400}
        position="bottom-end"
      >
        <Menu.Target>
          <ActionIcon onClick={handleClick} variant="light">
            <FontAwesomeIcon icon={faEllipsisV} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item onClick={showProductBatchModal}>
            Переместить сюда партию
          </Menu.Item>
          <Menu.Item onClick={showCreateProductBatchModal}>
            Добавить партию
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
});

export default ColumnHeader;
