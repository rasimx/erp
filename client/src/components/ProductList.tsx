import { Card, Stack } from '@mantine/core';
import React, { type FC } from 'react';
import { Link } from 'react-router-dom';

import { Product } from '../api/product/product.gql';
import { useProductList } from '../api/product/product.hooks';

export interface Props {}

const ProductList: FC<Props> = ({}) => {
  const { items: productList } = useProductList();

  return (
    <Stack>
      {productList.map((product: Product) => (
        <Card
          component={Link}
          to={`/kanban/${product.id}`}
          style={{ textDecoration: 'none', p: 2 }}
          key={product.id}
        >
          <strong>{product.sku}</strong>
          <br />
          <span>{product.name} </span>
        </Card>
      ))}
    </Stack>
  );
};

export default ProductList;
