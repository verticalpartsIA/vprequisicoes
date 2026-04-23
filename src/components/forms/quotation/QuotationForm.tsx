'use client';

import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { quotationSchema, QuotationInput } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { Button } from '@/components/ui/button';
import { Toast, ToastType } from '@/components/ui/toast';
import { ItemQuotationCard } from './ItemQuotationCard';
import { QuotationSummary } from './QuotationSummary';

interface QuotationFormProps {
  ticket: any; // Dados originais da requisição (M1...)
}

export const QuotationForm = ({ ticket }: QuotationFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const methods = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema),
    mode: 'onBlur',
    defaultValues: ticket.draft || {
      items: ticket.details.itens.map((item: any) => ({
        request_item_id: item.nome, // Usando nome como ID mock
        suppliers: [],
        notes: ''
      }))
    }
  });


  const { control, handleSubmit, watch, formState: { errors } } = methods;

  const currentItems = watch('items') || [];

  // Cálculos reativos para o resumo
  // watch('items') por si só pode não disparar re-render em mudanças profundas em algumas versões
  // mas aqui garantimos a leitura dos valores reais
  const { total, completedCount } = useMemo(() => {
    let sum = 0;
    let done = 0;
    
    currentItems.forEach((item, idx) => {
      const originalQty = ticket.details.itens[idx]?.quantidade || 0;
      const winner = item.suppliers?.find(s => s.is_winner);
      if (winner && Number(winner.price) > 0) {
        sum += (Number(winner.price) * originalQty);
        done++;
      }
    });

    return { total: sum, completedCount: done };
  }, [currentItems, ticket.details.itens]);



  const onSubmit = async (data: QuotationInput) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Atualizar o Ticket com os dados da cotação e iniciar Aprovação Nível 1
      const { error: updateError } = await supabase
        .from('req_tickets')
        .update({
          status: 'APPROVAL_L1', // Transição conforme SDD
          metadata: {
            ...ticket.metadata,
            current_approval_level: 1, // Inicializa contador de aprovação
            quotation: {
              ...data,
              total_amount: total,
              completed_at: new Date().toISOString(),
              buyer_id: user.id
            }
          }
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // 2. Auditoria
      await supabase.rpc('req_log_audit', {
        p_ticket_id: ticket.id,
        p_user_id: user.id,
        p_action: 'Cotação Concluída',
        p_details: `Valor Total: R$ ${total.toLocaleString('pt-BR')}. Iniciada Aprovação Nível 1.`,
        p_level: 'success',
        p_module: ticket.module
      });
      
      setToast({ type: 'success', message: 'Cotação enviada para o Nível 1 de Aprovação!' });
      setTimeout(() => router.push('/quotation'), 2000);
      
    } catch (error: any) {
      console.error('[QuotationForm] Erro:', error);
      setToast({ type: 'error', message: error.message || 'Erro ao enviar cotação.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const data = methods.getValues();
    try {
      await mockApiClient.patch(`/api/quotation/tickets/${ticket.id}/draft`, data);
      setToast({ type: 'success', message: 'Rascunho salvo localmente.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Erro ao salvar rascunho.' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda: Lista de Itens */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Itens da Requisição</h2>
            {ticket.details.itens.map((item: any, idx: number) => (
              <ItemQuotationCard 
                key={idx}
                itemIndex={idx}
                originalItem={item}
                formMethods={methods}
              />
            ))}
          </div>

          {/* Coluna Direita: Resumo e Ações */}
          <div className="lg:col-span-4">
            <QuotationSummary 
              total={total}
              itemCount={ticket.details.itens.length}
              completedCount={completedCount}
            />

            <div className="mt-8 space-y-4">
              <Button
                type="submit"
                loading={isLoading}
                variant="primary"
                className="w-full py-6 text-lg font-bold shadow-xl shadow-brand/20"
                disabled={completedCount < ticket.details.itens.length}
              >
                <Send className="w-5 h-5 mr-3" />
                Enviar para Aprovação
              </Button>
              
              <Button
                type="button"
                onClick={handleSaveDraft}
                variant="outline"
                className="w-full py-4 text-slate-600 border-slate-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar como Rascunho
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="w-full text-slate-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar à Lista
              </Button>
            </div>
          </div>
        </div>

        {toast && (
          <Toast 
            type={toast.type} 
            message={toast.message} 
            onClose={() => setToast(null)} 
          />
        )}
      </form>
    </FormProvider>
  );
};
