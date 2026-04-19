import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Config para rodar testes SDD no pipeline (BASE_001, MEIO_001).
 * Igual ao vitest.config.ts mas SEM o exclude de tests/sdd/**
 * (esses arquivos são excluídos no config padrão para não rodar no npm test local).
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
      // tests/sdd/** NÃO está excluído — esse config é usado pelo SDD pipeline
      // supabase-flow* NÃO está excluído — idem
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});
