import { Router } from '@remix-run/router';
import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

import KanbanBoard from './components/KanbanBoard/KanbanBoard';
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
        path: 'kanban/:productId',
        element: <KanbanBoard />,
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
