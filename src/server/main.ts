import * as path from 'path';
import { createServer } from './server';
import { randomUUID } from 'crypto';

function main(): void {
  const staticPath = process.env.STATIC_DIR;
  const storagePath = process.env.DATA_DIR;

  // Validate that both paths are absolute
  if (!staticPath || !storagePath || !path.isAbsolute(staticPath) || !path.isAbsolute(storagePath)) {
    console.error('Error: Both static-path and storage-path must be absolute paths');
    process.exit(1);
  }

  // Start server
  const PORT = process.env.PORT || 3000;
  const token = process.env.AUTH_TOKEN || randomUUID();
  console.log(`Auth token: ${token}`);
  const app = createServer(staticPath, storagePath, token);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Static files served from: ${staticPath}`);
    console.log(`Storage path: ${storagePath}`);
  });
}

main();
