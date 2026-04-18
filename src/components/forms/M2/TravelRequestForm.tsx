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
      return_date: ''
    }
  });

  const departureDate = useWatch({ control, name: 'departure_date' });
  const urgencyJs = useWatch({ control, name: 'urgency_justification' }) || "";
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
      <div className="p-8 bg-surface-card border border-surface-border rounded-3xl shadow-2xl space-y-8">
        <div className="flex items-center gap-4 border-b border-surface-border/30 pb-6">
          <div className="p-3 bg-brand/10 rounded-2xl text-brand">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Dados do Viajante</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identificação e Departamento</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                {...register('traveler_name')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-4 pl-12 text-sm text-white focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all"
              />
            </div>
            {errors.traveler_name && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.traveler_name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                {...register('traveler_department')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-4 pl-12 text-sm text-white focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all"
              />
            </div>
            {errors.traveler_department && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.traveler_department.message}</p>}
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: LOGÍSTICA DE DESLOCAMENTO */}
      <div className="p-8 bg-surface-card border border-surface-border rounded-3xl shadow-2xl space-y-8">
        <div className="flex items-center justify-between border-b border-surface-border/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 rounded-2xl text-brand">
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Detalhes da Viagem</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Origem, Destino e Datas</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-surface-border/30">
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Internacional?</span>
            <input type="checkbox" {...register('is_international')} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand focus:ring-brand" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Origem</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                {...register('origin')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-4 pl-12 text-sm text-white focus:border-brand outline-none transition-all"
                placeholder="Cidade de partida"
              />
            </div>
            {errors.origin && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.origin.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destino</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                {...register('destination')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-4 pl-12 text-sm text-white focus:border-brand outline-none transition-all"
                placeholder="Cidade de chegada"
              />
            </div>
            {errors.destination && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.destination.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data de Partida</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="date"
                {...register('departure_date')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-4 pl-12 text-sm text-white focus:border-brand outline-none transition-all"
              />
            </div>
            {errors.departure_date && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.departure_date.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data de Retorno</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="date"
                {...register('return_date')}
                className="w-full bg-slate-950 border-2 border-surface-border rounded-2xl p-4 pl-12 text-sm text-white focus:border-brand outline-none transition-all"
              />
            </div>
            {errors.return_date && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.return_date.message}</p>}
          </div>
        </div>

        <TransportSelector register={register} activeMode={transportMode} />
        
        {daysUntilDeparture <= 5 && (
          <UrgencyJustificationCard register={register} errors={errors} />
        )}
      </div>

      {/* SEÇÃO 3: ADD-ONS (Hotel, Carro) */}
      <div className="p-8 bg-surface-card border border-surface-border rounded-3xl shadow-2xl space-y-8">
        <div className="flex items-center gap-4 border-b border-surface-border/30 pb-6">
          <div className="p-3 bg-brand/10 rounded-2xl text-brand">
            <Hotel className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Opcionais e Comodidades</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hospedagem e Locação</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`p-6 rounded-3xl border-2 transition-all duration-300 ${needsLodging ? 'bg-brand/5 border-brand ring-4 ring-brand/10' : 'bg-slate-900 border-surface-border grayscale'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-950 rounded-2xl text-slate-400">
                <Hotel className="w-5 h-5" />
              </div>
              <input type="checkbox" {...register('needs_lodging')} className="w-6 h-6 rounded-lg border-slate-700 bg-slate-800 text-brand focus:ring-brand" />
            </div>
            <p className="text-sm font-black text-white uppercase tracking-tighter">Necessita Hospedagem?</p>
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">Hotel nível corporativo</p>
          </div>

          <div className={`p-6 rounded-3xl border-2 transition-all duration-300 ${needsCar ? 'bg-brand/5 border-brand ring-4 ring-brand/10' : 'bg-slate-900 border-surface-border grayscale'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-950 rounded-2xl text-slate-400">
                <Car className="w-5 h-5" />
              </div>
              <input type="checkbox" {...register('needs_destination_car')} className="w-6 h-6 rounded-lg border-slate-700 bg-slate-800 text-brand focus:ring-brand" />
            </div>
            <p className="text-sm font-black text-white uppercase tracking-tighter">Necessita Veículo?</p>
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">Locação no destino</p>
          </div>
        </div>
      </div>

      {/* FOOTER AÇÕES */}
      <div className="sticky bottom-8 z-20 flex items-center justify-between p-6 bg-slate-900/80 backdrop-blur-xl border border-surface-border rounded-full shadow-2xl">
        <div className="hidden lg:flex flex-col ml-4">
          <span className="text-xs font-bold text-white italic">Viagem para {destination}</span>
          {daysUntilDeparture <= 5 && <span className="text-[8px] text-rose-500 font-black uppercase lg:animate-pulse">Urgência Detectada</span>}
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 border-slate-800 bg-slate-950/50 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800"
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