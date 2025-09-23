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
if (process.platform === 'darwin') {
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

class ElectronMenuService {
  setApplicationMenu(template: Electron.MenuItemConstructorOptions[]) {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

const menuService = new ElectronMenuService();

// Service registry
const services: Record<string, unknown> = {
  databaseService: databaseService,
  menuService: menuService,
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
