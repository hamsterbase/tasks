import * as fs from 'fs/promises';
import * as path from 'path';
import { IDatabaseMeta } from '../../services/database/common/database';
import { getCliConfigPath } from './paths';

export interface CliConfig {
  currentDatabase?: string;
}

export async function readConfig(): Promise<CliConfig> {
  try {
    const raw = await fs.readFile(getCliConfigPath(), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

export async function writeConfig(config: CliConfig): Promise<void> {
  const filePath = getCliConfigPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf8');
}

/**
 * Resolve which database to act on. Precedence: explicit `--db` flag, then the
 * persisted `currentDatabase`, then — when neither is set — the first database
 * on disk. Only falls back to the literal `'local'` when there is nothing at
 * all (keeps the fresh-desktop-install path working).
 */
export function pickDatabaseId(dbFlag: string | undefined, config: CliConfig, dbs: IDatabaseMeta[] = []): string {
  if (dbFlag) return dbFlag;
  if (config.currentDatabase) return config.currentDatabase;
  return dbs[0]?.id ?? 'local';
}
