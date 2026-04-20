import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'vitest.config.ts',
  'vitest.sdd.config.ts',
  'packages/**/vitest.config.ts',
]);
