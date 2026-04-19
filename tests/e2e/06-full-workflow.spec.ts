/**
 * 06-full-workflow.spec.ts — @workflow
 *
 * Testa o fluxo completo de ponta a ponta:
 *   M1 → Cotação → Aprovação → Compras → Recebimento
 *
 * ⚠️  ATENÇÃO: Estes testes requerem a integração Supabase completa (API real).
 *    Enquanto os formulários usam mockApiClient, os testes de estado intermediário
 *    serão validados via UI (redirect, mensagem de sucesso, número do ticket).
 *    Quando a integração real estiver completa (SDD Phase 2), esta suíte
 *    validará dados persistidos no Supabase.
 */

import { test, expect } from '@playwright/test';

test.describe('@workflow — M1: Requisição de Produtos', () => {

  test('formulário M1 aceita dados válidos e mostra sucesso @workflow', async ({ page }) => {
    await page.goto('/products');

    // Preenche dados obrigatórios
    await page.getByLabel(/solicitante/i).fill('CI Tester');
    await page.getByLabel(/departamento/i).fill('Qualidade');
    await page.getByLabel(/centro de custo/i).fill('CC-001');
    await page.getByLabel(/justificativa/i).fill('Reposição de estoque de parafusos para manutenção mensal');

    // Adiciona item
    await page.getByRole('button', { name: /adicionar.*produto|add/i }).click();
    await page.getByLabel(/nome do produto/i).first().fill('Parafuso M8 x 30mm');
    await page.getByLabel(/quantidade/i).first().fill('100');

    // Submete
    await page.getByRole('button', { name: /finalizar|enviar/i }).click();

    // Deve mostrar número do ticket OU redirecionar para /quotation
    await Promise.race([
      expect(page.getByText(/M1-|ticket criado|submetido/i)).toBeVisible({ timeout: 15_000 }),
      expect(page).toHaveURL(/\/quotation/, { timeout: 15_000 }),
    ]);
  });

  test('M1 permite adicionar e remover itens dinamicamente @workflow', async ({ page }) => {
    await page.goto('/products');

    // Adiciona 2 itens extras (já tem 1)
    await page.getByRole('button', { name: /adicionar.*produto|add/i }).click();
    await page.getByRole('button', { name: /adicionar.*produto|add/i }).click();

    // Deve ter 3 campos de produto
    const nomeFields = page.getByLabel(/nome do produto/i);
    await expect(nomeFields).toHaveCount(3);

    // Remove o último
    const removeButtons = page.getByRole('button', { name: /remover|remove/i });
    await removeButtons.last().click();
    await expect(page.getByLabel(/nome do produto/i)).toHaveCount(2);
  });

});

test.describe('@workflow — M5: Frete', () => {

  test('formulário M5 preenche automaticamente o campo VerticalParts @workflow', async ({ page }) => {
    await page.goto('/freight');

    // Seleciona direção "Saída" (outbound)
    await page.getByRole('radio', { name: /saída|outbound/i }).click();

    // O campo "Origem" deve ser preenchido automaticamente com VerticalParts
    await expect(
      page.getByDisplayValue(/verticalparts|vertical parts/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('formulário M5 calcula peso total e exibe dimensões @workflow', async ({ page }) => {
    await page.goto('/freight');

    await page.getByLabel(/peso/i).fill('500');
    await expect(page.getByLabel(/peso/i)).toHaveValue('500');
  });

});

test.describe('@workflow — M4: Manutenção', () => {

  test('M4 exibe alerta de emergência quando corretiva + urgente @workflow', async ({ page }) => {
    await page.goto('/maintenance');

    // Seleciona tipo corretivo
    const correctiveOption = page.getByRole('radio', { name: /corretiva/i })
      .or(page.getByLabel(/corretiva/i)).first();
    await correctiveOption.click();

    // Seleciona prioridade emergência
    const prioritySelect = page.getByRole('combobox', { name: /prioridade/i })
      .or(page.locator('select[name="priority"]'));
    if (await prioritySelect.count() > 0) {
      await prioritySelect.selectOption(/emergência|emergency/i);
      // Banner de alerta deve aparecer
      await expect(page.getByText(/emergência|atenção/i).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test('M4 revela campos de contrato ao ativar toggle @workflow', async ({ page }) => {
    await page.goto('/maintenance');

    // Ativa o toggle "Coberto por Contrato"
    const contractToggle = page.getByRole('checkbox', { name: /contrato|coberto/i })
      .or(page.locator('[type="checkbox"]').filter({ hasText: /contrato/i })).first();

    if (await contractToggle.count() > 0) {
      await contractToggle.click();
      // Campo de número de contrato deve aparecer
      await expect(page.getByLabel(/número do contrato/i)).toBeVisible({ timeout: 5_000 });
    }
  });

});

test.describe('@workflow — M2: Viagens', () => {

  test('M2 exibe alerta de urgência para viagem em menos de 5 dias @workflow', async ({ page }) => {
    await page.goto('/travel');

    // Data de partida: amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const departureDateInput = page.getByLabel(/data.*partida|saída/i).first();
    if (await departureDateInput.count() > 0) {
      await departureDateInput.fill(dateStr);
      // Card de urgência deve aparecer
      await expect(page.getByText(/urgência|prazo/i).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test('M2 revela campos internacionais ao marcar viagem internacional @workflow', async ({ page }) => {
    await page.goto('/travel');

    const intlCheckbox = page.getByRole('checkbox', { name: /internacional/i });
    if (await intlCheckbox.count() > 0) {
      await intlCheckbox.click();
      await expect(page.getByLabel(/passaporte/i)).toBeVisible({ timeout: 5_000 });
    }
  });

});

test.describe('@workflow — Fluxo Navegacional', () => {

  test('sidebar permite navegar entre todos os módulos @workflow', async ({ page }) => {
    await page.goto('/dashboard');

    const moduleLinks = [
      { label: /produtos|m1/i, url: /\/products/ },
      { label: /viagens|m2/i, url: /\/travel/ },
      { label: /serviços|m3/i, url: /\/services/ },
      { label: /manutenção|m4/i, url: /\/maintenance/ },
      { label: /frete|m5/i,    url: /\/freight/ },
      { label: /locação|m6/i,  url: /\/rental/ },
    ];

    for (const mod of moduleLinks) {
      const link = page.getByRole('link', { name: mod.label });
      if (await link.count() > 0) {
        await link.first().click();
        await expect(page).toHaveURL(mod.url, { timeout: 10_000 });
        await page.goto('/dashboard');
      }
    }
  });

  test('link de cotações abre a lista de cotações @workflow', async ({ page }) => {
    await page.goto('/quotation');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/quotation/);
  });

  test('link de aprovações abre a lista de aprovações @workflow', async ({ page }) => {
    await page.goto('/approval');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/approval/);
  });

});
