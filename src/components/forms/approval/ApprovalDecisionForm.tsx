'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, XCircle, RefreshCcw, Send, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { approvalDecisionSchema, ApprovalDecisionInput } from '@/lib/validation/schemas';
import { realPost } from '@/lib/api/real-client';
import { Button } from '@/components/ui/button';
import { Toast, ToastType } from '@/components/ui/toast';
import { canApprove, getApprovalTier } from '@core/validation/approvalTiers';
import { TierBadge } from '@/components/ui/TierBadge';

interface ApprovalDecisionFormProps {
  ticket: any;
  userRole: string;
}

export const ApprovalDecisionForm = ({ ticket, userRole }: ApprovalDecisionFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const amount = ticket._totalAmount || 0;
  const tier = getApprovalTier(amount);
  const allowed = canApprove(userRole, amount);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ApprovalDecisionInput>({
    resolver: zodResolver(approvalDecisionSchema),
    defaultValues: {
      decision: 'approve'
    }
  });

  const selectedDecision = watch('decision');

  const onSubmit = async (data: ApprovalDecisionInput) => {
    if (!allowed && data.decision === 'approve') {
      setToast({ type: 'error', message: 'Sua alçada não permite aprovar este valor.' });
      return;
    }

    setIsLoading(true);
    try {
      await realPost(`/api/approval/tickets/${ticket.id}/decide`, data);

      const messages = {
         approve: 'Requisição aprovada com sucesso!',
         reject: 'Requisição reprovada.',
         revision: 'Pedido de revisão enviado.'
      };

      setToast({ type: 'success', message: messages[data.decision] });
      setTimeout(() => router.push('/approval'), 1500);

    } catch (error: any) {
      setToast({ type: 'error', message: error.message || 'Erro ao processar decisão.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-6 bg-surface-card border border-surface-border rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-border">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-3 text-brand" />
            Decisão do Aprovador
          </h3>
          <TierBadge tier={tier} hasPermission={allowed} />
        </div>

        {/* Radio Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <label className={`cursor-pointer group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedDecision === 'approve' ? 'border-brand-success bg-brand-success/5 shadow-lg shadow-brand-success/10' : 'border-surface-border hover:border-slate-300 bg-slate-50'}`}>
            <input type="radio" value="approve" {...register('decision')} className="sr-only" />
            <CheckCircle2 className={`w-8 h-8 mb-2 ${selectedDecision === 'approve' ? 'text-brand-success' : 'text-slate-600'}`} />
            <span className={`text-sm font-bold uppercase ${selectedDecision === 'approve' ? 'text-slate-900' : 'text-slate-500'}`}>Aprovar</span>
            {selectedDecision === 'approve' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-success" />}
          </label>

          <label className={`cursor-pointer group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedDecision === 'revision' ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10' : 'border-surface-border hover:border-slate-300 bg-slate-50'}`}>
            <input type="radio" value="revision" {...register('decision')} className="sr-only" />
            <RefreshCcw className={`w-8 h-8 mb-2 ${selectedDecision === 'revision' ? 'text-amber-500' : 'text-slate-600'}`} />
            <span className={`text-sm font-bold uppercase ${selectedDecision === 'revision' ? 'text-slate-900' : 'text-slate-500'}`}>Revisar</span>
            {selectedDecision === 'revision' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />}
          </label>

          <label className={`cursor-pointer group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedDecision === 'reject' ? 'border-rose-500 bg-rose-500/5 shadow-lg shadow-rose-500/10' : 'border-surface-border hover:border-slate-300 bg-slate-50'}`}>
            <input type="radio" value="reject" {...register('decision')} className="sr-only" />
            <XCircle className={`w-8 h-8 mb-2 ${selectedDecision === 'reject' ? 'text-rose-500' : 'text-slate-600'}`} />
            <span className={`text-sm font-bold uppercase ${selectedDecision === 'reject' ? 'text-slate-900' : 'text-slate-500'}`}>Reprovar</span>
            {selectedDecision === 'reject' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />}
          </label>
        </div>

        {/* Inputs Condicionais */}
        <div className="space-y-4">
          {selectedDecision === 'reject' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Motivo da Reprovação (Mín. 10 caracteres)</label>
              <textarea
                className={`flex min-h-[100px] w-full rounded-lg border ${errors.decision && (errors as any).reason ? 'border-rose-500' : 'border-surface-border'} bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500`}
                placeholder="Explique o motivo do indeferimento..."
                {...register('reason' as any)}
              />
              {(errors as any).reason && <p className="text-xs text-rose-500 font-bold">{(errors as any).reason.message}</p>}
            </div>
          )}

          {selectedDecision === 'revision' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Observações para Revisão (Mín. 5 caracteres)</label>
              <textarea
                className={`flex min-h-[100px] w-full rounded-lg border ${errors.decision && (errors as any).comment ? 'border-amber-500' : 'border-surface-border'} bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500`}
                placeholder="Indique o que precisa ser ajustado na cotação..."
                {...register('comment' as any)}
              />
              {(errors as any).comment && <p className="text-xs text-amber-500 font-bold">{(errors as any).comment.message}</p>}
            </div>
          )}

          {selectedDecision === 'approve' && (
            <div className="p-4 bg-brand-success/5 border border-brand-success/20 rounded-xl flex items-start">
              <CheckCircle2 className="w-5 h-5 text-brand-success mr-3 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Ao aprovar, você autoriza o departamento de compras a prosseguir com o pedido junto ao fornecedor vencedor. Esta ação será registrada em seu nome.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {!allowed && selectedDecision === 'approve' && (
          <div className="flex items-center p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Sua alçada ({userRole}) não permite aprovar tickets deste valor.
          </div>
        )}

        <Button
          type="submit"
          loading={isLoading}
          variant="primary"
          disabled={!allowed && selectedDecision === 'approve'}
          className={`w-full py-6 text-lg font-black tracking-widest uppercase transition-all shadow-md ${
            selectedDecision === 'approve' ? 'shadow-brand-success/20' :
            selectedDecision === 'reject' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20' :
            'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
          }`}
        >
          <Send className="w-5 h-5 mr-3" />
          Confirmar Decisão
        </Button>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  );
};
