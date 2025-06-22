/* eslint-disable custom/no-blacklisted-strings */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import * as customPlugin from './src/packages/eslint-plugin/index.ts';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'src/packages/vscf',
      'src/packages/cloud',
      'src/third-party',
      'android',
      'ios',
      'src/packages/eslint-plugin',
      'coverage',
      'script',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      custom: customPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'custom/no-duplicate-localization': 'error',
      'custom/no-chinese-in-localization-value': 'error',
      'custom/no-restricted-packages': [
        'error',
        {
          packages: [
            'lucide-react',
            { name: '@/packages/vscf', alternative: 'vscf' },
            { name: 'node:test', alternative: 'vitest' },
            { name: '@/vscf/internal/nls', alternative: '@/nls' },
          ],
        },
      ],
      'custom/no-blacklisted-strings': [
        'error',
        {
          strings: ['gray'],
        },
      ],
    },
  }
);
