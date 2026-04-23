'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  HardHat,
  Send,
  Save,
  Loader2,
  Info,
  DollarSign,
  ClipboardList,
  Wrench,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

import { maintenanceRequestSchema, MaintenanceRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MAINTENANCE_TYPES, PRIORITY_OPTIONS, RECURRENCE_OPTIONS } from '@/../packages/modules/M4-maintenance/constants';
import { isEmergencyRequest } from '@/../packages/core/validation/maintenanceRules';

export const MaintenanceRequestForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<MaintenanceRequestInput>({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      requester_name: 'Gelson Filho',
      requester_department: 'Manutenção / Infraestrutura',
      maintenance_type: 'preventive',
      priority: 'medium',
      covered_by_contract: false,
      recurrence: 'one_time',
      contract_frequency: 'monthly',
      auto_renew: true
    }
  });

  const maintenanceType = watch('maintenance_type');
  const priority = watch('priority');
  const isContract = watch('covered_by_contract');
  const isEmergency = isEmergencyRequest(maintenanceType, priority);

  const onSubmit = async (data: MaintenanceRequestInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Processando requisição de manutenção...');

    try {
      const res: any = await mockApiClient.post('/api/requests/maintenance', data);

      if (data.covered_by_contract) {
        toast.success(`Ticket ${res.data.ticket_number} APROVADO via Contrato Vigente!`, { id: toastId });
      } else {
        toast.success(`Ticket ${res.data.ticket_number} enviado para cotação.`, { id: toastId });
      }

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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Solicitante da Manutenção</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Input
            label="Nome"
            tooltip="Nome do colaborador solicitante do serviço"
            {...register('requester_name')}
            error={errors.requester_name?.message}
            icon={<User className="w-5 h-5 text-slate-600 group-focus-within:text-brand transition-colors" />}
          />
          <Input
            label="Departamento / Área"
            tooltip="Setor que utilizará o serviço de manutenção"
            {...register('requester_department')}
            error={errors.requester_department?.message}
            icon={<Building2 className="w-5 h-5 text-slate-600 group-focus-within:text-brand transition-colors" />}
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
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Escopo da Manutenção</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Ativo, Local e Natureza</p>
          </div>
        </div>

        {/* MENSAGEM DE EMERGÊNCIA */}
        {isEmergency && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-4 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-rose-500 uppercase">Prioridade Crítica Detectada</p>
              <p className="text-xs text-slate-700 font-medium">Esta requisição será notificada imediatamente à equipe de compras de plantão.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Tipo de Manutenção</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MAINTENANCE_TYPES.map((type) => (
              <label
                key={type.value}
                className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  maintenanceType === type.value
                    ? 'bg-brand/5 border-brand ring-4 ring-brand/10'
                    : 'bg-slate-50 border-surface-border grayscale'
                }`}
              >
                <input type="radio" {...register('maintenance_type')} value={type.value} className="hidden" />
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-xl ${maintenanceType === type.value ? 'bg-brand text-slate-950' : 'bg-white text-slate-600'}`}>
                      {type.value === 'preventive' ? <Calendar className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tight ${maintenanceType === type.value ? 'text-slate-900' : 'text-slate-500'}`}>
                      {type.label}
                   </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Ativo / Equipamento"
            placeholder="Ex: Ar Condicionado Sala 302"
            tooltip="Nome do equipamento ou área predial a ser reparada"
            {...register('asset_name')}
            error={errors.asset_name?.message}
          />
          <Input
            label="Localização (Setor/Andar)"
            placeholder="Ex: Prédio B - 3º Andar - TI"
            tooltip="Andar, bloco, sala ou coordenada interna"
            {...register('location')}
            error={errors.location?.message}
          />
        </div>

        <Textarea
          label="Descrição do Problema / Escopo"
          icon={<ClipboardList className="w-5 h-5" />}
          placeholder="Descreva o que precisa ser feito ou o defeito apresentado..."
          {...register('description')}
          error={errors.description?.message}
          tooltip="Seja específico. Informe sintomas, códigos de erro ou detalhes técnicos para facilitar a cotação."
          className="min-h-[120px]"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Select
             label="Prioridade"
             {...register('priority')}
             error={errors.priority?.message}
             tooltip="Prioridades Crítica/Emergência são tratadas como urgência e notificadas imediatamente."
           >
             {PRIORITY_OPTIONS.map(opt => (
               <option key={opt.value} value={opt.value}>{opt.label}</option>
             ))}
           </Select>

           <Select
             label="Recorrência Estimada"
             {...register('recurrence')}
             error={errors.recurrence?.message}
             tooltip="Indique se este serviço é pontual ou precisará ser repetido periodicamente."
           >
             {RECURRENCE_OPTIONS.map(opt => (
               <option key={opt.value} value={opt.value}>{opt.label}</option>
             ))}
           </Select>
        </div>
      </div>

      {/* SEÇÃO 3: LÓGICA DE CONTRATO (BYPASS) */}
      <div className={`p-10 border-2 rounded-[2.5rem] shadow-md transition-all duration-500 ${isContract ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-surface-card border-surface-border'}`}>
        <div className="flex items-center justify-between border-b border-surface-border pb-8 mb-10">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl transition-colors ${isContract ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-500'}`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter italic transition-colors ${isContract ? 'text-emerald-500' : 'text-slate-900'}`}>
                {isContract ? 'Contrato Vigente Ativo' : 'Cotação de Mercado'}
              </h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Bypass de Fluxo de Compras</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-surface-border">
             <span className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Coberto por Contrato?</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('covered_by_contract')} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
             </label>
          </div>
        </div>

        {isContract ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
             <Input
                label="Nº do Contrato"
                placeholder="CT-2024-X"
                tooltip="Número do contrato jurídico ativo na VerticalParts"
                {...register('contract_number')}
                error={errors.contract_number?.message}
                className="border-emerald-500/20"
                required
             />
             <Input
                label="Fornecedor Vinculado"
                placeholder="Manutenex S.A."
                {...register('contract_provider')}
                error={errors.contract_provider?.message}
                className="border-emerald-500/20"
                required
             />

             <Select
                label="Frequência"
                {...register('contract_frequency')}
                error={errors.contract_frequency?.message}
                className="border-emerald-500/20"
             >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="semi-annual">Semestral</option>
                <option value="annual">Anual</option>
             </Select>

             <Input
                label="Próxima Execução"
                type="date"
                tooltip="Data da próxima execução prevista conforme cronograma contratual"
                {...register('next_due_date')}
                error={errors.next_due_date?.message}
                className="border-emerald-500/20"
                required
             />

             <div className="flex items-center gap-3 col-span-full">
                <input type="checkbox" {...register('auto_renew')} id="auto_renew" className="w-5 h-5 rounded border-slate-300 bg-slate-100 text-emerald-500 focus:ring-emerald-500" />
                <label htmlFor="auto_renew" className="text-xs font-semibold text-slate-500 uppercase tracking-widest cursor-pointer">Renovação Automática de Vigência</label>
             </div>

             <div className="md:col-span-full p-4 bg-emerald-500/10 rounded-2xl flex items-center gap-3">
                <Info className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Fluxo Acelerado: Esta requisição pulará a etapa de cotação competitiva por possuir acordo comercial prévio.</p>
             </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4 text-center">
            <Input
              label="Valor Estimado Global (Referência)"
              type="number"
              step="0.01"
              icon={<DollarSign className="w-6 h-6" />}
              {...register('estimated_value', { valueAsNumber: true })}
              error={errors.estimated_value?.message}
              tooltip="Valor aproximado do serviço para balizamento de cotações."
              className="text-2xl font-black text-center h-20 rounded-full"
              placeholder="0,00"
              required
            />
          </div>
        )}
      </div>

      {/* FOOTER AÇÕES STICKY */}
      <div className="sticky bottom-10 z-30 flex items-center justify-between p-8 bg-white border-2 border-slate-200 rounded-[3rem] shadow-md">
         <div className="hidden lg:flex items-center gap-4 ml-6">
            <div className="p-3 bg-slate-50 rounded-2xl border border-surface-border">
               <FileText className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex flex-col text-left">
               <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Workflow M4</span>
               <span className="text-xs font-bold text-slate-900 italic">Validado conforme Protocolo SDD</span>
            </div>
         </div>

         <div className="flex items-center gap-8 w-full lg:w-auto">
            <Button
              type="button"
              variant="outline"
              className="h-16 px-10 border-slate-300 bg-white text-slate-400 hover:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Save className="w-4 h-4 mr-3" /> Rascunho
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`h-16 px-14 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 ${
                isContract ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-brand text-slate-950 hover:bg-brand-light shadow-brand/20'
              }`}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isContract ? 'Submeter Aprovação Direta' : 'Submeter para Cotação'}
            </Button>
         </div>
      </div>

    </form>
  );
};
