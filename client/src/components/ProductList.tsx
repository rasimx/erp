import React, { type FC } from 'react';

import { Product } from '../api/product/product.gql';
import { useProductList } from '../api/product/product.hooks';
import CustomLink from './CustomLink';

export interface Props {}

const ProductList: FC<Props> = props => {
  const { items: productList } = useProductList();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {productList.map((product: Product) => (
        <CustomLink
          to={`/kanban/${product.id}`}
          style={{ textDecoration: 'none' }}
          key={product.id}
        >
          <strong>{product.sku}</strong>
          <br />
          <span>{product.name} </span>
        </CustomLink>
      ))}
    </div>
  );
};

export default ProductList;
