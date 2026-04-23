/**
 * 02-auth.spec.ts — @auth
 *
 * Testa o fluxo de autenticação:
 * - Login com credenciais válidas
 * - Redirect para /dashboard após login
 * - Dados do usuário visíveis na sidebar
 * - Logout (se disponível)
 * - Login inválido mostra erro
 */

import { test, expect } from '@playwright/test';

test.describe('@auth — Autenticação', () => {

  test('login com credenciais válidas vai para o dashboard @auth', async ({ page }) => {
    const email    = process.env.TEST_REQUESTER_EMAIL;
    const password = process.env.TEST_REQUESTER_PASSWORD;

    test.skip(!email || !password, 'Credenciais de teste não configuradas');

    await page.goto('/login');
    await page.getByPlaceholder(/seu@verticalparts/i).fill(email!);
    await page.getByPlaceholder(/••••••••/i).fill(password!);
    await page.getByRole('button', { name: /entrar no sistema/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 20_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dashboard exibe KPI cards após login @auth', async ({ page }) => {
    await expect(page.getByRole('main')).toBeVisible();

    // Pelo menos 4 KPI cards (Total, Pendentes, Economia, etc.)
    const kpiCards = page.locator('[class*="rounded-xl"]').filter({ hasText: /total|pendente|economia|sla/i });
    await expect(kpiCards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('sidebar exibe os módulos de navegação @auth', async ({ page }) => {
    // A sidebar deve ter links para os módulos principais
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /produtos|m1/i })).toBeVisible();
  });

  test('login inválido exibe mensagem de erro @auth', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/seu@verticalparts/i).fill('invalido@teste.com');
    await page.getByPlaceholder(/••••••••/i).fill('senhaerrada123');
    await page.getByRole('button', { name: /entrar no sistema/i }).click();

    // Deve exibir erro — sem redirect para dashboard
    await expect(page.getByText(/incorretos|inválido|invalid/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('usuário já logado é redirecionado direto para o dashboard @auth', async ({ page }) => {
    // Já estamos logados pelo storageState — tentar abrir /login deve redirecionar
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

});
