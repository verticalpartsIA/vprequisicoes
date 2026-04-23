'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Search, ArrowRight, Package, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { mockApiClient } from '@/lib/api/client.mock';
import { normalizeTicket } from '@/lib/utils/normalize-ticket';
import { PageFooterTutorial } from '@/components/layout/PageFooterTutorial';

export default function ReceivingListPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await mockApiClient.get('/api/receiving/tickets', { status: 'PURCHASED' });
        const list = Array.isArray(res.data) ? res.data : [];
        setTickets(list.map(normalizeTicket));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portaria e Recebimento</h1>
          <p className="text-slate-500 text-sm">Controle de entrada de mercadorias e ateste de serviços executados.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Carga em Trânsito</span>
            <p className="text-lg font-bold text-emerald-700">{tickets.length > 0 ? `${tickets.length} Pedidos` : 'Fila Vazia'}</p>
          </div>
          <Button size="sm">
            <Search className="w-4 h-4 mr-2" /> Localizar OC
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-200 py-6 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand/10 rounded-xl border border-brand/20">
                <Truck className="w-7 h-7 text-brand" />
              </div>
              <div>
                <CardTitle>Fila de Recebimento Logístico</CardTitle>
                <CardDescription>Aguardando confirmação de entrega física ou conclusão de serviço.</CardDescription>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase mb-1 block">Físico (M1/M4)</span>
                <span className="text-sm font-bold text-slate-700">{tickets.filter(t => ['M1', 'M4'].includes(t._moduleShort)).length}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase mb-1 block">Digital (M2/M3)</span>
                <span className="text-sm font-bold text-slate-700">{tickets.filter(t => ['M2', 'M3'].includes(t._moduleShort)).length}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-200">
                  <th className="py-4 pl-6">Tipo</th>
                  <th className="py-4">Identificação / OC</th>
                  <th className="py-4">Fornecedor</th>
                  <th className="py-4">Destino</th>
                  <th className="py-4">Data Compra</th>
                  <th className="py-4 pr-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-8">
                        <div className="h-8 bg-slate-100 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Truck className="w-14 h-14 mb-4 text-slate-300" />
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Nenhuma carga em sistema no momento</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const isPhysical = ['M1', 'M4'].includes(ticket._moduleShort);

                    return (
                      <tr key={ticket.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-5 pl-6">
                          {isPhysical ? (
                            <div className="flex items-center gap-1.5 text-brand font-bold text-[10px] uppercase bg-brand/5 border border-brand/20 px-2.5 py-1 rounded-lg w-fit">
                              <Package className="w-3.5 h-3.5" /> Físico
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-sky-700 font-bold text-[10px] uppercase bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg w-fit">
                              <ShieldCheck className="w-3.5 h-3.5" /> Digital
                            </div>
                          )}
                        </td>
                        <td className="py-5">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">OC-{String(ticket.id).padStart(6, '0')}</span>
                              <span className="text-[10px] font-mono text-slate-400">#{ticket._ticketNumber}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[150px]">
                              {ticket._justificativa}
                            </span>
                          </div>
                        </td>
                        <td className="py-5">
                          <span className="text-sm font-semibold text-slate-700">{ticket.quotation?.items?.[0]?.suppliers?.find((s: any) => s.is_winner)?.name || 'Fornecedor Vencedor'}</span>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <MapPin className="w-3 h-3 text-brand" />
                            {isPhysical ? 'Almoxarifado Curitiba' : 'Execução Local/Digital'}
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <Calendar className="w-3 h-3" />
                            16/04/2026
                          </div>
                        </td>
                        <td className="py-5 text-right pr-6">
                          <Link href={`/receiving/${ticket.id}`}>
                            <Button size="sm" variant="outline">
                              {isPhysical ? 'Receber' : 'Atestar'}
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

      <PageFooterTutorial
        steps={[
          {
            title: "Fila de Recebimento",
            description: "Aqui você visualiza todas as OCs que já foram emitidas e aguardam mercadoria ou conclusão de serviço.",
            icon: <Truck className="w-5 h-5 text-brand" />
          },
          {
            title: "Físico vs Digital",
            description: "Itens 'Físicos' exigem conferência de almoxarifado. Itens 'Digitais' são serviços que exigem ateste pelo solicitante.",
            icon: <ShieldCheck className="w-5 h-5 text-sky-600" />
          },
          {
            title: "Localizar OC",
            description: "Use o botão 'Localizar OC' para buscar uma OC específica por número ou fornecedor.",
            icon: <Search className="w-5 h-5 text-slate-400" />
          }
        ]}
      />
    </div>
  );
}
