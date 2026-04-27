'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { realGet as realApiClient } from '@/lib/api/real-client';
import { ApprovalDecisionForm } from '@/components/forms/approval/ApprovalDecisionForm';
import { ClipboardCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeTicket } from '@/lib/utils/normalize-ticket';

import { RequestDetails } from '@/components/shared/RequestDetails';

export default function ApprovalClient() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('manager_level_1');

  useEffect(() => {
    const role = process.env.NEXT_PUBLIC_DEFAULT_USER_ROLE || 'manager_level_1';
    setUserRole(role);

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
        <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">Carregando dados para aprovação...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">Ticket não encontrado</h2>
        <Button onClick={() => router.push('/approval')}>Voltar para lista</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/approval')}
            className="flex items-center text-sm text-slate-500 hover:text-brand transition-colors uppercase font-bold tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Fila
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-brand/10 rounded-2xl border border-brand/20">
              <ClipboardCheck className="w-8 h-8 text-brand" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-4xl font-black text-white tracking-tighter uppercase">Ticket #{ticket._ticketNumber}</span>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-md border border-amber-500/20 uppercase">
                  {ticket.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium">
                Solicitado por <span className="text-white font-bold">{ticket._requester}</span> • {ticket._departamento}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LADO ESQUERDO: DETALHES DA REQUISIÇÃO */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900/40 rounded-3xl p-8 border border-white/5 shadow-2xl">
            <RequestDetails ticket={ticket} />
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO DE DECISÃO */}
        <div className="lg:col-span-4">
          <div className="sticky top-10">
            <ApprovalDecisionForm ticket={ticket} userRole={userRole} />
          </div>
        </div>
      </div>
    </div>
  );
}
