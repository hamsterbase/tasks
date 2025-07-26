import { createServer, ViteDevServer } from 'vite';
import { resolveRoot } from './paths';

export async function startViteServer(): Promise<ViteDevServer> {
  console.log('[startViteServer] Starting development server...');
  const server = await createServer({
    configFile: resolveRoot('vite.config.ts'),
  });

  await server.listen();
  console.log(`[startViteServer] Development server started on http://localhost:${server.config.server.port}`);
  return server;
}
