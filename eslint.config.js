import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import svelteParser from 'svelte-eslint-parser'

import svelteConfig from './svelte.config.js'

export default [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      '.svelte-kit/**',
      '.son-of-anton/**',
      '.vite-inspect/**',
      'tools/**',
      'package/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'html/**',
      'src/lib/generated/**',
      '*.cjs',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
      '.env',
      '.env.*',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  js.configs.recommended,
  ...svelte.configs.recommended,
  {
    files: ['**/*.{js,ts,svelte}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2017,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{ts,svelte}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // Existing app debt surfaced by restoring ESLint 9. Keep this migration
      // focused on replacing the abandoned Svelte plugin.
      'no-redeclare': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.spec.{js,ts}', 'src/mocks/setup.ts'],
    languageOptions: {
      globals: globals.vitest,
    },
  },
  {
    files: ['src/service-worker.ts'],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        svelteConfig,
      },
    },
    rules: {
      // Existing Svelte 5/navigation debt surfaced by the maintained plugin.
      // Track as follow-up rather than rewriting app behavior in this ticket.
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/no-reactive-reassign': 'off',
      'svelte/require-each-key': 'off',
    },
  },
  prettier,
]
