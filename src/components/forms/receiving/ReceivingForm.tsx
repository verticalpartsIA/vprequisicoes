'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ShoppingBag, CheckCircle2, AlertTriangle, User, FileText, Send } from 'lucide-react';

import { receivingSchema, ReceivingInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { Button } from '@/components/ui/button';
import { Toast, ToastType } from '@/components/ui/toast';
import { ReceiptItemRow } from './ReceiptItemRow';
import { DigitalAttestationCard } from './DigitalAttestationCard';

interface ReceivingFormProps {
  ticket: any;
}

export const ReceivingForm = ({ ticket }: ReceivingFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  // Auto-detecção do tipo pelo módulo
  const isPhysical = ['M1', 'M4'].includes(ticket.type);
  const receiptType = isPhysical ? 'physical' : 'digital';

  const winningQuotation = ticket.quotation?.items?.[0]?.suppliers?.find((s: any) => s.is_winner);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ReceivingInput>({
    resolver: zodResolver(receivingSchema),
    defaultValues: {
      type: receiptType,
      received_by: 'Operador Almoxarifado',
      items: isPhysical ? ticket.details?.itens?.map((item: any) => ({
        purchase_order_item_id: item.nome, // Mock id como nome para simplicidade
        description: item.nome,
        quantity_purchased: item.quantidade,
        quantity_received: item.quantidade,
        condition: 'ok'
      })) : undefined
    }
  });

  const watchedItems = watch('items');

  const onSubmit = async (data: ReceivingInput) => {
    setIsLoading(true);
    try {
      const endpoint = `/api/receiving/tickets/${ticket.id}/${data.type}`;
      const res: any = await mockApiClient.post(endpoint, data);
      
      setToast({ 
        type: 'success', 
        message: `Recebimento finalizado com sucesso! Status: ${res.data.status}` 
      });
      
      setTimeout(() => router.push('/receiving'), 2000);
    } catch (error: any) {
      setToast({ type: 'error', message: error.message || 'Erro ao processar recebimento.' });
    } finally {
      setIsLoading(false);
    }
  };

  const setFullReceipt = () => {
    // Helper para forçar recebimento total (seria via setValue de RHF, mas o default já é total)
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        <section className="p-8 bg-surface-card border border-surface-border rounded-3xl shadow-xl space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-brand/10 rounded-lg">
                    <User className="w-5 h-5 text-brand" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Responsável pelo Recebimento</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Atestado por: {watch('received_by')}</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="text-right hidden md:block">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Status da OC</p>
                    <span className="text-xs font-mono font-black text-brand-success bg-brand-success/10 px-2 py-1 rounded">EMITIDA #{ticket.id.toString().padStart(6, '0')}</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surface-border/50">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Identificação do Recebedor</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      {...register('received_by')}
                      className={`w-full bg-slate-950 border ${errors.received_by ? 'border-rose-500' : 'border-surface-border'} rounded-xl pl-11 pr-4 py-3 text-sm text-slate-300 focus:ring-2 focus:ring-brand outline-none`}
                    />
                 </div>
                 {errors.received_by && <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">{errors.received_by.message}</p>}
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Observações Gerais</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                    <textarea 
                      {...register('notes')}
                      placeholder="Alguma nota importante sobre a entrega ou ateste?"
                      className="w-full bg-slate-950 border border-surface-border rounded-xl pl-11 pr-4 py-3 text-sm text-slate-300 focus:ring-2 focus:ring-brand outline-none min-h-[46px] h-[46px]"
                    />
                 </div>
              </div>
           </div>
        </section>

        {isPhysical ? (
          <section className="space-y-6">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <ShoppingBag className="w-5 h-5 text-brand" />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Itens da Ordem de Compra</h3>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={setFullReceipt}
                  className="text-[10px] font-black uppercase tracking-widest h-8 border-brand/30 text-brand"
                >
                  Forçar Recebimento Total
                </Button>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {ticket.details?.itens?.map((item: any, index: number) => (
                   <ReceiptItemRow 
                     key={index}
                     index={index}
                     description={item.nome}
                     quantityPurchased={item.quantidade}
                     register={register}
                     errors={errors}
                     watchedCondition={watchedItems?.[index]?.condition}
                     watchedReceived={watchedItems?.[index]?.quantity_received}
                   />
                ))}
             </div>
          </section>
        ) : (
          <DigitalAttestationCard 
            register={register} 
            errors={errors} 
            ticketType={ticket.type} 
          />
        )}

        <div className="flex flex-col md:flex-row items-center gap-6 pt-10 border-t border-surface-border/50">
           <Button
             type="submit"
             loading={isLoading}
             className="w-full md:w-auto md:min-w-[300px] py-8 text-lg font-black uppercase tracking-[0.2em] bg-brand hover:bg-brand-hover shadow-2xl shadow-brand/20 transition-all"
           >
             <Send className="w-5 h-5 mr-3" />
             Finalizar Recebimento
           </Button>

           <div className="flex-1 p-4 bg-slate-900/40 border border-surface-border/50 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                 O envio desta confirmação é <span className="text-white font-bold">irreversível</span>. Em caso de divergência, os dados serão enviados automaticamente para o setor de Compras e Financeiro para contestação da NF.
              </p>
           </div>
        </div>
      </form>

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
