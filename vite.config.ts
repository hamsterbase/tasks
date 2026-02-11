import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import path from 'path';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import IstanbulPlugin from './src/packages/vite-plugin-istanbul/index';
import { commonFilesPlugin } from './src/packages/vite-plugin-common-files';

function getGitCommitHash() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

const base = process.env.USE_RELATIVE_BASE === 'true' ? './' : '/';

export default defineConfig({
  base,
  define: {
    __PROJECT_COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, './src'),
      vscf: path.join(__dirname, './src/packages/vscf'),
      vs: path.join(__dirname, './src/packages/vscf/internal'),
    },
  },

  plugins: [
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`,
    }),
    react(),
    wasm(),
    IstanbulPlugin({
      enabled: process.env.VITE_COVERAGE === 'true',
      exclude: ['**/node_modules/**', '**/vscf/**'],
      include: ['**/*.ts', '**/*.tsx'],
    }),
    commonFilesPlugin({
      entries: ['src/desktop/main.tsx', 'src/mobile/main.tsx'],
      exclude: [
        'src/nls.ts',
        'src/core/**',
        'src/packages/vscf/**',
        'src/services/**/*.ts',
        'src/packages/cloud/**',
        'src/packages/server-sdk/**',
        'src/base/common/**',
        'src/hooks/**',
        'src/plugins/**',
        'src/utils/dnd/**',
        'src/locales/**',
        'src/base/browser/**',
        'src/testIds.ts',
        'src/components/icons/index.ts',
        'src/components/GlobalContext/GlobalContext.tsx',
        'src/components/icons/ProjectStatusBox.tsx',
      ],
      validate: (files) => {
        console.log('\n┌─────────────────────────────────────────────────┐');
        console.log(`│ Common files between desktop and mobile: ${String(files.length).padEnd(5)} │`);
        console.log('└─────────────────────────────────────────────────┘');
        if (files.length > 0) {
          files.forEach((file, index) => {
            const prefix = index === files.length - 1 ? '└──' : '├──';
            console.log(`${prefix} ${file}`);
          });
          console.log('');
          throw new Error('Found common files between desktop and mobile!');
        }
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
