import { Router } from '@remix-run/router';
import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

import KanbanBoard from './components/KanbanBoard/KanbanBoard';
import StoreComponent from './components/Store/Store';
import Root from './Root';

export const routeObject: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'kanban',
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
