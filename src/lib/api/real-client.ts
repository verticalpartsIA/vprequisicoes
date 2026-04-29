/**
 * real-client.ts (VERSÃO ESTRUTURAL PARA HOSPEDAGEM COMPARTILHADA)
 * 
 * Esta versão remove a dependência de rotas /api do Next.js e fala diretamente
 * com o Supabase via navegador. Ideal para sites estáticos (output: export).
 */

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ModuleType   = Database['public']['Enums']['req_module_type'];
type StatusType   = Database['public']['Enums']['req_ticket_status'];
type PriorityType = Database['public']['Enums']['req_priority_level'];

// ─── HELPERS DE LÓGICA (Trazidos das Rotas de API) ───────────────────────────

function generateTitle(module: ModuleType, meta: any): string {
  switch (module) {
    case 'M1_PRODUTOS':
      return `Requisição de Produtos — ${meta.itens?.[0]?.nome ?? 'Múltiplos itens'}`;
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

function resolvePriority(module: ModuleType, meta: any): PriorityType {
  if (module === 'M4_MANUTENCAO' && meta.maintenance_type === 'corrective' && meta.priority === 'emergency') {
    return 'urgent';
  }
  if (module === 'M2_VIAGENS' && meta.urgency_justification) {
    return 'high';
  }
  const p = meta.priority;
  if (p === 'urgent' || p === 'high' || p === 'low') return p as PriorityType;
  return 'normal';
}

async function findOrCreateDepartment(name: string, costCenter: string): Promise<string> {
  const cleanName = (name || 'Sem departamento').trim();
  const cleanCC = (costCenter || 'N/A').trim();

  // Tenta encontrar
  const { data: existing } = await supabase
    .from('req_departments')
    .select('id')
    .ilike('name', cleanName)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // Cria se não existir
  const { data: created, error } = await supabase
    .from('req_departments')
    .insert({ name: cleanName, cost_center: cleanCC })
    .select('id')
    .single();

  if (error) throw new Error(`Erro ao criar departamento: ${error.message}`);
  return created.id;
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function realGet(path: string, params?: Record<string, string>): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // 1. Dashboard Summary — built from direct queries (no RPC dependency)
  if (path === '/api/dashboard/summary') {
    const period = params?.period || '30d';
    const moduleFilter = params?.module || 'ALL';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    let base = supabase.from('req_tickets').select('*', { count: 'exact', head: false });
    if (moduleFilter !== 'ALL') base = base.eq('module', moduleFilter as ModuleType);

    const [allRes, pendingRes, quotRes, approvedRes] = await Promise.all([
      supabase.from('req_tickets').select('id,status,module,created_at,approved_at,metadata', { count: 'exact' })
        .gte('created_at', since),
      supabase.from('req_tickets').select('id', { count: 'exact', head: true }).eq('status', 'PENDING_APPROVAL'),
      supabase.from('req_quotations').select('total_value,created_at').gte('created_at', since),
      supabase.from('req_tickets').select('created_at,approved_at')
        .eq('status', 'APPROVED').not('approved_at', 'is', null).gte('created_at', since),
    ]);

    const tickets = allRes.data || [];
    const quotations = quotRes.data || [];
    const approved = approvedRes.data || [];

    // KPIs
    const total_tickets = allRes.count ?? tickets.length;
    const tickets_pending_approval = pendingRes.count ?? 0;
    const total_spent = quotations.reduce((s: number, q: any) => s + Number(q.total_value || 0), 0);
    const slaArr = approved.map((t: any) => {
      const diff = new Date(t.approved_at).getTime() - new Date(t.created_at).getTime();
      return diff / 3600000;
    });
    const avg_sla_hours = slaArr.length ? Math.round(slaArr.reduce((a: number, b: number) => a + b, 0) / slaArr.length) : 0;

    // Savings timeline (total_value per day)
    const byDay: Record<string, number> = {};
    for (const q of quotations) {
      const day = q.created_at?.slice(0, 10) ?? '';
      if (day) byDay[day] = (byDay[day] || 0) + Number(q.total_value || 0);
    }
    const savings_timeline = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label: new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value }));

    // Module distribution
    const modCount: Record<string, number> = {};
    for (const t of tickets) { modCount[t.module] = (modCount[t.module] || 0) + 1; }
    const MOD_COLORS: Record<string, string> = {
      M1_PRODUTOS: '#f97316', M2_VIAGENS: '#3b82f6', M3_SERVICOS: '#8b5cf6',
      M4_MANUTENCAO: '#ef4444', M5_FRETE: '#10b981', M6_LOCACAO: '#f59e0b',
    };
    const MOD_LABEL: Record<string, string> = {
      M1_PRODUTOS: 'Produtos', M2_VIAGENS: 'Viagens', M3_SERVICOS: 'Serviços',
      M4_MANUTENCAO: 'Manutenção', M5_FRETE: 'Frete', M6_LOCACAO: 'Locação',
    };
    const module_distribution = Object.entries(modCount).map(([mod, count]) => ({
      label: MOD_LABEL[mod] || mod, value: count, color: MOD_COLORS[mod] || '#94a3b8',
    }));

    // Status distribution
    const stCount: Record<string, number> = {};
    for (const t of tickets) { stCount[t.status] = (stCount[t.status] || 0) + 1; }
    const status_distribution = Object.entries(stCount).map(([label, value]) => ({ label, value }));

    // Top suppliers from quotation metadata
    const supMap: Record<string, { pedidos: number; total: number }> = {};
    for (const q of quotations) {
      const name = 'Fornecedor';
      if (!supMap[name]) supMap[name] = { pedidos: 0, total: 0 };
      supMap[name].pedidos++;
      supMap[name].total += Number((q as any).total_value || 0);
    }
    const top_suppliers = Object.entries(supMap)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5)
      .map(([name, d]) => ({ name, orders: d.pedidos, total: d.total }));

    return {
      kpis: { total_tickets, tickets_pending_approval, total_auction_savings: total_spent, avg_sla_hours },
      savings_timeline,
      module_distribution,
      status_distribution,
      top_suppliers,
    };
  }

  // 2. Listagem de Tickets (View)
  const isSpecialList = path === '/api/approval/tickets' || path === '/api/purchasing/tickets' || path === '/api/receiving/tickets';
  let query = supabase
    .from(isSpecialList ? 'req_tickets' : 'req_tickets_view')
    .select('*')
    .order('created_at', { ascending: false });

  // Regras de Filtro
  if (path === '/api/quotation/list') {
    // Tela de cotação (kanban): apenas tickets aguardando ser cotados
    query = query.in('status', ['SUBMITTED', 'QUOTING'] as StatusType[]);
  } else if (path === '/api/requests') {
    // Para a lista geral, mostramos o que é do usuário OU o que está aguardando cotação (para compradores)
    query = query.or(`requester_email.eq.${user.email},status.in.(SUBMITTED,QUOTING)`);
  } else if (path === '/api/requests/rental') {
    query = query.eq('module', 'M6_LOCACAO').eq('requester_email', user.email!);
  } else if (path === '/api/approval/tickets') {
    query = query.eq('status', 'PENDING_APPROVAL');
  } else if (path === '/api/purchasing/tickets') {
    query = query.eq('status', (params?.status ?? 'APPROVED') as StatusType);
  } else if (path === '/api/receiving/tickets') {
    query = query.eq('status', (params?.status ?? 'RECEIVING') as StatusType);
  }

  // Filtros de busca dinâmica
  if (params?.status && 
      path !== '/api/approval/tickets' && 
      path !== '/api/purchasing/tickets' && 
      path !== '/api/receiving/tickets') {
    query = query.eq('status', params.status as StatusType);
  }

  // Detalhe de Ticket Único
  const requestMatch = path.match(/^\/api\/requests\/([^/]+)$/);
  if (requestMatch) {
    const { data, error } = await supabase
      .from('req_tickets_view')
      .select('*')
      .eq('id', requestMatch[1])
      .single();
    if (error) throw error;
    return { status: 'success', data };
  }

  // Audit Logs
  const auditMatch = path.match(/^\/api\/approval\/tickets\/([^/]+)\/audit$/);
  if (auditMatch) {
    const { data, error } = await supabase
      .from('req_audit_logs')
      .select('*')
      .eq('ticket_id', auditMatch[1])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { status: 'success', data };
  }

  const { data, error } = await query.limit(100);
  if (error) throw error;
  return { status: 'success', data: data ?? [] };
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function realPost(path: string, body: any): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // 1. Criação de Ticket (M1-M6)
  if (path.startsWith('/api/requests/')) {
    const moduleMap: Record<string, ModuleType> = {
      'products': 'M1_PRODUTOS',
      'travel': 'M2_VIAGENS',
      'services': 'M3_SERVICOS',
      'maintenance': 'M4_MANUTENCAO',
      'freight': 'M5_FRETE',
      'rental': 'M6_LOCACAO'
    };
    
    const segment = path.split('/').pop() || 'products';
    const module = moduleMap[segment] || 'M1_PRODUTOS';

    // Resolver Depto
    const deptId = await findOrCreateDepartment(body.departamento, body.centroCusto);

    // Gerar Número (RPC)
    const { data: ticketNumber } = await supabase.rpc('req_generate_ticket_number', { p_module: module });

    // Inserir Ticket
    const { data: ticket, error: ticketErr } = await supabase
      .from('req_tickets')
      .insert({
        module,
        title: generateTitle(module, body),
        requester_id: user.id,
        department_id: deptId,
        ticket_number: ticketNumber as string,
        status: 'SUBMITTED',
        currency: 'BRL',
        metadata: body,
        priority: resolvePriority(module, body),
        description: body.justificativa || null
      })
      .select()
      .single();

    if (ticketErr) throw ticketErr;

    // Se M1, insere itens
    if (module === 'M1_PRODUTOS' && body.itens?.length > 0) {
      await supabase.from('req_ticket_items').insert(
        body.itens.map((item: any, i: number) => ({
          ticket_id: ticket.id,
          description: item.nome || item.description,
          quantity: Number(item.quantidade || 1),
          unit: item.unit || 'un',
          sort_order: i
        }))
      );
    }

    // Auditoria
    await supabase.rpc('req_log_audit', {
      p_ticket_id: ticket.id,
      p_user_id: user.id,
      p_action: 'Requisição criada',
      p_details: `Ticket ${ticketNumber} criado via client estático`,
      p_level: 'success',
      p_module: module
    });

    return { status: 'success', data: ticket };
  }

    // 2. Fluxo de Cotação (V2)
    const draftMatch = path.match(/^\/api\/quotation\/tickets\/([^/]+)\/draft$/);
    if (draftMatch) {
      const ticketId = draftMatch[1];
      const { data: updatedTicket, error: updateError } = await supabase
        .from('req_tickets')
        .update({
          metadata: {
            ...((await supabase.from('req_tickets').select('metadata').eq('id', ticketId).single()).data?.metadata || {}),
            draft: body
          }
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { status: 'success', data: updatedTicket };
    }

    const quotationMatch = path.match(/^\/api\/quotation\/tickets\/([^/]+)$/);
    if (quotationMatch) {
      const ticketId = quotationMatch[1];
      let finalSupplierId = body.supplier_id;

      // Blindagem: Se o supplier_id não for um UUID válido, tratamos como nome
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(finalSupplierId)) {
        const supplierName = finalSupplierId || 'Fornecedor Avulso';
        
        // Tentar buscar por nome
        const { data: existingSupplier } = await supabase
          .from('req_suppliers')
          .select('id')
          .ilike('name', supplierName)
          .maybeSingle();

        if (existingSupplier) {
          finalSupplierId = existingSupplier.id;
        } else {
          // Criar novo fornecedor
          const { data: newSupplier, error: createErr } = await supabase
            .from('req_suppliers')
            .insert({ name: supplierName, is_active: true })
            .select('id')
            .single();
          
          if (!createErr && newSupplier) {
            finalSupplierId = newSupplier.id;
          } else {
            // Fallback final
            const { data: firstSup } = await supabase.from('req_suppliers').select('id').limit(1).maybeSingle();
            finalSupplierId = firstSup?.id;
          }
        }
      }
      
      // Extrai dados do fornecedor vencedor do primeiro item (para req_quotations)
      const firstItemWinner = body.items?.[0]?.winner || body.items?.[0]?.suppliers?.find((s: any) => s.is_winner);
      const winnerDeliveryDays = firstItemWinner?.delivery_days || body.delivery_days || 0;
      const winReasonLabel = firstItemWinner?.win_reason
        ? { price: 'Melhor Preço', deadline: 'Melhor Prazo', both: 'Preço e Prazo' }[firstItemWinner.win_reason as string] || ''
        : '';

      // Inserir Cotação
      const { data: quotation, error: quotErr } = await supabase
        .from('req_quotations')
        .insert({
          ticket_id: ticketId,
          supplier_id: finalSupplierId,
          total_value: body.total_amount,
          delivery_days: winnerDeliveryDays,
          notes: body.notes || (winReasonLabel ? `Critério de seleção: ${winReasonLabel}` : ''),
          status: 'RECEIVED',
          items: body.items || []
        })
        .select()
        .single();

      if (quotErr) throw quotErr;

      // Buscar Ticket Atual para preservar metadados originais
      const { data: existingTicket } = await supabase
        .from('req_tickets')
        .select('metadata')
        .eq('id', ticketId)
        .single();

      // Atualizar Ticket preservando dados originais (IMPORTANTE para M2-M6)
      await supabase
        .from('req_tickets')
        .update({
          status: 'PENDING_APPROVAL',
          quoted_at: new Date().toISOString(),
          metadata: {
            ...(existingTicket?.metadata || {}),
            quotation: {
              ...body,
              quotation_id: quotation.id,
              win_reason: firstItemWinner?.win_reason,
              win_reason_label: winReasonLabel,
              delivery_days: winnerDeliveryDays
            }
          }
        })
        .eq('id', ticketId);

      // Auditoria
      const auditDetail = `Cotação registrada. Total: R$ ${body.total_amount}. Fornecedor vencedor: ${firstItemWinner?.name || finalSupplierId}. Critério: ${winReasonLabel || 'não informado'}. Iniciada Aprovação.`;
      await supabase.rpc('req_log_audit', {
        p_ticket_id: ticketId,
        p_user_id: user.id,
        p_action: 'Cotação enviada',
        p_details: auditDetail,
        p_level: 'success',
        p_module: 'V2_COTACAO'
      });

      return { status: 'success', data: quotation };
    }

  // 3. Decisão de Aprovação (V3)
  const approvalDecideMatch = path.match(/^\/api\/approval\/tickets\/([^/]+)\/decide$/);
  if (approvalDecideMatch) {
    const ticketId = approvalDecideMatch[1];
    const rawDecision = body.decision?.toLowerCase();
    
    const { data: ticket } = await supabase.from('req_tickets').select('*').eq('id', ticketId).single();
    if (!ticket) throw new Error('Ticket não encontrado');

    const totalValue = Number(ticket.metadata?.quotation?.total_amount || ticket.metadata?.total_amount || 0);
    
    let nextStatus: StatusType = 'APPROVED';
    let actionLabel = 'Aprovação Concedida';

    if (rawDecision === 'reject' || rawDecision === 'rejected') {
      nextStatus = 'REJECTED';
      actionLabel = 'Requisição Rejeitada';
    } else if (rawDecision === 'revision') {
      nextStatus = 'QUOTING'; // Volta para cotação
      actionLabel = 'Pedido de Revisão';
    } else {
      // Escalação simplificada: se > 5000 vai para diretoria (simulado via status)
      nextStatus = totalValue > 5000 ? 'PENDING_APPROVAL' : 'APPROVED';
      actionLabel = 'Aprovação Concedida';
    }

    // Busca nome do aprovador para guardar no documento
    const { data: approverProfile } = await supabase
      .from('req_profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle();
    const approverName = approverProfile?.full_name || approverProfile?.email || user.email || 'Aprovador';

    const { error } = await supabase
      .from('req_tickets')
      .update({
        status: nextStatus,
        approved_at: (nextStatus === 'APPROVED') ? new Date().toISOString() : null,
        rejected_at: (nextStatus === 'REJECTED') ? new Date().toISOString() : null,
        metadata: {
          ...(ticket.metadata as any),
          approval_comment: body.comment || body.reason || '',
          last_decision: rawDecision.toUpperCase(),
          approved_by_name: nextStatus === 'APPROVED' ? approverName : undefined,
          approver_email: nextStatus === 'APPROVED' ? user.email : undefined,
        }
      })
      .eq('id', ticketId);

    if (error) throw error;

    await supabase.rpc('req_log_audit', {
      p_ticket_id: ticketId,
      p_user_id: user.id,
      p_action: actionLabel,
      p_details: `Decisão: ${rawDecision}. Comentário: ${body.comment || body.reason || 'Sem observações'}`,
      p_level: nextStatus === 'REJECTED' ? 'error' : 'success',
      p_module: 'V3_APROVACAO'
    });

    return { status: 'success' };
  }

  // 4. Fluxo de Compras (V4)
  const purchasingMatch = path.match(/^\/api\/purchasing\/tickets\/([^/]+)\/(direct|auction)$/);
  if (purchasingMatch) {
    const ticketId = purchasingMatch[1];

    // Se não requer recebimento, vai direto para RELEASED
    const requiresReceiving = body.requires_receiving !== false;
    const nextPurchasingStatus: StatusType = requiresReceiving ? 'RECEIVING' : 'RELEASED';
    const ocNumber = body.oc_number || `OC-${ticketId.slice(0, 6)}`;

    const { error } = await supabase
      .from('req_tickets')
      .update({
        status: nextPurchasingStatus,
        purchased_at: new Date().toISOString(),
        metadata: {
          ...body,
          oc_number: ocNumber,
          requires_receiving: requiresReceiving,
          winner_supplier: body.winner_name,
          winner_reason: body.winner_reason,
          purchase_address: 'Rua Armandina Braga de Almeida, 383 - Guarulhos/SP',
        }
      })
      .eq('id', ticketId);

    if (error) throw error;

    await supabase.rpc('req_log_audit', {
      p_ticket_id: ticketId,
      p_user_id: user.id,
      p_action: 'Ordem de Compra Emitida',
      p_details: `OC: ${ocNumber}. Fornecedor: ${body.winner_name || body.supplier_name}. Recebimento: ${requiresReceiving ? 'Sim' : 'Não'}.`,
      p_level: 'success',
      p_module: 'V4_COMPRAS'
    });

    return { status: 'success', data: { oc_number: ocNumber } };
  }

  // 5. Fluxo de Recebimento (V5)
  const receivingMatch = path.match(/^\/api\/receiving\/tickets\/([^/]+)\/(physical|digital)$/);
  if (receivingMatch) {
    const ticketId = receivingMatch[1];
    
    const { error } = await supabase
      .from('req_tickets')
      .update({
        status: 'RELEASED',
        received_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) throw error;

    await supabase.rpc('req_log_audit', {
      p_ticket_id: ticketId,
      p_user_id: user.id,
      p_action: 'Recebimento Confirmado',
      p_details: `Entrega confirmada via console de recebimento.`,
      p_level: 'success',
      p_module: 'V5_RECEBIMENTO'
    });

    return { status: 'success', data: { ticket_id: ticketId } };
  }

  throw new Error(`Caminho POST não suportado no modo estático: ${path}`);
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function realPatch(path: string, body: any): Promise<any> {
  // Exemplo de atualização de rascunho ou metadados
  const draftMatch = path.match(/^\/api\/quotation\/tickets\/([^/]+)\/draft$/);
  if (draftMatch) {
    const { error } = await supabase
      .from('req_tickets')
      .update({ metadata: body })
      .eq('id', draftMatch[1]);
    if (error) throw error;
    return { status: 'success' };
  }

  throw new Error(`Caminho PATCH não suportado no modo estático: ${path}`);
}
