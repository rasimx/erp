import { useModal } from '@ebay/nice-modal-react';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';
import React, { useCallback, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { ProductBatchGroup } from '../../../api/product-batch-group/product-batch-group.gql';
import { GroupProps } from '../../KanbanBoard/types';
import { MoveBtn } from '../MoveBtn/MoveBtn';
import ProductBatchGroupInfo from '../ProductBatchGroupDetail/ProductBatchGroupDetail';
import classes from './ProductBatchGroup.module.scss';

export interface Props extends GroupProps<ProductBatchGroup> {
  refetch: () => void;
}

export const ProductBatchGroupComponent = React.memo<Props>(props => {
  const { group, refetch, sortableData, children } = props;

  const productBatchGroupInfoDrawer = useModal(ProductBatchGroupInfo);
  const showProductBatchGroupInfoDrawer = useCallback(() => {
    productBatchGroupInfoDrawer.show({
      productBatchGroupId: group.id,
    });
  }, [productBatchGroupInfoDrawer, group]);

  const [openContent, setOpenContent] = useState(false);
  const contentRef = useRef(null);

  return (
    <div className={classes.group}>
      <div className={classes.header}>
        <MoveBtn sortableData={sortableData} />

        <div
          onClick={showProductBatchGroupInfoDrawer}
          className={classes.headerInner}
        >
          {group.name} #{group.productBatchList.length}
        </div>

        <Button
          onClick={() => setOpenContent(!openContent)}
          outlined
          className={classes.collapseBtn}
          pt={{}}
        >
          <FontAwesomeIcon icon={openContent ? faAngleUp : faAngleDown} />
        </Button>
      </div>
      <div className={classes.content}>
        <div className={classes.info}>
          <strong> {group.productBatchList.length} позиций</strong>
        </div>
        <CSSTransition
          nodeRef={contentRef}
          in={openContent}
          timeout={300}
          classNames="p-toggleable-content"
          addEndListener={() => {}}
          unmountOnExit
          onEnter={() => setOpenContent(true)}
          onExited={() => setOpenContent(false)}
        >
          <div ref={contentRef}>
            <div className={classes.collapsible}>{children}</div>
          </div>
        </CSSTransition>
      </div>
    </div>
  );
});

export default ProductBatchGroupComponent;
