import { checkPlatform } from '@/base/browser/checkPlatform';
import { initializeTheme, watchThemeChange } from '@/base/browser/initializeTheme';
import { initKeyboardListeners } from '@/base/browser/initKeyboardListeners';
import '@/base/commands/desktop';
import { GlobalContext } from '@/components/GlobalContext/GlobalContext';
import { CloudService, ICloudService } from '@/services/cloud/common/cloudService';
import { StandaloneCommandService } from '@/services/command/common/standaloneCommandService';
import { LocalStorageConfigStore } from '@/services/config/browser/localStorageConfigStore';
import { IConfigService, WorkbenchConfig } from '@/services/config/configService';
import { IndexdbDatabaseService } from '@/services/database/browser/indexdbDatabaseService';
import { IDatabaseService } from '@/services/database/common/database';
import { ElectronFsDatabaseService } from '@/services/database/native/electronFsDatabaseService';
import { EditService, IEditService } from '@/services/edit/common/editService';
import { IWorkbenchInstanceService, WorkbenchInstanceService } from '@/services/instance/common/instanceService';
import { StandaloneKeybindingService } from '@/services/keybinding/browser/standaloneKeybindingService';
import { IListService, ListService } from '@/services/list/common/listService';
import { INavigationService, NavigationService } from '@/services/navigationService/common/navigationService';
import { IWorkbenchOverlayService, WorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ISwitchService, SwitchService } from '@/services/switchService/common/switchService';
import { WorkbenchTodoService } from '@/services/todo/browser/workbenchTodoService';
import { ITodoService } from '@/services/todo/common/todoService';
import { WorkbenchWebLoggerService } from '@/services/weblogger/browser/workbenchWebLoggerService';
import { IWebLoggerService } from '@/services/weblogger/common/webloggerService';
import 'allotment/dist/style.css';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';
import { ICommandService } from 'vscf/platform/commands/common';
import { ContextKeyService } from 'vscf/platform/contextkey/browser';
import { IContextKeyService } from 'vscf/platform/contextkey/common';
import { InstantiationService, ServiceCollection, SyncDescriptor } from 'vscf/platform/instantiation/common';
import { IKeybindingService } from 'vscf/platform/keybinding/common';
import { App } from './app';

export async function startDesktop() {
  initializeTheme();
  watchThemeChange();
  initKeyboardListeners();
  const { isElectron } = checkPlatform();

  const serviceCollection = new ServiceCollection();
  serviceCollection.set(IWorkbenchOverlayService, new SyncDescriptor(WorkbenchOverlayService));
  serviceCollection.set(ITodoService, new SyncDescriptor(WorkbenchTodoService));
  serviceCollection.set(IConfigService, new SyncDescriptor(WorkbenchConfig, [new LocalStorageConfigStore()]));
  serviceCollection.set(INavigationService, new SyncDescriptor(NavigationService));
  serviceCollection.set(ICloudService, new SyncDescriptor(CloudService));
  serviceCollection.set(
    IDatabaseService,
    new SyncDescriptor(isElectron ? ElectronFsDatabaseService : IndexdbDatabaseService)
  );
  serviceCollection.set(ISwitchService, new SyncDescriptor(SwitchService));
  serviceCollection.set(IContextKeyService, new SyncDescriptor(ContextKeyService));
  serviceCollection.set(ICommandService, new SyncDescriptor(StandaloneCommandService));
  serviceCollection.set(IKeybindingService, new SyncDescriptor(StandaloneKeybindingService, [document.body]));
  serviceCollection.set(IListService, new SyncDescriptor(ListService));
  serviceCollection.set(IEditService, new SyncDescriptor(EditService));
  serviceCollection.set(IWorkbenchInstanceService, new SyncDescriptor(WorkbenchInstanceService));
  serviceCollection.set(IWebLoggerService, new SyncDescriptor(WorkbenchWebLoggerService));
  const instantiationService = new InstantiationService(serviceCollection, true);

  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(IConfigService).init();
  });
  await instantiationService.invokeFunction(async (dss) => {
    await dss.get(ICloudService).init();
  });

  instantiationService.invokeFunction(async (dss) => {
    console.log(`Found ${await dss.get(IKeybindingService).getKeybindings().length} keybindings`);
  });

  const globalContext = {
    instantiationService,
  };

  const Router = isElectron ? HashRouter : BrowserRouter;

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <GlobalContext.Provider value={globalContext}>
        <Router>
          <App></App>
        </Router>
      </GlobalContext.Provider>
    </StrictMode>
  );
}
