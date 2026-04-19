'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockApiClient } from '@/lib/api/client.mock';
import { ApprovalDecisionForm } from '@/components/forms/approval/ApprovalDecisionForm';
import { QuotationSummaryCard } from '@/components/approval/QuotationSummaryCard';
import { AuditTimeline } from '@/components/approval/AuditTimeline';
import { ShieldCheck, Loader2, ArrowLeft, ClipboardList, Info, History, AlertCircle, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApprovalDetailPage() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('manager_level_1');

  useEffect(() => {
    const loadData = async () => {
      try {
        const role = process.env.NEXT_PUBLIC_DEFAULT_USER_ROLE || 'manager_level_1';
        setUserRole(role);

        const res: any = await mockApiClient.get(`/api/requests/${ticketId}`);
        setTicket(res.data);

        const auditRes: any = await mockApiClient.get(`/api/approval/tickets/${ticketId}/audit`);
        setAuditLogs(auditRes.data);
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
        <p className="text-slate-400 font-medium">Carregando análise do ticket #{ticketId}...</p>
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
            className="flex items-center text-xs font-black uppercase text-slate-500 hover:text-brand transition-all tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volar ao Console
          </button>
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-brand/5 rounded-2xl border border-brand/20 shadow-md shadow-brand/10">
              <ShieldCheck className="w-10 h-10 text-brand" />
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-xl font-bold text-slate-900">Análise #{ticket.type}-{ticket.id.toString().padStart(4, '0')}</span>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded border border-amber-500/20 uppercase tracking-widest shadow-lg shadow-amber-900/10">
                  {ticket.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Solicitante: <span className="text-slate-200 ml-1">{ticket.username}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Depto: <span className="text-slate-200 ml-1">{ticket.details?.departamento || 'Global'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Data da Solicitação</span>
          <p className="text-brand font-mono font-black text-lg bg-brand/10 px-3 py-1 rounded-lg border border-brand/20">
            {new Date(ticket.submittedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center">
              <ClipboardList className="w-4 h-4 mr-3 text-brand" />
              Contexto da Requisição
            </h4>
            <div className="p-8 bg-slate-900/30 rounded-2xl border border-surface-border shadow-xl backdrop-blur-sm">
              <div className="space-y-8">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-3">Justificativa Estratégica</label>
                  <p className="text-lg text-slate-600 italic font-medium leading-relaxed bg-brand/5 p-4 rounded-xl border-l-4 border-brand">
                    "{ticket.details?.justificativa}"
                  </p>
                </div>
                
                <div className="p-6 bg-white/50 rounded-2xl border border-surface-border">
                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-4 border-b border-surface-border pb-2">Detalhamento dos Itens Originais</label>
                  <div className="space-y-3">
                    {ticket.details?.itens?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200 transition-all hover:border-slate-300">
                        <span className="text-sm font-bold text-slate-200">{item.nome}</span>
                        <div className="flex items-center gap-4">
                           {item.especificacao && <span className="text-[10px] text-slate-500 italic max-w-xs truncate">{item.especificacao}</span>}
                           <span className="text-xs font-black text-slate-400 bg-slate-800 px-2 py-1 rounded">x{item.quantidade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>section

          <section className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center">
              <Info className="w-4 h-4 mr-3 text-brand" />
              Resultado da Cotação (Buyer Feedback)
            </h4>
            <QuotationSummaryCard quotation={ticket.quotation} items={ticket.details?.itens || []} />
          </section>

          <ApprovalDecisionForm ticket={ticket} userRole={userRole} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="sticky top-8 space-y-8">
            <section className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center">
                <History className="w-4 h-4 mr-3 text-brand" />
                Histórico e Auditoria
              </h4>
              <div className="p-8 bg-slate-900/20 rounded-2xl border border-surface-border backdrop-blur-md min-h-[500px] shadow-md">
                <AuditTimeline logs={auditLogs} />
              </div>
            </section>
            
            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl shadow-xl shadow-amber-900/5">
              <p className="text-[11px] text-amber-500 font-black uppercase tracking-widest mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> Compliance
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Esta análise é protegida por trilhas de auditoria imutáveis. Sua decisão impactará o fluxo de caixa e a cadeia de suprimentos da VerticalParts. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
