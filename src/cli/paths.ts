import * as os from 'os';
import * as path from 'path';

const APP_NAME = 'HamsterBaseTasks';

export function getAppDataDir(): string {
  const home = os.homedir();
  if (!home) throw new Error('Home directory not found');
  switch (process.platform) {
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', APP_NAME);
    case 'linux':
      return path.join(home, '.config', APP_NAME);
    case 'win32':
      return path.join(home, 'AppData', 'Roaming', APP_NAME);
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

export function getDatabaseDir(databaseId: string): string {
  return path.join(getAppDataDir(), `hamster-base-tasks-${databaseId}`);
}

export function getCliConfigPath(): string {
  return path.join(getAppDataDir(), 'cli.json');
}
