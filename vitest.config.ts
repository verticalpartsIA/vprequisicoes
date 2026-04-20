import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './packages/modules'),
      '@core': path.resolve(__dirname, './packages/core'),
    },
  },

  test: {
    globals: true,
    environment: 'node',

    exclude: [
      'node_modules',
      '.next',
      'dist',
      'tests/e2e/**',
      'tests/sdd/**',
      'packages/core/db/__tests__/supabase-flow*',
    ],

    setupFiles: ['./vitest.setup.ts'],

    testTimeout: 30000,
  },
});
