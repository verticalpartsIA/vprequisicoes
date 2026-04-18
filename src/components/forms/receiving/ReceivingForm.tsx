'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  PackageCheck, 
  User, 
  FileText, 
  Truck, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';
import { receivingSchema, ReceivingInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { useRouter } from 'next/navigation';

import { ReceiptItemRow } from './ReceiptItemRow';
import { DigitalAttestationCard } from './DigitalAttestationCard';

interface ReceivingFormProps {
    ticket: any;
}

export const ReceivingForm = ({ ticket }: ReceivingFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Determinar se o recebimento é físico (M1/M4) ou digital (M2/M3)
    const isPhysical = useMemo(() => ['M1', 'M4'].includes(ticket.type), [ticket.type]);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ReceivingInput>({
        resolver: zodResolver(receivingSchema),
        defaultValues: {
            type: isPhysical ? 'physical' : 'digital',
            received_by: '',
            notes: '',
            items: isPhysical ? ticket.quotation.items.map((item: any) => ({
                purchase_order_item_id: item.request_item_id || 'item-1',
                description: item.description || 'Item Comprado',
                quantity_purchased: item.suppliers.find((s: any) => s.is_winner)?.quantity || 1, // Fallback p/ mock
                quantity_received: item.suppliers.find((s: any) => s.is_winner)?.quantity || 1,
                condition: 'ok'
            })) : []
        }
    });

    const watchedItems = watch('type') === 'physical' ? (watch() as any).items : [];

    const onSubmit = async (data: ReceivingInput) => {
        setIsLoading(true);
        try {
            const endpoint = `/api/receiving/tickets/${ticket.id}/${data.type}`;
            await mockApiClient.post(endpoint, data);
            
            // Sucesso
            router.push(`/receiving?success=${ticket.id}`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-24 max-w-5xl mx-auto">
            {/* Header de Identificação do Recebedor */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-8 space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-brand" />
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Responsável pela Conferência</label>
                    </div>
                    <div className="relative">
                        <input 
                            {...register('received_by')}
                            className={`w-full bg-slate-950 border-2 ${errors.received_by ? 'border-rose-500' : 'border-surface-border'} rounded-2xl px-6 py-5 text-sm text-white focus:border-brand outline-none transition-all shadow-inner`}
                            placeholder="Seu nome completo ou registro funcional..."
                        />
                        {errors.received_by && <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 italic">{errors.received_by.message as string}</p>}
                    </div>
                </div>

                <div className="md:col-span-4 p-5 bg-slate-900/50 border border-surface-border rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-brand/10 rounded-xl">
                        <Calendar className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Data do Recebimento</p>
                        <p className="text-xs font-bold text-slate-300">{new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            </div>

            {/* Seção Dinâmica: Itens (Físico) ou Ateste (Digital) */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <PackageCheck className="w-5 h-5 text-brand" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Detalhes do Recebimento</h3>
                </div>

                {isPhysical ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {watchedItems?.map((item: any, index: number) => (
                            <ReceiptItemRow 
                                key={index}
                                index={index}
                                description={item.description}
                                quantityPurchased={item.quantity_purchased}
                                register={register}
                                errors={errors}
                                watchedCondition={item.condition}
                                watchedReceived={item.quantity_received}
                            />
                        ))}
                    </div>
                ) : (
                    <DigitalAttestationCard register={register} errors={errors} ticketType={ticket.type} />
                )}
            </div>

            {/* Observações Gerais */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Observações Adicionais</label>
                </div>
                <textarea 
                    {...register('notes')}
                    className="w-full bg-slate-950 border-2 border-surface-border rounded-3xl p-6 text-sm text-slate-300 focus:border-brand outline-none h-32 transition-all resize-none shadow-inner"
                    placeholder="Alguma observação relevante sobre o estado da embalagem, transportadora ou execução do serviço?"
                />
            </div>

            {/* Footer de Ação */}
            <div className="pt-10 flex flex-col md:flex-row items-center justify-between border-t border-surface-border/50 gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conferência Final</span>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Protocolo Seguro</span>
                    </div>
                </div>

                <button 
                    disabled={isLoading}
                    className="group relative w-full md:w-auto flex items-center justify-center gap-4 px-12 py-6 bg-brand hover:bg-brand-hover text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl shadow-brand/20"
                >
                    {isLoading ? 'Registrando Entrada...' : 'Concluir Recebimento e Notificar'}
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>
        </form>
    );
};
