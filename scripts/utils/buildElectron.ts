import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import { promises as fs } from 'fs';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import { resolveRoot } from './paths';

export interface BuildElectronOptions {
  sourcemap?: boolean;
}

export async function buildElectron(options: BuildElectronOptions = {}): Promise<void> {
  const { sourcemap = true } = options;

  const inputOptions: RollupOptions = {
    input: resolveRoot('src/electron/main.ts'),
    external: ['electron', 'path', 'url', 'fs', 'fs/promises', 'crypto', 'os'],
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: resolveRoot('src') },
          { find: 'vscf', replacement: resolveRoot('src/packages/vscf') },
          { find: 'vs', replacement: resolveRoot('src/packages/vscf/internal') },
        ],
      }),
      resolve({
        preferBuiltins: true,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }),
      json(),
      esbuild({
        target: 'es2022',
        sourceMap: sourcemap,
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        loaders: {
          '.ts': 'ts',
          '.tsx': 'tsx',
          '.js': 'js',
          '.jsx': 'jsx',
        },
      }),
    ],
  };

  const outputOptions: OutputOptions = {
    dir: resolveRoot('electron-dist'),
    format: 'esm',
    interop: 'esModule',
    sourcemap,
  };

  const bundle = await rollup(inputOptions);
  await bundle.write(outputOptions);
  await bundle.close();

  await copyPreloadScript();
}

export async function copyPreloadScript(): Promise<void> {
  const srcPreload = resolveRoot('src/electron/preload.js');
  const distPreload = resolveRoot('electron-dist/preload.js');

  try {
    await fs.copyFile(srcPreload, distPreload);
    console.log('[electron] Copied preload.js');
  } catch (err) {
    console.error('[electron] Failed to copy preload.js:', err);
    throw err;
  }
}
