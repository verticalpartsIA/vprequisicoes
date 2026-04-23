/**
 * SUPABASE INTEGRATION TESTS — Fluxo Real M1→Cotação→Aprovação→Compras
 *
 * Usa service_role para bypass de RLS (ambiente CI apenas).
 * Cria dados, valida transições de status e limpa ao final.
 *
 * Requer variáveis de ambiente:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Database } from '../../../../src/lib/supabase/types';

// ─── Client Admin (service_role — somente CI) ────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      '[supabase-flow] Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.'
    );
  }
  return createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

// ─── IDs criados durante o teste (para limpeza) ───────────────────────────────
const created = {
  departmentId: '',
  requesterId:  '',
  approverId:   '',
  supplierId:   '',
  ticketId:     '',
  quotationId:  '',
  approvalId:   '',
};

// ─── Prefixo único por execução para evitar colisões ─────────────────────────
const RUN_ID = `ci-${Date.now()}`;

// ─────────────────────────────────────────────────────────────────────────────
describe('[Supabase] Conectividade básica', () => {
  it('deve alcançar o Supabase e listar módulos', async () => {
    const db = getAdminClient();
    const { data, error } = await db.from('modules').select('id, slug').limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('deve alcançar a tabela req_departments', async () => {
    const db = getAdminClient();
    const { error } = await db.from('req_departments').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('deve alcançar a tabela req_tickets', async () => {
    const db = getAdminClient();
    const { error } = await db.from('req_tickets').select('id').limit(1);
    expect(error).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('[Supabase] Setup de dados de teste', () => {
  const db = getAdminClient();

  it('cria departamento de teste', async () => {
    const { data, error } = await db
      .from('req_departments')
      .insert({ name: `Dept-${RUN_ID}`, cost_center: `CC-${RUN_ID}` })
      .select('id')
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();
    created.departmentId = data!.id;
  });

  it('cria perfil requester de teste', async () => {
    const fakeId = crypto.randomUUID();
    const { data, error } = await db
      .from('req_profiles')
      .insert({
        id:            fakeId,
        full_name:     `Requester-${RUN_ID}`,
        email:         `req-${RUN_ID}@ci.test`,
        role:          'requester',
        department_id: created.departmentId,
        approval_tier: 0,
        approval_limit: 0,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    created.requesterId = data!.id;
  });

  it('cria perfil approver de teste', async () => {
    const fakeId = crypto.randomUUID();
    const { data, error } = await db
      .from('req_profiles')
      .insert({
        id:             fakeId,
        full_name:      `Approver-${RUN_ID}`,
        email:          `apr-${RUN_ID}@ci.test`,
        role:           'approver',
        department_id:  created.departmentId,
        approval_tier:  1,
        approval_limit: 50000,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    created.approverId = data!.id;
  });

  it('cria fornecedor de teste', async () => {
    const { data, error } = await db
      .from('req_suppliers')
      .insert({
        name:       `Fornecedor-${RUN_ID}`,
        categories: ['M1_PRODUTOS'],
        is_active:  true,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    created.supplierId = data!.id;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('[Supabase] Fluxo M1 — Criação e Submissão de Ticket', () => {
  const db = getAdminClient();

  it('cria ticket M1 como DRAFT', async () => {
    const ticketNumber = `M1-${RUN_ID}`;

    const { data, error } = await db
      .from('req_tickets')
      .insert({
        ticket_number: ticketNumber,
        title:         `[CI] Produto Teste ${RUN_ID}`,
        module:        'M1_PRODUTOS',
        status:        'DRAFT',
        priority:      'normal',
        department_id: created.departmentId,
        requester_id:  created.requesterId,
        metadata:      { itens: [{ descricao: 'Parafuso M8', quantidade: 100, unidade: 'un' }] },
      })
      .select('id, status, ticket_number')
      .single();

    expect(error).toBeNull();
    expect(data?.status).toBe('DRAFT');
    created.ticketId = data!.id;
  });

  it('transiciona ticket de DRAFT → SUBMITTED via req_transition_ticket', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'SUBMITTED',
      p_user_id:    created.requesterId,
      p_notes:      'Submissão de teste CI',
    });

    expect(error).toBeNull();
    expect(data?.status).toBe('SUBMITTED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('[Supabase] Fluxo Cotação — SUBMITTED → QUOTING → PENDING_APPROVAL', () => {
  const db = getAdminClient();

  it('transiciona ticket para QUOTING', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'QUOTING',
      p_user_id:    created.requesterId,
      p_notes:      'Iniciando cotação CI',
    });

    expect(error).toBeNull();
    expect(data?.status).toBe('QUOTING');
  });

  it('cria cotação do fornecedor', async () => {
    const { data, error } = await db
      .from('req_quotations')
      .insert({
        ticket_id:   created.ticketId,
        supplier_id: created.supplierId,
        status:      'RECEIVED',
        total_value: 1500.00,
        delivery_days: 5,
        is_winner:   false,
        items:       [{ descricao: 'Parafuso M8', quantidade: 100, valor_unitario: 15.00 }],
      })
      .select('id, status, total_value')
      .single();

    expect(error).toBeNull();
    expect(data?.total_value).toBe(1500.00);
    created.quotationId = data!.id;
  });

  it('marca cotação como vencedora', async () => {
    const { error } = await db
      .from('req_quotations')
      .update({ is_winner: true, status: 'SELECTED' })
      .eq('id', created.quotationId);

    expect(error).toBeNull();
  });

  it('transiciona ticket para PENDING_APPROVAL', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'PENDING_APPROVAL',
      p_user_id:    created.requesterId,
      p_notes:      'Cotação selecionada, aguardando aprovação',
    });

    expect(error).toBeNull();
    expect(data?.status).toBe('PENDING_APPROVAL');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('[Supabase] Fluxo Aprovação — PENDING_APPROVAL → APPROVED', () => {
  const db = getAdminClient();

  it('cria registro de aprovação (Tier 1)', async () => {
    const { data, error } = await db
      .from('req_approvals')
      .insert({
        ticket_id:   created.ticketId,
        approver_id: created.approverId,
        tier:        1,
        decision:    'PENDING',
      })
      .select('id, decision')
      .single();

    expect(error).toBeNull();
    expect(data?.decision).toBe('PENDING');
    created.approvalId = data!.id;
  });

  it('registra decisão APPROVED no aprovador', async () => {
    const { error } = await db
      .from('req_approvals')
      .update({ decision: 'APPROVED', decided_at: new Date().toISOString(), notes: 'Aprovado no CI' })
      .eq('id', created.approvalId);

    expect(error).toBeNull();
  });

  it('transiciona ticket para APPROVED', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'APPROVED',
      p_user_id:    created.approverId,
      p_notes:      'Aprovado pelo Tier 1',
    });

    expect(error).toBeNull();
    expect(data?.status).toBe('APPROVED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('[Supabase] Fluxo Compras — APPROVED → PURCHASING → RELEASED', () => {
  const db = getAdminClient();

  it('transiciona ticket para PURCHASING', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'PURCHASING',
      p_user_id:    created.approverId,
      p_notes:      'Comprando no CI',
    });

    expect(error).toBeNull();
    expect(data?.status).toBe('PURCHASING');
  });

  it('transiciona ticket para RECEIVING', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'RECEIVING',
      p_user_id:    created.approverId,
    });

    expect(error).toBeNull();
    expect(data?.status).toBe('RECEIVING');
  });

  it('finaliza ticket com status RELEASED', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'RELEASED',
      p_user_id:    created.approverId,
      p_notes:      'Entregue e encerrado no CI',
    });

    expect(error).toBeNull();
    expect(data?.status).toBe('RELEASED');
  });

  it('ticket no banco está como RELEASED (verificação final)', async () => {
    const { data, error } = await db
      .from('req_tickets')
      .select('status, approved_at, purchased_at, received_at, released_at')
      .eq('id', created.ticketId)
      .single();

    expect(error).toBeNull();
    expect(data?.status).toBe('RELEASED');
    expect(data?.approved_at).toBeTruthy();
    expect(data?.purchased_at).toBeTruthy();
    expect(data?.received_at).toBeTruthy();
    expect(data?.released_at).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('[Supabase] Limpeza de dados de teste', () => {
  const db = getAdminClient();

  afterAll(async () => {
    // Ordem importa por dependências de FK
    if (created.approvalId)   await db.from('req_approvals').delete().eq('id', created.approvalId);
    if (created.quotationId)  await db.from('req_quotations').delete().eq('id', created.quotationId);
    if (created.ticketId)     await db.from('req_tickets').delete().eq('id', created.ticketId);
    if (created.supplierId)   await db.from('req_suppliers').delete().eq('id', created.supplierId);
    if (created.approverId)   await db.from('req_profiles').delete().eq('id', created.approverId);
    if (created.requesterId)  await db.from('req_profiles').delete().eq('id', created.requesterId);
    if (created.departmentId) await db.from('req_departments').delete().eq('id', created.departmentId);
  });

  it('placeholder — limpeza ocorre no afterAll', () => {
    expect(created.ticketId).toBeTruthy();
  });
});
