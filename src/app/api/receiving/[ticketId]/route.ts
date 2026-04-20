/**
 * POST /api/receiving/[ticketId]
 * Finaliza o recebimento físico (type=physical) ou atesto digital (type=digital).
 * Transiciona para RELEASED (digital) ou IN_USE/RETURNED (físico).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

type Params = Promise<{ ticketId: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { ticketId } = await params;

    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    // Ticket
    const { data: ticket } = await admin
      .from('req_tickets')
      .select('id, status, module')
      .eq('id', ticketId)
      .maybeSingle();

    if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

    const allowedStatuses = ['RECEIVING', 'PURCHASING', 'APPROVED'];
    if (!allowedStatuses.includes(ticket.status)) {
      return NextResponse.json(
        { error: `Ticket em status "${ticket.status}" não pode receber recebimento` },
        { status: 422 }
      );
    }

    const body = await request.json() as {
      type: 'physical' | 'digital';
      notes?: string;
      received_items?: Array<{ item_id: string; received_qty: number; condition: string }>;
    };

    // Para recebimento físico → RELEASED (ou IN_USE para M6)
    // Para atesto digital   → RELEASED
    const nextStatus = ticket.module === 'M6_LOCACAO' ? 'IN_USE' : 'RELEASED';

    await admin.rpc('req_transition_ticket', {
      p_ticket_id:  ticketId,
      p_new_status: nextStatus,
      p_user_id:    user.id,
      p_notes:      `Recebimento ${body.type === 'digital' ? 'digital' : 'físico'} confirmado. ${body.notes ?? ''}`.trim(),
    });

    // Atualiza received_at no ticket
    await admin
      .from('req_tickets')
      .update({ received_at: new Date().toISOString() })
      .eq('id', ticketId);

    // Log de auditoria
    const actionLabel = body.type === 'digital'
      ? 'Atesto digital confirmado'
      : 'Recebimento físico confirmado';

    await admin.rpc('req_log_audit', {
      p_ticket_id: ticketId,
      p_user_id:   user.id,
      p_action:    actionLabel,
      p_details:   body.notes ?? '',
      p_level:     'success',
      p_module:    'receiving',
      p_metadata:  { type: body.type, next_status: nextStatus },
    });

    return NextResponse.json({ ok: true, status: nextStatus });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[receiving POST]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
