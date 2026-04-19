'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  DollarSign,
  Loader2,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  Weight
} from 'lucide-react';

// Dashboard usa API real — sem mock em produção
import { KPICard } from '@/components/dashboard/KPICard';
import { BarChartNative } from '@/components/dashboard/charts/BarChartNative';
import { LineChartNative } from '@/components/dashboard/charts/LineChartNative';
import { DonutChartNative } from '@/components/dashboard/charts/DonutChartNative';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { TopSuppliersTable } from '@/components/dashboard/TopSuppliersTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const period = searchParams.get('period') || '30d';
    const module = searchParams.get('module') || 'ALL';

    const loadData = async () => {
      setIsLoading(true);
      try {
        const qs = new URLSearchParams({ period, module }).toString();
        const res = await fetch(`/api/dashboard?${qs}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('[dashboard]', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [searchParams]);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Consolidando métricas globais...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics & Business Intelligence</h1>
          <p className="text-slate-500 font-medium">Visão executiva do ecossistema de suprimentos VerticalParts.</p>
        </div>
        <DashboardFilters />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Total de Requisições" 
          value={data.kpis.total_tickets} 
          delta={data.kpis.delta_tickets}
          icon={<FileText className="w-6 h-6 text-brand" />}
        />
        <KPICard 
          label="Aguardando Aprovação" 
          value={data.kpis.tickets_pending_approval} 
          icon={<Clock className="w-6 h-6 text-amber-500" />}
          inverse
        />
        <KPICard 
          label="Economia em Leilão" 
          value={data.kpis.total_auction_savings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          delta={14.2}
          icon={<DollarSign className="w-6 h-6 text-brand-success" />}
        />
        <KPICard 
          label="SLA Médio de Aprovação" 
          value={data.kpis.avg_sla_hours} 
          suffix="horas"
          icon={<TrendingUp className="w-6 h-6 text-brand" />}
          inverse
        />
      </div>

      {/* M5 Specific KPIs */}
      {searchParams.get('module') === 'M5' && data.kpis.m5_stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
          <KPICard 
            label="Inbound (Entrada)" 
            value={data.kpis.m5_stats.inbound_volume} 
            icon={<ArrowDownLeft className="w-6 h-6 text-brand" />}
          />
          <KPICard 
            label="Outbound (Saída)" 
            value={data.kpis.m5_stats.outbound_volume} 
            icon={<ArrowUpRight className="w-6 h-6 text-brand" />}
          />
          <KPICard 
            label="Peso Total Transportado" 
            value={data.kpis.m5_stats.total_weight_kg.toLocaleString('pt-BR')} 
            suffix="kg"
            icon={<Weight className="w-6 h-6 text-brand" />}
          />
        </div>
      )}

      {/* Charts Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Histórico de Economia (Digital Auction)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-0">
             <div className="h-[250px] w-full mt-2">
                <LineChartNative data={data.savings_timeline} color="#10b981" />
             </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0 pb-8">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-brand" /> Mix por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 flex justify-center">
             <DonutChartNative data={data.module_distribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-6">
            <CardHeader className="px-0 pt-0 pb-6">
               <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-brand" /> Distribuição por Status
               </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
               <BarChartNative data={data.status_distribution} color="#3b82f6" />
            </CardContent>
         </Card>

         <Card className="p-6">
            <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
               <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand" /> Top Fornecedores
               </CardTitle>
               <button className="text-xs font-semibold text-brand hover:underline">Ver Todos</button>
            </CardHeader>
            <CardContent className="px-0">
               <TopSuppliersTable suppliers={data.top_suppliers} />
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-400">Carregando dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
