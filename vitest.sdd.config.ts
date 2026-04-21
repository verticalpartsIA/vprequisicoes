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
    name: 'sdd',
    globals: true,
    environment: 'node',
    include: ['tests/sdd/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      'tests/e2e/**',
      // tests/sdd/** NÃO excluído — esse config é específico para o SDD pipeline
    ],
    // Sobrescreve qualquer exclude herdado do vitest.config.ts raiz
    forceRerunTriggers: [],
    setupFiles: ['./vitest.setup.ts'],
  },
});
