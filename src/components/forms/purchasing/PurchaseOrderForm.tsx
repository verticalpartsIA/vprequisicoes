'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, FileCheck, AlertTriangle, CheckCircle2, XCircle, Trophy, DollarSign, Clock, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { purchaseOrderSchema, PurchaseOrderInput } from '@/lib/validation/schemas';
import { realPost } from '@/lib/api/real-client';
import { Button } from '@/components/ui/button';
import { Toast, ToastType } from '@/components/ui/toast';
import { PurchaseOrderPreview } from '../../purchasing/PurchaseOrderPreview';
import { generateOCNumber } from '@core/services/purchaseOrderGenerator';
import { PAYMENT_TERMS_OPTIONS } from '@modules/purchasing/constants';

interface PurchaseOrderFormProps {
  ticket: any;
}

const WIN_REASON_LABEL: Record<string, string> = {
  price:    'Melhor Preço',
  deadline: 'Melhor Prazo',
  both:     'Preço e Prazo',
};

export const PurchaseOrderForm = ({ ticket }: PurchaseOrderFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [ocNumber, setOcNumber] = useState('');
  const [requiresReceiving, setRequiresReceiving] = useState(true);

  const meta = (ticket.metadata as any) || {};
  const quotation = ticket._quotation || meta.quotation || null;
  const quotationItems: any[] = quotation?.items || [];

  // Reúne todos os fornecedores do vencedor por item
  const winners = quotationItems.map((item: any) =>
    (item.suppliers || []).find((s: any) => s.is_winner)
  ).filter(Boolean);

  const winningQuotation = winners[0] || null;
  const defaultAmount = Number(quotation?.total_amount || ticket._totalAmount || 0);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PurchaseOrderInput>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      method: 'direct',
      supplier_id: winningQuotation?.name || 'Fornecedor Vencedor',
      supplier_name: winningQuotation?.name || 'Fornecedor Vencedor',
      total_amount: defaultAmount,
      delivery_address: 'Rua Armandina Braga de Almeida, 383 - Guarulhos/SP',
      items: quotationItems.length > 0
        ? quotationItems.map((item: any) => {
            const w = (item.suppliers || []).find((s: any) => s.is_winner);
            return {
              description: item.nome || item.description || 'Item',
              quantity: item.quantidade || item.quantity || 1,
              unit_price: w?.price || 0,
              subtotal: (w?.price || 0) * (item.quantidade || item.quantity || 1),
            };
          })
        : (ticket.details?.itens || []).map((item: any) => ({
            description: item.nome,
            quantity: item.quantidade,
            unit_price: winningQuotation?.price || 0,
            subtotal: (winningQuotation?.price || 0) * item.quantidade,
          }))
    }
  });

  const watchedItems = watch('items');
  const watchedTotal = watch('total_amount');
  const watchedSupplier = watch('supplier_name');
  const watchedAddress = watch('delivery_address');
  const watchedTerms = watch('payment_terms');

  useEffect(() => {
    setOcNumber(generateOCNumber());
  }, []);

  const onSubmit = async (data: PurchaseOrderInput) => {
    setIsLoading(true);
    try {
      const endpoint = `/api/purchasing/tickets/${ticket.id}/direct`;
      const res: any = await realPost(endpoint, {
        ...data,
        oc_number: ocNumber,
        requires_receiving: requiresReceiving,
        winner_name: winningQuotation?.name,
        winner_reason: winningQuotation?.win_reason,
      });

      setToast({ type: 'success', message: `Pedido de Compra ${res.data?.oc_number || ocNumber} emitido com sucesso!` });
      setTimeout(() => router.push('/purchasing'), 2000);
    } catch (error: any) {
      setToast({ type: 'error', message: error.message || 'Erro ao emitir OC.' });
    } finally {
      setIsLoading(false);
    }
  };

  const previewOrder = {
    oc_number: ocNumber,
    issued_at: new Date().toISOString(),
    supplier_name: watchedSupplier,
    items: watchedItems,
    total_amount: watchedTotal,
    delivery_address: watchedAddress,
    payment_terms: watchedTerms,
    requester_name: ticket._requester || ticket.requester_name,
    approver_name: meta.approved_by_name || meta.approver_name || 'Gerência VerticalParts',
    requires_receiving: requiresReceiving,
    win_reason: winningQuotation?.win_reason,
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* CARD: VENCEDOR DA COTAÇÃO */}
          <section className="p-6 bg-surface-card border border-surface-border rounded-2xl shadow-md space-y-5">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-brand" />
              <h3 className="text-lg font-bold text-slate-900">Fornecedor Vencedor da Cotação</h3>
            </div>

            {winningQuotation ? (
              <div className="space-y-4">
                {/* Info do vencedor */}
                <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-slate-950" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Fornecedor Selecionado</p>
                    <p className="text-lg font-black text-slate-900">{winningQuotation.name}</p>
                    {winningQuotation.win_reason && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-brand/20 rounded-full text-[10px] font-black text-brand">
                        <Trophy className="w-3 h-3" />
                        Critério: {WIN_REASON_LABEL[winningQuotation.win_reason] || winningQuotation.win_reason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid de valores */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <DollarSign className="w-4 h-4 text-brand mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Preço Unit.</p>
                    <p className="text-sm font-black text-slate-900">
                      {Number(winningQuotation.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <Clock className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Prazo</p>
                    <p className="text-sm font-black text-slate-900">{winningQuotation.delivery_days || 0} dias</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <Package className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Total</p>
                    <p className="text-sm font-black text-emerald-700">
                      {defaultAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>

                {/* Todos os fornecedores consultados */}
                {quotationItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Todos os Fornecedores Consultados</p>
                    {quotationItems.map((item: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        {(item.suppliers || []).map((s: any, sIdx: number) => (
                          <div key={sIdx} className={`flex items-center gap-3 p-2 rounded-lg text-xs ${s.is_winner ? 'bg-brand/5 border border-brand/20' : 'bg-slate-50 border border-slate-200'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${s.is_winner ? 'bg-brand text-slate-950' : 'bg-slate-300 text-slate-600'}`}>
                              {sIdx + 1}
                            </div>
                            <span className={`flex-1 font-semibold ${s.is_winner ? 'text-slate-900' : 'text-slate-500'}`}>{s.name || '—'}</span>
                            <span className={`font-mono font-bold ${s.is_winner ? 'text-brand' : 'text-slate-400'}`}>
                              {Number(s.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span className="text-slate-400">{s.delivery_days || 0}d</span>
                            {s.is_winner && <CheckCircle2 className="w-3.5 h-3.5 text-brand" />}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-bold">
                Nenhum vencedor de cotação encontrado para este ticket.
              </div>
            )}
          </section>

          {/* CARD: NECESSITA RECEBIMENTO */}
          <section className="p-6 bg-surface-card border border-surface-border rounded-2xl shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-brand" />
              <h3 className="text-lg font-bold text-slate-900">Recebimento Físico</h3>
            </div>
            <p className="text-xs text-slate-500">Após a compra, haverá entrada de material no almoxarifado?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRequiresReceiving(true)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  requiresReceiving
                    ? 'border-brand bg-brand/5 shadow-md shadow-brand/10'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className={`w-7 h-7 mb-2 ${requiresReceiving ? 'text-brand' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold uppercase ${requiresReceiving ? 'text-slate-900' : 'text-slate-500'}`}>Sim</span>
                <p className="text-[10px] text-slate-500 text-center mt-1">Material entra no almoxarifado</p>
              </button>
              <button
                type="button"
                onClick={() => setRequiresReceiving(false)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  !requiresReceiving
                    ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <XCircle className={`w-7 h-7 mb-2 ${!requiresReceiving ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold uppercase ${!requiresReceiving ? 'text-slate-900' : 'text-slate-500'}`}>Não</span>
                <p className="text-[10px] text-slate-500 text-center mt-1">Serviço / entrega direta ao solicitante</p>
              </button>
            </div>
          </section>

          {/* CARD: CONDIÇÕES */}
          <section className="p-6 bg-surface-card border border-surface-border rounded-2xl shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-700 uppercase tracking-widest text-[11px]">Condições de Emissão</h3>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Condição de Pagamento</label>
              <select
                {...register('payment_terms')}
                className="w-full bg-white border border-surface-border rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-brand outline-none"
              >
                {PAYMENT_TERMS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.label}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Local de Entrega</label>
              <textarea
                {...register('delivery_address')}
                className={`w-full bg-white border ${errors.delivery_address ? 'border-rose-500' : 'border-surface-border'} rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-brand outline-none min-h-[80px]`}
              />
              {errors.delivery_address && <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">{errors.delivery_address.message}</p>}
            </div>
          </section>

          <Button
            type="submit"
            loading={isLoading}
            className="w-full py-8 text-xl font-black uppercase tracking-[0.2em] shadow-md bg-brand hover:bg-brand-hover shadow-brand/30"
          >
            <Send className="w-6 h-6 mr-3" />
            Emitir Ordem de Compra
          </Button>

          <div className="p-4 bg-slate-50 border border-surface-border rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <p className="text-[10px] text-slate-500 font-medium">
              Ao confirmar, o status mudará para{' '}
              <span className="text-brand font-bold italic">
                {requiresReceiving ? 'RECEIVING' : 'RELEASED'}
              </span>
              {requiresReceiving ? ' e o almoxarifado será notificado.' : ' — encerrado sem recebimento.'}
            </p>
          </div>
        </form>
      </div>

      <div className="hidden xl:block">
        <PurchaseOrderPreview order={previewOrder} />
      </div>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
