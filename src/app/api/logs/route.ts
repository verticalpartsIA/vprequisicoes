/**
 * GET /api/logs
 *
 * Retorna registros de auditoria (req_audit_logs) com filtros opcionais.
 *
 * Query params:
 *   - level=info|success|warning|error
 *   - module=M1_PRODUTOS|M2_VIAGENS|...|quotation|approval|purchasing|receiving
 *   - search=texto (busca em action/details/user_email)
 *   - ticket_id=uuid (filtra por ticket específico)
 *   - limit=200 (default 200, max 1000)
 *   - offset=0
 *
 * Resposta:
 *   { logs: [...], total: number }
 *
 * Cada item já vem com user_email e ticket_number resolvidos via JOIN
 * para que a UI consuma direto, sem N+1.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const level    = searchParams.get('level');
    const module   = searchParams.get('module');
    const search   = searchParams.get('search');
    const ticketId = searchParams.get('ticket_id');
    const limit    = Math.min(parseInt(searchParams.get('limit') ?? '200', 10), 1000);
    const offset   = parseInt(searchParams.get('offset') ?? '0', 10);

    const admin = getSupabaseAdmin();

    let query = admin
      .from('req_audit_logs')
      .select(
        `
        id, ticket_id, user_id, action, details, level, module, metadata, created_at,
        req_profiles!req_audit_logs_user_id_fkey(name, email),
        req_tickets!req_audit_logs_ticket_id_fkey(ticket_number, title)
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (level)    query = query.eq('level', level as 'info' | 'success' | 'warning' | 'error');
    if (module)   query = query.eq('module', module);
    if (ticketId) query = query.eq('ticket_id', ticketId);

    // Busca textual em action/details (ilike) ou ticket_number
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`action.ilike.${term},details.ilike.${term}`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error('[logs GET]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Achata as relações para o formato esperado pela UI
    const logs = (data ?? []).map((row: any) => ({
      id:            row.id,
      ticket_id:     row.ticket_id,
      ticket_number: row.req_tickets?.ticket_number ?? null,
      ticket_title:  row.req_tickets?.title ?? null,
      action:        row.action,
      details:       row.details ?? '',
      level:         row.level,
      module:        row.module ?? '',
      user_id:       row.user_id,
      user_name:     row.req_profiles?.name ?? null,
      user_email:    row.req_profiles?.email ?? '',
      metadata:      row.metadata ?? {},
      created_at:    row.created_at,
    }));

    return NextResponse.json({ logs, total: count ?? logs.length });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[logs GET]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
