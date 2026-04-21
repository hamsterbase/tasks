import * as fs from 'fs/promises';
import * as path from 'path';
import { IDatabaseMeta, LocalDatabaseMeta } from '../services/database/common/database';
import { getAppDataDir, getDatabaseDir } from './paths';

const DIR_PREFIX = 'hamster-base-tasks-';
const FILE_EXT = '.hamsterbase_tasks';

export async function listDatabases(): Promise<IDatabaseMeta[]> {
  const base = getAppDataDir();
  try {
    await fs.mkdir(base, { recursive: true });
  } catch {
    // ignore
  }

  const entries = await fs.readdir(base, { withFileTypes: true }).catch(() => []);
  const dbs: IDatabaseMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(DIR_PREFIX)) continue;
    try {
      const raw = await fs.readFile(path.join(base, entry.name, '_meta.json'), 'utf8');
      dbs.push(JSON.parse(raw));
    } catch {
      // skip unreadable entries
    }
  }

  if (!dbs.find((d) => d.id === 'local')) {
    dbs.unshift({ ...LocalDatabaseMeta });
  }
  return dbs;
}

export function resolveDatabase(input: string, dbs: IDatabaseMeta[]): IDatabaseMeta | { error: string; candidates?: IDatabaseMeta[] } {
  const exact = dbs.find((d) => d.id === input);
  if (exact) return exact;

  const prefixMatches = dbs.filter((d) => d.id.startsWith(input));
  if (prefixMatches.length === 1) return prefixMatches[0];
  if (prefixMatches.length > 1) {
    return { error: `"${input}" matches ${prefixMatches.length} databases`, candidates: prefixMatches };
  }
  return { error: `no database matches "${input}"` };
}

export async function countTaskFiles(databaseId: string): Promise<number> {
  try {
    const files = await fs.readdir(getDatabaseDir(databaseId));
    return files.filter((f) => f.endsWith(FILE_EXT) && f !== '_meta.json').length;
  } catch {
    return 0;
  }
}

export async function readSnapshotBlobs(databaseId: string): Promise<Uint8Array[]> {
  const dir = getDatabaseDir(databaseId);
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  const taskFiles = files.filter((f) => f.endsWith(FILE_EXT) && f !== '_meta.json');

  const blobs: Uint8Array[] = [];
  for (const name of taskFiles) {
    try {
      const b64 = await fs.readFile(path.join(dir, name), 'utf8');
      blobs.push(base64ToUint8Array(b64.trim()));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw err;
    }
  }
  return blobs;
}

function base64ToUint8Array(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}
