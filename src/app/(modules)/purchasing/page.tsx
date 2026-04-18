'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter, ArrowRight, Gavel, Flashlight, Clock } from 'lucide-react';
import Link from 'next/link';
import { mockApiClient } from '@/lib/api/client.mock';

export default function PurchasingListPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res: any = await mockApiClient.get('/api/purchasing/tickets', { status: 'APPROVED' });
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
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Console de Compras</h1>
          <p className="text-slate-400">Transforme requisições aprovadas em Pedidos de Compra (OC).</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900/50">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar Urgência
          </Button>
          <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-lg text-xs font-bold text-brand uppercase tracking-widest">
            {tickets.length} Pedidos Aguardando
          </div>
        </div>
      </div>

      <Card className="border-surface-border/60 bg-surface-card/30 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-surface-border/20 mb-6 bg-slate-900/50 py-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <ShoppingCart className="w-6 h-6 mr-3 text-brand" />
                Fila de Execução de Compra
              </CardTitle>
              <CardDescription>Tickets com status APPROVED prontos para emissão de OC.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-border/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="pb-4 pl-4 text-center w-20">Urg.</th>
                  <th className="pb-4">Ticket</th>
                  <th className="pb-4">Módulo</th>
                  <th className="pb-4">Valor Aprovado</th>
                  <th className="pb-4">Recomendação</th>
                  <th className="pb-4 text-right pr-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/30">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-12 bg-slate-900/10"></td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center opacity-30">
                            <ShoppingCart className="w-16 h-16 mb-4" />
                            <p className="text-sm font-black uppercase tracking-[0.2em]">Nenhum pedido para processar</p>
                        </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const amount = Number(ticket.quotation?.total_amount || 0);
                    const isUrgent = amount > 1000 || ticket.type === 'M3'; // Exemplos de regra

                    return (
                      <tr key={ticket.id} className="group hover:bg-brand/5 transition-all duration-300">
                        <td className="py-6 pl-4 text-center">
                           {isUrgent ? (
                             <div className="inline-flex p-1.5 bg-rose-500/10 rounded-lg text-rose-500 animate-pulse border border-rose-500/20 shadow-lg shadow-rose-900/10">
                               <Clock className="w-4 h-4" />
                             </div>
                           ) : (
                             <div className="inline-flex p-1.5 bg-slate-800 rounded-lg text-slate-500">
                               <Clock className="w-4 h-4" />
                             </div>
                           )}
                        </td>
                        <td className="py-6">
                           <div className="flex flex-col">
                             <span className="font-mono font-black text-slate-400">#{ticket.type}-{ticket.id.toString().padStart(4, '0')}</span>
                             <span className="text-[10px] text-brand-success font-black uppercase tracking-tighter">Aprovado por Direção</span>
                           </div>
                        </td>
                        <td className="py-6">
                           <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-500 uppercase">{ticket.type} - Produtos</span>
                        </td>
                        <td className="py-6">
                          <span className="text-sm font-mono font-black text-white">
                            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>
                        <td className="py-6">
                           {amount >= 500 ? (
                             <div className="flex items-center text-amber-500 text-[10px] font-black uppercase bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                               <Gavel className="w-3 h-3 mr-2" /> Leilão Recomendado
                             </div>
                           ) : (
                             <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                               <Flashlight className="w-3 h-3 mr-2" /> Compra Direta
                             </div>
                           )}
                        </td>
                        <td className="py-6 text-right pr-4">
                          <Link href={`/purchasing/${ticket.id}`}>
                            <Button size="sm" variant="primary" className="h-10 px-6 font-black tracking-widest uppercase text-xs shadow-lg shadow-brand/10 hover:shadow-brand/20">
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
      
      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-slate-900/40 rounded-2xl border border-surface-border/50">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Lead Time Médio</h4>
            <p className="text-2xl font-black text-white">4.2 Dias</p>
         </div>
         <div className="p-6 bg-slate-900/40 rounded-2xl border border-surface-border/50">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Economia Acumulada (Mês)</h4>
            <p className="text-2xl font-black text-brand-success">R$ 12.450,80</p>
         </div>
         <div className="p-6 bg-slate-900/40 rounded-2xl border border-surface-border/50">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">OCs Emitidas (Hoje)</h4>
            <p className="text-2xl font-black text-brand">14 Pedidos</p>
         </div>
      </div>
    </div>
  );
}
