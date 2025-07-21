import { DatePickerOverlay } from '@/desktop/overlay/datePicker/DatePickerOverlay';
import { CreateDatabaseOverlay } from '@/desktop/overlay/createDatabase/CreateDatabaseOverlay';
import { DesktopDialog } from '@/desktop/overlay/desktopDialog/DesktopDialog';
import { DesktopMenu } from '@/desktop/overlay/desktopMenu/DesktopMenu.tsx';
import { DesktopMessage } from '@/desktop/overlay/desktopMessage/DesktopMessage';
import { TreeSelectOverlay } from '@/desktop/overlay/treeSelect/TreeSelectOverlay';
import { useInputFocused } from '@/hooks/global/useInputFocused';
import React from 'react';
import { Navigate, useRoutes } from 'react-router';
import { SidebarLayout } from './layout/sidebar.tsx';
import { AreaPage } from './pages/area';
import { Completed } from './pages/completed';
import { EULA } from './pages/EULA';
import { FutureProjects } from './pages/futureProjects';
import { Inbox } from './pages/inbox';
import { Logs } from './pages/logger';
import { Privacy } from './pages/Privacy';
import { ProjectPage } from './pages/project';
import { Schedule } from './pages/schedule';
import { AccountSettings } from './pages/settings/AccountSettings';
import { AppearanceSettings } from './pages/settings/AppearanceSettings';
import { SyncSettings } from './pages/settings/databases/SyncSettings.tsx';
import { ImportExportSettings } from './pages/settings/ImportExportSettings';
import { SettingsLayout } from './pages/settings/SettingsLayout';
import { Today } from './pages/today/index.tsx';

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
        {
          path: 'logs',
          element: <Logs />,
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
      <DesktopMessage />
      <CreateDatabaseOverlay />
      <TreeSelectOverlay />
    </div>
  );
};
