import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll } from 'vitest';
import { getSupabaseClient } from '@/lib/supabase/client';

beforeAll(async () => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) return; // testes unitários sem Supabase passam normalmente

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.warn('[vitest.setup] Autenticação falhou:', error.message);
  }
});

afterAll(async () => {
  const email = process.env.TEST_USER_EMAIL;
  if (!email) return;

  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
});
