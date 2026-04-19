'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockApiClient } from '@/lib/api/client.mock';
import { QuotationForm } from '@/components/forms/quotation/QuotationForm';
import { ClipboardList, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuotationDetailPage() {
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
        <p className="text-slate-400 font-medium">Carregando dados do ticket #{ticketId}...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Ticket não encontrado</h2>
        <Button onClick={() => router.push('/quotation')}>Voltar para lista</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-border">
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/quotation')}
            className="flex items-center text-sm text-slate-500 hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Console
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand/10 rounded-xl">
              <ClipboardList className="w-8 h-8 text-brand" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-3xl font-bold text-white">Ticket #{ticket.type}-{ticket.id.toString().padStart(4, '0')}</span>
                <span className="px-3 py-1 bg-brand/20 text-brand text-xs font-bold rounded-full uppercase tracking-tighter">
                  {ticket.status}
                </span>
              </div>
              <p className="text-slate-400">
                Solicitado por <span className="text-slate-200 font-semibold">{ticket.username}</span> em {new Date(ticket.submittedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Prioridade Alta</span>
          <div className="flex space-x-1">
             {Array(5).fill(0).map((_, i) => (
               <div key={i} className={`w-6 h-1.5 rounded-full ${i < 4 ? 'bg-amber-500' : 'bg-slate-800'}`}></div>
             ))}
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="bg-surface-card/20 rounded-2xl p-8 border border-surface-border backdrop-blur-md">
        <QuotationForm ticket={ticket} />
      </div>

      {/* Audit/Info Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-surface-border">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Origem</p>
          <p className="text-sm text-slate-600 font-medium">Portal v2 - Módulo {ticket.type}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Justificativa Original</p>
          <p className="text-sm text-slate-600 font-medium italic">"{ticket.details.justificativa}"</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">SLA de Cotação</p>
          <p className="text-sm text-slate-600 font-medium">Expira em 48h</p>
        </div>
      </div>
    </div>
  );
}
