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

    // 🔥 FOCO TOTAL NESSE TESTE
    include: [
      'packages/core/db/__tests__/supabase-flow.integration.test.ts'
    ],

    // 🔥 NÃO excluir ele aqui
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'tests/e2e/**',
      'tests/sdd/**',
    ],

    setupFiles: ['./vitest.setup.ts'],

    testTimeout: 30000,
  },
});
