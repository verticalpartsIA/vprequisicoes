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
    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-900/50 backdrop-blur-md border border-surface-border/50 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-surface-border/30">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-800 pr-4">
          <Calendar className="w-3.5 h-3.5 text-brand" /> Período
        </label>
        <select 
          value={currentPeriod}
          onChange={(e) => updateFilters('period', e.target.value)}
          className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer hover:text-white transition-colors"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
      </div>

      <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-surface-border/30">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-800 pr-4">
          <Layers className="w-3.5 h-3.5 text-brand" /> Módulo
        </label>
        <select 
          value={currentModule}
          onChange={(e) => updateFilters('module', e.target.value)}
          className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer hover:text-white transition-colors"
        >
          <option value="ALL">Todos os Módulos</option>
          <option value="M1">M1 - Produtos</option>
          <option value="M2">M2 - Viagens</option>
          <option value="M3">M3 - Serviços</option>
          <option value="M4">M4 - Manutenção</option>
        </select>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 px-4 border-slate-800 bg-slate-900/50 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Atualizar
        </Button>
        <Button 
          variant="primary" 
          size="sm"
          className="h-9 px-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/10"
        >
          <Download className="w-3.5 h-3.5 mr-2" /> Exportar CSV
        </Button>
      </div>
    </div>
  );
};
