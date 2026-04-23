/**
 * SUPABASE INTEGRATION TESTS — Fluxo Real M1→Cotação→Aprovação→Compras
 *
 * Usa service_role para bypass de RLS (ambiente CI apenas).
 * Cria dados, valida transições de status e limpa ao final.
 *
 * Nome do ficheiro: NÃO use prefixo `supabase-flow*` — o vitest.config.ts mesclado
 * no CI excluía esse padrão e o Vitest não encontrava o teste ("No test files found").
 *
 * Requer variáveis de ambiente:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import type { Database } from '../../../../src/lib/supabase/types';

// ─── Client Admin (service_role — somente CI) ────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const HAS_SUPABASE = Boolean(SUPABASE_URL && SERVICE_KEY);

function getAdminClient() {
  // Retorna dummy quando sem credenciais (describe.skipIf garante que nenhum test roda)
  if (!HAS_SUPABASE) return null as unknown as ReturnType<typeof createClient<Database>>;
  return createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

// ─── IDs criados durante o teste (para limpeza) ───────────────────────────────
const created = {
  departmentId: '',
  requesterId: '',
  approverId: '',
  supplierId: '',
  ticketId: '',
  quotationId: '',
  approvalId: '',
  authUserIds: [] as string[],
};

// ─── Prefixo único por execução para evitar colisões ─────────────────────────
const RUN_ID = `ci-${Date.now()}`;

// ─────────────────────────────────────────────────────────────────────────────
describe.skipIf(!HAS_SUPABASE)('[Supabase] Conectividade básica', () => {
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
describe.skipIf(!HAS_SUPABASE)('[Supabase] Setup de dados de teste', () => {
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
    const email = `req-${RUN_ID}@test.com`;
    // Cria usuário real no Auth para satisfazer FK
    const { data: authUser, error: authError } = await db.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true
    });

    if (authError) throw authError;
    const authId = authUser.user.id;

    const { data, error } = await db
      .from('req_profiles')
      .upsert({
        id: authId,
        full_name: `Requester ${RUN_ID}`,
        email,
        role: 'requester',
        department_id: created.departmentId,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    created.requesterId = data!.id;
    created.authUserIds.push(authId); // Para limpeza no afterAll
  });

  it('cria perfil approver de teste', async () => {
    const email = `app-${RUN_ID}@test.com`;
    // Cria usuário real no Auth para satisfazer FK
    const { data: authUser, error: authError } = await db.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true
    });

    if (authError) throw authError;
    const authId = authUser.user.id;

    const { data, error } = await db
      .from('req_profiles')
      .upsert({
        id: authId,
        full_name: `Approver ${RUN_ID}`,
        email,
        role: 'approver',
        department_id: created.departmentId,
        approval_tier: 1,
        approval_limit: 100000,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    created.approverId = data!.id;
    created.authUserIds.push(authId);
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
describe.skipIf(!HAS_SUPABASE)('[Supabase] Fluxo M1 — Criação e Submissão de Ticket', () => {
  const db = getAdminClient();

  it('cria ticket M1 como DRAFT', async () => {
    const ticketNumber = `M1-${RUN_ID}`;

    if (!created.requesterId || !created.departmentId) {
      throw new Error(`Setup inconsistente: requesterId=${created.requesterId}, deptId=${created.departmentId}`);
    }

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
    // RPC pode retornar array ou objeto dependendo da versão/config
    const ticket = Array.isArray(data) ? data[0] : data;
    expect(ticket?.status).toBe('SUBMITTED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe.skipIf(!HAS_SUPABASE)('[Supabase] Fluxo Cotação — SUBMITTED → QUOTING → PENDING_APPROVAL', () => {
  const db = getAdminClient();

  it('transiciona ticket para QUOTING', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'QUOTING',
      p_user_id:    created.requesterId,
      p_notes:      'Iniciando cotação CI',
    });

    expect(error).toBeNull();
    const ticket = Array.isArray(data) ? data[0] : data;
    expect(ticket?.status).toBe('QUOTING');
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
    const ticket = Array.isArray(data) ? data[0] : data;
    expect(ticket?.status).toBe('PENDING_APPROVAL');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe.skipIf(!HAS_SUPABASE)('[Supabase] Fluxo Aprovação — PENDING_APPROVAL → APPROVED', () => {
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
    const ticket = Array.isArray(data) ? data[0] : data;
    expect(ticket?.status).toBe('APPROVED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe.skipIf(!HAS_SUPABASE)('[Supabase] Fluxo Compras — APPROVED → PURCHASING → RELEASED', () => {
  const db = getAdminClient();

  it('transiciona ticket para PURCHASING', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'PURCHASING',
      p_user_id:    created.approverId,
      p_notes:      'Comprando no CI',
    });

    expect(error).toBeNull();
    const ticket = Array.isArray(data) ? data[0] : data;
    expect(ticket?.status).toBe('PURCHASING');
  });

  it('transiciona ticket para RECEIVING', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'RECEIVING',
      p_user_id:    created.approverId,
    });

    expect(error).toBeNull();
    const ticket = Array.isArray(data) ? data[0] : data;
    expect(ticket?.status).toBe('RECEIVING');
  });

  it('finaliza ticket com status RELEASED', async () => {
    const { data, error } = await db.rpc('req_transition_ticket', {
      p_ticket_id:  created.ticketId,
      p_new_status: 'RELEASED',
      p_user_id:    created.approverId,
      p_notes:      'Entregue e encerrado no CI',
    });

    expect(error).toBeNull();
    const ticket = Array.isArray(data) ? data[0] : data;
    expect(ticket?.status).toBe('RELEASED');
  });

  it('ticket no banco está como RELEASED (verificação final)', async () => {
    const { data, error } = await db
      .from('req_tickets')
      .select('status, approved_at, purchased_at, received_at, released_at')
      .eq('id', created.ticketId)
      .single();

    expect(error).toBeNull();
    const ticket = Array.isArray(data) ? data[0] : data;
    expect(ticket?.status).toBe('RELEASED');
    expect(ticket?.approved_at).toBeTruthy();
    expect(data?.purchased_at).toBeTruthy();
    expect(data?.received_at).toBeTruthy();
    expect(data?.released_at).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe.skipIf(!HAS_SUPABASE)('[Supabase] Limpeza de dados de teste', () => {
  const db = getAdminClient();

  afterAll(async () => {
    if (created.ticketId) {
      await db.from('req_tickets').delete().eq('id', created.ticketId);
    }
    if (created.departmentId) {
      await db.from('req_departments').delete().eq('id', created.departmentId);
    }
    if (created.supplierId) {
      await db.from('req_suppliers').delete().eq('id', created.supplierId);
    }
    // Perfis são deletados via ON DELETE CASCADE se deletarmos os usuários do Auth
    for (const authId of created.authUserIds) {
      await db.auth.admin.deleteUser(authId);
    }
  });

  it('placeholder — limpeza ocorre no afterAll', () => {
    expect(created.ticketId).toBeTruthy();
  });
});
