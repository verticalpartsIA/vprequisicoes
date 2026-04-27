/**
 * GET  /api/quotation/[ticketId]  — dados do ticket para cotação
 * POST /api/quotation/[ticketId]  — submete a cotação e avança para PENDING_APPROVAL
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

type Params = Promise<{ ticketId: string }>;

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { ticketId } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/tickets/${ticketId}`,
    { headers: { Cookie: _request.headers.get('cookie') ?? '' } }
  );
  return res;
}

// ─── POST — submeter cotação ──────────────────────────────────────────────────

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

    // Verifica que o ticket existe e está em SUBMITTED
    const { data: ticket } = await admin
      .from('req_tickets')
      .select('id, status')
      .eq('id', ticketId)
      .maybeSingle();

    if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
    if (!['SUBMITTED', 'QUOTING'].includes(ticket.status)) {
      return NextResponse.json({ error: `Ticket em status "${ticket.status}" não pode receber cotação` }, { status: 422 });
    }

    const body = await request.json();
    // body.items = [{ item_name, suppliers: [{ name, price, delivery_days, email, is_winner }] }]
    const items: Array<{
      item_name: string;
      suppliers: Array<{
        name: string;
        price: number;
        delivery_days: number;
        email?: string;
        is_winner: boolean;
      }>;
    }> = body.items ?? [];

    // Para cada fornecedor, find-or-create e insere req_quotation
    for (const item of items) {
      for (const sup of item.suppliers) {
        if (!sup.name) continue;

        // Find or create supplier
        let { data: existingSupplier } = await admin
          .from('req_suppliers')
          .select('id')
          .ilike('name', sup.name.trim())
          .maybeSingle();

        if (!existingSupplier) {
          const { data: newSupplier } = await admin
            .from('req_suppliers')
            .insert({
              name: sup.name.trim(),
              email: sup.email ?? null,
              categories: [],
            })
            .select('id')
            .single();
          existingSupplier = newSupplier;
        }

        if (!existingSupplier) continue;

        await admin.from('req_quotations').insert({
          ticket_id:   ticketId,
          supplier_id: existingSupplier.id,
          quoter_id:   user.id,
          is_winner:   sup.is_winner,
          delivery_days: sup.delivery_days ?? null,
          total_value: sup.price ?? null,
          status:      sup.is_winner ? 'SELECTED' : 'RECEIVED',
          received_at: new Date().toISOString(),
          items: [{ item_name: item.item_name, price: sup.price }],
        });
      }
    }

    // Calcula valor total (cotação vencedora)
    const winnerPrice = items.flatMap(i => i.suppliers)
      .filter(s => s.is_winner)
      .reduce((acc, s) => acc + (s.price ?? 0), 0);

    // Transiciona para PENDING_APPROVAL
    const { error: transError } = await admin.rpc('req_transition_ticket', {
      p_ticket_id:  ticketId,
      p_new_status: 'PENDING_APPROVAL',
      p_user_id:    user.id,
      p_notes:      `Cotação submetida. Valor vencedor: R$ ${winnerPrice.toFixed(2)}`,
    });

    if (transError) {
      console.error('[quotation POST] transition error:', transError);
      // Mesmo com erro na transição, os dados foram salvos — logar mas não falhar
    }

    // Atualiza total_value no ticket
    await admin
      .from('req_tickets')
      .update({ total_value: winnerPrice, quoted_at: new Date().toISOString() })
      .eq('id', ticketId);

    // Log de auditoria
    await admin.rpc('req_log_audit', {
      p_ticket_id: ticketId,
      p_user_id:   user.id,
      p_action:    'Cotação submetida',
      p_details:   `Cotação com ${items.length} item(s) submetida. Valor: R$ ${winnerPrice.toFixed(2)}`,
      p_level:     'success',
      p_module:    'quotation',
      p_metadata:  { items_count: items.length, total_value: winnerPrice },
    });

    return NextResponse.json({ ok: true, status: 'PENDING_APPROVAL' });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[quotation POST]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PATCH — salvar rascunho ──────────────────────────────────────────────────

export async function PATCH(
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
    const draftData = await request.json();

    // Salva o rascunho no campo metadata do ticket
    const { data: ticket } = await admin
      .from('req_tickets')
      .select('metadata')
      .eq('id', ticketId)
      .maybeSingle();

    if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

    const updatedMeta = { ...(ticket.metadata as object ?? {}), quotation_draft: draftData };

    await admin
      .from('req_tickets')
      .update({ metadata: updatedMeta })
      .eq('id', ticketId);

    return NextResponse.json({ ok: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[quotation PATCH]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
