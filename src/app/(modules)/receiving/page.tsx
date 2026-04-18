'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Search, ArrowRight, Package, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { mockApiClient } from '@/lib/api/client.mock';

export default function ReceivingListPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await mockApiClient.get('/api/receiving/tickets', { status: 'PURCHASED' });
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Portaria e Recebimento</h1>
          <p className="text-slate-500 font-medium">Controle de entrada de mercadorias e ateste de serviços executados.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-right">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Carga em Trânsito</span>
              <p className="text-xl font-black text-emerald-500 uppercase">{tickets.length > 0 ? `${tickets.length} Pedidos` : 'Fila Vazia'}</p>
           </div>
           <Button className="h-10 px-6 font-black uppercase tracking-widest text-xs">
              <Search className="w-4 h-4 mr-2" /> Localizar OC
           </Button>
        </div>
      </div>

      <Card className="border-surface-border/60 bg-surface-card/30 backdrop-blur-xl shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-surface-border/20 bg-slate-900/50 py-10 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-brand/10 rounded-2xl border border-brand/20">
                <Truck className="w-10 h-10 text-brand" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter">Fila de Recebimento Logístico</CardTitle>
                <CardDescription className="text-slate-500">Aguardando confirmação de entrega física ou conclusão de serviço.</CardDescription>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-8">
                <div className="text-center">
                    <span className="text-[9px] text-slate-600 font-black uppercase mb-1 block">Físico (M1/M4)</span>
                    <span className="text-sm font-bold text-slate-400">{tickets.filter(t => ['M1', 'M4'].includes(t.type)).length}</span>
                </div>
                <div className="text-center">
                    <span className="text-[9px] text-slate-600 font-black uppercase mb-1 block">Digital (M2/M3)</span>
                    <span className="text-sm font-bold text-slate-400">{tickets.filter(t => ['M2', 'M3'].includes(t.type)).length}</span>
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/40 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-surface-border/30">
                  <th className="py-6 pl-8">Tipo</th>
                  <th className="py-6">Identificação / OC</th>
                  <th className="py-6">Fornecedor</th>
                  <th className="py-6">Destino / Local</th>
                  <th className="py-6">Data Compra</th>
                  <th className="py-6 pr-8 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/20">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-14 bg-slate-900/10"></td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center opacity-40">
                        <div className="flex flex-col items-center">
                            <Truck className="w-20 h-20 mb-6 text-slate-700" />
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Nenhuma carga em sistema no momento</p>
                        </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const isPhysical = ['M1', 'M4'].includes(ticket.type);
                    
                    return (
                      <tr key={ticket.id} className="group hover:bg-brand/5 transition-all duration-300">
                        <td className="py-8 pl-8">
                           {isPhysical ? (
                             <div className="flex items-center gap-2 text-brand font-black text-[10px] uppercase bg-brand/5 border border-brand/20 px-3 py-1.5 rounded-lg w-fit">
                               <Package className="w-3.5 h-3.5" /> Físico
                             </div>
                           ) : (
                             <div className="flex items-center gap-2 text-cyan-500 font-black text-[10px] uppercase bg-cyan-500/5 border border-cyan-500/20 px-3 py-1.5 rounded-lg w-fit">
                               <ShieldCheck className="w-3.5 h-3.5" /> Digital
                             </div>
                           )}
                        </td>
                        <td className="py-8">
                           <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-200">OC-{ticket.id.toString().padStart(6, '0')}</span>
                                <span className="text-[10px] font-mono text-slate-500">#{ticket.type}-{ticket.id.toString().padStart(4, '0')}</span>
                             </div>
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1 truncate max-w-[150px]">
                                {ticket.details?.justificativa}
                             </span>
                           </div>
                        </td>
                        <td className="py-8">
                           <span className="text-sm font-bold text-slate-300">{ticket.quotation?.items?.[0]?.suppliers?.find((s: any) => s.is_winner)?.name || 'Fornecedor Vencedor'}</span>
                        </td>
                        <td className="py-8">
                           <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-tight">
                              <MapPin className="w-3 h-3 text-brand" />
                              {isPhysical ? 'Almoxarifado Curitiba' : 'Execução Local/Digital'}
                           </div>
                        </td>
                        <td className="py-8">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase">
                                <Calendar className="w-3 h-3" />
                                16/04/2026
                            </div>
                        </td>
                        <td className="py-8 text-right pr-8">
                          <Link href={`/receiving/${ticket.id}`}>
                            <Button className="h-10 px-6 font-black tracking-widest uppercase text-xs shadow-lg shadow-brand/10 hover:shadow-brand/30 transition-all border border-brand/20 bg-brand/10 text-brand hover:bg-brand hover:text-white">
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
    </div>
  );
}
