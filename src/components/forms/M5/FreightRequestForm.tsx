'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, Send, ClipboardList, MapPin, Package, Calendar, Save, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { freightRequestSchema, FreightRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CARGO_TYPES, FREIGHT_DIRECTIONS } from '@/../packages/modules/M5-freight/constants';

export const FreightRequestForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<FreightRequestInput>({
    resolver: zodResolver(freightRequestSchema),
    mode: 'onBlur',
    defaultValues: {
      direction: 'inbound',
      origin: '',
      destination: 'VerticalParts',
      cargo_type: '',
      weight_kg: 0,
      dimensions: '',
      justification: '',
      desired_date: ''
    }
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = methods;

  const direction = watch('direction');

  useEffect(() => {
    if (direction === 'inbound') {
      setValue('destination', 'VerticalParts');
      if (watch('origin') === 'VerticalParts') setValue('origin', '');
    } else {
      setValue('origin', 'VerticalParts');
      if (watch('destination') === 'VerticalParts') setValue('destination', '');
    }
  }, [direction, setValue, watch]);

  const onSubmit = async (data: FreightRequestInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Processando requisição de frete...');

    try {
      const response: any = await mockApiClient.post('/api/requests/freight', data);
      toast.success(`Ticket ${response.data.ticket_number} gerado com sucesso!`, { id: toastId });

      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar requisição.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

        {/* SEÇÃO 1: ROTA */}
        <div id="m5-rota" className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-md space-y-8">
          <div className="flex items-center gap-6 border-b border-surface-border pb-8">
            <div className="p-4 bg-brand/10 rounded-2xl text-brand">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Rota de Transporte</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Direção e Endereços</p>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1 text-center block">Tipo de Movimentação</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FREIGHT_DIRECTIONS.map((dir) => (
                <label
                  key={dir.value}
                  className={`relative flex items-center p-8 border-2 rounded-[2rem] cursor-pointer transition-all duration-300 ${
                    direction === dir.value
                      ? 'bg-brand/5 border-brand ring-8 ring-brand/5'
                      : 'bg-slate-50 border-surface-border grayscale hover:grayscale-0'
                  }`}
                >
                  <input type="radio" {...register('direction')} value={dir.value} className="hidden" />
                  <div className="flex items-center gap-6">
                     <div className={`p-4 rounded-2xl ${direction === dir.value ? 'bg-brand text-slate-950' : 'bg-white text-slate-600'}`}>
                        <Truck className="w-6 h-6" />
                     </div>
                     <div className="flex flex-col">
                        <span className={`text-lg font-black uppercase tracking-tighter ${direction === dir.value ? 'text-slate-900' : 'text-slate-500'}`}>
                           {dir.label}
                        </span>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                           {dir.value === 'inbound' ? 'Coleta externa -> VerticalParts' : 'VerticalParts -> Entrega externa'}
                        </span>
                     </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
            <Input
              label="Origem"
              tooltip="Local de coleta da mercadoria"
              icon={<MapPin className="w-5 h-5" />}
              {...register('origin')}
              error={errors.origin?.message}
              readOnly={direction === 'outbound'}
              className={direction === 'outbound' ? 'bg-white text-slate-500 border-slate-200' : ''}
              placeholder="Ex: Porto de Santos / Unidade Fornecedor"
            />
            <Input
              label="Destino"
              tooltip="Local de entrega da mercadoria"
              icon={<MapPin className="w-5 h-5" />}
              {...register('destination')}
              error={errors.destination?.message}
              readOnly={direction === 'inbound'}
              className={direction === 'inbound' ? 'bg-white text-slate-500 border-slate-200' : ''}
              placeholder="Ex: CD Jundiaí / Unidade Cliente"
            />
          </div>
        </div>

        {/* SEÇÃO 2: CARGA */}
        <div id="m5-carga" className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-md space-y-10">
          <div className="flex items-center gap-6 border-b border-surface-border pb-8">
            <div className="p-4 bg-brand/10 rounded-2xl text-brand">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Especificações da Carga</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Volume, Peso e Dimensões</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Tipo de Carga</label>
              <select
                {...register('cargo_type')}
                className="w-full h-14 bg-white border-2 border-surface-border rounded-2xl px-4 text-sm text-slate-900 focus:border-brand outline-none appearance-none"
              >
                <option value="">Selecione o tipo...</option>
                {CARGO_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.cargo_type && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.cargo_type.message}</p>}
            </div>

            <Input
              label="Peso Total (kg)"
              tooltip="Peso bruto aproximado da carga"
              type="number"
              step="0.01"
              {...register('weight_kg', { valueAsNumber: true })}
              error={errors.weight_kg?.message}
              placeholder="0,00"
            />

            <Input
              label="Dimensões (C x L x A)"
              tooltip="Dimensões aproximadas (cm ou m)"
              {...register('dimensions')}
              error={errors.dimensions?.message}
              placeholder="Ex: 120x80x100 cm"
            />
          </div>
        </div>

        {/* SEÇÃO 3: PROGRAMAÇÃO E JUSTIFICATIVA */}
        <div id="m5-programacao" className="p-10 bg-surface-card border border-surface-border rounded-[2.5rem] shadow-md space-y-10">
          <div className="flex items-center gap-6 border-b border-surface-border pb-8">
            <div className="p-4 bg-brand/10 rounded-2xl text-brand">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Programação</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Data e Necessidade</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Input
              label="Data Desejada"
              tooltip="Data preferencial para coleta ou entrega"
              type="date"
              icon={<Calendar className="w-5 h-5" />}
              {...register('desired_date')}
              error={errors.desired_date?.message}
            />

            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Justificativa da Solicitação</label>
              <div className="relative group">
                <ClipboardList className="absolute left-5 top-5 w-5 h-5 text-slate-700 group-focus-within:text-brand transition-colors" />
                <textarea
                  {...register('justification')}
                  placeholder="Explique a necessidade deste transporte (Ex: Peças para manutenção urgente...)"
                  className="w-full bg-white border-2 border-surface-border rounded-[2rem] p-6 pl-14 h-32 text-sm text-slate-900 focus:border-brand outline-none transition-all resize-none"
                />
              </div>
              {errors.justification && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.justification.message}</p>}
            </div>
          </div>
        </div>

        {/* FOOTER AÇÕES STICKY */}
        <div className="sticky bottom-10 z-30 flex items-center justify-between p-8 bg-white border-2 border-slate-200 rounded-[3rem] shadow-md">
           <div className="hidden lg:flex items-center gap-4 ml-6">
              <div className="p-3 bg-slate-50 rounded-2xl border border-surface-border">
                 <Info className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex flex-col">
                 <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Workflow M5</span>
                 <span className="text-xs font-bold text-slate-900 italic italic">Aguardando definição de rota...</span>
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
                className="h-16 px-14 bg-brand text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-light shadow-xl shadow-brand/20 transition-all flex items-center gap-3"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Submeter para Cotação
              </Button>
           </div>
        </div>
      </form>
    </FormProvider>
  );
};
