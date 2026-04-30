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

    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'packages/**/*.{test,spec}.{ts,tsx}'
    ],

    exclude: [
      'node_modules',
      '.next',
      'dist',
      'tests/e2e/**',
      'packages/core/db/__tests__/supabase-flow*',
      'packages/core/db/__tests__/m1-through-release*',
    ],

    setupFiles: ['./vitest.setup.ts'],

    testTimeout: 30000,
  },
});
