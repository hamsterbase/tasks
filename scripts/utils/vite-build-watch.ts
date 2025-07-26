import { build } from 'vite';
import { resolveRoot } from './paths.js';

export async function startViteBuildWatch(): Promise<void> {
  console.log('[startViteBuildWatch] Starting build watch mode...');

  return new Promise((resolve, reject) => {
    try {
      process.env.USE_RELATIVE_BASE = 'true';
      let firstBuildComplete = false;

      build({
        configFile: resolveRoot('vite.config.ts'),
        build: {
          watch: {},
          outDir: resolveRoot('electron-dist/frontend'),
        },
        plugins: [
          {
            name: 'watch-complete',
            closeBundle() {
              if (!firstBuildComplete) {
                firstBuildComplete = true;
                console.log('[startViteBuildWatch] Initial build complete');
                resolve();
              }
            },
          },
        ],
      }).catch(reject);
    } catch (error) {
      console.error('[startViteBuildWatch] Error during build watch:', error);
      reject(error);
    }
  });
}
