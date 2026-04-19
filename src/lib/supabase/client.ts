'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Supabase Browser Client (singleton)
 * Usar em Client Components e hooks do lado do cliente.
 */
export function getSupabaseClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

export const supabase = getSupabaseClient();
