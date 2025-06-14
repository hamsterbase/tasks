import { initializeTheme, watchThemeChange } from '@/base/browser/initializeTheme';
import { initKeyboardListeners } from '@/base/browser/initKeyboardListeners';
import { GlobalContext } from '@/components/GlobalContext/GlobalContext';
import { InstantiationService, ServiceCollection, SyncDescriptor } from '@/packages/vscf/platform/instantiation/common';
import { CloudService, ICloudService } from '@/services/cloud/common/cloudService';
import { LocalStorageConfigStore } from '@/services/config/browser/localStorageConfigStore';
import { IConfigService, WorkbenchConfig } from '@/services/config/configService';
import { IndexdbDatabaseService } from '@/services/database/browser/indexdbDatabaseService';
import { IDatabaseService } from '@/services/database/common/database';
import { INavigationService, NavigationService } from '@/services/navigationService/common/navigationService';
import { IWorkbenchOverlayService, WorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ISwitchService, SwitchService } from '@/services/switchService/common/switchService';
import { WorkbenchTodoService } from '@/services/todo/browser/workbenchTodoService';
import { ITodoService } from '@/services/todo/common/todoService';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './app';
import 'allotment/dist/style.css';
import { ISelectionService } from '@/services/selection/common/selectionService';
import { SelectionService } from '@/services/selection/browser/selectionService';

export async function start() {
  initializeTheme();
  watchThemeChange();
  initKeyboardListeners();
  const serviceCollection = new ServiceCollection();
  serviceCollection.set(IWorkbenchOverlayService, new SyncDescriptor(WorkbenchOverlayService));
  serviceCollection.set(ITodoService, new SyncDescriptor(WorkbenchTodoService));
  serviceCollection.set(IConfigService, new SyncDescriptor(WorkbenchConfig, [new LocalStorageConfigStore()]));
  serviceCollection.set(INavigationService, new SyncDescriptor(NavigationService));
  serviceCollection.set(ICloudService, new SyncDescriptor(CloudService));
  serviceCollection.set(ISelectionService, new SyncDescriptor(SelectionService));
  serviceCollection.set(IDatabaseService, new SyncDescriptor(IndexdbDatabaseService));
  serviceCollection.set(ISwitchService, new SyncDescriptor(SwitchService));
  const instantiationService = new InstantiationService(serviceCollection, true);
  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(IConfigService).init();
  });
  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(ICloudService).init();
  });

  const globalContext = {
    instantiationService,
  };

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <GlobalContext.Provider value={globalContext}>
        <BrowserRouter>
          <App></App>
        </BrowserRouter>
      </GlobalContext.Provider>
    </StrictMode>
  );
}
