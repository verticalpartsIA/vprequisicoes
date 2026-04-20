import { defineConfig } from 'vitest/config';
import path from 'path';

// Config explícita para testes de integração (*.integration.test.{ts,tsx})
// NÃO usa mergeConfig para evitar que environment:node da base sobrescreva jsdom.
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
    environment: 'jsdom',   // obrigatório para testes React (document, window)

    include: ['**/*.integration.test.{ts,tsx}'],

    exclude: [
      'node_modules',
      '.next',
      'dist',
      'tests/e2e/**',
      'tests/sdd/**',
      '**/db/__tests__/supabase-flow*',
      '**/db/__tests__/m1-through-release*',
    ],

    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30000,
  },
});
