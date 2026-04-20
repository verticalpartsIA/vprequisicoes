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
      ['**/*.integration.test.tsx', 'jsdom'],
      ['**/*.test.tsx', 'jsdom'],
    ],

    // ✔ Testes padrão
    include: ['**/*.{test,spec}.{ts,tsx}'],

    // ✔ Exclusões estratégicas
    exclude: [
      'node_modules',
      '.next',
      'dist',

      // E2E separado
      'tests/e2e/**',

      // 🔒 SDD isolado (correto)
      'tests/sdd/**',

      // 🔒 Fluxos Supabase isolados
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
