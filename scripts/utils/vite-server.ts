import { createServer, ViteDevServer } from 'vite';
import { resolveRoot } from './paths';

export async function startViteServer(host?: string | boolean): Promise<ViteDevServer> {
  console.log('[startViteServer] Starting development server...');
  console.log();
  const server = await createServer({
    configFile: resolveRoot('vite.config.ts'),
    server: {
      host,
    },
  });

  await server.listen();
  server.printUrls();
  return server;
}
