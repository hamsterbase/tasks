import fs from 'fs';
import os from 'os';
import path from 'path';

export function createTempDir(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tasks-release-'));
  return tempDir;
}
