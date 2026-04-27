/**
 * POST /api/approval/[ticketId]
 * Submete decisão de aprovação (approve | reject | revision).
 *
 * GET  /api/approval/[ticketId]
 * Retorna dados do ticket para a tela de aprovação.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type Params   = Promise<{ ticketId: string }>;
type Decision = 'approve' | 'reject' | 'revision';

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { ticketId } = await params;

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const admin = getSupabaseAdmin();

  const [ticketRes, quotationsRes, approvalsRes, auditRes] = await Promise.all([
    admin.from('req_tickets_view').select('*').eq('id', ticketId).maybeSingle(),
    admin.from('req_quotations').select('*, req_suppliers(name, email)').eq('ticket_id', ticketId),
    admin.from('req_approvals').select('*').eq('ticket_id', ticketId),
    admin.from('req_audit_logs').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false }),
  ]);

  if (!ticketRes.data) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

  return NextResponse.json({
    ticket:     ticketRes.data,
    quotations: quotationsRes.data ?? [],
    approvals:  approvalsRes.data  ?? [],
    audit_logs: auditRes.data      ?? [],
  });
}

// ─── POST — decisão ───────────────────────────────────────────────────────────

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

    // Verifica role do usuário
    const { data: profile } = await admin
      .from('req_profiles')
      .select('role, approval_tier, approval_limit')
      .eq('id', user.id)
      .maybeSingle();

    const allowedRoles = ['approver', 'admin'];
    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: 'Sem permissão para aprovar' }, { status: 403 });
    }

    // Ticket
    const { data: ticket } = await admin
      .from('req_tickets')
      .select('id, status, total_value')
      .eq('id', ticketId)
      .maybeSingle();

    if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
    if (ticket.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ error: `Ticket em status "${ticket.status}" não pode ser aprovado` }, { status: 422 });
    }

    // Verifica alçada
    const ticketValue = ticket.total_value ?? 0;
    const approvalLimit = profile.approval_limit ?? 0;
    if (profile.role !== 'admin' && approvalLimit > 0 && ticketValue > approvalLimit) {
      return NextResponse.json(
        { error: `Valor R$ ${ticketValue.toFixed(2)} excede sua alçada de R$ ${approvalLimit.toFixed(2)}` },
        { status: 403 }
      );
    }

    const body = await request.json() as {
      decision: Decision;
      reason?:  string;
      comment?: string;
    };

    const decisionMap: Record<Decision, Database['public']['Enums']['req_approval_decision']> = {
      approve:  'APPROVED',
      reject:   'REJECTED',
      revision: 'REJECTED', // revisão volta para o fluxo de cotação
    };

    const newStatusMap: Record<Decision, Database['public']['Enums']['req_ticket_status']> = {
      approve:  'APPROVED',
      reject:   'REJECTED',
      revision: 'SUBMITTED',
    };

    // Insere registro de aprovação
    await admin.from('req_approvals').insert({
      ticket_id:   ticketId,
      approver_id: user.id,
      decision:    decisionMap[body.decision],
      tier:        profile.approval_tier ?? 1,
      notes:       body.reason ?? body.comment ?? null,
      decided_at:  new Date().toISOString(),
    });

    // Transiciona o ticket
    await admin.rpc('req_transition_ticket', {
      p_ticket_id:  ticketId,
      p_new_status: newStatusMap[body.decision],
      p_user_id:    user.id,
      p_notes:      body.reason ?? body.comment ?? `Decisão: ${body.decision}`,
    });

    // Log de auditoria
    const actionLabel = { approve: 'Requisição aprovada', reject: 'Requisição rejeitada', revision: 'Revisão solicitada' };
    const levelLabel  = { approve: 'success', reject: 'warning', revision: 'info' } as const;
    await admin.rpc('req_log_audit', {
      p_ticket_id: ticketId,
      p_user_id:   user.id,
      p_action:    actionLabel[body.decision],
      p_details:   body.reason ?? body.comment ?? '',
      p_level:     levelLabel[body.decision],
      p_module:    'approval',
      p_metadata:  { decision: body.decision, approver_tier: profile.approval_tier },
    });

    return NextResponse.json({ ok: true, status: newStatusMap[body.decision] });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[approval POST]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
