import { test, expect } from '@playwright/test';

test.describe('Cotação — Módulo de Quotation', () => {
  test('deve carregar a lista de cotações', async ({ page }) => {
    await page.goto('/quotation');
    await expect(page.getByText(/cotação|quotation/i).first()).toBeVisible();
  });

  test('deve bloquear cotação sem fornecedor vencedor', async ({ page }) => {
    await page.goto('/quotation');

    await page.getByRole('link', { name: /cotar agora/i }).first().click();
    await page.getByRole('button', { name: /adicionar fornecedor/i }).first().click();
    await page.getByLabel(/nome do fornecedor/i).first().fill('Fornecedor Teste');
    await page.getByLabel(/preço unitário/i).first().fill('100');
    await page.getByLabel(/prazo \(dias\)/i).first().fill('5');

    await page.getByRole('button', { name: /enviar para aprovação/i }).click();
    await expect(page.getByText(/fornecedor vencedor|vencedor para este item/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('fluxo completo: seleciona vencedor e envia para aprovação', async ({ page }) => {
    await page.goto('/quotation');

    await expect(page.getByText(/M1-/i).first()).toBeVisible();
    await page.getByRole('link', { name: /cotar agora/i }).first().click();

    await page.getByRole('button', { name: /adicionar fornecedor/i }).first().click();
    await page.getByLabel(/nome do fornecedor/i).first().fill('Parafusos Brasil');
    await page.getByLabel(/preço unitário/i).first().fill('110');
    await page.getByLabel(/prazo \(dias\)/i).first().fill('3');
    await page.getByRole('button', { name: /marcar como vencedor/i }).first().click();

    await page.getByRole('button', { name: /enviar para aprovação/i }).click();
    await expect(page.getByText(/cotação enviada para aprovação|aprovação com sucesso/i)).toBeVisible({ timeout: 10000 });
  });
});
