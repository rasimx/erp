import { useModal } from '@ebay/nice-modal-react';
import {
  faAngleDown,
  faAngleUp,
  faUpDownLeftRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Card, Collapse } from '@mantine/core';
import React, { useCallback } from 'react';

import { ProductBatchGroup } from '../../../api/product-batch-group/product-batch-group.gql';
import { GroupProps } from '../../KanbanBoard/types';
import ProductBatchGroupInfo from '../ProductBatchGroupDetail';
import classes from './ProductBatchGroup.module.scss';

export interface Props extends GroupProps<ProductBatchGroup> {
  refetch: () => void;
}

export const ProductBatchGroupComponent = React.memo<Props>(props => {
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
    <div className={classes.group}>
      <div className={classes.header}>
        <ActionIcon
          variant="light"
          ref={sortableData?.setActivatorNodeRef}
          {...sortableData?.listeners}
        >
          <FontAwesomeIcon icon={faUpDownLeftRight} />
        </ActionIcon>

        <div
          onClick={showProductBatchGroupInfoDrawer}
          className={classes.headerInner}
        >
          {group.name} #{group.productBatchList.length}
        </div>

        <ActionIcon variant="light" onClick={handleClickCollapse}>
          <FontAwesomeIcon icon={openCollapse ? faAngleUp : faAngleDown} />
        </ActionIcon>
      </div>
      <Collapse in={openCollapse}>
        <div className={classes.inner}>{children}</div>
      </Collapse>
    </div>
  );
});

export default ProductBatchGroupComponent;
