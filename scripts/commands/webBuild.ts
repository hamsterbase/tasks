import { build } from 'vite';
import { resolveRoot } from '../utils/paths.js';

interface WebBuildOptions {
  coverage?: boolean;
  useRelativeBase?: boolean;
}

export async function webBuildCommand(options: WebBuildOptions = {}) {
  try {
    console.log('[vite] Building for production...');

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

    console.log('[vite] Build completed successfully!');
  } catch (error) {
    console.error('Error building Vite project:', error);
    process.exit(1);
  }
}
