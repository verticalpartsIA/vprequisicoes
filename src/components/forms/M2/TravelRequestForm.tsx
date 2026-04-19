'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  PlaneTakeoff,
  MapPin,
  Calendar as CalendarIcon,
  User,
  Building2,
  Hotel,
  Car,
  ChevronRight,
  Send,
  Save,
  Globe,
  Loader2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { travelRequestSchema, TravelRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { TransportSelector } from '../travel/TransportSelector';
import { UrgencyJustificationCard } from '../travel/UrgencyJustificationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateDaysUntilDeparture } from '@/../packages/core/validation/travelRules';

export const TravelRequestForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [today, setToday] = useState<string>('');

  // Sincronizar 'hoje' apenas no cliente para evitar erro de hidratação
  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<TravelRequestInput>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: {
      traveler_name: 'Gelson Filho',
      traveler_department: 'Engenharia de Software',
      travel_type: 'visita_tecnica',
      is_international: false,
      transport_mode: 'aviao',
      needs_lodging: false,
      needs_destination_car: false,
      origin: '',
      destination: '',
      departure_date: '',
      return_date: '',
      visa_required: false,
      travel_insurance: true
    }
  });

  const departureDate = useWatch({ control, name: 'departure_date' });
  const isInternational = useWatch({ control, name: 'is_international' });
  const transportMode = useWatch({ control, name: 'transport_mode' });
  const needsLodging = useWatch({ control, name: 'needs_lodging' });
  const needsCar = useWatch({ control, name: 'needs_destination_car' });
  const destination = useWatch({ control, name: 'destination' }) || "...";

  const daysUntilDeparture = useMemo(() => {
    if (!departureDate || !today) return 100;
    return calculateDaysUntilDeparture(today, departureDate);
  }, [departureDate, today]);

  const onSubmit = (data: TravelRequestInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Processando requisição...');

    mockApiClient.post('/api/requests/travel', data)
      .then((res: any) => {
        toast.success(`Ticket ${res.data.ticket_number} gerado com sucesso!`, { id: toastId });

        setTimeout(() => {
          router.push('/');
        }, 1500);
      })
      .catch((err: any) => {
        toast.error(err.message || 'Erro ao processar requisição', { id: toastId });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* SEÇÃO 1: PESSOAL */}
      <div className="p-8 bg-surface-card border border-surface-border rounded-2xl shadow-md space-y-8">
        <div className="flex items-center gap-4 border-b border-surface-border pb-6">
          <div className="p-3 bg-brand/10 rounded-2xl text-brand">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Dados do Viajante</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Identificação e Departamento</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Nome Completo"
            tooltip="Nome completo do colaborador que irá realizar a viagem"
            {...register('traveler_name')}
            error={errors.traveler_name?.message}
            icon={<User className="w-4 h-4" />}
          />
          <Input
            label="Departamento"
            tooltip="Departamento responsável pelo custo da viagem"
            {...register('traveler_department')}
            error={errors.traveler_department?.message}
            icon={<Building2 className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* SEÇÃO 2: LOGÍSTICA DE DESLOCAMENTO */}
      <div className="p-8 bg-surface-card border border-surface-border rounded-2xl shadow-md space-y-8">
        <div className="flex items-center justify-between border-b border-surface-border pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 rounded-2xl text-brand">
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Detalhes da Viagem</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Origem, Destino e Datas</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-surface-border">
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Internacional?</span>
            <input type="checkbox" {...register('is_international')} className="w-4 h-4 rounded border-slate-300 bg-slate-100 text-brand focus:ring-brand" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Origem"
            placeholder="Cidade de partida"
            tooltip="Cidade e estado de partida"
            {...register('origin')}
            error={errors.origin?.message}
            icon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Destino"
            placeholder="Cidade de chegada"
            tooltip="Cidade e estado de chegada"
            {...register('destination')}
            error={errors.destination?.message}
            icon={<MapPin className="w-4 h-4" />}
          />
        </div>

        {isInternational && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-brand/5 border border-brand/20 rounded-2xl animate-in zoom-in-95 duration-300">
            <Input
              label="Passaporte"
              placeholder="Número do documento"
              tooltip="Número do passaporte válido para viagens internacionais"
              {...register('passport_number')}
              error={errors.passport_number?.message}
              icon={<Globe className="w-4 h-4" />}
            />
            <Input
              label="País de Destino"
              placeholder="Ex: Estados Unidos"
              tooltip="País de destino para conferência de visto e vacinas"
              {...register('destination_country')}
              error={errors.destination_country?.message}
              icon={<Globe className="w-4 h-4" />}
            />
            <div className="flex items-center gap-4 col-span-full border-t border-brand/10 pt-4 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" {...register('visa_required')} className="w-5 h-5 rounded border-slate-300 bg-slate-100 text-brand focus:ring-brand" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest group-hover:text-brand transition-colors">Visto Obrigatório?</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" {...register('travel_insurance')} className="w-5 h-5 rounded border-slate-300 bg-slate-100 text-brand focus:ring-brand" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest group-hover:text-brand transition-colors">Seguro Viagem Incluso</span>
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Data de Partida"
            type="date"
            tooltip="Data prevista para o início do deslocamento"
            {...register('departure_date')}
            error={errors.departure_date?.message}
            icon={<CalendarIcon className="w-4 h-4" />}
          />
          <Input
            label="Data de Retorno"
            type="date"
            tooltip="Data prevista para o retorno à base"
            {...register('return_date')}
            error={errors.return_date?.message}
            icon={<CalendarIcon className="w-4 h-4" />}
          />
        </div>

        <TransportSelector register={register} selected={transportMode} />

        {daysUntilDeparture <= 5 && (
          <UrgencyJustificationCard days={daysUntilDeparture} register={register} errors={errors} />
        )}
      </div>

      {/* SEÇÃO 3: ADD-ONS (Hotel, Carro) */}
      <div className="p-8 bg-surface-card border border-surface-border rounded-2xl shadow-md space-y-8">
        <div className="flex items-center gap-4 border-b border-surface-border pb-6">
          <div className="p-3 bg-brand/10 rounded-2xl text-brand">
            <Hotel className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Opcionais e Comodidades</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Hospedagem e Locação</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${needsLodging ? 'bg-brand/5 border-brand ring-4 ring-brand/10' : 'bg-slate-50 border-surface-border grayscale'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-2xl text-slate-400">
                <Hotel className="w-5 h-5" />
              </div>
              <input type="checkbox" {...register('needs_lodging')} className="w-6 h-6 rounded-lg border-slate-300 bg-slate-100 text-brand focus:ring-brand" />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Necessita Hospedagem?</p>
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">Hotel nível corporativo</p>
          </div>

          <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${needsCar ? 'bg-brand/5 border-brand ring-4 ring-brand/10' : 'bg-slate-50 border-surface-border grayscale'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-2xl text-slate-400">
                <Car className="w-5 h-5" />
              </div>
              <input type="checkbox" {...register('needs_destination_car')} className="w-6 h-6 rounded-lg border-slate-300 bg-slate-100 text-brand focus:ring-brand" />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Necessita Veículo?</p>
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">Locação no destino</p>
          </div>
        </div>
      </div>

      {/* FOOTER AÇÕES */}
      <div className="sticky bottom-8 z-20 flex items-center justify-between p-6 bg-white border border-surface-border rounded-full shadow-md">
        <div className="hidden lg:flex flex-col ml-4">
          <span className="text-xs font-bold text-slate-900 italic">Viagem para {destination}</span>
          {daysUntilDeparture <= 5 && <span className="text-[8px] text-rose-500 font-black uppercase lg:animate-pulse">Urgência Detectada</span>}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-50"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-10 bg-brand text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-brand-light shadow-lg shadow-brand/20 transition-all active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Send className="w-4 h-4 mr-2" />}
            Enviar para Cotação
          </Button>
        </div>
      </div>
    </form>
  );
};
