import { startDebugServer } from '../utils/debugServer';

export function debugServerCommand(options: { port?: number } = {}): void {
  console.log('启动调试服务器...');

  try {
    startDebugServer(options.port);
  } catch (error) {
    console.error('调试服务器启动失败:', error);
    process.exit(1);
  }
}
