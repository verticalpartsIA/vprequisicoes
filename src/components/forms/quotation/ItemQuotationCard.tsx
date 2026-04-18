'use client';

import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Plus, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { QuotationInput } from '@/lib/validation/schemas';
import { SupplierRow } from './SupplierRow';
import { Button } from '@/components/ui/button';
import { MAX_SUPPLIERS_PER_ITEM } from '@modules/quotation/constants';

interface ItemQuotationCardProps {
  itemIndex: number;
  originalItem: {
    nome: string;
    quantidade: number;
    especificacao?: string;
  };
  formMethods: UseFormReturn<QuotationInput>;
}

export const ItemQuotationCard = ({ itemIndex, originalItem, formMethods }: ItemQuotationCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  const { control, watch, formState: { errors } } = formMethods;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: `items.${itemIndex}.suppliers` as const
  });

  const suppliers = watch(`items.${itemIndex}.suppliers`) || [];
  const winner = suppliers.find(s => s.is_winner);
  const subtotal = winner ? (winner.price * originalItem.quantidade) : 0;
  
  const itemErrors: any = errors.items?.[itemIndex];

  return (
    <div className={`overflow-hidden rounded-xl border transition-all ${isExpanded ? 'border-surface-border' : 'border-surface-border/40 bg-surface-bg/30'}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-5 cursor-pointer bg-surface-card/30 hover:bg-surface-card/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Produto {itemIndex + 1}</span>
            <span className="text-lg font-bold text-white">{originalItem.nome}</span>
          </div>
          <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
            <span className="text-sm font-semibold text-slate-300">Qtd: {originalItem.quantidade}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-xs text-slate-500">Subtotal Vencedor</p>
            <p className={`text-lg font-mono font-bold ${subtotal > 0 ? 'text-brand-success' : 'text-slate-600'}`}>
              {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-surface-border">
          {originalItem.especificacao && (
            <div className="p-3 bg-slate-800/40 rounded border border-slate-700 text-sm italic text-slate-400">
              <span className="font-bold text-slate-300 not-italic mr-2">Especificação:</span>
              {originalItem.especificacao}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cotações (Fornecedores)</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={fields.length >= MAX_SUPPLIERS_PER_ITEM}
                onClick={() => append({ name: '', price: 0, delivery_days: 0, is_winner: fields.length === 0 })}
                className="text-xs border-brand/40 text-brand"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Adicionar Fornecedor
              </Button>
            </div>

            {itemErrors?.suppliers && (
              <div className="flex items-center p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs">
                <AlertCircle className="w-4 h-4 mr-2" />
                {itemErrors.suppliers.message || "Validação pendente para fornecedores"}
              </div>
            )}

            <div className="space-y-4">
              {fields.map((field, idx) => (
                <SupplierRow
                  key={field.id}
                  itemIndex={itemIndex}
                  supplierIndex={idx}
                  onRemove={() => remove(idx)}
                  formMethods={formMethods}
                />
              ))}
              
              {fields.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600">Nenhum fornecedor adicionado para este item.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
