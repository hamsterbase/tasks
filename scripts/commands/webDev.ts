import { startViteServer } from '../utils/vite-server.js';

interface WebDevOptions {
  host?: string | boolean;
}

export async function webDevCommand(options: WebDevOptions = {}) {
  await startViteServer(options.host);
}
