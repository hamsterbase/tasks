import { build } from 'vite';
import { resolveRoot } from '../utils/paths.js';
import { checkUncommittedChanges } from '../utils/git.js';
import { generateReleaseConfig } from '../utils/release.js';

interface WebBuildOptions {
  coverage?: boolean;
  useRelativeBase?: boolean;
  release?: boolean;
}

export async function webBuildCommand(options: WebBuildOptions = {}) {
  try {
    console.log('[vite] Building for production...');

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
