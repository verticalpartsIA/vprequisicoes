import { test, expect } from '@playwright/test';

test.describe('Recebimento — Atesto Físico e Digital', () => {
  test('deve carregar a página de recebimento', async ({ page }) => {
    await page.goto('/receiving');
    await expect(page.getByText(/recebimento|receiving/i).first()).toBeVisible();
  });

  test('atesto físico: valida recebimento com item em bom estado', async ({ page }) => {
    await page.goto('/receiving');

    await page.getByRole('radio', { name: /físico|physical/i }).check();
    await page.getByLabel(/recebedor|received_by/i).fill('Carlos Operador');

    await page.getByLabel(/condição|condition/i).first().selectOption('ok');
    await page.getByLabel(/quantidade recebida/i).first().fill('10');

    await page.getByRole('button', { name: /confirmar|atestar|submit/i }).click();
    await expect(page.getByText(/confirmado|sucesso|ok/i)).toBeVisible({ timeout: 8000 });
  });

  test('atesto digital: exige confirmação e descrição mínima', async ({ page }) => {
    await page.goto('/receiving');

    await page.getByRole('radio', { name: /digital/i }).check();

    await page.getByRole('button', { name: /confirmar|atestar|submit/i }).click();
    await expect(page.getByText(/obrigatório|confirmar execução/i).first()).toBeVisible();
  });

  test('atesto digital: fluxo completo válido', async ({ page }) => {
    await page.goto('/receiving');

    await page.getByRole('radio', { name: /digital/i }).check();
    await page.getByLabel(/recebedor|received_by/i).fill('Maria Gestora');
    await page.getByLabel(/descrição|notes/i).fill('Serviço de manutenção executado conforme contrato.');
    await page.getByRole('checkbox', { name: /confirmar execução/i }).check();

    await page.getByRole('button', { name: /confirmar|atestar|submit/i }).click();
    await expect(page.getByText(/atestado|confirmado|sucesso/i)).toBeVisible({ timeout: 8000 });
  });
});
