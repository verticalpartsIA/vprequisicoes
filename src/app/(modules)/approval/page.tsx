'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Filter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { mockApiClient } from '@/lib/api/client.mock';
import { TierBadge } from '@/components/ui/TierBadge';
import { canApprove, getApprovalTier } from '@core/validation/approvalTiers';
import { normalizeTicket } from '@/lib/utils/normalize-ticket';

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
        const list = Array.isArray(res.data) ? res.data : [];
        setTickets(list.map(normalizeTicket));
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Painel de Aprovação</h1>
          <p className="text-slate-500 text-sm">Analise requisições que aguardam seu deferimento dentro da sua alçada.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600">
            Sua Alçada: <span className="text-brand ml-1 uppercase">{userRole}</span>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar Valor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-200 mb-4">
          <CardTitle className="flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-brand" />
            Tickets Pendentes
          </CardTitle>
          <CardDescription>Requisições em estágio PENDING_APPROVAL.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="pb-4 pl-4">Ticket</th>
                  <th className="pb-4">Solicitante</th>
                  <th className="pb-4">Valor Total</th>
                  <th className="pb-4">Alçada</th>
                  <th className="pb-4 text-center">Permissão</th>
                  <th className="pb-4 text-right pr-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-8">
                        <div className="h-8 bg-slate-100 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-50">
                        <ShieldCheck className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Nenhuma aprovação pendente</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const amount = Number(ticket.quotation?.total_amount || 0);
                    const tier = getApprovalTier(amount);
                    const allowed = canApprove(userRole, amount);

                    return (
                      <tr key={ticket.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-4">
                          <span className="font-mono font-bold text-slate-500 text-sm">#{ticket._ticketNumber}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{ticket._requester}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-tight">{ticket._departamento}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>
                        <td className="py-4">
                          <TierBadge tier={tier} />
                        </td>
                        <td className="py-4 text-center">
                          {allowed ? (
                            <span className="text-[10px] font-bold text-emerald-700 uppercase px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">Autorizado</span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-600 uppercase px-2 py-0.5 bg-red-50 rounded border border-red-200">Nível Superior</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-4">
                          <Link href={`/approval/${ticket.id}`}>
                            <Button size="sm" variant={allowed ? "primary" : "outline"}>
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
