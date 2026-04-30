'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { realGet as realApiClient } from '@/lib/api/real-client';
import { normalizeTicket } from '@/lib/utils/normalize-ticket';

export default function PurchasingListPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res: any = await realApiClient('/api/purchasing/tickets', { status: 'APPROVED' });
        const list = Array.isArray(res.data) ? res.data : (res ?? []);
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
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Console de Compras</h1>
          <p className="text-slate-500 text-sm">
            Transforme requisições aprovadas em Pedidos de Compra (OC).{' '}
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand">Portal do Comprador Senior</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar Urgência
          </Button>
          <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-lg text-xs font-bold text-brand uppercase tracking-widest">
            {tickets.length} Pedidos Aguardando
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-200 mb-4">
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-brand" />
            Fila de Execução de Compra
          </CardTitle>
          <CardDescription>Tickets com status APPROVED prontos para emissão de OC.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="pb-4 pl-4 text-center w-20">Urg.</th>
                  <th className="pb-4">Ticket</th>
                  <th className="pb-4">Módulo</th>
                  <th className="pb-4">Valor Aprovado</th>
                  <th className="pb-4">Recomendação</th>
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
                      <div className="flex flex-col items-center opacity-40">
                        <ShoppingCart className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Nenhum pedido para processar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const amount = Number(ticket._totalAmount || ticket._quotation?.total_amount || 0);
                    const isUrgent = amount > 1000 || ticket._moduleShort === 'M3';

                    return (
                      <tr key={ticket.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-5 pl-4 text-center">
                          {isUrgent ? (
                            <div className="inline-flex p-1.5 bg-red-50 rounded-lg text-red-500 border border-red-200">
                              <Clock className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="inline-flex p-1.5 bg-slate-100 rounded-lg text-slate-400">
                              <Clock className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="py-5">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-slate-600 text-sm">#{ticket._ticketNumber}</span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Aprovado por Direção</span>
                          </div>
                        </td>
                        <td className="py-5">
                          <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600 uppercase">{ticket._moduleShort} — {ticket.module_name || 'Produtos'}</span>
                        </td>
                        <td className="py-5">
                          <span className="text-sm font-mono font-bold text-slate-900">
                            {amount > 0
                              ? amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : <span className="text-slate-400 text-xs">Sem cotação</span>}
                          </span>
                        </td>
                        <td className="py-5">
                          {(() => {
                            const winner = ticket._quotation?.items?.[0]?.suppliers?.find((s: any) => s.is_winner);
                            return winner?.name ? (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Vencedor</span>
                                <span className="text-xs font-bold text-emerald-700 truncate max-w-[140px]">{winner.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-emerald-700 text-[10px] font-bold uppercase bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                Cotação Finalizada
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-5 text-right pr-4">
                          <Link href={`/purchasing/${ticket.id}`}>
                            <Button size="sm" variant="primary">
                              Iniciar Compra
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

      {/* KPI cards — dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total de Compras Realizadas</h4>
          <p className="text-2xl font-bold text-slate-900">
            {tickets.filter(t => ['RECEIVING','RELEASED','IN_USE'].includes(t.status)).length > 0
              ? `${tickets.filter(t => ['RECEIVING','RELEASED','IN_USE'].includes(t.status)).length} OCs`
              : <span className="text-slate-400 text-base">Nenhuma ainda</span>}
          </p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valor Total em Aprovação</h4>
          <p className="text-2xl font-bold text-emerald-600">
            {tickets.length > 0
              ? tickets.reduce((s, t) => s + Number(t._totalAmount || 0), 0)
                  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : <span className="text-slate-400 text-base">R$ 0,00</span>}
          </p>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aguardando Compra</h4>
          <p className="text-2xl font-bold text-brand">
            {tickets.length} {tickets.length === 1 ? 'Pedido' : 'Pedidos'}
          </p>
        </div>
      </div>

    </div>
  );
}
