import { buildElectron } from '../utils/buildElectron.js';

export async function electronBuildCommand() {
  try {
    console.log('[electron] Building Electron...');
    await buildElectron({ sourcemap: false });
    console.log('[electron] Build completed successfully!');
  } catch (error) {
    console.error('Error building Electron:', error);
    process.exit(1);
  }
}
