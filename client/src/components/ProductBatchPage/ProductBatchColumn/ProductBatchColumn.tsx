import { useModal } from '@ebay/nice-modal-react';
import {
  faEllipsisV,
  faUpDownLeftRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Card, Menu, Title } from '@mantine/core';
import omit from 'lodash/omit';
import React, { useCallback } from 'react';

import { ProductBatch } from '../../../api/product-batch/product-batch.gql';
import { useProductBatchMutations } from '../../../api/product-batch/product-batch.hook';
import { ProductBatchGroup } from '../../../api/product-batch-group/product-batch-group.gql';
import { StatusFragment } from '../../../gql-types/graphql';
import { CreateProductBatchModal } from '../../CreateProductBatch/CreateProductBatchForm';
import { CreateProductBatchesByAssemblingModal } from '../../CreateProductBatchesByAssembling/modal';
import { CreateProductBatchesFromSourcesModal } from '../../CreateProductBatchesFromSources/modal';
import CustomLink from '../../CustomLink';
import { ColumnProps } from '../../KanbanBoard/types';
import { StoreStateProvider } from '../../StoreState';
import classes from './ProductBatchColumn.module.scss';

export interface Props
  extends ColumnProps<StatusFragment, ProductBatchGroup, ProductBatch> {
  refetch: () => void;
}

export const ProductBatchColumn = React.memo<Props>(props => {
  const { createProductBatch } = useProductBatchMutations();
  const {
    column: status,
    refetch,
    sortableData,
    children,
    items,
    isActive,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const createProductBatchModal = useModal(CreateProductBatchModal);
  const showCreateProductBatchModal = useCallback(() => {
    createProductBatchModal.show({
      initialValues: {
        statusId: status.id,
      },
      onSubmit: async values => {
        // createProductBatch({
        //   ...omit(values, ['product']),
        //   productId: values.product.id,
        //   statusId: status.id,
        //   groupId: null,
        // })
        //   .then(result => {
        //     refetch();
        //   })
        //   .catch(err => {
        //     alert('ERROR');
        //   });
      },
    });
    handleClose();
  }, [status]);

  const createProductBatchesByAssemblingModal = useModal(
    CreateProductBatchesByAssemblingModal,
  );
  const showCreateProductBatchesByAssemblingModal = useCallback(() => {
    createProductBatchesByAssemblingModal.show({
      initialValues: {
        statusId: status.id,
      },
      onSubmit: async values => {
        // createProductBatch({
        //   ...omit(values, ['product']),
        //   productId: values.product.id,
        //   statusId: status.id,
        //   groupId: null,
        // })
        //   .then(result => {
        //     refetch();
        //   })
        //   .catch(err => {
        //     alert('ERROR');
        //   });
      },
    });
    handleClose();
  }, [status]);

  const createProductBatchesFromSourcesModal = useModal(
    CreateProductBatchesFromSourcesModal,
  );
  const showCreateProductBatchesFromSourcesModal = useCallback(() => {
    createProductBatchesFromSourcesModal.show({
      initialValues: {
        statusId: status.id,
      },
      onSubmit: async values => {
        // createProductBatch({
        //   ...omit(values, ['product']),
        //   productId: values.product.id,
        //   statusId: status.id,
        //   groupId: null,
        // })
        //   .then(result => {
        //     refetch();
        //   })
        //   .catch(err => {
        //     alert('ERROR');
        //   });
      },
    });
    handleClose();
  }, [status]);

  return (
    <StoreStateProvider status={status} items={items} skip={isActive}>
      <Card className={classes.column} padding="xs">
        <Card.Section className={classes.header}>
          <div className={classes.headerInner}>
            <ActionIcon
              variant="light"
              ref={sortableData?.setActivatorNodeRef}
              {...sortableData?.listeners}
            >
              <FontAwesomeIcon icon={faUpDownLeftRight} />
            </ActionIcon>

            <Title order={4}>
              <CustomLink to={`/status/${status.id}`} className={classes.link}>
                {status.title}
              </CustomLink>
            </Title>

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
                <Menu.Item onClick={showCreateProductBatchModal}>
                  Добавить партию товаров
                </Menu.Item>
                <Menu.Item onClick={showCreateProductBatchesFromSourcesModal}>
                  Перенос товаров
                </Menu.Item>
                <Menu.Item onClick={showCreateProductBatchesByAssemblingModal}>
                  Собрать комбо-товары
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Card.Section>
        <Card.Section className={classes.inner}>{children}</Card.Section>
      </Card>
    </StoreStateProvider>
  );
});

export default ProductBatchColumn;
