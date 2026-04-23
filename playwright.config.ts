import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright — VPRequisições
 *
 * Em CI:  BASE_URL aponta para produção (https://requisicoes.vpsistema.com)
 * Local:  BASE_URL aponta para localhost:3000 (precisa de `npm start` rodando)
 */

const isCI  = !!process.env.CI;
const BASE_URL = process.env.BASE_URL ?? (isCI
  ? 'https://requisicoes.vpsistema.com'
  : 'http://localhost:3000'
);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },

  /* Retry apenas em CI, para absorver flakiness de rede */
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : 1,

  reporter: isCI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'],   ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },

  /* ────── Projetos ────────────────────────────────────────────────────────
   *  setup  → faz login UMA vez e salva storageState
   *  smoke  → não precisa de auth (acessa URLs públicas)
   *  authed → usa o storageState gerado pelo setup
   * ──────────────────────────────────────────────────────────────────────── */
  projects: [
    {
      name: 'setup',
      testMatch: '**/global-setup.ts',
    },
    {
      name: 'smoke',
      testMatch: '**/*.spec.ts',
      grep: /@smoke/,
      use: { ...devices['Desktop Chrome'] },
      // Smoke não depende do login
    },
    {
      name: 'authed',
      testMatch: '**/*.spec.ts',
      grepInvert: /@smoke/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.playwright/storageState.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* Sobe servidor local apenas quando não está em CI */
  webServer: isCI ? undefined : {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
