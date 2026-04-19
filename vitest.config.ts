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
    environmentMatchGlobs: [
      // Testes de componente React precisam de DOM
      ['**/*.integration.test.tsx', 'jsdom'],
      ['**/*.test.tsx', 'jsdom'],
    ],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'tests/e2e/**',
      // Testes SDD de integração — precisam de env vars Supabase, rodam só no pipeline SDD
      'tests/sdd/**',
      // Supabase flow — roda só no job sdd-meio-integration com secrets
      'packages/core/db/__tests__/supabase-flow*',
    ],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**', 'packages/**'],
    },
  },
});
