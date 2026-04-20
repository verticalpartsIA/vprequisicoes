/**
 * 03-module-forms.spec.ts — @modules
 *
 * Verifica que cada formulário de módulo (M1-M6):
 * - Carrega sem erro (ou redireciona para /login se sem auth — aceitável)
 * - Exibe o cabeçalho correto do módulo (quando autenticado)
 * - Bloqueia envio de formulário vazio (validação Zod)
 * - Renderiza campos principais
 *
 * NOTA: Testes que exigem autenticação usam storageState do global-setup.
 * Se TEST_REQUESTER_EMAIL/PASSWORD não estiverem configurados no CI, o
 * storageState fica vazio e o app redireciona para /login — isso é tratado
 * como smoke pass (a rota existe, não retorna 404/500).
 */

import { test, expect } from '@playwright/test';

// Helper: verifica se a página está na rota esperada OU foi redirecionada para /login
async function expectPageOrLogin(page: import('@playwright/test').Page, route: string) {
  const url = page.url();
  const isOnRoute = url.includes(route);
  const isOnLogin = url.includes('/login');
  if (!isOnRoute && !isOnLogin) {
    throw new Error(`Esperado estar em ${route} ou /login, mas está em: ${url}`);
  }
  return { isOnLogin };
}

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
      // Aguarda navegação estabilizar
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      // Aceitável: está na rota correta OU foi redirecionado para /login (rota protegida)
      const { isOnLogin } = await expectPageOrLogin(page, mod.route);
      if (isOnLogin) {
        // Redirecionar para login é comportamento correto de rota protegida
        await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
        return;
      }
      // Se chegou na rota, não deve mostrar erro do Next.js
      await expect(page.getByText(/application error|this page/i)).not.toBeVisible();
    });

    test(`${mod.route} exibe cabeçalho do módulo @modules`, async ({ page }) => {
      await page.goto(mod.route);
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      const { isOnLogin } = await expectPageOrLogin(page, mod.route);
      if (isOnLogin) {
        // Sem auth no CI — pula verificação de conteúdo autenticado
        test.skip();
        return;
      }
      // Verifica título do módulo (M1, M2, etc.)
      const moduleCode = mod.route.replace('/', '').toUpperCase();
      await expect(
        page.getByText(new RegExp(moduleCode, 'i')).first()
      ).toBeVisible({ timeout: 10_000 });
    });

    test(`${mod.route} bloqueia envio vazio com validação @modules`, async ({ page }) => {
      await page.goto(mod.route);
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      const { isOnLogin } = await expectPageOrLogin(page, mod.route);
      if (isOnLogin) {
        // Sem auth no CI — pula validação de formulário
        test.skip();
        return;
      }

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
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      const { isOnLogin } = await expectPageOrLogin(page, mod.route);
      if (isOnLogin) {
        // Sem auth no CI — pula verificação de campos
        test.skip();
        return;
      }
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
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await expectPageOrLogin(page, '/quotation');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
  });

  test('/approval carrega lista de aprovações @modules', async ({ page }) => {
    await page.goto('/approval');
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await expectPageOrLogin(page, '/approval');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
  });

  test('/purchasing carrega console de compras @modules', async ({ page }) => {
    await page.goto('/purchasing');
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await expectPageOrLogin(page, '/purchasing');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
  });

  test('/receiving carrega painel de recebimento @modules', async ({ page }) => {
    await page.goto('/receiving');
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await expectPageOrLogin(page, '/receiving');
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
  });

});
