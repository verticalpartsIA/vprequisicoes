'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Send, ClipboardList, User, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { productRequestSchema, ProductRequestInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Toast, ToastType } from '@/components/ui/toast';
import { ProductItemCard } from './ProductItemCard';

export const ProductRequestForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const methods = useForm<ProductRequestInput>({
    resolver: zodResolver(productRequestSchema),
    mode: 'onBlur',
    defaultValues: {
      itens: [{ nome: '', quantidade: 1 }],
      solicitante: '',
      justificativa: '',
      departamento: '',
      centroCusto: ''
    }
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens"
  });

  const onSubmit = async (data: ProductRequestInput) => {
    setIsLoading(true);
    try {
      const response: any = await mockApiClient.post('/api/requests/products', data);
      setToast({ 
        type: 'success', 
        message: `Sucesso! Ticket ${response.data.ticket_number} gerado.` 
      });
      
      setTimeout(() => {
        router.push(`/products?success=${response.data.ticket_number}`);
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
              <ClipboardList className="w-8 h-8 text-brand" />
            </div>
            <div>
              <CardTitle className="text-2xl">Abertura de Requisição (M1)</CardTitle>
              <CardDescription>Preencha os dados abaixo seguindo as normas da VerticalParts.</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-10 pt-8">
            {/* Seção: Identificação */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest">
                <User className="w-4 h-4" />
                <span>Identificação</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Nome do Solicitante" 
                  placeholder="Ex: João da Silva"
                  tooltip="Nome completo do colaborador que está solicitando o material"
                  required
                  {...register('solicitante')} 
                  error={errors.solicitante?.message}
                />
                <Input 
                  label="Departamento / Centro" 
                  placeholder="Ex: Manutenção / Infra"
                  tooltip="Seto ou Centro de Custo responsável pela despesa"
                  {...register('departamento')} 
                  error={errors.departamento?.message}
                />
              </div>
            </section>

            {/* Seção: Lista de Itens */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest">
                  <Plus className="w-4 h-4" />
                  <span>Itens para Cotação ({fields.length})</span>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ nome: '', quantidade: 1 })}
                  className="border-brand/30 text-brand hover:bg-brand/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar outro produto
                </Button>
              </div>

              <div className="space-y-6">
                {fields.map((field, index) => (
                  <ProductItemCard 
                    key={field.id} 
                    itemIndex={index} 
                    onRemove={() => remove(index)} 
                    formMethods={methods}
                  />
                ))}
              </div>
            </section>

            {/* Seção: Motivo */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest">
                <ClipboardList className="w-4 h-4" />
                <span>Justificativa da Compra</span>
              </div>
              <div className="space-y-1.5">
                <Textarea 
                  label="Justificativa da Compra"
                  placeholder="Descreva o propósito da compra..."
                  tooltip="Explique detalhadamente a necessidade do material. Mínimo 10 caracteres."
                  required
                  {...register('justificativa')}
                  error={errors.justificativa?.message}
                />
              </div>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t border-surface-border/40 mt-10 pt-8 gap-4">
            <div className="text-sm text-slate-500 italic">
              Campos marcados com <span className="text-red-500 font-bold">*</span> são obrigatórios.
            </div>
            <Button 
              type="submit" 
              loading={isLoading} 
              className="w-full sm:w-auto px-8 py-6 text-lg shadow-xl shadow-brand/20"
            >
              <Send className="w-5 h-5 mr-3" />
              Enviar para Cotação
            </Button>
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
