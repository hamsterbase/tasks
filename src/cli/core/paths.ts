import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

const APP_NAME = 'HamsterBaseTasks';

// MAS (Mac App Store) build is sandboxed; its data lives in the container.
// Keep these in sync with scripts/commands/electronPack/config/mas-universal.ts
const MAS_APP_ID = 'com.hamsterbase.tasks-desktop-mas';
const MAS_PRODUCT_NAME = 'Hamsterbase Tasks Desktop';

const DB_DIR_PREFIX = 'hamster-base-tasks-';

function homeDir(): string {
  const home = os.homedir();
  if (!home) throw new Error('Home directory not found');
  return home;
}

/**
 * Ordered list of base directories that may contain databases.
 *
 * - `HAMSTERBASE_TASKS_DATA_DIR` forces a single directory (used by tests).
 * - macOS returns both the regular path and the MAS sandbox container so the
 *   CLI sees data regardless of which desktop build wrote it.
 */
export function getDataDirs(): string[] {
  const override = process.env.HAMSTERBASE_TASKS_DATA_DIR;
  if (override) return [override];

  const home = homeDir();
  switch (process.platform) {
    case 'darwin':
      return [
        path.join(home, 'Library', 'Application Support', APP_NAME),
        path.join(
          home,
          'Library',
          'Containers',
          MAS_APP_ID,
          'Data',
          'Library',
          'Application Support',
          MAS_PRODUCT_NAME
        ),
      ];
    case 'linux':
      return [path.join(home, '.config', APP_NAME)];
    case 'win32':
      return [path.join(home, 'AppData', 'Roaming', APP_NAME)];
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

/** Primary directory: where new databases and config are written. */
export function getPrimaryDataDir(): string {
  return getDataDirs()[0];
}

/**
 * Directory of a specific database. Searches every data dir and returns the
 * first one that actually holds it; falls back to the primary dir for new or
 * not-yet-created databases (e.g. `local`).
 */
export async function resolveDatabaseDir(databaseId: string): Promise<string> {
  const dirName = `${DB_DIR_PREFIX}${databaseId}`;
  for (const base of getDataDirs()) {
    try {
      if ((await fs.stat(path.join(base, dirName))).isDirectory()) {
        return path.join(base, dirName);
      }
    } catch {
      // not in this base
    }
  }
  return path.join(getPrimaryDataDir(), dirName);
}

/**
 * Path of cli.json. Unified across platforms and decoupled from the data dir;
 * `HAMSTERBASE_TASKS_CONFIG` forces a specific path (used by tests).
 */
export function getCliConfigPath(): string {
  const override = process.env.HAMSTERBASE_TASKS_CONFIG;
  if (override) return override;
  return path.join(homeDir(), '.config', 'hamsterbase-tasks', 'cli.json');
}
