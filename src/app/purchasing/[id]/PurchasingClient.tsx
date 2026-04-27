'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { realGet as realApiClient } from '@/lib/api/real-client';
import { PurchaseOrderForm } from '@/components/forms/purchasing/PurchaseOrderForm';
import { ShoppingCart, Loader2, ArrowLeft, ClipboardList, Info, History, ShieldCheck, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeTicket } from '@/lib/utils/normalize-ticket';

export default function PurchasingClient() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id || id === '0') return;
      try {
        const res: any = await realApiClient(`/api/requests/${id}`);
        const raw = res.data?.ticket ?? res.data;
        setTicket(normalizeTicket(raw));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-slate-400 font-medium">Preparando ambiente de compra para ticket #{id}...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Requisição não encontrada</h2>
        <Button onClick={() => router.push('/purchasing')}>Voltar para lista</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-border">
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/purchasing')}
            className="flex items-center text-xs font-black uppercase text-slate-500 hover:text-brand transition-all tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Console de Compras
          </button>
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-brand/5 rounded-2xl border border-brand/20 shadow-md shadow-brand/10">
              <ShoppingCart className="w-10 h-10 text-brand" />
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-xl font-bold text-slate-900">Execução #{ticket._ticketNumber}</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded border border-emerald-500/20 uppercase tracking-widest shadow-lg shadow-emerald-900/10">
                  {ticket.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Solicitante: <span className="text-slate-200">{ticket._requester}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-surface-border shadow-sm">
        <PurchaseOrderForm ticket={ticket} />
      </div>
    </div>
  );
}
