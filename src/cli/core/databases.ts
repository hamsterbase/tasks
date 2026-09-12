import * as fs from 'fs/promises';
import * as path from 'path';
import { getDatabaseDir, resolveDatabaseDir } from './paths';

const FILE_EXT = '.hamsterbase_tasks';

export async function readSnapshotBlobs(databaseId: string, dataDir?: string): Promise<Uint8Array[]> {
  const dir = dataDir ? getDatabaseDir(dataDir, databaseId) : await resolveDatabaseDir(databaseId);
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
