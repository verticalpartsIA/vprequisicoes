/**
 * fixtures.ts
 *
 * Fixtures compartilhados entre todos os testes E2E.
 * Exporta `test` e `expect` já com helpers prontos.
 */

import { test as base, expect, type Page } from '@playwright/test';

/** Faz login via UI e retorna quando o dashboard estiver visível */
async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder(/seu@verticalparts/i).fill(email);
  await page.getByPlaceholder(/••••••••/i).fill(password);
  await page.getByRole('button', { name: /entrar no sistema/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
}

/** Verifica se está autenticado — redireciona para login se não estiver */
async function ensureAuthenticated(page: Page) {
  if (!page.url().includes('/dashboard')) {
    const email    = process.env.TEST_REQUESTER_EMAIL ?? '';
    const password = process.env.TEST_REQUESTER_PASSWORD ?? '';
    if (email && password) await loginAs(page, email, password);
  }
}

type Fixtures = {
  /** Página já autenticada como requester */
  authedPage: Page;
};

export const test = base.extend<Fixtures>({
  authedPage: async ({ page }, use) => {
    await ensureAuthenticated(page);
    await use(page);
  },
});

export { expect };
export { loginAs };
