'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Layers, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPeriod = searchParams.get('period') || '30d';
  const currentModule = searchParams.get('module') || 'ALL';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-300 pr-3">
          <Calendar className="w-3.5 h-3.5 text-brand" /> Período
        </label>
        <select
          value={currentPeriod}
          onChange={(e) => updateFilters('period', e.target.value)}
          className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:text-slate-900 transition-colors"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
      </div>

      <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-300 pr-3">
          <Layers className="w-3.5 h-3.5 text-brand" /> Módulo
        </label>
        <select
          value={currentModule}
          onChange={(e) => updateFilters('module', e.target.value)}
          className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:text-slate-900 transition-colors"
        >
          <option value="ALL">Todos os Módulos</option>
          <option value="M1">M1 — Produtos</option>
          <option value="M2">M2 — Viagens</option>
          <option value="M3">M3 — Serviços</option>
          <option value="M4">M4 — Manutenção</option>
          <option value="M5">M5 — Frete</option>
          <option value="M6">M6 — Locação</option>
        </select>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Atualizar
        </Button>
        <Button variant="primary" size="sm">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
        </Button>
      </div>
    </div>
  );
};
