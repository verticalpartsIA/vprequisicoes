/**
 * global-setup.ts
 *
 * Faz login UMA VEZ com o usuário requisitante de CI e salva o storageState.
 * Todos os testes @auth, @modules, @workflow reutilizam esse estado —
 * sem repetir o fluxo de login em cada teste.
 *
 * Credenciais via env / GitHub Secrets:
 *   TEST_REQUESTER_EMAIL    TEST_REQUESTER_PASSWORD
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const STATE_FILE = path.join(process.cwd(), '.playwright', 'storageState.json');

setup('autenticar usuário CI', async ({ page }) => {
  const email    = process.env.TEST_REQUESTER_EMAIL ?? '';
  const password = process.env.TEST_REQUESTER_PASSWORD ?? '';

  if (!email || !password) {
    console.warn(
      '[global-setup] TEST_REQUESTER_EMAIL ou TEST_REQUESTER_PASSWORD não definidos. ' +
      'Testes @auth/@modules/@workflow serão pulados.'
    );
    // Cria um estado vazio para não quebrar outros projetos
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  // Navega para a página de login
  await page.goto('/login');
  await expect(page.getByText('VPRequisições')).toBeVisible();

  // Preenche as credenciais
  await page.getByPlaceholder(/seu@verticalparts/i).fill(email);
  await page.getByPlaceholder(/••••••••/i).fill(password);

  // Submete
  await page.getByRole('button', { name: /entrar no sistema/i }).click();

  // Aguarda redirect para o dashboard
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
  await expect(page.getByRole('main')).toBeVisible();

  // Garante que o diretório existe e salva o estado
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  await page.context().storageState({ path: STATE_FILE });

  console.log('[global-setup] Login OK — storageState salvo em', STATE_FILE);
});
