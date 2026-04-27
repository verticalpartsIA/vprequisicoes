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
import { realPost } from '@/lib/api/real-client';
import { MilestoneTable } from '../services/MilestoneTable';
import { ProviderSelector } from '../services/ProviderSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      const res: any = await realPost('/api/requests/services', data);
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
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-md space-y-8">
        <div className="flex items-center gap-6 border-b border-surface-border pb-8">
          <div className="p-4 bg-brand/10 rounded-2xl text-brand outline outline-4 outline-brand/5">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Identificação</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Dados do Solicitante Interno</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Input
            label="Nome do Solicitante"
            tooltip="Nome completo do colaborador solicitante"
            icon={<User className="w-5 h-5" />}
            {...register('requester_name')}
            error={errors.requester_name?.message}
          />

          <Input
            label="Departamento"
            tooltip="Centro de custo ou área responsável pelo serviço"
            icon={<Building2 className="w-5 h-5" />}
            {...register('requester_department')}
            error={errors.requester_department?.message}
          />
        </div>
      </div>

      {/* SEÇÃO 2: DETALHES TÉCNICOS */}
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-md space-y-10">
        <div className="flex items-center gap-6 border-b border-surface-border pb-8">
          <div className="p-4 bg-brand/10 rounded-2xl text-brand">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Escopo do Serviço</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tipo, Descrição e Endereço</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Modalidade de Serviço</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICE_TYPES.map((type) => (
              <label
                key={type.value}
                className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  serviceType === type.value
                    ? 'bg-brand/5 border-brand ring-4 ring-brand/10'
                    : 'bg-slate-50 border-surface-border grayscale'
                }`}
              >
                <input type="radio" {...register('service_type')} value={type.value} className="hidden" />
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-xl ${serviceType === type.value ? 'bg-brand text-slate-950' : 'bg-white text-slate-600'}`}>
                      {type.value === 'maintenance' ? <Briefcase className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tight ${serviceType === type.value ? 'text-slate-900' : 'text-slate-500'}`}>
                      {type.label}
                   </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Descrição Detalhada do Escopo</label>
          <div className="relative">
             <ClipboardList className="absolute left-6 top-6 w-5 h-5 text-slate-700" />
             <textarea
               {...register('scope_description')}
               placeholder="Descreva a mão de obra necessária, ferramentas exigidas e cronograma desejado..."
               className="w-full bg-white border-2 border-surface-border rounded-[2rem] p-6 pl-16 h-40 text-sm text-slate-900 outline-none focus:border-brand focus:ring-8 focus:ring-brand/5 transition-all scrollbar-hide"
             />
          </div>
          {errors.scope_description && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.scope_description.message as string}</p>}
        </div>

        <Input
          label="Local de Execução (Endereço Completo)"
          tooltip="Endereço exato onde o serviço será realizado"
          icon={<MapPin className="w-5 h-5" />}
          {...register('location_address')}
          error={errors.location_address?.message}
        />

        {/* CAMPOS CONDICIONAIS PARA INSTALAÇÃO */}
        {serviceType === 'installation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white border border-brand/20 rounded-[2rem] animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white border border-brand/20 rounded-[2rem] animate-in zoom-in-95 duration-500">
             <Input
               label="Código da Obra"
               tooltip="Código identificador do projeto no sistema de obras"
               {...register('work_code')}
               error={errors.work_code?.message}
               placeholder="Ex: OBRA-2024-XPTO"
               required
             />
             <Input
               label="Endereço da Obra"
               tooltip="Endereço específico do canteiro de obras"
               {...register('work_address')}
               error={errors.work_address?.message}
             />
          </div>
          </div>
        )}
      </div>

      {/* SEÇÃO 3: PAGAMENTO E MEDIÇÃO */}
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-md space-y-10">
        <div className="flex items-center justify-between border-b border-surface-border pb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Pagamento</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Medição e Valor Estimado</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-surface-border">
             <span className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Pago por Medição?</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('payment_by_milestone')} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
             </label>
          </div>
        </div>

        {payByMilestone && (
          <MilestoneTable control={control as any} register={register} errors={errors} />
        )}

        <div className="max-w-md mx-auto pt-10 border-t border-surface-border">
          <Input
            label="Valor Estimado (Global)"
            tooltip="Valor total de referência para o serviço"
            icon={<DollarSign className="w-6 h-6" />}
            type="number"
            step="0.01"
            className="text-2xl font-black text-emerald-500 text-center h-20"
            {...register('estimated_value', { valueAsNumber: true })}
            error={errors.estimated_value?.message}
            hint="Referência inicial para negociação competitiva"
          />
        </div>
      </div>

      {/* SEÇÃO 4: FORNECEDOR SUGERIDO */}
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-md space-y-10">
        <div className="flex items-center gap-6 border-b border-surface-border pb-8">
          <div className="p-4 bg-brand/10 rounded-2xl text-brand">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Fornecedor Sugerido</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Indicação de Terceiro</p>
          </div>
        </div>

        <ProviderSelector register={register} errors={errors} control={control as any} />
      </div>

      {/* FOOTER AÇÕES STICKY */}
      <div className="sticky bottom-10 z-30 flex items-center justify-between p-8 bg-white border-2 border-slate-200 rounded-[3rem] shadow-md">
         <div className="hidden lg:flex items-center gap-4 ml-6">
            <div className="p-3 bg-slate-50 rounded-2xl border border-surface-border">
               <Info className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex flex-col">
               <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Status da Requisição</span>
               <span className="text-xs font-bold text-slate-900 italic">Aguardando preenchimento total...</span>
            </div>
         </div>

         <div className="flex items-center gap-8 w-full lg:w-auto">
            <Button
              type="button"
              variant="outline"
              className="h-16 px-10 border-slate-300 bg-white text-slate-400 hover:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
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
