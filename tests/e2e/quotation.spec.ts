import { test, expect } from '@playwright/test';

test.describe('Cotação — Módulo de Quotation', () => {
  test('deve carregar a lista de cotações', async ({ page }) => {
    await page.goto('/quotation');
    await expect(page.getByText(/cotação|quotation/i).first()).toBeVisible();
  });

  test('deve bloquear cotação sem fornecedor vencedor', async ({ page }) => {
    await page.goto('/quotation');

    await page.getByRole('button', { name: /adicionar cotação|add supplier/i }).first().click();
    await page.getByLabel(/fornecedor|supplier/i).first().fill('Fornecedor Teste');
    await page.getByLabel(/preço|price/i).first().fill('100');
    await page.getByLabel(/prazo|delivery/i).first().fill('5');

    await page.getByRole('button', { name: /salvar|submit|enviar/i }).click();
    await expect(page.getByText(/vencedor|winner/i)).toBeVisible({ timeout: 5000 });
  });

  test('fluxo completo: seleciona vencedor e envia para aprovação', async ({ page }) => {
    await page.goto('/quotation');

    const ticket = page.getByText(/M1-/i).first();
    await expect(ticket).toBeVisible();
    await ticket.click();

    await page.getByRole('button', { name: /cotar|adicionar cotação/i }).click();
    await page.getByLabel(/fornecedor/i).first().fill('Parafusos Brasil');
    await page.getByLabel(/preço/i).first().fill('110');
    await page.getByLabel(/prazo/i).first().fill('3');
    await page.getByRole('radio', { name: /vencedor|winner/i }).first().check();

    await page.getByRole('button', { name: /enviar para aprovação|submit/i }).click();
    await expect(page.getByText(/enviado|aprovação|QUOTED/i)).toBeVisible({ timeout: 10000 });
  });
});
