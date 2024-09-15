import { useModal } from '@ebay/nice-modal-react';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';
import React, { useCallback, useRef } from 'react';

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

  const productBatchGroupInfoDrawer = useModal(ProductBatchGroupInfo);
  const showProductBatchGroupInfoDrawer = useCallback(() => {
    productBatchGroupInfoDrawer.show({
      productBatchGroupId: group.id,
    });
  }, [productBatchGroupInfoDrawer, group]);

  const ref = useRef<Panel>(null);

  const headerTemplate = (options: PanelHeaderTemplateOptions) => {
    console.log(options);
    const className = `${options.className} justify-content-space-between`;

    return (
      <div className={className}>
        <Button
          icon="pi pi-arrows-alt"
          // @ts-ignore
          ref={sortableData?.setActivatorNodeRef}
          {...sortableData?.listeners}
          className={classes.move}
        />

        <div
          onClick={showProductBatchGroupInfoDrawer}
          className={classes.headerInner}
        >
          {group.name} #{group.productBatchList.length}
        </div>

        {options.iconsElement}

        {/*<Button onClick={e => ref.current?.toggle(e)}>*/}
        {/*  <FontAwesomeIcon icon={openCollapse ? faAngleUp : faAngleDown} />*/}
        {/*</Button>*/}
      </div>
    );
  };

  return (
    <div className={classes.group}>
      <Panel headerTemplate={headerTemplate} toggleable ref={ref} collapsed>
        <div className={classes.collapsible}>{children}</div>
      </Panel>
    </div>
  );
});

export default ProductBatchGroupComponent;
