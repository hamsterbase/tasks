import { buildElectron } from '../utils/buildElectron.js';
import { startElectronProcess } from '../utils/startElectronProcess.js';
import { startViteBuildWatch } from '../utils/vite-build-watch.js';

export async function electronDevCommand() {
  try {
    // Build Electron with Rollup
    console.log('[electron] Building Electron...');
    await buildElectron({ sourcemap: true });
    await startViteBuildWatch();

    // Start Electron
    console.log('[electron] Starting Electron...\n');
    startElectronProcess();
  } catch (error) {
    console.error('Error starting development server:', error);
    process.exit(1);
  }
}
