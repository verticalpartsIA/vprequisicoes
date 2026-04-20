'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Search, Filter, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { mockApiClient } from '@/lib/api/client.mock';

// Normaliza ticket independente de vir do mock ou do Supabase real
function normalizeTicket(t: any) {
  const module = t.module ?? t.type ?? '';
  const moduleShort = module.includes('_') ? module.split('_')[0] : module;
  const ticketNumber = t.ticket_number ?? `${moduleShort}-${String(t.id).padStart(4, '0')}`;
  const requester = t.requester_name ?? t.requester_email ?? t.username ?? '—';
  const submittedAt = t.submitted_at ?? t.submittedAt ?? t.created_at;
  return { ...t, _moduleShort: moduleShort, _ticketNumber: ticketNumber, _requester: requester, _submittedAt: submittedAt };
}

export default function QuotationListPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res: any = await mockApiClient.get('/api/requests');
        const list = Array.isArray(res.data) ? res.data : [];
        const pending = list.filter((t: any) =>
          t.status === 'SUBMITTED' || t.status === 'QUOTING' ||
          t.status === 'submitted' || t.status === 'quoting'
        );
        setTickets(pending.map(normalizeTicket));
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Buyer Console</h1>
          <p className="text-slate-500 text-sm">Gerencie e realize cotações para as requisições pendentes.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ticket ou produto..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none w-64 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-200 mb-4">
          <CardTitle className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-brand" />
            Tickets Aguardando Cotação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="pb-4 pl-4">Ticket</th>
                  <th className="pb-4">Módulo</th>
                  <th className="pb-4">Solicitante</th>
                  <th className="pb-4">Data Envio</th>
                  <th className="pb-4 text-center">Urgência</th>
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
                        <ShoppingBag className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-400 font-medium">Nenhuma requisição pendente de cotação.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 pl-4">
                        <span className="font-mono font-bold text-brand text-sm">#{ticket._ticketNumber}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs px-2 py-1 bg-slate-100 rounded font-bold text-slate-600 border border-slate-200">
                          {ticket._moduleShort}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{ticket._requester}</span>
                          <span className="text-xs text-slate-400">{ticket.department_name ?? ticket.departamento ?? 'Almoxarifado'}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-slate-500">
                          {ticket._submittedAt ? new Date(ticket._submittedAt).toLocaleDateString('pt-BR') : '—'}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <Clock className="w-4 h-4 text-amber-500 mx-auto" />
                      </td>
                      <td className="py-4 text-right pr-4">
                        <Link href={`/quotation/${ticket.id}`}>
                          <Button size="sm" variant="outline">
                            Cotar Agora
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
