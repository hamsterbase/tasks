import { CreateDatabaseOverlay } from '@/desktop/overlay/createDatabase/CreateDatabaseOverlay';
import { DatePickerOverlay } from '@/desktop/overlay/datePicker/DatePickerOverlay';
import { DesktopDialog } from '@/desktop/overlay/desktopDialog/DesktopDialog';
import { DesktopMenu } from '@/desktop/overlay/desktopMenu/DesktopMenu.tsx';
import { DesktopMessage } from '@/desktop/overlay/desktopMessage/DesktopMessage';
import { TagEditorOverlay } from '@/desktop/overlay/tagEditor/TagEditorOverlay';
import { TreeSelectOverlay } from '@/desktop/overlay/treeSelect/TreeSelectOverlay';
import { Privacy } from '@/desktop/pages/settings/account/Privacy.tsx';
import { useInputFocused } from '@/hooks/global/useInputFocused';
import { useCloudSync } from '@/hooks/useCloudSync.ts';
import React, { useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router';
import { SidebarLayout } from './layout/sidebar.tsx';
import { AreaPage } from './pages/area';
import { Completed } from './pages/completed';
import { FutureProjects } from './pages/futureProjects';
import { Inbox } from './pages/inbox';
import { ProjectPage } from './pages/project';
import { Schedule } from './pages/schedule';
import { EULA } from './pages/settings/account/eula/EULA.tsx';
import { AccountSettings } from './pages/settings/AccountSettings';
import { AppearanceSettings } from './pages/settings/AppearanceSettings';
import { SyncSettings } from './pages/settings/databases/SyncSettings.tsx';
import { ImportExportSettings } from './pages/settings/ImportExportSettings';
import { LoginPage } from './pages/settings/Login/LoginPage.tsx';
import { RegisterPage } from './pages/settings/Register/RegisterPage.tsx';
import { Today } from './pages/today/index.tsx';

export const App = () => {
  useInputFocused();
  useCloudSync();
  useEffect(() => {
    const originalFontSize = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = '14px';
    return () => {
      document.documentElement.style.fontSize = originalFontSize;
    };
  }, []);
  const element = useRoutes([
    {
      path: '/desktop',
      children: [
        {
          path: '',
          element: <SidebarLayout setting={false} />,
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
          element: <SidebarLayout setting={true} />,
          children: [
            {
              path: '',
              children: [
                {
                  index: true,
                  element: <Navigate to="appearance" replace />,
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
                  path: 'appearance',
                  element: <AppearanceSettings />,
                },
                {
                  path: 'sync',
                  element: <SyncSettings />,
                },
                {
                  path: 'account',
                  children: [
                    {
                      index: true,
                      element: <Navigate to="detail" replace />,
                    },
                    {
                      path: 'login',
                      element: <LoginPage />,
                    },
                    {
                      path: 'register',
                      element: <RegisterPage />,
                    },
                    {
                      path: 'detail',
                      element: <AccountSettings />,
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
                {
                  path: 'import-export',
                  element: <ImportExportSettings />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/desktop/inbox" replace />,
    },
  ]);

  return (
    <div>
      {element}
      <DesktopMenu />
      <DatePickerOverlay />
      <TagEditorOverlay />
      <DesktopDialog />
      <DesktopMessage />
      <CreateDatabaseOverlay />
      <TreeSelectOverlay />
    </div>
  );
};
