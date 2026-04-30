'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Search,
  Download,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Filter,
  ChevronDown,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type LogLevel = 'info' | 'success' | 'warning' | 'error';

interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  module: string;
  action: string;
  user: string;
  details: string;
  metadata: Record<string, unknown>;
  ticket_id: string | null;
  ticket_number: string | null;
  ticket_created_at: string | null;
  ticket_received_at: string | null;
}

interface WorkflowChain {
  requisitor: string;
  cotador: string;
  aprovador: string;
  comprador: string;
  almoxarife: string;
}

function formatSLA(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return 'SLA 0 dias/ 0 horas';
  const totalHours = Math.floor(ms / 1000 / 60 / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `SLA ${days} dia${days !== 1 ? 's' : ''}/ ${hours} hora${hours !== 1 ? 's' : ''}`;
}

const LEVEL_CONFIG: Record<LogLevel, { icon: React.ReactNode; badge: string; row: string }> = {
  info:    { icon: <Info className="w-4 h-4 text-blue-500" />,    badge: 'bg-blue-50 text-blue-700 border-blue-200',    row: 'hover:bg-blue-50/50' },
  success: { icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', row: 'hover:bg-emerald-50/50' },
  warning: { icon: <AlertCircle className="w-4 h-4 text-amber-500" />, badge: 'bg-amber-50 text-amber-700 border-amber-200', row: 'hover:bg-amber-50/50' },
  error:   { icon: <XCircle className="w-4 h-4 text-red-500" />,   badge: 'bg-red-50 text-red-700 border-red-200',       row: 'hover:bg-red-50/50' },
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  info: 'Info', success: 'Sucesso', warning: 'Aviso', error: 'Erro'
};

// Valor real no banco (req_audit_logs.module) → label exibido na UI
const MODULES: { value: string; label: string }[] = [
  { value: 'M1_PRODUTOS',    label: 'M1 — Produtos' },
  { value: 'M2_VIAGENS',     label: 'M2 — Viagens' },
  { value: 'M3_SERVICOS',    label: 'M3 — Serviços' },
  { value: 'M4_MANUTENCAO',  label: 'M4 — Manutenção' },
  { value: 'M5_FRETE',       label: 'M5 — Frete' },
  { value: 'M6_LOCACAO',     label: 'M6 — Locação' },
  { value: 'quotation',      label: 'V2 — Cotação' },
  { value: 'approval',       label: 'V3 — Aprovação' },
  { value: 'purchasing',     label: 'V4 — Compras' },
  { value: 'receiving',      label: 'V5 — Recebimento' },
];
const MODULE_LABEL = Object.fromEntries(MODULES.map(m => [m.value, m.label])) as Record<string, string>;

// Modules that end at V4 (no receiving step)
const NO_RECEIVING_MODULES = new Set(['M2_VIAGENS', 'M3_SERVICOS', 'M6_LOCACAO']);

function fmtDT(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [ticketLogs, setTicketLogs] = useState<Record<string, LogEntry[]>>({});

  const toggleExpand = async (log: LogEntry) => {
    if (!log.ticket_id) return;
    const key = log.ticket_id;
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    if (ticketLogs[key]) return; // already loaded
    const { data } = await supabase
      .from('req_audit_logs')
      .select('id, created_at, level, module, action, details, metadata, req_profiles:user_id(full_name, email)')
      .eq('ticket_id', key)
      .order('created_at', { ascending: true });
    if (data) {
      setTicketLogs(prev => ({
        ...prev,
        [key]: data.map((r: any) => ({
          id: r.id, timestamp: r.created_at, level: r.level || 'info',
          module: r.module, action: r.action, details: r.details || '',
          user: r.req_profiles?.full_name ?? r.req_profiles?.email ?? 'Sistema',
          metadata: r.metadata || {}, ticket_id: key, ticket_number: null,
          ticket_created_at: null, ticket_received_at: null,
        }))
      }));
    }
  };

  useEffect(() => {
    async function loadLogs() {
      try {
        const { data, error } = await supabase
          .from('req_audit_logs')
          .select(`
            id,
            created_at,
            level,
            module,
            action,
            details,
            metadata,
            ticket_id,
            req_profiles:user_id ( full_name, email ),
            req_tickets:ticket_id ( ticket_number, created_at, received_at )
          `)
          .order('created_at', { ascending: false })
          .limit(500);

        if (error) {
          console.error('[Logs] Supabase error:', error);
          return;
        }

        const mapped: LogEntry[] = (data || []).map((row: any, idx: number) => ({
          id: row.id ?? idx,
          timestamp: row.created_at,
          level: (['info','success','warning','error'].includes(row.level) ? row.level : 'info') as LogLevel,
          module: row.module ?? 'sistema',
          action: row.action ?? '',
          user: row.req_profiles?.full_name ?? row.req_profiles?.email ?? 'Sistema',
          details: row.details ?? '',
          metadata: row.metadata ?? {},
          ticket_id: row.ticket_id ?? null,
          ticket_number: row.req_tickets?.ticket_number ?? null,
          ticket_created_at: row.req_tickets?.created_at ?? null,
          ticket_received_at: row.req_tickets?.received_at ?? null,
        }));

        setLogs(mapped);
      } catch (err) {
        console.error('[Logs] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  // Workflow chains por ticket — built from the already-loaded log entries, zero extra queries
  const ticketChains = useMemo(() => {
    const chains: Record<string, WorkflowChain> = {};
    for (const log of logs) {
      if (!log.ticket_id) continue;
      if (!chains[log.ticket_id]) {
        chains[log.ticket_id] = { requisitor: 'N/A', cotador: 'N/A', aprovador: 'N/A', comprador: 'N/A', almoxarife: 'N/A' };
      }
      const c = chains[log.ticket_id];
      const act = log.action.toLowerCase();
      const mod = log.module;
      if (act.includes('criada') || act.includes('criado') || act.includes('criação')) {
        c.requisitor = log.user;
      } else if (mod === 'V2_COTACAO' || mod === 'quotation' || act.includes('cotação')) {
        c.cotador = log.user;
      } else if (mod === 'V3_APROVACAO' || mod === 'approval' || act.includes('aprovação') || act.includes('aprovad')) {
        c.aprovador = log.user;
      } else if (mod === 'V4_COMPRAS' || mod === 'purchasing' || act.includes('ordem de compra') || act.includes('compra')) {
        c.comprador = log.user;
      } else if (mod === 'receiving' || mod === 'V5_RECEBIMENTO' || act.includes('recebimento') || act.includes('atesto')) {
        c.almoxarife = log.user;
      }
    }
    return chains;
  }, [logs]);

  const filtered = useMemo(() => logs.filter(log => {
    const haystack = [log.action, log.details, log.user, log.module, log.ticket_number ?? '']
      .map(s => s.toLowerCase());
    const matchSearch = !search || haystack.some(s => s.includes(search.toLowerCase()));
    const matchLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchSearch && matchLevel && matchModule;
  }), [logs, search, levelFilter, moduleFilter]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vp-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = {
    total: logs.length,
    success: logs.filter((l: LogEntry) => l.level === 'success').length,
    warning: logs.filter((l: LogEntry) => l.level === 'warning').length,
    error: logs.filter((l: LogEntry) => l.level === 'error').length,
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl space-y-8 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sistema</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Auditoria & Monitoramento</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Logs de <span className="text-brand">Atividades</span>
          </h1>
          <p className="text-slate-500 text-sm">Acompanhe todas as ações e eventos do sistema.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Exportar JSON
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Eventos', value: counts.total, icon: <Activity className="w-5 h-5 text-brand" />, color: 'bg-brand/10' },
          { label: 'Sucessos', value: counts.success, icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, color: 'bg-emerald-50' },
          { label: 'Avisos', value: counts.warning, icon: <AlertCircle className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50' },
          { label: 'Erros', value: counts.error, icon: <XCircle className="w-5 h-5 text-red-500" />, color: 'bg-red-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${kpi.color}`}>{kpi.icon}</div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por ação, detalhe, usuário ou módulo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={levelFilter}
                  onChange={e => setLevelFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Todos os níveis</option>
                  <option value="info">Info</option>
                  <option value="success">Sucesso</option>
                  <option value="warning">Aviso</option>
                  <option value="error">Erro</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <select
                  value={moduleFilter}
                  onChange={e => setModuleFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Todos os módulos</option>
                  {MODULES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE LOGS */}
      <Card>
        <CardHeader className="border-b border-slate-200 py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-brand" />
            {loading ? 'Carregando...' : `${filtered.length} evento${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-3"></div>
              <p className="text-slate-400 font-medium">Carregando logs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Nenhum evento registrado ainda.</p>
              <p className="text-slate-300 text-sm mt-1">As atividades do sistema aparecerão aqui conforme forem ocorrendo.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(log => {
                const cfg = LEVEL_CONFIG[log.level];
                const sla = formatSLA(log.ticket_created_at, log.ticket_received_at);
                const chain = log.ticket_id ? ticketChains[log.ticket_id] : null;
                const chainStr = chain
                  ? `Requisitor: ${chain.requisitor} | Cotador: ${chain.cotador} | Aprovador: ${chain.aprovador} | Comprador: ${chain.comprador} | Almoxarife: ${chain.almoxarife}`
                  : null;
                const isExpanded = log.ticket_id ? expanded.has(log.ticket_id) : false;
                const timeline = log.ticket_id ? (ticketLogs[log.ticket_id] || []) : [];
                const ticketModule = log.module;
                const hasReceiving = !NO_RECEIVING_MODULES.has(ticketModule);

                return (
                  <div key={log.id} className="border-b border-slate-100 last:border-0">
                    {/* Row principal */}
                    <div
                      className={`flex items-start gap-4 p-5 transition-colors cursor-pointer ${cfg.row} ${log.ticket_id ? 'select-none' : ''}`}
                      onClick={() => toggleExpand(log)}
                    >
                      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                            {LEVEL_LABELS[log.level]}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{MODULE_LABEL[log.module] ?? log.module}</span>
                          {log.ticket_number && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-bold text-brand bg-brand/5 border border-brand/20 px-2 py-0.5 rounded font-mono">
                                {log.ticket_number}
                              </span>
                            </>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                          {sla && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              {sla}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mb-0.5">{log.action}</p>
                        <p className="text-sm text-slate-500 mb-2">{log.details}</p>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {log.user}
                          </span>
                          {chainStr && (
                            <span className="text-[10px] text-slate-500 font-medium">{chainStr}</span>
                          )}
                        </div>
                      </div>
                      {log.ticket_id && (
                        <div className="flex-shrink-0 mt-1 text-slate-400">
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                    </div>

                    {/* Timeline expandida */}
                    {isExpanded && log.ticket_id && (
                      <div className="ml-12 mr-5 mb-5 bg-slate-50 border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <GitBranch className="w-4 h-4 text-brand" />
                          <span className="text-[10px] font-black text-brand uppercase tracking-widest">Timeline do Ticket</span>
                          {!hasReceiving && (
                            <span className="ml-2 text-[9px] bg-sky-50 border border-sky-200 text-sky-700 px-2 py-0.5 rounded font-bold uppercase">
                              Encerra em V4
                            </span>
                          )}
                        </div>
                        {timeline.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Carregando histórico...</p>
                        ) : (
                          <div className="space-y-3">
                            {timeline
                              .filter(t => hasReceiving || !['receiving','V5_RECEBIMENTO'].includes(t.module))
                              .map((t, i) => (
                                <div key={t.id} className="flex items-start gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-[9px] font-black text-brand">
                                      {i + 1}
                                    </div>
                                    {i < timeline.length - 1 && <div className="w-px h-4 bg-slate-200 mt-1" />}
                                  </div>
                                  <div className="flex-1 pb-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                      <span className="text-[10px] text-slate-500 font-medium">{fmtDT(t.timestamp)}</span>
                                      <span className="text-slate-300">|</span>
                                      <span className="text-[10px] font-bold text-slate-700">{t.user}</span>
                                      <span className="text-slate-300">|</span>
                                      <span className="text-[10px] font-bold text-brand">{t.action}</span>
                                    </div>
                                    {t.details && (
                                      <p className="text-[11px] text-slate-500">{t.details}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
