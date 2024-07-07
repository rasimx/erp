import { Router } from '@remix-run/router';
import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { ProductBatchPage } from './components/ProductBatchPage/ProductBatchPage';
import ProductList from './components/ProductList';
import StoreComponent from './components/Store/Store';
import Root from './Root';

export const routeObject: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'products',
        element: <ProductList />,
      },
      {
        path: 'batch/:productId',
        element: <ProductBatchPage />,
      },
      {
        path: 'ozon-store/:statusId',
        element: <StoreComponent />,
      },
    ],
  },
];

export const createRouter = (basename?: string): Router => {
  return createBrowserRouter(routeObject, { basename });
};
