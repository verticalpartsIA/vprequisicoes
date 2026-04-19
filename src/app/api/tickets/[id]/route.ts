/**
 * GET /api/tickets/[id]
 * Retorna um ticket completo com itens, cotações e aprovações.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    // Ticket principal (view enriquecida)
    const { data: ticket, error: ticketError } = await admin
      .from('req_tickets_view')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 });
    if (!ticket)     return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

    // Itens do ticket (M1)
    const { data: items } = await admin
      .from('req_ticket_items')
      .select('*')
      .eq('ticket_id', id)
      .order('sort_order');

    // Cotações vinculadas
    const { data: quotations } = await admin
      .from('req_quotations')
      .select('*, req_suppliers(name, email)')
      .eq('ticket_id', id)
      .order('created_at');

    // Aprovações vinculadas
    const { data: approvals } = await admin
      .from('req_approvals')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at');

    // Logs de auditoria do ticket
    const { data: auditLogs } = await admin
      .from('req_audit_logs')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      ticket,
      items:     items      ?? [],
      quotations: quotations ?? [],
      approvals:  approvals  ?? [],
      audit_logs: auditLogs  ?? [],
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
