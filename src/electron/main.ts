import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as os from 'os';
import * as path from 'path';
import { ElectronDatabaseService } from './databaseService';

let mainWindow: BrowserWindow | null = null;

// Platform check
if (process.platform !== 'darwin') {
  console.error(`Platform ${process.platform} is not supported yet`);
  app.quit();
}

// Determine base path for database storage
const homeDir = os.homedir();
if (!homeDir) {
  throw new Error('Home directory not found');
}
const appName = 'HamsterBaseTasks';
const basePath = path.join(homeDir, 'Library', 'Application Support', appName);

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

// Service registry
const services: Record<string, unknown> = {
  databaseService: databaseService,
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
