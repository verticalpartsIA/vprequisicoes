import { test, expect } from '@playwright/test';

test.describe('Módulo de Aprovação', () => {
  test('servidor responde com 200', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
  });

  test('carrega lista de aprovações pendentes', async ({ page }) => {
    await page.goto('/approval');
    await expect(page.getByRole('list')).toBeVisible();
  });

  test('fluxo completo: busca → analisa → aprova', async ({ page }) => {
    await page.goto('/approval');

    // Buscar ticket M1-0123
    const search = page.getByPlaceholder(/buscar|search/i);
    await search.fill('M1-0123');
    await expect(page.getByText('M1-0123')).toBeVisible();
    await expect(page.getByText('R$ 110,00')).toBeVisible();
    await expect(page.getByText('Tier 1')).toBeVisible();

    // Analisar
    await page.getByRole('button', { name: /analisar/i }).click();
    await expect(page.getByText('Parafusos Brasil')).toBeVisible();

    // Aprovar
    await page.getByRole('button', { name: /aprovar/i }).click();
    await page.getByRole('button', { name: /confirmar/i }).click();

    // Resultado
    await expect(page.getByText(/approved/i)).toBeVisible();
  });

  test('bloqueia aprovação sem cotação', async ({ page }) => {
    await page.goto('/approval');
    const btn = page.getByRole('button', { name: /aprovar/i }).first();
    await expect(btn).toBeDisabled();
  });

  test('bloqueia reprovação sem motivo (mínimo 10 chars)', async ({ page }) => {
    await page.goto('/approval');
    await page.getByRole('button', { name: /reprovar/i }).first().click();
    const confirmar = page.getByRole('button', { name: /confirmar/i });
    await expect(confirmar).toBeDisabled();

    await page.getByRole('textbox').fill('curto');
    await expect(confirmar).toBeDisabled();

    await page.getByRole('textbox').fill('motivo válido aqui');
    await expect(confirmar).toBeEnabled();
  });

  test('bloqueia revisão sem comentário (mínimo 5 chars)', async ({ page }) => {
    await page.goto('/approval');
    await page.getByRole('button', { name: /revisar/i }).first().click();
    const confirmar = page.getByRole('button', { name: /confirmar/i });
    await expect(confirmar).toBeDisabled();

    await page.getByRole('textbox').fill('ok');
    await expect(confirmar).toBeDisabled();

    await page.getByRole('textbox').fill('comentário');
    await expect(confirmar).toBeEnabled();
  });

  test('ticket sai da lista após aprovação', async ({ page }) => {
    await page.goto('/approval');
    await page.getByPlaceholder(/buscar|search/i).fill('M1-0123');
    await page.getByRole('button', { name: /analisar/i }).click();
    await page.getByRole('button', { name: /aprovar/i }).click();
    await page.getByRole('button', { name: /confirmar/i }).click();

    await page.getByPlaceholder(/buscar|search/i).clear();
    await expect(page.getByText('M1-0123')).not.toBeVisible();
  });
});
