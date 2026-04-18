'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ProductRequestInput } from '@/lib/validation/schemas';

interface ProductItemCardProps {
  itemIndex: number;
  onRemove: () => void;
  formMethods: UseFormReturn<ProductRequestInput>;
}

export const ProductItemCard = ({ itemIndex, onRemove, formMethods }: ProductItemCardProps) => {
  const { register, formState: { errors } } = formMethods;

  return (
    <div className="relative group p-6 border border-surface-border bg-surface-bg/50 rounded-xl hover:border-brand/50 transition-all duration-300">
      <div className="absolute -top-3 left-4 px-2 bg-surface-bg text-xs font-bold text-brand uppercase tracking-wider border border-surface-border rounded">
        Item #{itemIndex + 1}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Nome do Produto */}
        <div className="md:col-span-12">
          <Input
            label="Nome do Produto"
            placeholder="Ex: Parafuso Sextavado M12"
            required
            aria-required="true"
            {...register(`itens.${itemIndex}.nome` as const)}
            error={errors.itens?.[itemIndex]?.nome?.message}
          />
        </div>

        {/* Quantidade */}
        <div className="md:col-span-4">
          <Input
            label="Quantidade"
            type="number"
            min="1"
            required
            aria-required="true"
            {...register(`itens.${itemIndex}.quantidade` as const, { valueAsNumber: true })}
            error={errors.itens?.[itemIndex]?.quantidade?.message}
          />
        </div>

        {/* Especificação */}
        <div className="md:col-span-8">
          <Input
            label="Especificação Técnica"
            placeholder="Ex: 50mm, Aço Inox 304"
            {...register(`itens.${itemIndex}.especificacao` as const)}
            error={errors.itens?.[itemIndex]?.especificacao?.message}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remover Item
        </Button>
      </div>
    </div>
  );
};
