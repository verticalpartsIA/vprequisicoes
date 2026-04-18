'use client';

import React from 'react';
import { AlertTriangle, MessageSquareQuote } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface UrgencyJustificationCardProps {
  days: number;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watchValue?: string;
}

export const UrgencyJustificationCard = ({ days, register, errors, watchValue = "" }: UrgencyJustificationCardProps) => {
  const daysNum = Number(days);
  if (daysNum > 5) return null;

  return (
    <div 
      id="urgency-card"
      className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-6 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-rose-500/5"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-1 italic">Solicitação em Caráter de Urgência</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Esta viagem está planejada para daqui a <span className="text-white font-bold">{isNaN(daysNum) ? 'poucos' : daysNum} dias</span>. 
            Políticas corporativas exigem uma justificativa detalhada para aprovação imediata pela diretoria.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-4 left-4 text-slate-700">
          <MessageSquareQuote className="w-5 h-5" />
        </div>
        <textarea
          {...register('urgency_justification')}
          placeholder="Descreva o motivo da urgência, impacto no negócio e por que não pôde ser planejado com antecedência..."
          className={`w-full bg-slate-950 border-2 rounded-2xl p-4 pl-12 h-32 text-xs text-white placeholder:text-slate-700 outline-none transition-all focus:ring-4 ${
            errors.urgency_justification ? 'border-rose-500/50 focus:ring-rose-500/10' : 'border-surface-border focus:border-brand focus:ring-brand/10'
          }`}
        />
        <div className="flex justify-between mt-2 px-1">
          <p className="text-[10px] font-bold text-rose-500">
            {errors.urgency_justification?.message ? String(errors.urgency_justification.message) : ''}
          </p>
          <p className={`text-[10px] font-black uppercase tracking-tighter ${watchValue.length >= 20 ? 'text-emerald-500' : 'text-slate-600'}`}>
            {watchValue.length} / 20 caracteres min.
          </p>
        </div>
      </div>
    </div>
  );
};
