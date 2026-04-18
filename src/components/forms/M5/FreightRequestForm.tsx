'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, Send, ClipboardList, MapPin, Package, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { freightRequestSchema, FreightRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Toast, ToastType } from '@/components/ui/toast';

// Estes tipos e constantes podem ser movidos para caminhos centrais se necessário
const CARGO_TYPES = [
  { value: 'small', label: 'Carga Leve (Caixas/Envelopes)' },
  { value: 'medium', label: 'Carga Média (Paletes)' },
  { value: 'heavy', label: 'Carga Pesada (Maquinário/Aço)' },
  { value: 'hazardous', label: 'Carga Perigosa (Químicos/Inflamáveis)' },
];

const FREIGHT_DIRECTIONS = [
  { value: 'inbound', label: 'Entrada (Para VerticalParts)' },
  { value: 'outbound', label: 'Saída (Para Cliente/Fornecedor)' },
];

export const FreightRequestForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

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

  // Lógica de Preenchimento: Se 'Entrada' -> Destino fixo 'VerticalParts'. Se 'Saída' -> Origem fixa 'VerticalParts'.
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
    setIsLoading(true);
    try {
      const response: any = await mockApiClient.post('/api/requests/freight', data);
      setToast({ 
        type: 'success', 
        message: `Sucesso! Ticket ${response.data.ticket_number} gerado.` 
      });
      
      setTimeout(() => {
        router.push(`/dashboard?success=${response.data.ticket_number}`);
      }, 2000);
      
    } catch (error: any) {
      setToast({ 
        type: 'error', 
        message: error.message || 'Erro ao processar requisição.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Card className="max-w-4xl mx-auto shadow-2xl border-surface-border/60">
        <CardHeader className="border-b border-surface-border/40 pb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand/10 rounded-xl">
              <Truck className="w-8 h-8 text-brand" />
            </div>
            <div>
              <CardTitle className="text-2xl">Requisição de Frete (M5)</CardTitle>
              <CardDescription>O frete será cotado pelo setor de Compras após o envio.</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-10 pt-8">
            {/* Seção: Direção e Rota */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest">
                <MapPin className="w-4 h-4" />
                <span>Direção e Rota</span>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-300">Direção do Transporte</label>
                <div className="flex flex-wrap gap-4">
                  {FREIGHT_DIRECTIONS.map((dir) => (
                    <label 
                      key={dir.value}
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        direction === dir.value 
                          ? 'border-brand bg-brand/5 ring-1 ring-brand' 
                          : 'border-surface-border bg-surface-card/50 hover:border-slate-500'
                      }`}
                    >
                      <input 
                        type="radio" 
                        value={dir.value} 
                        {...register('direction')} 
                        className="w-4 h-4 text-brand focus:ring-brand bg-slate-700 border-slate-600"
                      />
                      <span className="text-sm font-medium">{dir.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Origem" 
                  placeholder="Cidade/Estado ou Endereço"
                  required
                  readOnly={direction === 'outbound'}
                  {...register('origin')} 
                  error={errors.origin?.message}
                  className={direction === 'outbound' ? 'opacity-70 bg-slate-800' : ''}
                />
                <Input 
                  label="Destino" 
                  placeholder="Cidade/Estado ou Endereço"
                  required
                  readOnly={direction === 'inbound'}
                  {...register('destination')} 
                  error={errors.destination?.message}
                  className={direction === 'inbound' ? 'opacity-70 bg-slate-800' : ''}
                />
              </div>
            </section>

            {/* Seção: Carga e Detalhes */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest">
                <Package className="w-4 h-4" />
                <span>Detalhes da Carga</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-sm font-medium text-slate-300">Tipo de Carga</label>
                  <select 
                    {...register('cargo_type')}
                    className={`flex h-10 w-full rounded-md border ${errors.cargo_type ? 'border-red-500' : 'border-surface-border'} bg-surface-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`}
                  >
                    <option value="">Selecione...</option>
                    {CARGO_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.cargo_type && <p className="text-xs text-red-500 font-medium">{errors.cargo_type.message}</p>}
                </div>
                
                <Input 
                  label="Peso Total (kg)" 
                  type="number"
                  step="0.01"
                  placeholder="Ex: 50.5"
                  {...register('weight_kg', { valueAsNumber: true })} 
                  error={errors.weight_kg?.message}
                />

                <Input 
                  label="Dimensões (Comp x Larg x Alt)" 
                  placeholder="Ex: 100x80x50 cm"
                  {...register('dimensions')} 
                  error={errors.dimensions?.message}
                />
              </div>
            </section>

            {/* Seção: Data e Justificativa */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest">
                  <Calendar className="w-4 h-4" />
                  <span>Programação</span>
                </div>
                <Input 
                  label="Data Desejada para Coleta/Entrega" 
                  type="date"
                  required
                  {...register('desired_date')} 
                  error={errors.desired_date?.message}
                />
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest">
                  <ClipboardList className="w-4 h-4" />
                  <span>Justificativa</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Por que este transporte é necessário? (Mín 20 carac.) <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    className={`flex min-h-[100px] w-full rounded-md border ${errors.justificativa ? 'border-red-500' : 'border-surface-border'} bg-surface-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`}
                    placeholder="Ex: Envio de peças para assistência técnica em São Paulo..."
                    {...register('justification')}
                  />
                  {errors.justificativa && <p className="text-xs text-red-500 font-medium">{errors.justificativa.message}</p>}
                </div>
              </div>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t border-surface-border/40 mt-10 pt-8 gap-4">
            <div className="text-sm text-slate-500 italic">
              O setor de compras buscará a melhor cotação disponível.
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setToast({ type: 'info', message: 'Rascunho salvo (simulado)' })}
              >
                Salvar Rascunho
              </Button>
              <Button 
                type="submit" 
                loading={isLoading} 
                className="w-full sm:w-auto px-8 shadow-xl shadow-brand/20"
              >
                <Send className="w-5 h-5 mr-3" />
                Enviar para Cotação
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      {toast && (
        <Toast 
          type={toast.type} 
          message={toast.message} 
          onClose={() => setToast(null)} 
        />
      )}
    </FormProvider>
  );
};
