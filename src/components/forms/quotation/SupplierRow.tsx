'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { QuotationInput } from '@/lib/validation/schemas';

interface SupplierRowProps {
  itemIndex: number;
  supplierIndex: number;
  onRemove: () => void;
  formMethods: UseFormReturn<QuotationInput>;
}

export const SupplierRow = ({ itemIndex, supplierIndex, onRemove, formMethods }: SupplierRowProps) => {
  const { register, watch, setValue, formState: { errors } } = formMethods;

  const isWinner = watch(`items.${itemIndex}.suppliers.${supplierIndex}.is_winner`);

  const handleSetWinner = async () => {
    const suppliers = watch(`items.${itemIndex}.suppliers`);
    suppliers.forEach((_, idx) => {
      setValue(`items.${itemIndex}.suppliers.${idx}.is_winner`, idx === supplierIndex, {
        shouldDirty: true,
      });
    });
    // Forçar revalidação do item para limpar o erro de "Vencedor não selecionado"
    formMethods.trigger(`items.${itemIndex}.suppliers`);
  };



  return (
    <div className={`p-4 rounded-lg border transition-all ${isWinner ? 'border-brand bg-brand/5 ring-1 ring-brand' : 'border-surface-border bg-surface-card'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isWinner ? 'bg-brand text-white' : 'bg-slate-700 text-slate-400'}`}>
            {supplierIndex + 1}
          </div>
          <span className="text-sm font-semibold text-slate-200">Fornecedor #{supplierIndex + 1}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleSetWinner}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isWinner 
              ? 'bg-brand text-white' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {isWinner ? 'Vencedor' : 'Marcar como Vencedor'}
          </button>
          
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="p-2 h-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <Input
            label="Nome do Fornecedor"
            placeholder="Ex: Metalúrgica Silva"
            {...register(`items.${itemIndex}.suppliers.${supplierIndex}.name`)}
            error={errors.items?.[itemIndex]?.suppliers?.[supplierIndex]?.name?.message}
          />
        </div>
        <div className="md:col-span-3">
          <Input
            label="Preço Unitário (R$)"
            type="number"
            step="0.01"
            {...register(`items.${itemIndex}.suppliers.${supplierIndex}.price`, { valueAsNumber: true })}
            error={errors.items?.[itemIndex]?.suppliers?.[supplierIndex]?.price?.message}
          />
        </div>
        <div className="md:col-span-3">
          <Input
            label="Prazo (Dias)"
            type="number"
            {...register(`items.${itemIndex}.suppliers.${supplierIndex}.delivery_days`, { valueAsNumber: true })}
            error={errors.items?.[itemIndex]?.suppliers?.[supplierIndex]?.delivery_days?.message}
          />
        </div>
        <div className="md:col-span-12">
          <textarea
            className="flex min-h-[60px] w-full rounded-md border border-surface-border bg-surface-bg px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder="Observações do fornecedor (opcional)..."
            {...register(`items.${itemIndex}.suppliers.${supplierIndex}.observations`)}
          />
        </div>
      </div>
    </div>
  );
};
