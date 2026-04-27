'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  Hash,
} from 'lucide-react';

type LogLevel = 'info' | 'success' | 'warning' | 'error';

interface LogEntry {
  id: string;
  ticket_id: string | null;
  ticket_number: string | null;
  ticket_title: string | null;
  action: string;
  details: string;
  level: LogLevel;
  module: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const LEVEL_CONFIG: Record<LogLevel, { icon: React.ReactNode; badge: string; row: string }> = {
  info:    { icon: <Info        className="w-4 h-4 text-blue-500" />,    badge: 'bg-blue-50 text-blue-700 border-blue-200',          row: 'hover:bg-blue-50/50' },
  success: { icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', row: 'hover:bg-emerald-50/50' },
  warning: { icon: <AlertCircle className="w-4 h-4 text-amber-500" />,   badge: 'bg-amber-50 text-amber-700 border-amber-200',       row: 'hover:bg-amber-50/50' },
  error:   { icon: <XCircle     className="w-4 h-4 text-red-500" />,     badge: 'bg-red-50 text-red-700 border-red-200',             row: 'hover:bg-red-50/50' },
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  info: 'Info', success: 'Sucesso', warning: 'Aviso', error: 'Erro',
};

// Módulo: rótulo amigável → valor real no banco (audit_logs.module)
const MODULES: { label: string; value: string }[] = [
  { label: 'M1 — Produtos',     value: 'M1_PRODUTOS' },
  { label: 'M2 — Viagens',      value: 'M2_VIAGENS' },
  { label: 'M3 — Serviços',     value: 'M3_SERVICOS' },
  { label: 'M4 — Manutenção',   value: 'M4_MANUTENCAO' },
  { label: 'M5 — Frete',        value: 'M5_FRETE' },
  { label: 'M6 — Locação',      value: 'M6_LOCACAO' },
  { label: 'V2 — Cotação',      value: 'quotation' },
  { label: 'V3 — Aprovação',    value: 'approval' },
  { label: 'V4 — Compras',      value: 'purchasing' },
  { label: 'V5 — Recebimento',  value: 'receiving' },
];

const MODULE_LABEL_BY_VALUE: Record<string, string> =
  Object.fromEntries(MODULES.map(m => [m.value, m.label]));

export default function LogsPage() {
  const [search, setSearch]             = useState('');
  const [levelFilter, setLevelFilter]   = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [logs, setLogs]                 = useState<LogEntry[]>([]);
  const [total, setTotal]               = useState<number>(0);
  const [carregando, setCarregando]     = useState<boolean>(true);
  const [erro, setErro]                 = useState<string | null>(null);

  // ── Carregar logs do servidor (server-side filter quando possível) ──────────
  useEffect(() => {
    const ctrl = new AbortController();
    const carregar = async () => {
      setCarregando(true);
      setErro(null);
      try {
        const params = new URLSearchParams();
        if (levelFilter  !== 'all') params.set('level',  levelFilter);
        if (moduleFilter !== 'all') params.set('module', moduleFilter);
        params.set('limit', '500');

        const res = await fetch(`/api/logs?${params.toString()}`, { signal: ctrl.signal });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        setLogs(json.logs ?? []);
        setTotal(json.total ?? 0);
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return;
        setErro((e as Error).message ?? 'Falha ao carregar logs.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
    return () => ctrl.abort();
  }, [levelFilter, moduleFilter]);

  // ── Filtro de busca textual no client ───────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const s = search.toLowerCase();
    return logs.filter(l =>
      [l.action, l.details, l.user_email, l.user_name ?? '', l.module, l.ticket_number ?? '']
        .some(v => v.toLowerCase().includes(s))
    );
  }, [logs, search]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `vp-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => ({
    total:   logs.length,
    success: logs.filter(l => l.level === 'success').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error:   logs.filter(l => l.level === 'error').length,
  }), [logs]);

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
          <p className="text-slate-500 text-sm">
            Acompanhe todas as ações e eventos do sistema {total > 0 ? `(${total} eventos no total).` : '.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Exportar JSON
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Eventos', value: counts.total,   icon: <Activity    className="w-5 h-5 text-brand" />,         color: 'bg-brand/10' },
          { label: 'Sucessos',         value: counts.success, icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,   color: 'bg-emerald-50' },
          { label: 'Avisos',           value: counts.warning, icon: <AlertCircle className="w-5 h-5 text-amber-500" />,     color: 'bg-amber-50' },
          { label: 'Erros',            value: counts.error,   icon: <XCircle     className="w-5 h-5 text-red-500" />,       color: 'bg-red-50' },
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
                placeholder="Buscar por ação, detalhe, usuário, módulo ou número do ticket..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
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
                  {MODULES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
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
            {carregando
              ? 'Carregando eventos...'
              : `${filtered.length} evento${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {carregando ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm">Buscando registros de auditoria...</p>
            </div>
          ) : erro ? (
            <div className="py-20 text-center">
              <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-red-500 font-medium">Falha ao carregar logs.</p>
              <p className="text-slate-400 text-sm mt-1">{erro}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Nenhum evento registado para os filtros aplicados.</p>
              <p className="text-slate-300 text-sm mt-1">Tente ajustar os filtros ou crie uma nova requisição para gerar registros.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(log => {
                const cfg = LEVEL_CONFIG[log.level];
                const moduleLabel = MODULE_LABEL_BY_VALUE[log.module] ?? log.module;
                return (
                  <div key={log.id} className={`flex items-start gap-4 p-5 transition-colors ${cfg.row}`}>
                    <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                          {LEVEL_LABELS[log.level]}
                        </span>
                        {moduleLabel && (
                          <span className="text-xs font-semibold text-slate-700">{moduleLabel}</span>
                        )}
                        {log.ticket_number && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand bg-brand/5 border border-brand/20 px-2 py-0.5 rounded">
                              <Hash className="w-3 h-3" />
                              {log.ticket_number}
                            </span>
                          </>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mb-0.5">{log.action}</p>
                      {log.details && <p className="text-sm text-slate-500 mb-2">{log.details}</p>}
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {log.user_name ?? log.user_email ?? '—'}
                        </span>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 truncate max-w-md">
                            {JSON.stringify(log.metadata)}
                          </span>
                        )}
                      </div>
                    </div>
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
