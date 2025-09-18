import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { getSHA256Hash, validateParams, getFolderPath, ensureDirectoryExists } from './utils';

export function createServer(staticPath: string, storagePath: string, authToken: string): express.Application {
  const app = express();

  // Middleware to validate auth token header
  const validateAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const clientAuthToken = req.headers['authorization'] as string;

    if (!clientAuthToken || clientAuthToken !== authToken) {
      return res.status(401).json({ error: 'Invalid or missing authorization token' });
    }

    next();
  };

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.static(staticPath));

  // Apply auth validation middleware globally to all API routes
  app.use('/api', validateAuthMiddleware);

  // API Routes

  // List files in folder
  app.post('/api/v1/cloud/list', async (req, res) => {
    try {
      const { folder } = req.body;
      if (!folder) {
        return res.status(400).json({ error: 'folder parameter is required' });
      }

      const folderPath = getFolderPath(storagePath, folder);

      try {
        await fs.access(folderPath);
        const files = await fs.readdir(folderPath);
        res.json({ files });
      } catch {
        // If folder doesn't exist, return empty array
        res.json({ files: [] });
      }
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete file
  app.post('/api/v1/cloud/delete', async (req, res) => {
    try {
      const validation = validateParams(req.body, ['folder', 'key']);
      if (validation.error) {
        return res.status(400).json({ error: validation.error });
      }

      const { folder, key } = validation;
      const folderPath = getFolderPath(storagePath, folder as string);
      const filePath = path.join(folderPath, key as string);

      await fs.unlink(filePath);
      res.json({ success: true });
    } catch (error: unknown) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        res.status(404).json({ error: 'File not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Read file
  app.post('/api/v1/cloud/read', async (req, res) => {
    try {
      const validation = validateParams(req.body, ['folder', 'key']);
      if (validation.error) {
        return res.status(400).json({ error: validation.error });
      }

      const { folder, key } = validation;
      const folderPath = getFolderPath(storagePath, folder as string);
      const filePath = path.join(folderPath, key as string);

      const data = await fs.readFile(filePath, 'utf-8');
      res.json({ data });
    } catch (error: unknown) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        res.status(404).json({ error: 'File not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Save file
  app.post('/api/v1/cloud/save', async (req, res) => {
    try {
      const validation = validateParams(req.body, ['folder', 'data']);
      if (validation.error) {
        return res.status(400).json({ error: validation.error });
      }

      const { folder, data } = validation;
      // Generate key from data SHA256
      const key = getSHA256Hash(data);

      const folderPath = getFolderPath(storagePath, folder as string);
      await ensureDirectoryExists(folderPath);

      const filePath = path.join(folderPath, key);
      await fs.writeFile(filePath, data!, 'utf-8');

      res.json({ success: true, key });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Catch-all route for SPA - must be last
  app.use('/*splat', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  return app;
}
