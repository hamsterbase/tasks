import { checkPlatform } from '@/base/browser/checkPlatform.ts';
import { initializeTheme, watchThemeChange } from '@/base/browser/initializeTheme.ts';
import { initKeyboardListeners } from '@/base/browser/initKeyboardListeners.ts';
import { CloudService, ICloudService } from '@/services/cloud/common/cloudService.ts';
import { LocalStorageConfigStore } from '@/services/config/browser/localStorageConfigStore.ts';
import { IConfigService, WorkbenchConfig } from '@/services/config/configService.ts';
import { IndexdbDatabaseService } from '@/services/database/browser/indexdbDatabaseService.ts';
import { IDatabaseService } from '@/services/database/common/database.ts';
import { FsDatabaseService } from '@/services/database/native/fsDatabaseService.ts';
import { INavigationService, NavigationService } from '@/services/navigationService/common/navigationService.ts';
import { IReminderService } from '@/services/reminders/common/reminderService.ts';
import { MobileReminderService } from '@/services/reminders/native/mobileReminderService.ts';
import { ISelfhostedSyncService } from '@/services/selfhostedSync/common/selfhostedSyncService.ts';
import { WorkbenchSelfhostedSyncService } from '@/services/selfhostedSync/common/workbenchSelfhostedSyncService.ts';
import { ISwitchService, SwitchService } from '@/services/switchService/common/switchService.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { WorkbenchWebLoggerService } from '@/services/weblogger/browser/workbenchWebLoggerService.ts';
import { IWebLoggerService } from '@/services/weblogger/common/webloggerService.ts';
import { Directory } from '@capacitor/filesystem';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InstantiationService, ServiceCollection, SyncDescriptor } from 'vscf/platform/instantiation/common.ts';
import { GlobalContext } from '../components/GlobalContext/GlobalContext.tsx';
import {
  IWorkbenchOverlayService,
  WorkbenchOverlayService,
} from '../services/overlay/common/WorkbenchOverlayService.ts';
import { WorkbenchTodoService } from '../services/todo/browser/workbenchTodoService.ts';
import '../styles/main.css';
import { App } from './App.tsx';

export const startMobile = async () => {
  initializeTheme();
  watchThemeChange();
  initKeyboardListeners();
  const serviceCollection = new ServiceCollection();
  serviceCollection.set(IWorkbenchOverlayService, new SyncDescriptor(WorkbenchOverlayService));
  serviceCollection.set(ITodoService, new SyncDescriptor(WorkbenchTodoService));
  serviceCollection.set(IConfigService, new SyncDescriptor(WorkbenchConfig, [new LocalStorageConfigStore()]));
  serviceCollection.set(INavigationService, new SyncDescriptor(NavigationService));
  serviceCollection.set(ICloudService, new SyncDescriptor(CloudService));
  serviceCollection.set(IWebLoggerService, new SyncDescriptor(WorkbenchWebLoggerService));
  serviceCollection.set(IReminderService, new SyncDescriptor(MobileReminderService));
  serviceCollection.set(ISelfhostedSyncService, new SyncDescriptor(WorkbenchSelfhostedSyncService));
  if (checkPlatform().isNative) {
    serviceCollection.set(IDatabaseService, new SyncDescriptor(FsDatabaseService, [Directory.Data]));
  } else {
    serviceCollection.set(IDatabaseService, new SyncDescriptor(IndexdbDatabaseService));
  }
  serviceCollection.set(ISwitchService, new SyncDescriptor(SwitchService));
  const instantiationService = new InstantiationService(serviceCollection, true);
  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(ISwitchService).init();
  });
  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(IConfigService).init();
  });
  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(ICloudService).init();
  });
  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(ISelfhostedSyncService).init();
  });
  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(IReminderService).start();
  });

  const globalContext = {
    instantiationService,
  };

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <GlobalContext.Provider value={globalContext}>
        <App />
      </GlobalContext.Provider>
    </StrictMode>
  );
};
