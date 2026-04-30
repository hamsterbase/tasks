import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron';
import * as os from 'os';
import * as path from 'path';
import { ElectronDatabaseService } from './databaseService';

let mainWindow: BrowserWindow | null = null;

// Determine base path for database storage
const homeDir = os.homedir();
if (!homeDir) {
  throw new Error('Home directory not found');
}
const appName = 'HamsterBaseTasks';
// Platform-specific paths
let basePath: string;
if (process.mas) {
  basePath = app.getPath('userData');
} else if (process.platform === 'darwin') {
  basePath = path.join(homeDir, 'Library', 'Application Support', appName);
} else if (process.platform === 'linux') {
  basePath = path.join(homeDir, '.config', appName);
} else if (process.platform === 'win32') {
  basePath = path.join(homeDir, 'AppData', 'Roaming', appName);
} else {
  throw new Error(`Unsupported platform: ${process.platform}`);
}

const databaseService: ElectronDatabaseService = new ElectronDatabaseService(basePath);

const isMac = process.platform === 'darwin';

function createWindow() {
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'preload.js'),
    },
  };

  // macOS specific options
  if (isMac) {
    windowOptions.titleBarStyle = 'hiddenInset';
    windowOptions.trafficLightPosition = { x: 15, y: 15 };
  } else {
    // Windows/Linux options
    windowOptions.frame = true;
  }

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadFile(path.join(app.getAppPath(), 'frontend', 'index.html'));
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function restoreMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    return;
  }
  createWindow();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('is-fullscreen', () => {
  return mainWindow?.isFullScreen() || false;
});

// Menu item click handlers can only run in the main process. Items sent via IPC
// from the renderer carry an `id` marker; we attach the matching handler here.
function injectMenuActions(items: Electron.MenuItemConstructorOptions[]): Electron.MenuItemConstructorOptions[] {
  return items.map((item) => {
    const next: Electron.MenuItemConstructorOptions = { ...item };
    if (next.id === 'restore-window') {
      next.click = () => restoreMainWindow();
    }
    if (Array.isArray(next.submenu)) {
      next.submenu = injectMenuActions(next.submenu as Electron.MenuItemConstructorOptions[]);
    }
    return next;
  });
}

class ElectronMenuService {
  setApplicationMenu(template: Electron.MenuItemConstructorOptions[]) {
    const menu = Menu.buildFromTemplate(injectMenuActions(template));
    Menu.setApplicationMenu(menu);
  }
}

const menuService = new ElectronMenuService();

class ElectronDockBadgeService {
  setBadge(count: number) {
    if (process.platform !== 'darwin') {
      return;
    }

    if (!app.dock) {
      console.warn('app.dock is not available');
      return;
    }

    const badgeString = count > 0 ? String(count) : '';
    app.dock.setBadge(badgeString);
  }
}

const dockBadgeService = new ElectronDockBadgeService();

// Service registry
const services: Record<string, unknown> = {
  databaseService: databaseService,
  menuService: menuService,
  dockBadgeService: dockBadgeService,
};

// Generic service handler
ipcMain.handle('service-channel-call', async (_event, { serviceName, method, args }) => {
  try {
    const service = services[serviceName];
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceMethod = (service as any)[method];
    if (typeof serviceMethod !== 'function') {
      throw new Error(`Method '${method}' not found on service '${serviceName}'`);
    }

    return await serviceMethod.apply(service, args);
  } catch (error) {
    // Return error with message and stack trace
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return {
      __isError: true,
      message: errorMessage,
      stack: errorStack,
    };
  }
});
