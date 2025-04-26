import React from 'react';
import { useRoutes } from 'react-router';
import { SidebarLayout } from './layout/sidebar.tsx';

export const App = () => {
  const element = useRoutes([
    {
      path: '/desktop',
      element: <SidebarLayout></SidebarLayout>,
      children: [
        {
          path: 'inbox',
          element: <div>inbox</div>,
        },
      ],
    },
  ]);
  return <div>{element}</div>;
};
