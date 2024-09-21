import React from 'react';
import { RouteObject } from 'react-router-dom';

import App from './components/App/App';
import EditForm from './components/EditForm/EditForm';
import { ProductBatchPage } from './components/ProductBatchPage/ProductBatchPage';
import ProductList from './components/ProductList';
import { StatusPage } from './components/StatusPage/StatusPage';

export const getRoutes = (basename?: string): RouteObject[] => [
  {
    path: basename ? `${basename}` : '*',
    element: <App basename={basename} />,
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
      {
        path: 'edit',
        element: <EditForm />,
      },
    ],
  },
];

export default {};
