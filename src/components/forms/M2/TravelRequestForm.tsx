'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Plane, MapPin, Calendar, User, Info, AlertTriangle } from 'lucide-react';
import { travelRequestSchema, TravelRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { useRouter } from 'next/navigation';

export const TravelRequestForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<TravelRequestInput>({
        resolver: zodResolver(travelRequestSchema),
        defaultValues: {
            is_international: false,
            needs_lodging: false,
            needs_destination_car: false,
            transport_mode: 'aviao',
            travel_type: 'visita_tecnica'
        }
    });

    const departureDate = watch('departure_date');
    const isUrgent = departureDate ? (new Date(departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 5 : false;

    const onSubmit = async (data: TravelRequestInput) => {
        setIsLoading(true);
        try {
            await mockApiClient.post('/api/requests/travel', data);
            router.push('/travel?success=true');
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-20">
            {/* Header com Contexto */}
            <div className="bg-brand/5 border border-brand/20 p-6 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="p-3 bg-brand/10 rounded-2xl">
                    <Info className="w-6 h-6 text-brand" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Política de Viagens v1.4</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Lembre-se: Todas as viagens devem ser solicitadas com antecedência mínima de <span className="text-brand font-bold">15 dias</span> para voos nacionais e <span className="text-brand font-bold">30 dias</span> internacionais.
                    </p>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Coluna 1: Dados do Viajante */}
                <div className="space-y-8">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-brand" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Viajante e Destino</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nome Completo</label>
                            <input 
                                {...register('traveler_name')}
                                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl px-5 py-4 text-sm text-white focus:border-brand outline-none transition-all shadow-inner"
                                placeholder="Ex: Gelson Filho"
                            />
                            {errors.traveler_name && <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 italic">{errors.traveler_name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Origem</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input {...register('origin')} className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl pl-12 pr-4 py-4 text-xs text-white focus:border-brand outline-none" placeholder="Ex: São Paulo" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destino</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand" />
                                    <input {...register('destination')} className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl pl-12 pr-4 py-4 text-xs text-white focus:border-brand outline-none" placeholder="Ex: Miami, US" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Coluna 2: Datas e Tipo */}
                <div className="space-y-8">
                     <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-brand" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cronograma</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Partida</label>
                            <input type="date" {...register('departure_date')} className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl px-4 py-4 text-xs text-white focus:border-brand outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Retorno</label>
                            <input type="date" {...register('return_date')} className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl px-4 py-4 text-xs text-white focus:border-brand outline-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Motivo da Viagem</label>
                        <select 
                            {...register('travel_type')}
                            className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl px-4 py-4 text-xs text-white focus:border-brand outline-none appearance-none"
                        >
                            <option value="visita_tecnica">Visita Técnica</option>
                            <option value="evento">Evento / Conferência</option>
                            <option value="workshop">Workshop</option>
                            <option value="curso">Curso / Treinamento</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Seção: Justificativa de Urgência (Condicional) */}
            {isUrgent && (
                <div className="p-8 bg-rose-500/5 border-2 border-rose-500/20 rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        <h4 className="text-sm font-black text-rose-500 uppercase tracking-tighter italic">Viagem Fora do Prazo - Justificativa Mandatória</h4>
                    </div>
                    <textarea 
                        {...register('urgency_justification')}
                        placeholder="Explique detalhadamente por que esta viagem não pôde ser planejada com antecedência..."
                        className="w-full bg-slate-950 border-2 border-rose-500/30 rounded-2xl p-5 text-sm text-rose-200 placeholder:text-rose-500/40 focus:border-rose-500 outline-none h-32 transition-all shadow-inner"
                    />
                    {errors.urgency_justification && <p className="text-[10px] text-rose-500 font-black uppercase">{errors.urgency_justification.message}</p>}
                </div>
            )}

            {/* Footer com Ação */}
            <div className="pt-10 flex items-center justify-between border-t border-surface-border/50">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" {...register('is_international')} className="w-5 h-5 rounded border-surface-border bg-slate-950 text-brand focus:ring-brand" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Viagem Internacional</span>
                    </label>
                </div>

                <button 
                    disabled={isLoading}
                    className="group relative flex items-center gap-3 px-10 py-5 bg-brand hover:bg-brand-hover text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? 'Reserva em processamento...' : 'Solicitar Reserva de Viagem'}
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>
        </form>
    );
};
