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

/** Primary directory used as the fallback for database lookup. */
export function getPrimaryDataDir(): string {
  return getDataDirs()[0];
}

/** Directory of a database inside one specific app data directory. */
export function getDatabaseDir(dataDir: string, databaseId: string): string {
  return path.join(dataDir, `${DB_DIR_PREFIX}${databaseId}`);
}

/**
 * Directory of a specific database. Searches every data dir and returns the
 * first one that actually holds it; falls back to the primary data directory
 * so the caller can report an empty or missing snapshot consistently.
 */
export async function resolveDatabaseDir(databaseId: string): Promise<string> {
  for (const base of getDataDirs()) {
    const databaseDir = getDatabaseDir(base, databaseId);
    try {
      if ((await fs.stat(databaseDir)).isDirectory()) {
        return databaseDir;
      }
    } catch {
      // not in this base
    }
  }
  return getDatabaseDir(getPrimaryDataDir(), databaseId);
}
