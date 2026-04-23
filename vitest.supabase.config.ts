import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * CI: job "Supabase — Fluxo real…" e SDD (vitest.sdd) quando apontam para este ficheiro.
 * Teste pesado: packages/core/db/__tests__/m1-through-release*. Excluído dos scripts
 * npm em package.json. O ficheiro antigo supabase-flow* era excluído pelo vitest.config
 * mesclado no CI — renomeado para não bater nesse padrão.
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
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});
