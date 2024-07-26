import { Router } from '@remix-run/router';
import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { ProductBatchPage } from './components/ProductBatchPage/ProductBatchPage';
import ProductList from './components/ProductList';
import { StatusPage } from './components/StatusPage/StatusPage';
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
        path: 'batch',
        element: <ProductBatchPage />,
      },
      {
        path: 'batch/:productId',
        element: <ProductBatchPage />,
      },
      {
        path: 'status/:statusId',
        element: <StatusPage />,
      },
    ],
  },
];

export const createRouter = (basename?: string): Router => {
  return createBrowserRouter(routeObject, { basename });
};
