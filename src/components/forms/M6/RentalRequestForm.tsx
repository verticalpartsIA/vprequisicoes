'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { PackageSearch, MapPin, Calendar, User, Building2, Send, Save, Loader2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

import { rentalRequestSchema, RentalRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

const EQUIPMENT_CATEGORIES = [
  { value: 'ferramenta', label: 'Ferramenta / Equipamento Manual' },
  { value: 'veiculo', label: 'Veículo / Munck / Guindaste' },
  { value: 'informatica', label: 'Informática / Eletrônico' },
  { value: 'medicao', label: 'Medição / Calibração' },
  { value: 'seguranca', label: 'Segurança / EPI Especial' },
  { value: 'outro', label: 'Outro' },
];

export const RentalRequestForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RentalRequestInput>({
    resolver: zodResolver(rentalRequestSchema),
    defaultValues: {
      requester_name: 'Gelson Filho',
      department: 'Engenharia de Software',
      quantity: 1,
    }
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

  const rentalDays = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const onSubmit = async (data: RentalRequestInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Processando requisição de locação...');
    try {
      const response: any = await mockApiClient.post('/api/requests/rental', data);
      toast.success(`Ticket ${response.data.ticket_number} gerado com sucesso!`, { id: toastId });
      setTimeout(() => router.push('/'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar requisição.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* SEÇÃO 1: SOLICITANTE */}
      <div className="p-8 bg-surface-card border border-surface-border rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-surface-border pb-6">
          <div className="p-3 bg-brand/10 rounded-xl text-brand">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Dados do Solicitante</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Identificação e Departamento</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nome do Solicitante"
            tooltip="Nome completo do responsável pela locação"
            required
            {...register('requester_name')}
            error={errors.requester_name?.message}
            icon={<User className="w-4 h-4" />}
          />
          <Input
            label="Departamento"
            tooltip="Departamento responsável pelo custo"
            {...register('department')}
            error={errors.department?.message}
            icon={<Building2 className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* SEÇÃO 2: EQUIPAMENTO */}
      <div className="p-8 bg-surface-card border border-surface-border rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-surface-border pb-6">
          <div className="p-3 bg-brand/10 rounded-xl text-brand">
            <PackageSearch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Especificação do Equipamento</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tipo, nome e quantidade</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label="Categoria"
            tooltip="Selecione a categoria do equipamento"
            required
            {...register('equipment_category')}
            error={errors.equipment_category?.message}
          >
            <option value="">Selecione...</option>
            {EQUIPMENT_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <div className="md:col-span-2">
            <Input
              label="Nome / Especificação do Equipamento"
              placeholder="Ex: Munck 30 toneladas com lança de 25m"
              tooltip="Descreva o equipamento com o máximo de detalhe possível"
              required
              {...register('equipment_name')}
              error={errors.equipment_name?.message}
              icon={<Wrench className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Quantidade"
            type="number"
            min="1"
            tooltip="Número de unidades necessárias"
            required
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
          />

          <div className="md:col-span-2">
            <Input
              label="Local de Utilização"
              placeholder="Ex: Obra Centro — Rua das Flores, 123"
              tooltip="Endereço ou nome do local onde o equipamento será usado"
              required
              {...register('usage_location')}
              error={errors.usage_location?.message}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: PERÍODO */}
      <div className="p-8 bg-surface-card border border-surface-border rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-surface-border pb-6">
          <div className="p-3 bg-brand/10 rounded-xl text-brand">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Período e Justificativa</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Datas e necessidade</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Data de Início"
            type="date"
            tooltip="Data prevista para início da locação"
            required
            {...register('start_date')}
            error={errors.start_date?.message}
            icon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Data de Devolução"
            type="date"
            tooltip="Data prevista para devolução do equipamento"
            required
            {...register('end_date')}
            error={errors.end_date?.message}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Período calculado */}
        {rentalDays > 0 && (
          <div className="flex items-center gap-3 p-4 bg-brand/5 border border-brand/20 rounded-xl animate-in zoom-in-95 duration-300">
            <Calendar className="w-5 h-5 text-brand" />
            <span className="text-sm font-semibold text-slate-700">
              Período total: <span className="text-brand font-bold">{rentalDays} {rentalDays === 1 ? 'dia' : 'dias'}</span>
            </span>
          </div>
        )}
        {rentalDays < 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            ⚠ A data de devolução deve ser posterior à data de início.
          </div>
        )}

        <Input
          label="Fornecedor Preferencial (opcional)"
          placeholder="Ex: Locadora TransEquip"
          tooltip="Indique uma locadora de preferência, se houver"
          {...register('preferred_supplier')}
          error={errors.preferred_supplier?.message}
        />

        <Textarea
          label="Justificativa da Locação"
          placeholder="Descreva a necessidade do equipamento, objetivo da locação..."
          tooltip="Explique detalhadamente a necessidade. Mínimo 10 caracteres."
          required
          {...register('justification')}
          error={errors.justification?.message}
        />
      </div>

      {/* FOOTER AÇÕES */}
      <div className="sticky bottom-8 z-20 flex items-center justify-between p-5 bg-white border border-surface-border rounded-full shadow-md">
        <div className="hidden lg:flex flex-col ml-4">
          <span className="text-xs font-bold text-slate-900">
            {rentalDays > 0 ? `Locação de ${rentalDays} dias` : 'Preencha o período'}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Módulo M6 — Locação</span>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 rounded-full"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-10 rounded-full shadow-lg shadow-brand/20"
          >
            {isSubmitting
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              : <Send className="w-4 h-4 mr-2" />
            }
            Enviar para Cotação
          </Button>
        </div>
      </div>
    </form>
  );
};
