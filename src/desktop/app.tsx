import { DatePickerOverlay } from '@/desktop/overlay/datePicker/DatePickerOverlay';
import { DesktopMenu } from '@/desktop/overlay/desktopMenu/DesktopMenu.tsx';
import { useInputFocused } from '@/hooks/global/useInputFocused';
import React from 'react';
import { Navigate, useRoutes } from 'react-router';
import { SidebarLayout } from './layout/sidebar.tsx';
import { Inbox } from './pages/inbox';
import { AreaPage } from './pages/area';
import { ProjectPage } from './pages/project';
import { FutureProjects } from './pages/futureProjects';
import { Today } from './pages/today';
import { Schedule } from './pages/schedule';
import { Completed } from './pages/completed';

export const App = () => {
  useInputFocused();
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
          element: <Today />,
        },
        {
          path: 'schedule',
          element: <Schedule />,
        },
        {
          path: 'completed',
          element: <Completed />,
        },
        {
          path: 'future_projects',
          element: <FutureProjects />,
        },
        {
          path: 'area/:areaUid',
          element: <AreaPage />,
        },
        {
          path: 'project/:projectUid',
          element: <ProjectPage />,
        },
      ],
    },
  ]);

  return (
    <div>
      {element}
      <DesktopMenu />
      <DatePickerOverlay />
    </div>
  );
};
