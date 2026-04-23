'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, FileCheck, Gavel, AlertTriangle, Printer, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { purchaseOrderSchema, PurchaseOrderInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { Button } from '@/components/ui/button';
import { Toast, ToastType } from '@/components/ui/toast';
import { PurchaseMethodSelector } from './PurchaseMethodSelector';
import { PurchaseOrderPreview } from '../../purchasing/PurchaseOrderPreview';
import { AuctionProgress } from '../../purchasing/AuctionProgress';
import { generateOCNumber, formatPurchaseOrder, exportToPDF } from '@core/services/purchaseOrderGenerator';
import { simulateAuction } from '@core/services/auction-mock';
import { PAYMENT_TERMS_OPTIONS } from '@modules/purchasing/constants';

interface PurchaseOrderFormProps {
  ticket: any;
}

export const PurchaseOrderForm = ({ ticket }: PurchaseOrderFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuctionRunning, setIsAuctionRunning] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [ocNumber, setOcNumber] = useState('');

  const winningQuotation = ticket.quotation?.items?.[0]?.suppliers?.find((s: any) => s.is_winner);
  const defaultAmount = ticket.quotation?.total_amount || 0;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PurchaseOrderInput>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      method: (defaultAmount >= 500) ? 'auction' : 'direct',
      supplier_id: winningQuotation?.name || '',
      supplier_name: winningQuotation?.name || '',
      total_amount: defaultAmount,
      delivery_address: 'Almoxarifado Central - VerticalParts Curitiba/PR',
      items: ticket.details?.itens?.map((item: any) => ({
        description: item.nome,
        quantity: item.quantidade,
        unit_price: winningQuotation?.price || 0,
        subtotal: (winningQuotation?.price || 0) * item.quantidade
      })) || []
    }
  });

  const selectedMethod = watch('method');
  const watchedItems = watch('items');
  const watchedTotal = watch('total_amount');
  const watchedSupplier = watch('supplier_name');
  const watchedAddress = watch('delivery_address');
  const watchedTerms = watch('payment_terms');

  useEffect(() => {
    setOcNumber(generateOCNumber());
  }, []);

  const onAuctionComplete = async (result: any) => {
    setIsAuctionRunning(false);
    setValue('supplier_name', result.winning_supplier);
    setValue('supplier_id', result.winning_supplier);
    setValue('total_amount', result.final_price);

    // Atualizar preços dos itens proporcionalmente
    const ratio = result.final_price / defaultAmount;
    const updatedItems = watchedItems.map(item => ({
      ...item,
      unit_price: Number((item.unit_price * ratio).toFixed(2)),
      subtotal: Number((item.subtotal * ratio).toFixed(2))
    }));
    setValue('items', updatedItems);

    setToast({ type: 'success', message: `Leilão finalizado! Economia de ${((1 - ratio) * 100).toFixed(1)}% obtida.` });
  };

  const onSubmit = async (data: PurchaseOrderInput) => {
    if (data.method === 'auction' && !isAuctionRunning && watchedTotal === defaultAmount) {
      setIsAuctionRunning(true);
      const supplierList = ticket.quotation.items[0].suppliers.map((s: any) => s.name);
      const result = await simulateAuction(ticket.id, supplierList, defaultAmount);
      await onAuctionComplete(result);
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = data.method === 'auction' ? `/api/purchasing/tickets/${ticket.id}/auction` : `/api/purchasing/tickets/${ticket.id}/direct`;
      const res: any = await mockApiClient.post(endpoint, { ...data, oc_number: ocNumber });

      setToast({ type: 'success', message: `Pedido de Compra ${res.data.oc_number} emitido com sucesso!` });
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
    payment_terms: watchedTerms
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <div className="space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="p-8 bg-surface-card border border-surface-border rounded-2xl shadow-md space-y-8">
             <div className="flex items-center gap-3 mb-2">
                <Gavel className="w-5 h-5 text-brand" />
                <h3 className="text-lg font-bold text-slate-900">Configuração da Compra</h3>
             </div>

             <PurchaseMethodSelector
               amount={defaultAmount}
               method={selectedMethod}
               onChange={(m) => setValue('method', m)}
             />

             {selectedMethod === 'direct' && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                  <FileCheck className="w-5 h-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Compra Direta Ativada</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Utilizando o fornecedor vencedor da cotação: <span className="text-emerald-500 font-bold">{winningQuotation?.name}</span>.
                      Esta opção é recomendada para agilizar o recebimento.
                    </p>
                  </div>
                </div>
             )}

             <div className="space-y-4 pt-4 border-t border-surface-border">
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
             </div>
          </section>

          <Button
            type="submit"
            loading={isLoading || isAuctionRunning}
            className={`w-full py-8 text-xl font-black uppercase tracking-[0.2em] shadow-md transition-all ${
              selectedMethod === 'auction' && watchedTotal === defaultAmount
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/30'
                : 'bg-brand hover:bg-brand-hover shadow-brand/30'
             }`}
          >
            {selectedMethod === 'auction' && watchedTotal === defaultAmount ? (
              <>
                <Gavel className="w-6 h-6 mr-3" />
                Disparar Leilão Digital
              </>
            ) : (
              <>
                <Send className="w-6 h-6 mr-3" />
                Emitir Ordem de Compra
              </>
            )}
          </Button>

          {isAuctionRunning && (
            <AuctionProgress
              initialPrice={defaultAmount}
              onComplete={onAuctionComplete}
            />
          )}

          <div className="p-4 bg-slate-50 border border-surface-border rounded-xl flex items-center gap-3">
             <AlertTriangle className="w-5 h-5 text-slate-500" />
             <p className="text-[10px] text-slate-500 font-medium">Ao confirmar, o status da requisição mudará para <span className="text-brand font-bold italic">PURCHASED</span> e o almoxarifado será notificado.</p>
          </div>
        </form>
      </div>

      <div className="hidden xl:block">
        <PurchaseOrderPreview order={previewOrder} />
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
