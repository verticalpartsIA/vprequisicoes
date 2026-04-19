'use client';

import React from 'react';
import { Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { ReceivingInput } from '@/lib/validation/schemas';
import { DIVERGENCE_REASONS } from '@modules/receiving/constants';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface ReceiptItemRowProps {
  index: number;
  description: string;
  quantityPurchased: number;
  register: UseFormRegister<any>;
  errors: any;
  watchedCondition: string;
  watchedReceived: number;
}

export const ReceiptItemRow = ({
  index,
  description,
  quantityPurchased,
  register,
  errors,
  watchedCondition,
  watchedReceived
}: ReceiptItemRowProps) => {

  const isDivergent = watchedCondition !== 'ok' || watchedReceived !== quantityPurchased;

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 ${
      isDivergent ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-50 border-surface-border'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5 space-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-brand" />
            <span className="text-sm font-bold text-slate-900">{description}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Comprado: <span className="text-slate-700">{quantityPurchased} un</span>
          </p>
        </div>

        <div className="md:col-span-2">
          <Input
            label="Qtd Recebida"
            type="number"
            {...register(`items.${index}.quantity_received`, { valueAsNumber: true })}
            error={errors.items?.[index]?.quantity_received?.message}
            className="h-9 text-xs"
          />
        </div>

        <div className="md:col-span-2">
          <Select
            label="Condição"
            {...register(`items.${index}.condition`)}
            error={errors.items?.[index]?.condition?.message}
            className="h-9 text-xs"
          >
            <option value="ok">Perfeito Estado</option>
            <option value="damaged">Avariado</option>
            <option value="missing">Faltante</option>
          </Select>
        </div>

        <div className="md:col-span-3">
          {isDivergent ? (
            <div className="animate-in fade-in slide-in-from-right-2">
              <Select
                label="Motivo da Divergência"
                {...register(`items.${index}.divergence_reason`)}
                error={errors.items?.[index]?.divergence_reason?.message}
                icon={<AlertCircle className="w-3 h-3 text-rose-500" />}
                className="h-9 text-[10px] bg-rose-500/10 border-rose-500/30 text-rose-200"
              >
                <option value="">Selecione o motivo...</option>
                {DIVERGENCE_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-emerald-500/40 text-[10px] font-black uppercase tracking-widest gap-1">
                <CheckCircle2 className="w-5 h-5" />
                Validado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
