'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Settings, AlertOctagon, FileCheck, Building, User, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { maintenanceRequestSchema, MaintenanceRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { useRouter } from 'next/navigation';

export const MaintenanceRequestForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<MaintenanceRequestInput>({
        resolver: zodResolver(maintenanceRequestSchema),
        defaultValues: {
            maintenance_type: 'corrective',
            priority: 'medium',
            covered_by_contract: false,
            recurrence: 'one_time'
        }
    });

    const isContract = watch('covered_by_contract');
    const priority = watch('priority');

    const onSubmit = async (data: MaintenanceRequestInput) => {
        setIsLoading(true);
        try {
            await mockApiClient.post('/api/requests/maintenance', data);
            router.push('/maintenance?success=true');
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-16 pb-32">
            {/* Header / Alerta de Segurança */}
            <div className="relative overflow-hidden p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldAlert className="w-32 h-32 text-rose-500" />
                </div>
                <div className="relative flex items-start gap-6">
                    <div className="p-4 bg-rose-500/10 rounded-2xl">
                        <AlertOctagon className="w-8 h-8 text-rose-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Protocolo M4 - Manutenção Crítica</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-2xl">
                            Requisições de manutenção corretiva com prioridade <span className="text-rose-500 font-bold underline">EMERGÊNCIA</span> são tratadas em regime de urgência 24/7. Certifique-se da real necessidade antes de submeter.
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Coluna Esquerda: Dados e Ativo */}
                <div className="lg:col-span-7 space-y-12">
                    <section className="space-y-8">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand/10 rounded-lg">
                                <Settings className="w-4 h-4 text-brand" />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identificação do Ativo</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Equipamento / Ativo</label>
                                <input 
                                    {...register('asset_name')}
                                    className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl px-5 py-4 text-sm text-white focus:border-brand outline-none transition-all shadow-inner"
                                    placeholder="Ex: Ar Condicionado Central - Bloco B"
                                />
                                {errors.asset_name && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.asset_name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo</label>
                                <select {...register('maintenance_type')} className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl px-4 py-4 text-xs text-white focus:border-brand outline-none appearance-none">
                                    <option value="preventive">Preventiva (Planejada)</option>
                                    <option value="corrective">Corretiva (Quebra/Falha)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prioridade</label>
                                <select {...register('priority')} className={`w-full border-2 rounded-2xl px-4 py-4 text-xs font-bold outline-none appearance-none transition-colors ${
                                    priority === 'emergency' ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-slate-950 border-surface-border text-white'
                                }`}>
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                    <option value="emergency">EMERGÊNCIA</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição do Problema / Escopo</label>
                            <textarea 
                                {...register('description')}
                                className="w-full bg-slate-950 border-2 border-surface-border rounded-3xl p-6 text-sm text-slate-300 focus:border-brand outline-none h-40 transition-all resize-none shadow-inner"
                                placeholder="Descreva os sintomas da falha ou o escopo da manutenção preventiva..."
                            />
                            {errors.description && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.description.message}</p>}
                        </div>
                    </section>
                </div>

                {/* Coluna Direita: Contrato e Alçada */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Card de Mecanismo de Bypass */}
                    <div className={`p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col gap-6 ${
                        isContract ? 'bg-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'bg-slate-900/50 border-surface-border'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileCheck className={`w-5 h-5 ${isContract ? 'text-emerald-500' : 'text-slate-500'}`} />
                                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isContract ? 'text-emerald-500' : 'text-slate-500'}`}>Motor de Aprovação</h4>
                            </div>
                            <input type="checkbox" {...register('covered_by_contract')} className="w-6 h-6 rounded border-surface-border bg-slate-950 text-emerald-500 focus:ring-emerald-500" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-black text-white uppercase tracking-tighter">Possui Contrato Vigente?</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                Se marcado, a requisição <span className="text-emerald-500">ignora o fluxo de cotações</span> e segue diretamente para aprovação da gestor.
                            </p>
                        </div>

                        {isContract ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-emerald-500/70 uppercase tracking-widest ml-1">Número do Contrato</label>
                                    <input {...register('contract_number')} className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none" placeholder="Ex: CT-2024-088" />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="text-[9px] font-black text-emerald-200 uppercase tracking-widest italic leading-tight">Workflow Acelerado Ativado</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor Estimado</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">R$</span>
                                        <input type="number" step="0.01" {...register('estimated_value', { valueAsNumber: true })} className="w-full bg-slate-950 border border-surface-border rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-brand outline-none" />
                                    </div>
                                    {errors.estimated_value && <p className="text-[8px] text-rose-500 font-black uppercase mt-1">{errors.estimated_value.message}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Informações Auxiliares */}
                    <div className="p-6 bg-slate-950/50 border border-surface-border rounded-2xl space-y-4">
                        <div className="flex items-center gap-4 text-slate-600">
                            <Building className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Unidade: Matriz VerticalParts</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600">
                            <User className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Solicitante: Engenharia de Campo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer de Ação */}
            <div className="pt-10 flex items-center justify-end border-t border-surface-border/50">
                <button 
                    disabled={isLoading}
                    className="group relative flex items-center gap-4 px-12 py-6 bg-brand hover:bg-brand-hover text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl shadow-brand/20"
                >
                    {isLoading ? 'Transmitindo Protocolo...' : 'Gerar Ordem de Manutenção'}
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>
        </form>
    );
};
