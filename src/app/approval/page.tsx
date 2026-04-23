'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Filter, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
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
        const { data, error } = await supabase
          .from('req_tickets_view')
          .select('*')
          .in('status', ['APPROVAL_L1', 'APPROVAL_L2', 'APPROVAL_L3', 'PENDING_APPROVAL']);

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        console.error('[ApprovalList]', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Painel de Aprovação</h1>
          <p className="text-slate-500 font-medium">Analise requisições que aguardam seu deferimento.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 border border-white/10 bg-slate-900 rounded-lg text-[10px] font-black text-brand uppercase tracking-widest">
            Sua Alçada: <span className="ml-1 text-white">{userRole}</span>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-white/5 shadow-2xl overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/5">
          <CardTitle className="flex items-center text-white">
            <ShieldCheck className="w-5 h-5 mr-3 text-brand" />
            Tickets Aguardando Decisão
          </CardTitle>
          <CardDescription className="text-slate-500">Filtrando tickets em estágio de aprovação.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="p-5">Ticket</th>
                  <th className="p-5">Solicitante</th>
                  <th className="p-5 text-right">Valor Total</th>
                  <th className="p-5 text-center">Nível Atual</th>
                  <th className="p-5 text-center">Status</th>
                  <th className="p-5 text-right pr-10">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-10">
                        <div className="h-6 bg-white/5 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <ShieldCheck className="w-16 h-16 text-slate-500 mb-4" />
                        <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-[10px]">Nenhum ticket para aprovar no momento</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const amount = Number(ticket.metadata?.quotation?.total_amount || 0);
                    const tier = getApprovalTier(amount);
                    const allowed = canApprove(userRole, amount);
                    const level = ticket.metadata?.current_approval_level || 1;

                    return (
                      <tr key={ticket.id} className="group hover:bg-white/5 transition-all duration-300">
                        <td className="p-5">
                          <span className="font-black text-white tracking-tighter">#{ticket.ticket_number || ticket.id.slice(0,8)}</span>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200">{ticket.requester_name || '—'}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{ticket.module}</span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <span className="text-sm font-black text-brand bg-brand/10 px-3 py-1 rounded-lg border border-brand/20">
                            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                           <span className="px-2 py-1 bg-white/5 text-white text-[10px] font-black rounded-md border border-white/10 uppercase">
                             L{level}
                           </span>
                        </td>
                        <td className="p-5 text-center">
                           <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-md border border-amber-500/20 uppercase">
                             Pendente
                           </span>
                        </td>
                        <td className="p-5 text-right pr-10">
                          <Link href={`/approval/${ticket.id}`}>
                            <Button 
                              size="sm" 
                              className={allowed ? "bg-brand text-slate-950 font-black" : "bg-white/5 text-white/40 border-white/10"}
                            >
                              {allowed ? 'ANALISAR AGORA' : 'VER DETALHES'}
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
