import React, { type FC } from 'react';

import { Product } from '../../api/product/product.gql';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { StatusFragment } from '../../gql-types/graphql';
import { ProductBatchCard } from '../ProductBatchPage/ProductBatchCard/ProductBatchCard';
import { useStoreStateByProductId } from '../StoreState';
import classes from './Column.module.scss';
import ColumnHeader from './ColumnHeader';

export type A = {
  product: Product;
  productBatchList: ProductBatch[];
};

interface Props {
  item: A;
  status: StatusFragment;
}

const Column: FC<Props> = props => {
  const { item, status } = props;
  const { product, productBatchList } = item;
  const storeState = useStoreStateByProductId(product.id);

  const listItems: { label: string; value: string | number }[] = [];
  if (storeState) {
    const linkedCount = storeState.linkedSales.reduce(
      (prev, cur) => prev + cur.count,
      0,
    );
    listItems.push(
      ...[
        {
          label: 'Всего',
          value:
            storeState.inStoreCount +
            storeState.unlinkedSalesCount +
            linkedCount,
        },
        {
          label: 'На складе FBO',
          value: storeState.inStoreCount,
        },
        {
          label: 'Учтенных',
          value: linkedCount,
        },
        {
          label: 'Не учтенных',
          value: storeState.unlinkedSalesCount,
        },
      ],
    );
  }

  return (
    <div className={classes.column} {...item}>
      <ColumnHeader status={status} product={product} />
      <div style={{ fontSize: 12 }}>
        {listItems.map((item, index) => (
          <div
            style={{ display: 'flex', justifyContent: 'space-between' }}
            key={index}
          >
            <div>{item.label}</div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {productBatchList.map(item => (
          <ProductBatchCard card={item} refetch={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default Column;
