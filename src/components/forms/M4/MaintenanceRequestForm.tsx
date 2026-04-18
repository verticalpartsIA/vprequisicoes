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
      recurrence: 'one_time'
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
      <div className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-2xl space-y-8">
        <div className="flex items-center gap-6 border-b border-surface-border/30 pb-8">
          <div className="p-4 bg-brand/10 rounded-2xl text-brand outline outline-4 outline-brand/5">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Identificação</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Solicitante da Manutenção</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-brand transition-colors" />
              <input 
                {...register('requester_name')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 pl-14 text-sm text-white focus:border-brand focus:ring-8 focus:ring-brand/5 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Departamento / Área</label>
            <div className="relative group">
              <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-brand transition-colors" />
              <input 
                {...register('requester_department')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 pl-14 text-sm text-white focus:border-brand outline-none transition-all"
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
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Escopo da Manutenção</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Ativo, Local e Natureza</p>
          </div>
        </div>

        {/* MENSAGEM DE EMERGÊNCIA */}
        {isEmergency && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-4 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-rose-500 uppercase">Prioridade Crítica Detectada</p>
              <p className="text-xs text-slate-300 font-medium">Esta requisição será notificada imediatamente à equipe de compras de plantão.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Manutenção</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MAINTENANCE_TYPES.map((type) => (
              <label 
                key={type.value}
                className={`relative flex items-center p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 ${
                  maintenanceType === type.value 
                    ? 'bg-brand/5 border-brand ring-4 ring-brand/10' 
                    : 'bg-slate-900 border-surface-border grayscale'
                }`}
              >
                <input type="radio" {...register('maintenance_type')} value={type.value} className="hidden" />
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-xl ${maintenanceType === type.value ? 'bg-brand text-slate-950' : 'bg-slate-950 text-slate-600'}`}>
                      {type.value === 'preventive' ? <Calendar className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tight ${maintenanceType === type.value ? 'text-white' : 'text-slate-500'}`}>
                      {type.label}
                   </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ativo / Equipamento</label>
            <input 
              {...register('asset_name')}
              placeholder="Ex: Ar Condicionado Sala 302"
              className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 text-sm text-white focus:border-brand outline-none transition-all"
            />
            {errors.asset_name && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.asset_name.message as string}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Localização (Setor/Andar)</label>
            <input 
              {...register('location')}
              placeholder="Ex: Prédio B - 3º Andar - TI"
              className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 text-sm text-white focus:border-brand outline-none transition-all"
            />
            {errors.location && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.location.message as string}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição do Problema / Escopo</label>
          <div className="relative">
             <ClipboardList className="absolute left-6 top-6 w-5 h-5 text-slate-700" />
             <textarea 
               {...register('description')}
               placeholder="Descreva o que precisa ser feito ou o defeito apresentado..."
               className="w-full bg-slate-950 border-2 border-surface-border rounded-[2rem] p-6 pl-16 h-32 text-sm text-white outline-none focus:border-brand transition-all"
             />
          </div>
          {errors.description && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.description.message as string}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prioridade</label>
              <select 
                {...register('priority')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 text-sm text-white focus:border-brand outline-none appearance-none"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
           </div>
           
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recorrência Estimada</label>
              <select 
                {...register('recurrence')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-5 text-sm text-white focus:border-brand outline-none appearance-none"
              >
                {RECURRENCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
           </div>
        </div>
      </div>

      {/* SEÇÃO 3: LÓGICA DE CONTRATO (BYPASS) */}
      <div className={`p-10 border-2 rounded-[2.5rem] shadow-2xl transition-all duration-500 ${isContract ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-surface-card border-surface-border'}`}>
        <div className="flex items-center justify-between border-b border-surface-border/30 pb-8 mb-10">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl transition-colors ${isContract ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter italic transition-colors ${isContract ? 'text-emerald-500' : 'text-white'}`}>
                {isContract ? 'Contrato Vigente Ativo' : 'Cotação de Mercado'}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Bypass de Fluxo de Compras</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-3xl border border-surface-border">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Coberto por Contrato?</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('covered_by_contract')} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
             </label>
          </div>
        </div>

        {isContract ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-500">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Nº do Contrato</label>
                <input {...register('contract_number')} className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl p-4 text-xs text-white" placeholder="CT-2024-X" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Fornecedor Vinculado</label>
                <input {...register('contract_provider')} className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl p-4 text-xs text-white" placeholder="Manutenex S.A." />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Validade</label>
                <input {...register('contract_valid_until')} type="date" className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl p-4 text-xs text-white" />
             </div>
             <div className="md:col-span-3 p-4 bg-emerald-500/10 rounded-2xl flex items-center gap-3">
                <Info className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Atenção: Esta requisição pulará a etapa de cotação e seguirá para aprovação direta do gestor.</p>
             </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4 text-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor Estimado Global (Referência)</label>
            <div className="relative group">
              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-brand transition-colors" />
              <input 
                type="number"
                step="0.01"
                {...register('estimated_value', { valueAsNumber: true })}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-full p-6 pl-16 text-2xl font-black text-white focus:border-brand text-center outline-none"
                placeholder="0,00"
              />
            </div>
            {errors.estimated_value && <p className="text-[10px] font-bold text-rose-500">{errors.estimated_value.message as string}</p>}
          </div>
        )}
      </div>

      {/* FOOTER AÇÕES STICKY */}
      <div className="sticky bottom-10 z-30 flex items-center justify-between p-8 bg-slate-900/80 backdrop-blur-3xl border-2 border-white/5 rounded-[3rem] shadow-2xl">
         <div className="hidden lg:flex items-center gap-4 ml-6">
            <div className="p-3 bg-slate-950 rounded-2xl border border-surface-border">
               <FileText className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex flex-col text-left">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow M4</span>
               <span className="text-xs font-bold text-white italic">Validado conforme Protocolo SDD</span>
            </div>
         </div>

         <div className="flex items-center gap-8 w-full lg:w-auto">
            <Button 
              type="button"
              variant="outline"
              className="h-16 px-10 border-slate-700 bg-slate-950/50 text-slate-400 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
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
