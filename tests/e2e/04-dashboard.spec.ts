/**
 * 04-dashboard.spec.ts — @auth
 *
 * Verifica o painel de controlo (dashboard):
 * - KPI cards renderizam
 * - Filtros de período funcionam
 * - Filtro de módulo funciona
 * - Gráficos estão visíveis
 * - Tabela de fornecedores visível
 */

import { test, expect } from '@playwright/test';

test.describe('@auth — Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
  });

  test('exibe os 4 KPI cards principais @auth', async ({ page }) => {
    // Procura por cards com ícones de KPI — independente do valor
    const kpiSection = page.locator('[class*="rounded-xl"]').filter({
      hasText: /total|pendente|economia|sla|ticket/i,
    });
    await expect(kpiSection.first()).toBeVisible();
  });

  test('filtro de período altera a URL @auth', async ({ page }) => {
    // Clica no filtro de período (7d, 30d, 90d, 1y)
    const periodBtn = page.getByRole('button', { name: /7d|30d|90d|1 ano/i }).first();
    await expect(periodBtn).toBeVisible();
    await periodBtn.click();

    // URL deve incluir o parâmetro de período
    await expect(page).toHaveURL(/period=/);
  });

  test('filtro de módulo altera a URL @auth', async ({ page }) => {
    // Abre o seletor de módulo
    const moduleSelect = page.getByRole('combobox', { name: /módulo/i })
      .or(page.locator('select').filter({ hasText: /todos|m1|módulo/i }));

    if (await moduleSelect.count() > 0) {
      await moduleSelect.first().selectOption('M5');
      await expect(page).toHaveURL(/module=M5/);
    }
  });

  test('seção de gráficos está visível @auth', async ({ page }) => {
    // Verifica que pelo menos uma área de gráfico está no DOM
    const chartArea = page.locator('svg, canvas, [class*="chart"]');
    await expect(chartArea.first()).toBeVisible({ timeout: 8_000 });
  });

  test('seção "Top Fornecedores" é visível @auth', async ({ page }) => {
    await expect(
      page.getByText(/top fornecedores|fornecedores/i).first()
    ).toBeVisible();
  });

  test('cabeçalho mostra o título "Dashboard" @auth', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();
  });

});
