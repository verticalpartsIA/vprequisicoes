'use client';

import React, { useState, useMemo } from 'react';
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
  Filter
} from 'lucide-react';

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
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: 1,
    timestamp: '2026-04-18T14:32:15',
    level: 'info',
    module: 'M5 — Frete',
    action: 'Cotação criada',
    user: 'João Silva',
    details: 'Cotação #COT-2026-045 criada para transporte SP-RJ',
    metadata: { ticketId: 'COT-2026-045', value: 3500 }
  },
  {
    id: 2,
    timestamp: '2026-04-18T14:28:42',
    level: 'success',
    module: 'M1 — Produtos',
    action: 'Requisição aprovada',
    user: 'Maria Santos',
    details: 'Requisição #REQ-2026-123 aprovada pela alçada 2',
    metadata: { ticketId: 'REQ-2026-123', approver: 'Carlos Mendes' }
  },
  {
    id: 3,
    timestamp: '2026-04-18T14:15:30',
    level: 'warning',
    module: 'M6 — Locação',
    action: 'Prazo de cotação excedido',
    user: 'Sistema',
    details: 'Cotação de locação #LOC-2026-012 ultrapassou 4 horas sem resposta',
    metadata: { ticketId: 'LOC-2026-012', elapsedHours: 5 }
  },
  {
    id: 4,
    timestamp: '2026-04-18T13:45:18',
    level: 'error',
    module: 'M3 — Serviços',
    action: 'Falha na integração',
    user: 'Sistema',
    details: 'Erro ao conectar com API do fornecedor ABC',
    metadata: { error: 'Timeout', provider: 'ABC Services' }
  },
  {
    id: 5,
    timestamp: '2026-04-18T13:30:05',
    level: 'info',
    module: 'V2 — Cotação',
    action: 'Leilão iniciado',
    user: 'Pedro Oliveira',
    details: 'Leilão #LEI-2026-008 iniciado com 5 fornecedores',
    metadata: { ticketId: 'LEI-2026-008', suppliers: 5 }
  },
  {
    id: 6,
    timestamp: '2026-04-18T12:15:22',
    level: 'success',
    module: 'M4 — Manutenção',
    action: 'OS finalizada',
    user: 'Ana Paula',
    details: 'Ordem de serviço #OS-2026-089 concluída e atestada',
    metadata: { ticketId: 'OS-2026-089', cost: 1250 }
  },
  {
    id: 7,
    timestamp: '2026-04-18T11:42:10',
    level: 'info',
    module: 'M2 — Viagens',
    action: 'Passagens emitidas',
    user: 'Lucas Ferreira',
    details: 'Passagens emitidas para viagem #VIA-2026-034',
    metadata: { ticketId: 'VIA-2026-034', passengers: 3 }
  },
  {
    id: 8,
    timestamp: '2026-04-18T10:20:33',
    level: 'warning',
    module: 'V4 — Compras',
    action: 'Orçamento estourado',
    user: 'Sistema',
    details: 'Compra #COM-2026-056 excedeu orçamento aprovado em 15%',
    metadata: { ticketId: 'COM-2026-056', overage: 15 }
  },
  {
    id: 9,
    timestamp: '2026-04-18T09:55:00',
    level: 'success',
    module: 'V5 — Recebimento',
    action: 'Mercadoria recebida',
    user: 'Carlos Mendes',
    details: 'OC-000312 recebida e conferida no almoxarifado',
    metadata: { oc: 'OC-000312', items: 8 }
  },
  {
    id: 10,
    timestamp: '2026-04-18T09:10:47',
    level: 'error',
    module: 'V3 — Aprovação',
    action: 'Alçada insuficiente',
    user: 'João Silva',
    details: 'Tentativa de aprovação sem alçada suficiente para valor R$ 85.000',
    metadata: { value: 85000, required_tier: 3 }
  },
];

const LEVEL_CONFIG: Record<LogLevel, { icon: React.ReactNode; badge: string; row: string }> = {
  info:    { icon: <Info className="w-4 h-4 text-blue-500" />,    badge: 'bg-blue-50 text-blue-700 border-blue-200',    row: 'hover:bg-blue-50/50' },
  success: { icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', row: 'hover:bg-emerald-50/50' },
  warning: { icon: <AlertCircle className="w-4 h-4 text-amber-500" />, badge: 'bg-amber-50 text-amber-700 border-amber-200', row: 'hover:bg-amber-50/50' },
  error:   { icon: <XCircle className="w-4 h-4 text-red-500" />,   badge: 'bg-red-50 text-red-700 border-red-200',       row: 'hover:bg-red-50/50' },
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  info: 'Info', success: 'Sucesso', warning: 'Aviso', error: 'Erro'
};

const MODULES = ['M1 — Produtos', 'M2 — Viagens', 'M3 — Serviços', 'M4 — Manutenção', 'M5 — Frete', 'M6 — Locação', 'V2 — Cotação', 'V3 — Aprovação', 'V4 — Compras', 'V5 — Recebimento'];

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filtered = useMemo(() => MOCK_LOGS.filter(log => {
    const matchSearch = !search || [log.action, log.details, log.user, log.module]
      .some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchSearch && matchLevel && matchModule;
  }), [search, levelFilter, moduleFilter]);

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
    total: MOCK_LOGS.length,
    success: MOCK_LOGS.filter(l => l.level === 'success').length,
    warning: MOCK_LOGS.filter(l => l.level === 'warning').length,
    error: MOCK_LOGS.filter(l => l.level === 'error').length,
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
                  {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
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
            {filtered.length} evento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Nenhum log corresponde aos filtros.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(log => {
                const cfg = LEVEL_CONFIG[log.level];
                return (
                  <div key={log.id} className={`flex items-start gap-4 p-5 transition-colors ${cfg.row}`}>
                    <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                          {LEVEL_LABELS[log.level]}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{log.module}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mb-0.5">{log.action}</p>
                      <p className="text-sm text-slate-500 mb-2">{log.details}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {log.user}
                        </span>
                        {Object.keys(log.metadata).length > 0 && (
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">
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
