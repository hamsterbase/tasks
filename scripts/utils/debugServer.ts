import fs from 'fs';
import os from 'os';
import path from 'path';
import { createServer } from '../../src/server/server';

export function createTempDebugDir(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tasks-debug-'));
  return tempDir;
}

export function startDebugServer(port: number = 3000): void {
  // Create temporary directory for debug storage
  const tempDir = createTempDebugDir();
  const staticPath = path.join(process.cwd(), 'dist');
  const authToken = 'debug-token-123';

  console.log(`Debug server starting with:`);
  console.log(`  Static Path: ${staticPath}`);
  console.log(`  Storage Path: ${tempDir}`);
  console.log(`  Auth Token: ${authToken}`);
  console.log(`  Port: ${port}`);

  // Create and start the server
  const app = createServer(staticPath, tempDir, authToken);

  const server = app.listen(port, () => {
    console.log(`🚀 Debug server running at http://localhost:${port}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nStopping debug server...');
    server.close(() => {
      console.log('Debug server stopped');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit(0);
    });
  });
}
