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
        {
          path: 'today',
          element: <div>今天</div>,
        },
        {
          path: 'schedule',
          element: <div>日程</div>,
        },
        {
          path: 'completed',
          element: <div>已完成</div>,
        },
      ],
    },
  ]);
  return <div>{element}</div>;
};
