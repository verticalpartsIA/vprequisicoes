'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceRequestSchema, ServiceRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  MapPin, 
  Layers, 
  CalendarClock, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';

import { ProviderSelector } from './ProviderSelector';
import { MilestoneTable } from './MilestoneTable';

export const ServiceRequestForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const methods = useForm<ServiceRequestInput>({
        resolver: zodResolver(serviceRequestSchema),
        defaultValues: {
            service_type: 'maintenance',
            provider_type: 'PJ',
            payment_by_milestone: false,
            milestones: []
        }
    });

    const { register, handleSubmit, watch, formState: { errors }, control } = methods;
    const isByMilestone = watch('payment_by_milestone');
    const serviceType = watch('service_type');

    const onSubmit = async (data: ServiceRequestInput) => {
        setIsLoading(true);
        try {
            await mockApiClient.post('/api/requests/services', data);
            router.push('/services?success=true');
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-16 pb-32">
                {/* Stepper Visual */}
                <div className="flex items-center justify-center gap-4 mb-20 animate-in fade-in zoom-in-95 duration-500">
                    {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2 ${
                                currentStep === step ? 'bg-brand border-brand text-slate-950 scale-110 shadow-lg shadow-brand/20' : 
                                currentStep > step ? 'bg-brand/20 border-brand/40 text-brand' : 'bg-slate-900 border-surface-border text-slate-600'
                            }`}>
                                {step}
                            </div>
                            {step < 3 && <div className={`h-1 w-12 rounded-full transition-all duration-1000 ${currentStep > step ? 'bg-brand' : 'bg-slate-900'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Definição do Escopo */}
                {currentStep === 1 && (
                    <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                        <header className="space-y-2">
                             <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-brand" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Definição do Escopo de Serviço</h3>
                             </div>
                             <p className="text-xs text-slate-500 font-medium max-w-xl">Identifique a natureza do serviço e forneça o endereço exato para mobilização da equipe.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Modalidade</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['maintenance', 'installation'].map((type) => (
                                        <label key={type} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${serviceType === type ? 'bg-brand/10 border-brand text-white' : 'bg-slate-900 border-surface-border text-slate-600'}`}>
                                            <input type="radio" {...register('service_type')} value={type} className="hidden" />
                                            <span className="text-xs font-black uppercase tracking-widest">{type === 'maintenance' ? 'Manutenção' : 'Instalação'}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Local de Execução</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input {...register('location_address')} className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl pl-12 pr-4 py-4 text-xs text-white focus:border-brand outline-none" placeholder="Rua, Número, Bairro, Cidade - UF" />
                                </div>
                                {errors.location_address && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.location_address.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-brand" />
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Escopo Técnico Detalhado</label>
                            </div>
                            <textarea 
                                {...register('scope_description')}
                                className="w-full bg-slate-950 border-2 border-surface-border rounded-3xl p-6 text-sm text-slate-300 focus:border-brand outline-none h-48 transition-all resize-none shadow-inner"
                                placeholder="Descreva todas as etapas do serviço, materiais inclusos e resultados esperados..."
                            />
                            {errors.scope_description && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.scope_description.message}</p>}
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                onClick={() => setCurrentStep(2)}
                                className="group flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-surface-border text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Próximo: Fornecedor
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Fornecedor Sugerido */}
                {currentStep === 2 && (
                    <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                        <header className="space-y-2">
                             <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-brand" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Seleção de Fornecedor Sugerido</h3>
                             </div>
                             <p className="text-xs text-slate-500 font-medium max-w-xl">O Compras realizará a homologação final, mas você deve indicar o fornecedor preferencial ou pré-negociado.</p>
                        </header>

                        <ProviderSelector register={register} errors={errors} control={control} />

                        <div className="flex justify-between">
                            <button type="button" onClick={() => setCurrentStep(1)} className="px-8 py-4 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">Voltar</button>
                            <button 
                                type="button" 
                                onClick={() => setCurrentStep(3)}
                                className="group flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-surface-border text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Próximo: Condição de Pagamento
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Cronograma de Pagamento / Milestones */}
                {currentStep === 3 && (
                    <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                        <header className="space-y-2">
                             <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-brand" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Condições de Faturamento</h3>
                             </div>
                             <p className="text-xs text-slate-500 font-medium max-w-xl">Defina se o pagamento será integral após a conclusão ou dividido por marcos de faturamento (milestones).</p>
                        </header>

                        <div className="space-y-8">
                            <label className={`flex items-center gap-4 p-8 border-2 rounded-3xl cursor-pointer transition-all duration-300 ${isByMilestone ? 'bg-brand/5 border-brand ring-4 ring-brand/10' : 'bg-slate-900 border-surface-border'}`}>
                                <div className={`p-4 rounded-xl ${isByMilestone ? 'bg-brand text-slate-950' : 'bg-slate-950 text-slate-500'}`}>
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                         <span className="text-sm font-black uppercase tracking-tighter text-white">Pagamento Por Etapa (Milestones)</span>
                                         <input type="checkbox" {...register('payment_by_milestone')} className="w-6 h-6 rounded border-surface-border bg-slate-950 text-brand focus:ring-brand" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Ideal para projetos longos ou obras com medições quinzenais.</p>
                                </div>
                            </label>

                            {isByMilestone && (
                                <MilestoneTable control={control} register={register} errors={errors} />
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-surface-border">
                            <button type="button" onClick={() => setCurrentStep(2)} className="px-8 py-4 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">Voltar</button>
                            
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex items-center gap-3 px-12 py-5 bg-brand hover:bg-brand-hover text-slate-950 rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl shadow-brand/20"
                            >
                                {isLoading ? 'Processando Requisição...' : 'Finalizar e Enviar Requisição'}
                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </FormProvider>
    );
};
