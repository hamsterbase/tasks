import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import path from 'path';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vite';
import IstanbulPlugin from './src/packages/vite-plugin-istanbul/index';

export default defineConfig({
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
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
