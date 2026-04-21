import * as fs from 'fs/promises';
import * as path from 'path';
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

export function pickDatabaseId(dbFlag: string | undefined, config: CliConfig): string {
  return dbFlag ?? config.currentDatabase ?? 'local';
}
