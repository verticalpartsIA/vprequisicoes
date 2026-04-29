'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileText,
  DollarSign,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Weight
} from 'lucide-react';

import { KPICard } from '@/components/dashboard/KPICard';
import { BarChartNative } from '@/components/dashboard/charts/BarChartNative';
import { LineChartNative } from '@/components/dashboard/charts/LineChartNative';
import { DonutChartNative } from '@/components/dashboard/charts/DonutChartNative';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { TopSuppliersTable } from '@/components/dashboard/TopSuppliersTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// IMPORTANTE: Usando realGet para falar direto com Supabase no modo estático
import { realGet } from '@/lib/api/real-client';

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
        // Agora chamamos o Supabase diretamente, sem passar pela rota /api do Next
        const json = await realGet('/api/dashboard/summary', { period, module });
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Total de Requisições" 
          value={data.kpis.total_tickets} 
          icon={<FileText className="w-6 h-6 text-brand" />}
        />
        <KPICard 
          label="Aguardando Aprovação" 
          value={data.kpis.tickets_pending_approval} 
          icon={<Clock className="w-6 h-6 text-amber-500" />}
          inverse
        />
        <KPICard 
          label="Total Gasto (Cotações)"
          value={Number(data.kpis.total_auction_savings || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Histórico de Economia
            </CardTitle>
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
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando métricas...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
