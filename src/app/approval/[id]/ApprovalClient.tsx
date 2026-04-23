'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockApiClient } from '@/lib/api/client.mock';
import { ApprovalDecisionForm } from '@/components/forms/approval/ApprovalDecisionForm';
import { ClipboardCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeTicket } from '@/lib/utils/normalize-ticket';

export default function ApprovalClient() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const res: any = await mockApiClient.get(`/api/requests/${id}`);
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
        <p className="text-slate-400 font-medium">Carregando dados para aprovação do ticket #{id}...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Ticket não encontrado</h2>
        <Button onClick={() => router.push('/approval')}>Voltar para lista</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-border">
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/approval')}
            className="flex items-center text-sm text-slate-500 hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Fila de Aprovação
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand/10 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-brand" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-3xl font-bold text-slate-900">Ticket #{ticket._ticketNumber}</span>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full uppercase tracking-tighter border border-amber-500/20">
                  {ticket.status}
                </span>
              </div>
              <p className="text-slate-500">
                Solicitado por <span className="text-slate-900 font-semibold">{ticket._requester}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-surface-border shadow-sm">
        <ApprovalDecisionForm ticket={ticket} />
      </div>
    </div>
  );
}
