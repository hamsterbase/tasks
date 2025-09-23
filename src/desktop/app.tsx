import { SidebarLayout } from '@/desktop/components/SidebarLayout/SidebarLayout.tsx';
import { CreateDatabaseOverlay } from '@/desktop/overlay/createDatabase/CreateDatabaseOverlay';
import { DatePickerOverlay } from '@/desktop/overlay/datePicker/DatePickerOverlay';
import { DesktopDialog } from '@/desktop/overlay/desktopDialog/DesktopDialog';
import { DesktopMenu } from '@/desktop/overlay/desktopMenu/DesktopMenu.tsx';
import { DesktopMessage } from '@/desktop/overlay/desktopMessage/DesktopMessage';
import { TagEditorOverlay } from '@/desktop/overlay/tagEditor/TagEditorOverlay';
import { TimePickerOverlay } from '@/desktop/overlay/timePicker/TimePickerOverlay';
import { TreeSelectOverlay } from '@/desktop/overlay/treeSelect/TreeSelectOverlay';
import { AreaPage } from '@/desktop/pages/area';
import { Completed } from '@/desktop/pages/completed';
import { FutureProjects } from '@/desktop/pages/futureProjects';
import { Inbox } from '@/desktop/pages/inbox';
import { ProjectPage } from '@/desktop/pages/project';
import { Schedule } from '@/desktop/pages/schedule';
import { EULA } from '@/desktop/pages/settings/account/eula/EULA.tsx';
import { Privacy } from '@/desktop/pages/settings/account/Privacy.tsx';
import { AccountSettings } from '@/desktop/pages/settings/AccountSettings';
import { AppearanceSettings } from '@/desktop/pages/settings/AppearanceSettings';
import { SyncSettings } from '@/desktop/pages/settings/databases/SyncSettings.tsx';
import { ImportExportSettings } from '@/desktop/pages/settings/ImportExportSettings';
import { LoginPage } from '@/desktop/pages/settings/Login/LoginPage.tsx';
import { RegisterPage } from '@/desktop/pages/settings/Register/RegisterPage.tsx';
import { SelfHostedSyncSettings } from '@/desktop/pages/settings/sync/SelfHostedSyncSettings.tsx';
import { Today } from '@/desktop/pages/today/index.tsx';
import { useInputFocused } from '@/hooks/global/useInputFocused';
import { useCloudSync } from '@/hooks/useCloudSync.ts';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useService } from '@/hooks/use-service';
import { IMenuService } from '@/services/menu/common/menuService';
import React, { useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router';

export const App = () => {
  useInputFocused();
  useCloudSync();

  const menuService = useService(IMenuService);
  useEffect(() => {
    menuService.updateMenu();
  }, [menuService]);

  useEffect(() => {
    const originalFontSize = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = '14px';
    return () => {
      document.documentElement.style.fontSize = originalFontSize;
    };
  }, []);
  useSafeArea();

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
                  path: 'selfhosted-sync',
                  element: <SelfHostedSyncSettings />,
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
      <TimePickerOverlay />
      <TagEditorOverlay />
      <DesktopDialog />
      <DesktopMessage />
      <CreateDatabaseOverlay />
      <TreeSelectOverlay />
    </div>
  );
};
