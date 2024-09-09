import { Card, Stack } from '@mui/material';
import React, { type FC } from 'react';
import { Link } from 'react-router-dom';

import { Product } from '../api/product/product.gql';
import { useProductList } from '../api/product/product.hooks';

export interface Props {}

const ProductList: FC<Props> = ({}) => {
  const { items: productList } = useProductList();

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      {productList.map((product: Product) => (
        <Card
          elevation={3}
          component={Link}
          to={`/kanban/${product.id}`}
          sx={{ textDecoration: 'none', p: 2 }}
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
