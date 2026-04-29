'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ApprovalProgress } from '@/components/workflow/ApprovalProgress';
import { ItemsTable, QuotationItem } from './components/ItemsTable';
import {
  ClipboardList,
  Loader2,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  AlertCircle,
  Save,
  Send,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast, ToastType } from '@/components/ui/toast';
import { realPost } from '@/lib/api/real-client';

export default function QuotationClient({ overrideId }: { overrideId?: string }) {
  const params = useParams();
  const id = overrideId || (params.id as string);
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id || id === '0') return;
      try {
        const { data, error } = await supabase
          .from('req_tickets_view')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setTicket(data);

          const meta = (data.metadata as any) || {};
          const details = (data as any).details || {};
          let rawItems: any[] = meta.itens || details.itens || [];

          if (rawItems.length === 0) {
            const moduleLabels: Record<string, string> = {
              M2_VIAGENS: 'Serviço de Viagem / Passagem',
              M3_SERVICOS: 'Prestação de Serviço',
              M4_MANUTENCAO: 'Serviço de Manutenção',
              M5_FRETE: 'Serviço de Frete / Logística',
              M6_LOCACAO: 'Locação de Equipamento',
            };
            rawItems = [{
              nome: moduleLabels[data.module as string] || 'Solicitação Geral',
              quantidade: 1,
              especificacao: data.title,
            }];
          }

          const quotedItems: any[] = meta.quotation?.items || [];

          const mapped: QuotationItem[] = rawItems.map((item: any, idx: number) => {
            // Migra cotações existentes para o novo formato multi-fornecedor
            const existingSuppliers: any[] = quotedItems[idx]?.suppliers || [];
            const legacyName = quotedItems[idx]?.supplier_name || '';
            const legacyPrice = quotedItems[idx]?.quoted_price || 0;

            let suppliers = existingSuppliers.length > 0
              ? existingSuppliers
              : legacyName
                ? [{ name: legacyName, price: legacyPrice, is_winner: true }]
                : [];

            return {
              nome: item.nome,
              description: item.description,
              especificacao: item.especificacao,
              quantidade: item.quantidade || 1,
              suppliers,
            };
          });

          setItems(mapped);
        }
      } catch (err) {
        console.error('[QuotationClient] Erro:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAddSupplier = (itemIdx: number) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[itemIdx] };
      item.suppliers = [...item.suppliers, { name: '', price: 0, is_winner: false }];
      next[itemIdx] = item;
      return next;
    });
  };

  const handleRemoveSupplier = (itemIdx: number, supplierIdx: number) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[itemIdx] };
      const newSuppliers = item.suppliers.filter((_, i) => i !== supplierIdx);
      // Se remover o vencedor e ainda há fornecedores, marca o primeiro como vencedor
      const hasWinner = newSuppliers.some(s => s.is_winner);
      if (!hasWinner && newSuppliers.length > 0) {
        newSuppliers[0] = { ...newSuppliers[0], is_winner: true };
      }
      item.suppliers = newSuppliers;
      next[itemIdx] = item;
      return next;
    });
  };

  const handleUpdateSupplier = (
    itemIdx: number,
    supplierIdx: number,
    field: 'name' | 'price',
    value: string | number
  ) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[itemIdx] };
      const suppliers = [...item.suppliers];
      suppliers[supplierIdx] = { ...suppliers[supplierIdx], [field]: value };
      item.suppliers = suppliers;
      next[itemIdx] = item;
      return next;
    });
  };

  const handleSetWinner = (itemIdx: number, supplierIdx: number) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[itemIdx] };
      item.suppliers = item.suppliers.map((s, i) => ({ ...s, is_winner: i === supplierIdx }));
      next[itemIdx] = item;
      return next;
    });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const response = await realPost(`/api/quotation/tickets/${id}/draft`, {
        items,
        updated_at: new Date().toISOString(),
      });
      if (response.status === 'error') throw new Error(response.message);
      setToast({ type: 'success', message: 'Rascunho salvo com sucesso!' });
    } catch (err: any) {
      setToast({ type: 'error', message: 'Erro ao salvar: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    // Validação: cada item precisa de ao menos 1 fornecedor com preço e um vencedor
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.suppliers.length === 0) {
        setToast({ type: 'error', message: `Item ${i + 1}: adicione pelo menos um fornecedor.` });
        return;
      }
      const winner = item.suppliers.find(s => s.is_winner);
      if (!winner) {
        setToast({ type: 'error', message: `Item ${i + 1}: marque um fornecedor como vencedor.` });
        return;
      }
      if (!winner.price || winner.price <= 0) {
        setToast({ type: 'error', message: `Item ${i + 1}: o fornecedor vencedor precisa ter preço preenchido.` });
        return;
      }
    }

    setIsSaving(true);
    try {
      const total = items.reduce((acc, item) => {
        const winner = item.suppliers.find(s => s.is_winner);
        return acc + (winner ? winner.price * item.quantidade : 0);
      }, 0);

      const winnerSupplierName = items[0]?.suppliers.find(s => s.is_winner)?.name || 'MULTIPLE';

      const response = await realPost(`/api/quotation/tickets/${id}`, {
        items: items.map(item => ({
          nome: item.nome,
          quantidade: item.quantidade,
          suppliers: item.suppliers,
          winner: item.suppliers.find(s => s.is_winner),
        })),
        total_amount: total,
        supplier_id: winnerSupplierName,
        notes: 'Cotação finalizada via Buyer Console',
      });

      if (response.status === 'error') throw new Error(response.message);

      setToast({ type: 'success', message: 'Cotação enviada para Aprovação!' });
      setTimeout(() => router.push('/quotation'), 2000);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const itemsWithWinner = items.filter(i => i.suppliers.some(s => s.is_winner && s.price > 0));
  const grandTotal = items.reduce((acc, item) => {
    const winner = item.suppliers.find(s => s.is_winner);
    return acc + (winner ? winner.price * item.quantidade : 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-slate-400 font-medium font-mono text-[10px] uppercase tracking-widest">
          Carregando mapa de cotação...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-3xl font-black text-white tracking-tighter">
                Ticket #{ticket?.ticket_number || id.slice(0, 8)}
              </h1>
              <span className="px-3 py-1 bg-brand/20 text-brand text-[10px] font-black rounded-full uppercase tracking-widest">
                {ticket?.status}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Módulo: {ticket?.module?.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-9 space-y-8">
          {/* INFO DO TICKET */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-brand" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Solicitante</p>
                <p className="text-sm text-white">{ticket?.requester_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building2 className="w-4 h-4 text-brand" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Departamento</p>
                <p className="text-sm text-white">VerticalParts - Matriz</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-brand" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Data Solicitação</p>
                <p className="text-sm text-white">
                  {ticket?.created_at ? new Date(ticket.created_at).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Prioridade</p>
                <p className="text-sm text-white">{ticket?.priority_level || 'Normal'}</p>
              </div>
            </div>
          </div>

          {/* TABELA DE ITENS COM MÚLTIPLOS FORNECEDORES */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <ClipboardList className="w-5 h-5 mr-3 text-brand" /> Itens da Requisição
            </h2>
            <p className="text-xs text-slate-500">
              Adicione até 3 fornecedores por item. Marque o vencedor — ele será enviado para aprovação.
            </p>
            <ItemsTable
              items={items}
              onAddSupplier={handleAddSupplier}
              onRemoveSupplier={handleRemoveSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onSetWinner={handleSetWinner}
            />
          </div>

          {/* TIMELINE DE APROVAÇÃO */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Timeline de Aprovação</h2>
            <ApprovalProgress
              currentLevel={ticket?.metadata?.current_approval_level || 0}
              status={ticket?.status}
            />
          </div>
        </div>

        {/* COLUNA DIREITA: AÇÕES */}
        <div className="lg:col-span-3 space-y-6">
          <div className="sticky top-10 space-y-4">
            <div className="bg-slate-900 p-6 rounded-2xl border border-brand/20 shadow-2xl shadow-brand/5">
              <p className="text-[10px] text-brand uppercase font-black tracking-widest mb-4">
                Ações Disponíveis
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-brand hover:bg-brand-dark text-slate-950 font-bold py-6"
                  onClick={handleFinalize}
                  loading={isSaving}
                >
                  <Send className="w-4 h-4 mr-2" /> COTAR E ENVIAR
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-slate-300 hover:bg-white/5 py-6"
                  onClick={handleSaveDraft}
                  loading={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" /> SALVAR RASCUNHO
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-400 hover:bg-red-500/10 py-6"
                  onClick={() => router.back()}
                >
                  <X className="w-4 h-4 mr-2" /> CANCELAR
                </Button>
              </div>
            </div>

            {/* RESUMO ECONÔMICO */}
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-widest">
                Resumo Econômico
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Total Itens</span>
                  <span className="text-xs text-white font-bold">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Com Vencedor</span>
                  <span className="text-xs text-emerald-400 font-bold">{itemsWithWinner.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Fornecedores</span>
                  <span className="text-xs text-white font-bold">
                    {items.reduce((acc, i) => acc + i.suppliers.length, 0)}
                  </span>
                </div>
                {grandTotal > 0 && (
                  <div className="pt-2 border-t border-white/5 flex justify-between">
                    <span className="text-xs text-slate-400">Total Geral</span>
                    <span className="text-xs text-brand font-black">
                      {grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
