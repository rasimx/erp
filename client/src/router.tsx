import { Router } from '@remix-run/router';
import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

import Kanban from './components/Kanban/Kanban';
import ProductBatch from './components/Kanban/ProductBatch';
import Graph from './Graph';
import Root from './Root';

export const routeObject: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'kanban',
        element: <Kanban />,
      },
      {
        path: 'graph',
        element: <Graph />,
      },
      {
        path: 'product-batch/:productBatchId',
        element: <ProductBatch />,
      },
    ],
  },
];

export const createRouter = (basename?: string): Router => {
  return createBrowserRouter(routeObject, { basename });
};
