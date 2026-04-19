/**
 * 05-logs.spec.ts — @auth
 *
 * Verifica a página de logs de auditoria:
 * - Página carrega
 * - Estado vazio ("Nenhum evento registado ainda")
 * - Filtros de nível e módulo funcionam
 * - Campo de busca funciona
 * - Botão de export existe
 */

import { test, expect } from '@playwright/test';

test.describe('@auth — Logs de Atividade', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/logs');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
  });

  test('página de logs carrega sem erros @auth', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /logs de atividade/i })
    ).toBeVisible();
  });

  test('exibe estado vazio quando não há logs @auth', async ({ page }) => {
    // O sistema está limpo — deve mostrar a mensagem de vazio
    await expect(
      page.getByText(/nenhum evento registado ainda/i)
    ).toBeVisible({ timeout: 8_000 });
  });

  test('KPI cards de contagem estão visíveis @auth', async ({ page }) => {
    await expect(page.getByText(/total de eventos/i)).toBeVisible();
    await expect(page.getByText(/sucessos/i)).toBeVisible();
    await expect(page.getByText(/avisos/i)).toBeVisible();
    await expect(page.getByText(/erros/i)).toBeVisible();
  });

  test('filtro de nível está disponível @auth', async ({ page }) => {
    const levelFilter = page.getByRole('combobox').filter({ hasText: /todos os níveis|nível/i })
      .or(page.locator('select').filter({ hasText: /info|sucesso|aviso|erro/i })).first();
    await expect(levelFilter).toBeVisible();
  });

  test('filtro de módulo está disponível @auth', async ({ page }) => {
    const moduleFilter = page.locator('select').filter({ hasText: /todos os módulos|m1|módulo/i }).first();
    await expect(moduleFilter).toBeVisible();
  });

  test('campo de busca está disponível @auth', async ({ page }) => {
    const search = page.getByPlaceholder(/buscar por ação|buscar/i);
    await expect(search).toBeVisible();

    // Digitar no campo não deve gerar erros
    await search.fill('teste');
    await expect(page.getByText(/evento encontrado/i)).toBeVisible();
  });

  test('botão de exportar JSON está visível @auth', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /exportar json/i })
    ).toBeVisible();
  });

});
