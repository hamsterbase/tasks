import React from 'react';
import { useRoutes, Navigate } from 'react-router';
import { SidebarLayout } from './layout/sidebar.tsx';
import { Inbox } from './pages/inbox';

export const App = () => {
  const element = useRoutes([
    {
      path: '/desktop',
      element: <SidebarLayout></SidebarLayout>,
      children: [
        {
          index: true,
          element: <Navigate to="inbox" replace />,
        },
        {
          path: 'inbox',
          element: <Inbox />,
        },
        {
          path: 'today',
          element: <div>Today</div>,
        },
        {
          path: 'schedule',
          element: <div>Schedule</div>,
        },
        {
          path: 'completed',
          element: <div>Completed</div>,
        },
      ],
    },
  ]);

  return <div>{element}</div>;
};
