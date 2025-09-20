import React from 'react';
import { MobileHome } from './pages/home.tsx';
import { TodayPage } from './pages/today.tsx';
import { InboxPage } from './pages/inbox.tsx';
import { ProjectPage } from './pages/project.tsx';
import { AreaPage } from './pages/area.tsx';
import { MobileSettings } from './pages/settings';
import { ScheduledPage } from '@/mobile/pages/scheduled.tsx';
import { FutureProjectsPage } from './pages/futureProjectsPage.tsx';
import { CreateTaskActionSheet } from './pages/createTask.tsx';
import { LoginPage } from './pages/login';
import { LanguageSettings } from './pages/settings/languageSettings';
import { ThemeSettings } from '@/mobile/pages/settings/themeSettings.tsx';
import { TaskDisplaySettings } from '@/mobile/pages/settings/taskDisplaySettings.tsx';
import { CloudSettings } from '@/mobile/pages/settings/cloudSettings.tsx';
import { CreateDatabasePage } from '@/mobile/pages/settings/createDatabase.tsx';
import { DatabaseDetailPage } from '@/mobile/pages/settings/deatbaseDetail/databaseDetail.tsx';
import { ExportSettings } from '@/mobile/pages/settings/exportSettings.tsx';
import { AccountPage } from '@/mobile/pages/settings/account.tsx';
import { MobileCompleted } from '@/mobile/pages/completed.tsx';
import { ImportPage } from '@/mobile/pages/settings/import.tsx';
import { PrivacyPage } from '@/mobile/pages/settings/privacy.tsx';
import { EULAPage } from '@/mobile/pages/settings/eula.tsx';
import { AboutPage } from '@/mobile/pages/settings/about.tsx';
import { FeedbackPage } from '@/mobile/pages/settings/feedback.tsx';
import { SelfhostedSync } from './pages/settings/selfhosted-sync/selfhostedSync.tsx';

interface IPage {
  url: string;
  content: React.ReactNode;
}

export const pages: IPage[] = [
  {
    url: '/home',
    content: <MobileHome></MobileHome>,
  },
  {
    url: '/today',
    content: <TodayPage></TodayPage>,
  },
  {
    url: '/inbox',
    content: <InboxPage></InboxPage>,
  },
  {
    url: '/project/:projectUid',
    content: <ProjectPage></ProjectPage>,
  },
  {
    url: '/area/:areaUID',
    content: <AreaPage></AreaPage>,
  },
  {
    url: '/settings',
    content: <MobileSettings />,
  },
  {
    url: '/settings/language',
    content: <LanguageSettings />,
  },
  {
    url: '/settings/theme',
    content: <ThemeSettings />,
  },
  {
    url: '/settings/task-display',
    content: <TaskDisplaySettings />,
  },
  {
    url: '/settings/login',
    content: <LoginPage />,
  },
  {
    url: '/settings/cloud',
    content: <CloudSettings />,
  },
  {
    url: '/settings/account',
    content: <AccountPage />,
  },
  {
    url: '/settings/create-database',
    content: <CreateDatabasePage />,
  },
  {
    url: '/settings/cloud/database/:id',
    content: <DatabaseDetailPage />,
  },
  {
    url: '/settings/export',
    content: <ExportSettings />,
  },
  {
    url: '/settings/import',
    content: <ImportPage />,
  },
  {
    url: '/settings/feedback',
    content: <FeedbackPage />,
  },
  {
    url: '/completed',
    content: <MobileCompleted></MobileCompleted>,
  },
  {
    url: '/scheduled',
    content: <ScheduledPage></ScheduledPage>,
  },
  {
    url: '/future_projects',
    content: <FutureProjectsPage></FutureProjectsPage>,
  },
  {
    url: '/create_task',
    content: <CreateTaskActionSheet></CreateTaskActionSheet>,
  },
  {
    url: '/settings/privacy',
    content: <PrivacyPage />,
  },
  {
    url: '/settings/eula',
    content: <EULAPage />,
  },
  {
    url: '/settings/about',
    content: <AboutPage />,
  },
  {
    url: '/settings/selfhosted-sync',
    content: <SelfhostedSync />,
  },
];
