import { buildElectron } from '../utils/buildElectron.js';
import { checkUncommittedChanges } from '../utils/git.js';
import { generateReleaseConfig } from '../utils/release.js';
import { resolveRoot } from '../utils/paths.js';
import { promises as fs } from 'fs';

interface ElectronBuildOptions {
  release?: boolean;
}

export async function electronBuildCommand(options: ElectronBuildOptions = {}) {
  try {
    console.log('[electron] Building Electron...');

    const electronDistDir = resolveRoot('electron-dist');
    await fs.rm(electronDistDir, { recursive: true, force: true });
    await fs.mkdir(electronDistDir, { recursive: true });

    if (options.release) {
      console.log('[release] Release mode enabled');

      if (checkUncommittedChanges()) {
        console.error(
          '[release] Error: Uncommitted changes detected. Please commit all changes before building in release mode.'
        );
        process.exit(1);
      }

      console.log('[release] Working directory is clean');
    }

    await buildElectron({ sourcemap: false });

    if (options.release) {
      const distDir = resolveRoot('electron-dist');
      generateReleaseConfig(options, distDir);
    }

    console.log('[electron] Build completed successfully!');
  } catch (error) {
    console.error('Error building Electron:', error);
    process.exit(1);
  }
}
