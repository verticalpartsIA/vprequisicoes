import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Config especial para rodar o supabase-flow integration test no CI.
 * Igual ao vitest.config.ts mas SEM o exclude de supabase-flow*
 * (esse arquivo é excluído no config padrão para não rodar no npm test local).
 */
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
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'tests/e2e/**',
      'tests/sdd/**',
      // supabase-flow* NÃO está excluído aqui — esse config é usado pelo CI
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});
