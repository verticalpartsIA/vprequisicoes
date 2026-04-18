'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Filter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { mockApiClient } from '@/lib/api/client.mock';
import { TierBadge } from '@/components/ui/TierBadge';
import { canApprove, getApprovalTier } from '@core/validation/approvalTiers';

export default function ApprovalListPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('manager_level_1');

  useEffect(() => {
    const role = process.env.NEXT_PUBLIC_DEFAULT_USER_ROLE || 'manager_level_1';
    setUserRole(role);

    const fetchTickets = async () => {
      try {
        const res: any = await mockApiClient.get('/api/approval/tickets', { role });
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Painel de Aprovação</h1>
          <p className="text-slate-400">Analise requisições que aguardam seu deferimento dentro da sua alçada.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 border border-slate-700 bg-slate-900/50 rounded-lg text-xs font-bold text-slate-400">
            Sua Alçada: <span className="text-brand ml-1 uppercase">{userRole}</span>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar Valor
          </Button>
        </div>
      </div>

      <Card className="border-surface-border/60 bg-surface-card/30 backdrop-blur-sm shadow-2xl">
        <CardHeader className="border-b border-surface-border/20 mb-6">
          <CardTitle className="text-lg flex items-center">
            <ShieldCheck className="w-5 h-5 mr-3 text-brand" />
            Tickets Pendentes
          </CardTitle>
          <CardDescription>Requisições em estágio PENDING_APPROVAL.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-border/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="pb-4 pl-4">Ticket</th>
                  <th className="pb-4">Solicitante</th>
                  <th className="pb-4">Valor Total</th>
                  <th className="pb-4">Alçada</th>
                  <th className="pb-4 text-center">Permissão</th>
                  <th className="pb-4 text-right pr-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/30">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-8 bg-slate-800/10 rounded-lg"></td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <ShieldCheck className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Nenhuma aprovação pendente</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const amount = Number(ticket.quotation?.total_amount || 0);
                    const tier = getApprovalTier(amount);
                    const allowed = canApprove(userRole, amount);

                    return (
                      <tr key={ticket.id} className="group hover:bg-brand/10 transition-all duration-300">
                        <td className="py-5 pl-4">
                          <span className="font-mono font-black text-slate-400">#{ticket.type}-{ticket.id.toString().padStart(4, '0')}</span>
                        </td>
                        <td className="py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200">{ticket.username}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">{ticket.details?.departamento || 'Geral'}</span>
                          </div>
                        </td>
                        <td className="py-5">
                          <span className="text-sm font-mono font-bold text-brand-success bg-brand-success/5 px-2 py-1 rounded">
                            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>
                        <td className="py-5">
                          <TierBadge tier={tier} />
                        </td>
                        <td className="py-5 text-center">
                          {allowed ? (
                            <span className="text-[10px] font-black text-emerald-500 uppercase px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 shadow-sm">Autorizado</span>
                          ) : (
                            <span className="text-[10px] font-black text-rose-500 uppercase px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/20 shadow-sm">Nível Superior</span>
                          )}
                        </td>
                        <td className="py-5 text-right pr-4">
                          <Link href={`/approval/${ticket.id}`}>
                            <Button size="sm" variant={allowed ? "primary" : "outline"} className="h-9 px-4 font-bold border-brand/50 hover:border-brand">
                              {allowed ? 'Analisar' : 'Ver Detalhes'}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}