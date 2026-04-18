'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  MapPin, 
  User, 
  Building2,
  HardHat,
  Send,
  Save,
  Loader2,
  Info,
  DollarSign,
  ClipboardList,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';

import { serviceRequestSchema, ServiceRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { MilestoneTable } from '../services/MilestoneTable';
import { ProviderSelector } from '../services/ProviderSelector';
import { Button } from '@/components/ui/button';
import { SERVICE_TYPES } from '@/../packages/modules/M3-services/constants';

export const ServiceRequestForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<ServiceRequestInput>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      requester_name: 'Gelson Filho',
      requester_department: 'Manutenção / Engenharia',
      service_type: 'maintenance',
      payment_by_milestone: false,
      milestones: [],
      provider_type: 'PJ'
    }
  });

  const serviceType = watch('service_type');
  const payByMilestone = watch('payment_by_milestone');

  const onSubmit = async (data: ServiceRequestInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Processando requisição de serviços...');
    
    try {
      const res: any = await mockApiClient.post('/api/requests/services', data);
      toast.success(`Ticket ${res.data.ticket_number} gerado com sucesso!`, { id: toastId });
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar requisição', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* SEÇÃO 1: IDENTIFICAÇÃO */}
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-2xl space-y-8">
        <div className="flex items-center gap-6 border-b border-surface-border/30 pb-8">
          <div className="p-4 bg-brand/10 rounded-2xl text-brand outline outline-4 outline-brand/5">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Identificação</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Dados do Solicitante Interno</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Solicitante</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-brand transition-colors" />
              <input 
                {...register('requester_name')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 pl-14 text-sm text-white focus:border-brand focus:ring-8 focus:ring-brand/5 outline-none transition-all shadow-inner"
              />
            </div>
            {errors.requester_name && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.requester_name.message as string}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
            <div className="relative group">
              <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-brand transition-colors" />
              <input 
                {...register('requester_department')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 pl-14 text-sm text-white focus:border-brand focus:ring-8 focus:ring-brand/5 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: DETALHES TÉCNICOS */}
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-2xl space-y-10">
        <div className="flex items-center gap-6 border-b border-surface-border/30 pb-8">
          <div className="p-4 bg-brand/10 rounded-2xl text-brand">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Escopo do Serviço</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Tipo, Descrição e Endereço</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Modalidade de Serviço</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICE_TYPES.map((type) => (
              <label 
                key={type.value}
                className={`relative flex items-center p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 ${
                  serviceType === type.value 
                    ? 'bg-brand/5 border-brand ring-4 ring-brand/10' 
                    : 'bg-slate-900 border-surface-border grayscale'
                }`}
              >
                <input type="radio" {...register('service_type')} value={type.value} className="hidden" />
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-xl ${serviceType === type.value ? 'bg-brand text-slate-950' : 'bg-slate-950 text-slate-600'}`}>
                      {type.value === 'maintenance' ? <Briefcase className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tight ${serviceType === type.value ? 'text-white' : 'text-slate-500'}`}>
                      {type.label}
                   </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição Detalhada do Escopo</label>
          <div className="relative">
             <ClipboardList className="absolute left-6 top-6 w-5 h-5 text-slate-700" />
             <textarea 
               {...register('scope_description')}
               placeholder="Descreva a mão de obra necessária, ferramentas exigidas e cronograma desejado..."
               className="w-full bg-slate-950 border-2 border-surface-border rounded-[2rem] p-6 pl-16 h-40 text-sm text-white outline-none focus:border-brand focus:ring-8 focus:ring-brand/5 transition-all scrollbar-hide"
             />
          </div>
          {errors.scope_description && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.scope_description.message as string}</p>}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Local de Execução (Endereço Completo)</label>
          <div className="relative group">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-brand transition-colors" />
            <input 
              {...register('location_address')}
              className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 pl-14 text-sm text-white focus:border-brand outline-none transition-all"
            />
          </div>
          {errors.location_address && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.location_address.message as string}</p>}
        </div>

        {/* CAMPOS CONDICIONAIS PARA INSTALAÇÃO */}
        {serviceType === 'installation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-900/30 border border-brand/20 rounded-[2rem] animate-in zoom-in-95 duration-500">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-1">Código da Obra (Obrigatório)</label>
                <input 
                  {...register('work_code')}
                  className="w-full bg-slate-950 border-2 border-brand/20 rounded-2xl p-4 text-xs text-white focus:border-brand outline-none"
                  placeholder="Ex: OBRA-2024-XPTO"
                />
                {errors.work_code && <p className="text-[10px] font-bold text-rose-500">{errors.work_code.message as string}</p>}
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Endereço da Obra</label>
                <input 
                  {...register('work_address')}
                  className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-4 text-xs text-white focus:border-brand outline-none"
                />
             </div>
          </div>
        )}
      </div>

      {/* SEÇÃO 3: PAGAMENTO E MEDIÇÃO */}
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-2xl space-y-10">
        <div className="flex items-center justify-between border-b border-surface-border/30 pb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Pagamento</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Medição e Valor Estimado</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-3xl border border-surface-border">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pago por Medição?</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('payment_by_milestone')} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
             </label>
          </div>
        </div>

        {payByMilestone && (
          <MilestoneTable control={control} register={register} errors={errors} />
        )}

        <div className="max-w-md mx-auto space-y-4 pt-10 border-t border-surface-border/20 text-center">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor Estimado (Global)</label>
          <div className="relative group">
            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="number"
              step="0.01"
              {...register('estimated_value', { valueAsNumber: true })}
              className="w-full bg-slate-950 border-2 border-surface-border rounded-full p-6 pl-16 text-2xl font-black text-emerald-500 focus:border-emerald-500 ring-8 ring-emerald-500/0 focus:ring-emerald-500/5 outline-none transition-all text-center"
              placeholder="0,00"
            />
          </div>
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Referência inicial para negociação competitiva</p>
        </div>
      </div>

      {/* SEÇÃO 4: FORNECEDOR SUGERIDO */}
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-2xl space-y-10">
        <div className="flex items-center gap-6 border-b border-surface-border/30 pb-8">
          <div className="p-4 bg-brand/10 rounded-2xl text-brand">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Fornecedor Sugerido</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Indicação de Terceiro</p>
          </div>
        </div>

        <ProviderSelector register={register} errors={errors} control={control} />
      </div>

      {/* FOOTER AÇÕES STICKY */}
      <div className="sticky bottom-10 z-30 flex items-center justify-between p-8 bg-slate-900/80 backdrop-blur-3xl border-2 border-white/5 rounded-[3rem] shadow-2xl">
         <div className="hidden lg:flex items-center gap-4 ml-6">
            <div className="p-3 bg-slate-950 rounded-2xl border border-surface-border">
               <Info className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status da Requisição</span>
               <span className="text-xs font-bold text-white italic">Aguardando preenchimento total...</span>
            </div>
         </div>

         <div className="flex items-center gap-8 w-full lg:w-auto">
            <Button 
              type="button"
              variant="outline"
              className="h-16 px-10 border-slate-700 bg-slate-950/50 text-slate-400 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Save className="w-4 h-4 mr-3" /> Salvar Rascunho
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="h-16 px-14 bg-brand text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-light shadow-xl shadow-brand/20 transition-all flex items-center gap-3"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Submeter para Cotação
            </Button>
         </div>
      </div>

    </form>
  );
};
