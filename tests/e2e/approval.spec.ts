import { test, expect } from '@playwright/test';

test.describe('Módulo de Aprovação', () => {
  test('servidor responde com 200', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
  });

  test('carrega lista de aprovações pendentes', async ({ page }) => {
    await page.goto('/approval');
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('fluxo completo: busca → analisa → aprova', async ({ page }) => {
    await page.goto('/approval');

    // Buscar ticket M1-0123
    const search = page.getByPlaceholder(/buscar|search/i);
    await search.fill('M1-0123');
    await expect(page.getByText('M1-0123')).toBeVisible();
    await expect(page.getByText('R$ 110,00')).toBeVisible();
    await expect(page.getByText(/nível 1/i)).toBeVisible();

    // Analisar
    await page.getByRole('button', { name: /analisar/i }).click();
    await expect(page.getByText('Parafusos Brasil')).toBeVisible();

    // Aprovar
    await page.getByRole('button', { name: /confirmar decisão/i }).click();

    // Resultado (redireciona para compras após aprovar)
    await expect(page.getByRole('heading', { name: /console de compras/i })).toBeVisible({ timeout: 15000 });
  });

  test('bloqueia aprovação sem cotação', async ({ page }) => {
    await page.goto('/approval/124');
    await expect(page.getByRole('button', { name: /confirmar decisão/i })).toBeDisabled();
  });

  test('bloqueia reprovação sem motivo (mínimo 10 chars)', async ({ page }) => {
    await page.goto('/approval/123');
    await page.getByRole('radio', { name: /reprovar/i }).click();
    const confirmar = page.getByRole('button', { name: /confirmar decisão/i });
    await expect(confirmar).toBeDisabled();

    await page.getByRole('textbox').fill('curto');
    await expect(confirmar).toBeDisabled();

    await page.getByRole('textbox').fill('motivo válido aqui');
    await expect(confirmar).toBeEnabled();
  });

  test('bloqueia revisão sem comentário (mínimo 5 chars)', async ({ page }) => {
    await page.goto('/approval/123');
    await page.getByRole('radio', { name: /revisar/i }).click();
    const confirmar = page.getByRole('button', { name: /confirmar decisão/i });
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
    await page.getByRole('button', { name: /confirmar decisão/i }).click();

    await page.goto('/approval');
    await page.getByPlaceholder(/buscar|search/i).fill('M1-0123');
    await expect(page.getByText('M1-0123')).not.toBeVisible();
  });
});
