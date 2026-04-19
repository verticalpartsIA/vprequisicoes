/**
 * 03-module-forms.spec.ts — @modules
 *
 * Verifica que cada formulário de módulo (M1-M6):
 * - Carrega sem erro
 * - Exibe o cabeçalho correto do módulo
 * - Bloqueia envio de formulário vazio (validação Zod)
 * - Renderiza campos principais
 */

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Mapa: rota → texto esperado na página
// ─────────────────────────────────────────────────────────────────────────────
const MODULES = [
  {
    route: '/products',
    heading: /requisição.*m1|m1.*produto/i,
    requiredField: /solicitante|departamento/i,
    tag: '@modules',
  },
  {
    route: '/travel',
    heading: /requisição.*m2|m2.*viagen/i,
    requiredField: /viajante|solicitante|nome/i,
    tag: '@modules',
  },
  {
    route: '/services',
    heading: /requisição.*m3|m3.*serviço/i,
    requiredField: /solicitante|departamento/i,
    tag: '@modules',
  },
  {
    route: '/maintenance',
    heading: /requisição.*m4|m4.*manutenção/i,
    requiredField: /solicitante|departamento/i,
    tag: '@modules',
  },
  {
    route: '/freight',
    heading: /requisição.*m5|m5.*frete/i,
    requiredField: /solicitante|departamento/i,
    tag: '@modules',
  },
  {
    route: '/rental',
    heading: /requisição.*m6|m6.*locação/i,
    requiredField: /solicitante|departamento/i,
    tag: '@modules',
  },
] as const;

for (const mod of MODULES) {
  test.describe(`@modules — ${mod.route}`, () => {

    test(`${mod.route} carrega sem erro @modules`, async ({ page }) => {
      await page.goto(mod.route);
      // Não deve mostrar erro 404 ou 500
      await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
      // Não deve ter o texto de erro do Next.js
      await expect(page.getByText(/application error|this page/i)).not.toBeVisible();
    });

    test(`${mod.route} exibe cabeçalho do módulo @modules`, async ({ page }) => {
      await page.goto(mod.route);
      // Verifica título do módulo (M1, M2, etc.)
      const moduleCode = mod.route.replace('/', '').toUpperCase();
      await expect(
        page.getByText(new RegExp(moduleCode, 'i')).first()
      ).toBeVisible({ timeout: 10_000 });
    });

    test(`${mod.route} bloqueia envio vazio com validação @modules`, async ({ page }) => {
      await page.goto(mod.route);

      // Clica no botão de envio sem preencher nada
      const submitBtn = page.getByRole('button', {
        name: /finalizar|enviar|submit|salvar/i,
      }).first();
      await submitBtn.click();

      // Deve aparecer pelo menos uma mensagem de erro de validação
      await expect(
        page.getByText(/obrigatório|required|mínimo|deve ser/i).first()
      ).toBeVisible({ timeout: 8_000 });
    });

    test(`${mod.route} renderiza campos principais @modules`, async ({ page }) => {
      await page.goto(mod.route);
      await expect(
        page.getByLabel(mod.requiredField).or(
          page.getByPlaceholder(mod.requiredField)
        ).first()
      ).toBeVisible({ timeout: 10_000 });
    });

  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Páginas de suporte ao workflow
// ─────────────────────────────────────────────────────────────────────────────
test.describe('@modules — Páginas de workflow', () => {

  test('/quotation carrega lista de cotações @modules', async ({ page }) => {
    await page.goto('/quotation');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
  });

  test('/approval carrega lista de aprovações @modules', async ({ page }) => {
    await page.goto('/approval');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
  });

  test('/purchasing carrega console de compras @modules', async ({ page }) => {
    await page.goto('/purchasing');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
  });

  test('/receiving carrega painel de recebimento @modules', async ({ page }) => {
    await page.goto('/receiving');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
  });

});
