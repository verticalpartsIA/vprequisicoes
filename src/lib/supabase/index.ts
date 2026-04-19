/**
 * VPRequisições — Supabase Module
 *
 * Exporta os clientes e tipos do Supabase para uso em toda a aplicação.
 *
 * Uso:
 *   Client Component  → import { supabase } from '@/lib/supabase'
 *   Server Component  → import { getSupabaseServer } from '@/lib/supabase'
 *   Route Handler     → import { getSupabaseAdmin } from '@/lib/supabase'
 */

export { supabase, getSupabaseClient } from './client';
export { getSupabaseServer, getSupabaseAdmin } from './server';
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './types';
export { Constants } from './types';
