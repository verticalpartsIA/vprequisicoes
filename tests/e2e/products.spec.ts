import { test, expect } from '@playwright/test';

test.describe('M1 — Requisição de Produtos', () => {
  test('deve carregar a página de produtos', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText(/Abertura de Requisição|Requisição de Produtos|M1/i)).toBeVisible();
  });

  test('deve bloquear envio de formulário vazio', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: /enviar|finalizar|submit/i }).click();
    await expect(page.getByText(/obrigatório|required/i).first()).toBeVisible();
  });

  test('fluxo completo: preenche e submete requisição', async ({ page }) => {
    await page.goto('/products');

    await page.getByLabel(/solicitante/i).fill('Gelson Simões');
    await page.getByLabel(/justificativa/i).fill('Necessidade de reposição de estoque de parafusos M8');

    await page.getByRole('button', { name: /adicionar item|add item/i }).click();
    await page.getByLabel(/nome do produto/i).first().fill('Parafuso M8');
    await page.getByLabel(/quantidade/i).first().fill('100');

    await page.getByRole('button', { name: /enviar|finalizar|submit/i }).click();
    await expect(page.getByText(/submetido|sucesso|M1-/i)).toBeVisible({ timeout: 10000 });
  });
});
