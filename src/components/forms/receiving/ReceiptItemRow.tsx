'use client';

import React from 'react';
import { Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { ReceivingInput } from '@/lib/validation/schemas';
import { DIVERGENCE_REASONS } from '@modules/receiving/constants';

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
      isDivergent ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-900/30 border-surface-border/50'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5 space-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-brand" />
            <span className="text-sm font-bold text-white">{description}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Comprado: <span className="text-slate-300">{quantityPurchased} un</span>
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1 block">Qtd Recebida</label>
          <input 
            type="number"
            {...register(`items.${index}.quantity_received`, { valueAsNumber: true })}
            className="w-full bg-slate-950 border border-surface-border rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-brand outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1 block">Condição</label>
          <select 
            {...register(`items.${index}.condition`)}
            className="w-full bg-slate-950 border border-surface-border rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-brand outline-none"
          >
            <option value="ok">Perfeito Estado</option>
            <option value="damaged">Avariado</option>
            <option value="missing">Faltante</option>
          </select>
        </div>

        <div className="md:col-span-3">
          {isDivergent ? (
            <div className="animate-in fade-in slide-in-from-right-2">
              <label className="text-[8px] font-black text-rose-500 uppercase tracking-tighter mb-1 block flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Motivo da Divergência
              </label>
              <select 
                {...register(`items.${index}.divergence_reason`)}
                className="w-full bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2 text-[10px] text-rose-200 focus:ring-1 focus:ring-rose-500 outline-none"
              >
                <option value="">Selecione o motivo...</option>
                {DIVERGENCE_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
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
