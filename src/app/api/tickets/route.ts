/**
 * POST /api/tickets
 * Cria um novo ticket para qualquer módulo (M1-M6).
 *
 * GET /api/tickets?status=SUBMITTED&module=M1_PRODUTOS
 * Lista tickets com filtros opcionais.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type ModuleType  = Database['public']['Enums']['req_module_type'];
type StatusType  = Database['public']['Enums']['req_ticket_status'];
type PriorityType = Database['public']['Enums']['req_priority_level'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateTitle(module: ModuleType, meta: Record<string, unknown>): string {
  switch (module) {
    case 'M1_PRODUTOS':
      return `Requisição de Produtos — ${(meta.itens as any[])?.[0]?.nome ?? 'Múltiplos itens'}`;
    case 'M2_VIAGENS':
      return `Viagem ${meta.origin ?? ''} → ${meta.destination ?? ''}`;
    case 'M3_SERVICOS':
      return `Serviço — ${meta.service_type ?? ''} em ${meta.location ?? ''}`;
    case 'M4_MANUTENCAO':
      return `Manutenção ${meta.maintenance_type ?? ''} — ${meta.asset_name ?? ''}`;
    case 'M5_FRETE':
      return `Frete ${meta.direction === 'inbound' ? 'Entrada' : 'Saída'} — ${meta.cargo_type ?? ''}`;
    case 'M6_LOCACAO':
      return `Locação — ${meta.equipment_name ?? ''}`;
    default:
      return `Requisição — ${module}`;
  }
}

function resolvePriority(module: ModuleType, meta: Record<string, unknown>): PriorityType {
  if (module === 'M4_MANUTENCAO' && meta.maintenance_type === 'corrective' && meta.priority === 'emergency') {
    return 'urgent';
  }
  if (module === 'M2_VIAGENS' && meta.urgency_justification) {
    return 'high';
  }
  const p = meta.priority as string | undefined;
  if (p === 'urgent' || p === 'high' || p === 'low') return p as PriorityType;
  return 'normal';
}

async function findOrCreateDepartment(
  adminClient: ReturnType<typeof getSupabaseAdmin>,
  name: string,
  costCenter: string
): Promise<string> {
  // Tenta encontrar pelo nome (case-insensitive)
  const { data: existing } = await adminClient
    .from('req_departments')
    .select('id')
    .ilike('name', name.trim())
    .maybeSingle();

  if (existing?.id) return existing.id;

  // Cria o departamento
  const { data: created, error } = await adminClient
    .from('req_departments')
    .insert({ name: name.trim(), cost_center: (costCenter ?? 'N/A').trim() })
    .select('id')
    .single();

  if (error) throw new Error(`Erro ao criar departamento: ${error.message}`);
  return created.id;
}

// ─── POST — criar ticket ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 2. Corpo da requisição
    const body = await request.json();
    const { module, departamento, centroCusto, ...restMeta } = body as {
      module: ModuleType;
      departamento: string;
      centroCusto?: string;
      [key: string]: unknown;
    };

    if (!module) {
      return NextResponse.json({ error: 'Campo "module" obrigatório' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // 3. Departamento
    const departmentId = await findOrCreateDepartment(
      admin,
      departamento || 'Sem departamento',
      centroCusto  || 'N/A'
    );

    // 4. Número do ticket
    const { data: ticketNumber, error: numError } = await admin.rpc(
      'req_generate_ticket_number',
      { p_module: module }
    );
    if (numError || !ticketNumber) {
      return NextResponse.json({ error: 'Erro ao gerar número do ticket' }, { status: 500 });
    }

    // 5. Inserir ticket
    const metadata = { departamento, centroCusto, ...restMeta };
    const { data: ticket, error: ticketError } = await admin
      .from('req_tickets')
      .insert({
        module,
        title: generateTitle(module, metadata),
        requester_id: user.id,
        department_id: departmentId,
        ticket_number: ticketNumber as string,
        status: 'SUBMITTED' as StatusType,
        metadata,
        priority: resolvePriority(module, metadata),
        submitted_at: new Date().toISOString(),
        description: (metadata.justificativa as string) ?? null,
      })
      .select()
      .single();

    if (ticketError) {
      console.error('[tickets POST] ticket insert error:', ticketError);
      return NextResponse.json({ error: ticketError.message }, { status: 500 });
    }

    // 6. Itens (M1 — Produtos)
    if (module === 'M1_PRODUTOS') {
      const itens = (metadata.itens as any[]) ?? [];
      if (itens.length > 0) {
        await admin.from('req_ticket_items').insert(
          itens.map((item, i) => ({
            ticket_id: ticket.id,
            description: item.nome ?? item.description ?? '',
            quantity: Number(item.quantidade ?? item.quantity ?? 1),
            notes: item.especificacao ?? item.notes ?? null,
            unit: item.unit ?? 'un',
            sort_order: i,
          }))
        );
      }
    }

    // 7. Log de auditoria
    await admin.rpc('req_log_audit', {
      p_ticket_id: ticket.id,
      p_user_id:   user.id,
      p_action:    'Requisição criada',
      p_details:   `Ticket ${ticketNumber} criado no módulo ${module}`,
      p_level:     'success',
      p_module:    module,
      p_metadata:  { ticket_number: ticketNumber, module },
    });

    return NextResponse.json(
      { id: ticket.id, ticket_number: ticketNumber, status: ticket.status },
      { status: 201 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[tickets POST]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── GET — listar tickets ─────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const module = searchParams.get('module');
    const admin  = getSupabaseAdmin();

    // Busca no profile do usuário o role
    const { data: profile } = await admin
      .from('req_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role ?? 'requester';

    let query = admin
      .from('req_tickets_view')
      .select('*')
      .order('created_at', { ascending: false });

    // Requester vê apenas os próprios tickets; outros roles vêem todos
    if (role === 'requester') {
      query = query.eq('requester_email', user.email!);
    }

    if (status) query = query.eq('status', status as StatusType);
    if (module) query = query.eq('module', module as ModuleType);

    const { data, error } = await query.limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ tickets: data ?? [] });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
