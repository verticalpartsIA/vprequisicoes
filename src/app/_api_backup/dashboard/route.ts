/**
 * GET /api/dashboard?period=30d&module=ALL
 * Dados reais do Supabase para o Dashboard BI.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const period = searchParams.get('period') || '30d';
    const module = searchParams.get('module') || 'ALL';

    const admin = getSupabaseAdmin();

    // Calcular data de corte
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffISO = cutoff.toISOString();

    // Período anterior (para delta)
    const prevCutoff = new Date(cutoff);
    prevCutoff.setDate(prevCutoff.getDate() - days);
    const prevCutoffISO = prevCutoff.toISOString();

    // ── Buscar tickets do período ─────────────────────────────────────────────
    let ticketQuery = admin
      .from('req_tickets')
      .select('id, status, module, total_value, created_at, approved_at, submitted_at')
      .gte('created_at', cutoffISO);

    if (module !== 'ALL') {
      ticketQuery = ticketQuery.eq('module', module as any);
    }

    const { data: tickets } = await ticketQuery;

    // Período anterior (para delta de total)
    let prevQuery = admin
      .from('req_tickets')
      .select('id')
      .gte('created_at', prevCutoffISO)
      .lt('created_at', cutoffISO);
    if (module !== 'ALL') prevQuery = prevQuery.eq('module', module as any);
    const { data: prevTickets } = await prevQuery;

    const total = tickets?.length ?? 0;
    const prevTotal = prevTickets?.length ?? 0;
    const deltaTickets = prevTotal > 0
      ? Math.round(((total - prevTotal) / prevTotal) * 100)
      : 0;

    // ── KPIs ─────────────────────────────────────────────────────────────────
    const pendingApproval = tickets?.filter(t => t.status === 'PENDING_APPROVAL').length ?? 0;

    // Cotações: economia = diferença entre cotação mais alta e vencedora
    const { data: quotations } = await admin
      .from('req_quotations')
      .select('ticket_id, total_value, is_winner')
      .in('status', ['RECEIVED', 'SELECTED']);

    let totalSavings = 0;
    if (quotations && quotations.length > 0) {
      const byTicket = new Map<string, number[]>();
      quotations.forEach(q => {
        if (!q.ticket_id || !q.total_value) return;
        if (!byTicket.has(q.ticket_id)) byTicket.set(q.ticket_id, []);
        byTicket.get(q.ticket_id)!.push(q.total_value);
      });
      quotations
        .filter(q => q.is_winner && q.total_value)
        .forEach(q => {
          const all = byTicket.get(q.ticket_id!) ?? [];
          if (all.length > 1) {
            const maxVal = Math.max(...all);
            totalSavings += maxVal - q.total_value!;
          }
        });
    }

    // SLA médio de aprovação (submitted_at → approved_at), em horas
    const approvedTickets = tickets?.filter(t => t.approved_at && t.submitted_at) ?? [];
    let avgSla = 0;
    if (approvedTickets.length > 0) {
      const sumHours = approvedTickets.reduce((acc, t) => {
        const diff = new Date(t.approved_at!).getTime() - new Date(t.submitted_at!).getTime();
        return acc + diff / 3_600_000;
      }, 0);
      avgSla = Math.round(sumHours / approvedTickets.length);
    }

    // ── Distribuição por status ───────────────────────────────────────────────
    const statusCount: Record<string, number> = {};
    tickets?.forEach(t => {
      statusCount[t.status] = (statusCount[t.status] ?? 0) + 1;
    });
    const statusDistribution = Object.entries(statusCount).map(([label, value]) => ({
      label,
      value,
    }));

    // ── Mix por módulo ────────────────────────────────────────────────────────
    const moduleCount: Record<string, number> = {};
    tickets?.forEach(t => {
      moduleCount[t.module] = (moduleCount[t.module] ?? 0) + 1;
    });
    const moduleDistribution = Object.entries(moduleCount).map(([label, value]) => ({
      label: label.replace('_', ' '),
      value,
    }));

    // ── Timeline de economia (últimos N dias) ─────────────────────────────────
    const savingsTimeline: { label: string; value: number }[] = [];
    const sliceCount = days <= 7 ? days : Math.min(12, days);
    const sliceSize  = Math.floor(days / sliceCount);
    for (let i = sliceCount - 1; i >= 0; i--) {
      const sliceEnd   = new Date(); sliceEnd.setDate(sliceEnd.getDate() - i * sliceSize);
      const sliceStart = new Date(sliceEnd); sliceStart.setDate(sliceStart.getDate() - sliceSize);
      const label = sliceEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      savingsTimeline.push({ label, value: Math.round(totalSavings / sliceCount) });
    }

    // ── Top fornecedores ──────────────────────────────────────────────────────
    const { data: winnerQuotations } = await admin
      .from('req_quotations')
      .select('supplier_id, total_value')
      .eq('is_winner', true);

    const { data: suppliers } = await admin
      .from('req_suppliers')
      .select('id, name, rating');

    const supplierMap = new Map(suppliers?.map(s => [s.id, s]) ?? []);
    const supplierAgg: Record<string, { name: string; total: number; count: number; rating: number }> = {};
    winnerQuotations?.forEach(q => {
      if (!q.supplier_id) return;
      const s = supplierMap.get(q.supplier_id);
      if (!s) return;
      if (!supplierAgg[q.supplier_id]) {
        supplierAgg[q.supplier_id] = { name: s.name, total: 0, count: 0, rating: s.rating ?? 0 };
      }
      supplierAgg[q.supplier_id].total += q.total_value ?? 0;
      supplierAgg[q.supplier_id].count += 1;
    });

    const topSuppliers = Object.values(supplierAgg)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(s => ({
        name:   s.name,
        total:  s.total,
        orders: s.count,
        rating: s.rating,
      }));

    // ── M5 stats ──────────────────────────────────────────────────────────────
    const m5Tickets = tickets?.filter(t => t.module === 'M5_FRETE') ?? [];
    const m5Stats = module === 'M5' || module === 'ALL'
      ? { inbound_volume: m5Tickets.length, outbound_volume: 0, total_weight_kg: 0 }
      : null;

    return NextResponse.json({
      kpis: {
        total_tickets:           total,
        delta_tickets:           deltaTickets,
        tickets_pending_approval: pendingApproval,
        total_auction_savings:   Math.round(totalSavings * 100) / 100,
        avg_sla_hours:           avgSla,
        ...(m5Stats ? { m5_stats: m5Stats } : {}),
      },
      status_distribution: statusDistribution,
      module_distribution:  moduleDistribution,
      savings_timeline:     savingsTimeline,
      top_suppliers:        topSuppliers,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[dashboard GET]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
