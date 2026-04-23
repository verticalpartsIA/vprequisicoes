/**
 * 01-smoke.spec.ts — @smoke
 *
 * Verifica que o site está no ar e que as rotas básicas respondem corretamente.
 * NÃO precisa de autenticação.
 */

import { test, expect } from '@playwright/test';

test.describe('@smoke — Site no ar', () => {

  test('homepage redireciona para /login quando não autenticado @smoke', async ({ page }) => {
    const res = await page.goto('/');
    // 200 após o redirect chain (Next.js pode devolver 307 → 200)
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/login/);
  });

  test('/dashboard redireciona para /login quando não autenticado @smoke', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/login carrega o formulário @smoke', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('VPRequisições')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar no sistema/i })).toBeVisible();
  });

  test('/login tem aba "Criar Conta" @smoke', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /criar conta/i })).toBeVisible();
  });

  test('rotas protegidas redirecionam para /login @smoke', async ({ page }) => {
    const routes = ['/products', '/travel', '/services', '/maintenance', '/freight', '/rental',
                    '/quotation', '/approval', '/purchasing', '/receiving', '/logs'];

    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
    }
  });

  test('cabeçalho da resposta não expõe erros 5xx @smoke', async ({ request }) => {
    const res = await request.get('/login');
    expect(res.status()).toBeLessThan(500);
  });

});
