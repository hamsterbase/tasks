import { spawn } from 'child_process';
import electron from 'electron';
import { resolveRoot } from './paths';

export function startElectronProcess(): void {
  const electronProcess = spawn(electron as unknown as string, [resolveRoot('electron-dist/main.js')], {
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'inherit',
  });

  electronProcess.on('exit', () => {
    process.exit();
  });
}
