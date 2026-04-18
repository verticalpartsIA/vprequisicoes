'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockApiClient } from '@/lib/api/client.mock';
import { PurchaseOrderForm } from '@/components/forms/purchasing/PurchaseOrderForm';
import { ShoppingCart, Loader2, ArrowLeft, ClipboardList, Info, History, ShieldCheck, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PurchasingDetailPage() {
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-slate-400 font-medium">Preparando ambiente de compra para ticket #{ticketId}...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Requisição não encontrada</h2>
        <Button onClick={() => router.push('/purchasing')}>Voltar para lista</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-border/50">
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/purchasing')}
            className="flex items-center text-xs font-black uppercase text-slate-500 hover:text-brand transition-all tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Console de Compras
          </button>
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-brand/5 rounded-2xl border border-brand/20 shadow-2xl shadow-brand/10">
              <ShoppingCart className="w-10 h-10 text-brand" />
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-4xl font-black text-white tracking-tighter uppercase">Execução #{ticket.type}-{ticket.id.toString().padStart(4, '0')}</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded border border-emerald-500/20 uppercase tracking-widest shadow-lg shadow-emerald-900/10">
                  {ticket.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Solicitante: <span className="text-slate-200">{ticket.username}</span></span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Aprovação: <span className="text-emerald-500">Concluída</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-6 bg-slate-900/30 rounded-2xl border border-surface-border/50">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                   <ClipboardList className="w-4 h-4 mr-2 text-brand" /> Justificativa Original
                </h4>
                <p className="text-sm text-slate-400 italic">"{ticket.details?.justificativa}"</p>
             </div>
             <div className="p-6 bg-slate-900/30 rounded-2xl border border-surface-border/50">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                   <Info className="w-4 h-4 mr-2 text-brand" /> Decisão da Gestão
                </h4>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-200">Aprovado para Compra Direta ou Leilão</span>
                   <span className="text-lg font-mono font-black text-brand-success">
                     {Number(ticket.quotation?.total_amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </span>
                </div>
             </div>
          </div>
        </section>

        <PurchaseOrderForm ticket={ticket} />

        <section className="pt-10 border-t border-surface-border/50">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center mb-6">
              <History className="w-4 h-4 mr-3 text-brand" />
              Rastreabilidade do Ticket
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-xl border border-surface-border/30 flex flex-col items-center text-center">
                 <span className="text-[8px] text-slate-500 uppercase font-black mb-1">M1 - Requisição</span>
                 <span className="text-[10px] text-emerald-500 font-bold uppercase">Finalizado</span>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-surface-border/30 flex flex-col items-center text-center">
                 <span className="text-[8px] text-slate-500 uppercase font-black mb-1">M2 - Cotação</span>
                 <span className="text-[10px] text-emerald-500 font-bold uppercase">Finalizado</span>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-surface-border/30 flex flex-col items-center text-center">
                 <span className="text-[8px] text-slate-500 uppercase font-black mb-1">M7 - Aprovação</span>
                 <span className="text-[10px] text-emerald-500 font-bold uppercase">Finalizado</span>
              </div>
              <div className="p-4 bg-brand/5 rounded-xl border border-brand/20 flex flex-col items-center text-center">
                 <span className="text-[8px] text-brand uppercase font-black mb-1">M8 - Compras</span>
                 <span className="text-[10px] text-brand animate-pulse font-black uppercase tracking-widest">Em Execução</span>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
