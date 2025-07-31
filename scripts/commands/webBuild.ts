import { build } from 'vite';
import { resolveRoot } from '../utils/paths.js';
import { checkUncommittedChanges } from '../utils/git.js';
import { generateReleaseConfig } from '../utils/release.js';
import { promises as fs } from 'fs';

interface WebBuildOptions {
  coverage?: boolean;
  useRelativeBase?: boolean;
  release?: boolean;
}

export async function webBuildCommand(options: WebBuildOptions = {}) {
  try {
    console.log('[vite] Building for production...');

    const distDir = resolveRoot('dist');
    await fs.rm(distDir, { recursive: true, force: true });
    await fs.mkdir(distDir, { recursive: true });

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

    if (options.coverage) {
      console.log('[vite] Coverage mode enabled');
      process.env.VITE_COVERAGE = 'true';
    }

    if (options.useRelativeBase) {
      process.env.USE_RELATIVE_BASE = 'true';
      console.log('[vite] Using relative base path');
    }

    await build({
      configFile: resolveRoot('vite.config.ts'),
    });

    if (options.release) {
      const distDir = resolveRoot('dist');
      generateReleaseConfig(options, distDir);
    }

    console.log('[vite] Build completed successfully!');
  } catch (error) {
    console.error('Error building Vite project:', error);
    process.exit(1);
  }
}
