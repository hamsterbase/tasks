import { DatePickerOverlay } from '@/desktop/overlay/datePicker/DatePickerOverlay';
import { DesktopMenu } from '@/desktop/overlay/desktopMenu/DesktopMenu.tsx';
import { DesktopDialog } from '@/desktop/overlay/desktopDialog/DesktopDialog';
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
import { SettingsLayout } from './pages/settings/SettingsLayout';
import { AppearanceSettings } from './pages/settings/AppearanceSettings';
import { SyncSettings } from './pages/settings/SyncSettings';
import { AccountSettings } from './pages/settings/AccountSettings';
import { ImportExportSettings } from './pages/settings/ImportExportSettings';
import { Privacy } from './pages/Privacy';
import { EULA } from './pages/EULA';

export const App = () => {
  useInputFocused();
  const element = useRoutes([
    {
      path: '/desktop',
      children: [
        {
          path: '',
          element: <SidebarLayout />,
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
        {
          path: 'settings',
          element: <SidebarLayout hideSelectionPanel />,
          children: [
            {
              path: '',
              element: <SettingsLayout />,
              children: [
                {
                  index: true,
                  element: <Navigate to="appearance" replace />,
                },
                {
                  path: 'appearance',
                  element: <AppearanceSettings />,
                },
                {
                  path: 'sync',
                  element: <SyncSettings />,
                },
                {
                  path: 'account',
                  element: <AccountSettings />,
                },
                {
                  path: 'import-export',
                  element: <ImportExportSettings />,
                },
              ],
            },
          ],
        },
        {
          path: 'privacy',
          element: <Privacy />,
        },
        {
          path: 'eula',
          element: <EULA />,
        },
      ],
    },
  ]);

  return (
    <div>
      {element}
      <DesktopMenu />
      <DatePickerOverlay />
      <DesktopDialog />
    </div>
  );
};
