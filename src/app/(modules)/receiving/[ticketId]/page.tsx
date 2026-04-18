'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockApiClient } from '@/lib/api/client.mock';
import { ReceivingForm } from '@/components/forms/receiving/ReceivingForm';
import { Truck, Loader2, ArrowLeft, ClipboardList, Info, ShieldCheck, Bookmark, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReceivingDetailPage() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res: any = await mockApiClient.get(`/api/requests/${ticketId}`);
        setTicket(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [ticketId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
            <Loader2 className="w-16 h-16 text-brand animate-spin" />
            <Truck className="w-8 h-8 text-brand absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Sincronizando dados logísticos para ticket #{ticketId}...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">Pedido de Recebimento Não Localizado</h2>
        <Button onClick={() => router.push('/receiving')} className="font-black uppercase tracking-widest px-8">Voltar para Fila</Button>
      </div>
    );
  }

  const isPhysical = ['M1', 'M4'].includes(ticket.type);

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-surface-border/50">
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/receiving')}
            className="flex items-center text-[10px] font-black uppercase text-slate-500 hover:text-brand transition-all tracking-[0.2em]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Portaria / Recebimento
          </button>
          <div className="flex items-center space-x-8">
            <div className="p-5 bg-brand/5 rounded-3xl border border-brand/20 shadow-2xl shadow-brand/10">
              <Truck className="w-12 h-12 text-brand" />
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-4xl font-black text-white tracking-tighter uppercase italic">Fluxo Logístico: OC-{ticket.id.toString().padStart(6, '0')}</span>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded border border-amber-500/20 uppercase tracking-widest shadow-lg shadow-amber-900/10">
                  {ticket.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-slate-600" />
                  <span>Requisição: <span className="text-slate-300">#{ticket.type}-{ticket.id.toString().padStart(4, '0')}</span></span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                  <span>Fase Atual: <span className="text-brand">Confirmação de Entrega</span></span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-6">
                  <FileSearch className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tipo: <span className={isPhysical ? 'text-brand-success' : 'text-cyan-500'}>{isPhysical ? 'Carga Física' : 'Ateste Digital'}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
            <Button variant="outline" className="border-slate-800 bg-slate-900/40 text-slate-400 font-black text-[10px] uppercase tracking-widest h-12 px-6">
                Visualizar Ordem de Compra PDF
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-900/30 rounded-3xl border border-surface-border/50 shadow-inner">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                    <ClipboardList className="w-4 h-4 mr-3 text-brand" /> Resumo do Pedido de Suprimentos
                 </h4>
                 <div className="space-y-4">
                    <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-brand/30 pl-4">"{ticket.details?.justificativa}"</p>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-surface-border/30">
                            <span className="text-[8px] text-slate-500 uppercase font-black block mb-1">Fornecedor Orçado</span>
                            <span className="text-[10px] font-bold text-slate-200">{ticket.quotation?.items?.[0]?.suppliers?.find((s: any) => s.is_winner)?.name || 'Consultando...'}</span>
                        </div>
                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-surface-border/30">
                            <span className="text-[8px] text-slate-500 uppercase font-black block mb-1">Pagamento Previsto</span>
                            <span className="text-[10px] font-bold text-slate-200">Boleto 28 DD</span>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-slate-900/30 rounded-3xl border border-surface-border/50 flex flex-col justify-center">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                    <Info className="w-4 h-4 mr-3 text-brand" /> Direcionamento de Recebimento
                 </h4>
                 <div className="flex items-center justify-between p-6 bg-brand/5 border border-brand/20 rounded-2xl">
                    <div>
                        <span className="text-xs font-bold text-slate-300 block">Total da Ordem de Compra</span>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">Valor assegurado via leilão digital</p>
                    </div>
                    <span className="text-3xl font-black text-brand italic">
                      {Number(ticket.quotation?.total_amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                 </div>
              </div>
           </div>
        </section>

        <section className="animate-in slide-in-from-top-6 duration-1000">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-8 border-b border-surface-border/30 pb-4">Ação de Campo: {isPhysical ? 'Conferência de ITENS' : 'Ateste de Serviço'}</h3>
            <ReceivingForm ticket={ticket} />
        </section>
      </div>
    </div>
  );
}
