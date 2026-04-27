/**
 * POST /api/purchasing/[ticketId]
 * Finaliza a compra de um ticket aprovado.
 * Transiciona para PURCHASING (e depois RECEIVING ou RELEASED conforme módulo).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type Params = Promise<{ ticketId: string }>;

/** Módulos com recebimento físico */
const PHYSICAL_MODULES: Database['public']['Enums']['req_module_type'][] = ['M1_PRODUTOS', 'M4_MANUTENCAO'];
/** Módulos com atesto digital → vão direto para RELEASED */
const DIGITAL_MODULES:  Database['public']['Enums']['req_module_type'][] = ['M2_VIAGENS', 'M3_SERVICOS', 'M5_FRETE'];
/** M6 Locação → IN_USE */

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
    if (ticket.status !== 'APPROVED') {
      return NextResponse.json({ error: `Ticket em status "${ticket.status}" não pode ser comprado` }, { status: 422 });
    }

    const body = await request.json() as {
      method: 'auction' | 'direct';
      supplier_name?: string;
      notes?: string;
      po_number?: string;
    };

    // Próximo status baseado no módulo
    let nextStatus: Database['public']['Enums']['req_ticket_status'] = 'PURCHASING';
    if (PHYSICAL_MODULES.includes(ticket.module)) {
      nextStatus = 'RECEIVING';
    } else if (DIGITAL_MODULES.includes(ticket.module)) {
      nextStatus = 'RELEASED';
    } else if (ticket.module === 'M6_LOCACAO') {
      nextStatus = 'IN_USE';
    }

    // Salva dados da PO no metadata
    await admin
      .from('req_tickets')
      .update({
        purchased_at: new Date().toISOString(),
        metadata: { ...(ticket as any).metadata, purchase_method: body.method, po_number: body.po_number },
      })
      .eq('id', ticketId);

    // Transiciona
    await admin.rpc('req_transition_ticket', {
      p_ticket_id:  ticketId,
      p_new_status: nextStatus,
      p_user_id:    user.id,
      p_notes:      `Compra finalizada via ${body.method === 'auction' ? 'leilão' : 'compra direta'}. ${body.notes ?? ''}`.trim(),
    });

    // Log de auditoria
    await admin.rpc('req_log_audit', {
      p_ticket_id: ticketId,
      p_user_id:   user.id,
      p_action:    'Compra finalizada',
      p_details:   `Método: ${body.method === 'auction' ? 'Leilão' : 'Compra Direta'}. Próximo status: ${nextStatus}`,
      p_level:     'success',
      p_module:    'purchasing',
      p_metadata:  { method: body.method, next_status: nextStatus },
    });

    return NextResponse.json({ ok: true, status: nextStatus });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[purchasing POST]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
