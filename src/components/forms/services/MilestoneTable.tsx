'use client';

import React from 'react';
import { useFieldArray, Control, UseFormRegister, FieldErrors, useWatch } from 'react-hook-form';
import { Plus, Trash2, Info, CheckCircle2, AlertCircle, MessageSquareQuote } from 'lucide-react';
import { MILESTONE_TOTAL_PERCENTAGE } from '@/../packages/modules/M3-services/constants';

interface MilestoneTableProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export const MilestoneTable = ({ control, register, errors }: MilestoneTableProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones"
  });

  const milestones = useWatch({ control, name: 'milestones' }) || [];
  const currentTotal = milestones.reduce((acc: number, m: any) => acc + (Number(m.percentage) || 0), 0);
  const isComplete = currentTotal === MILESTONE_TOTAL_PERCENTAGE;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-brand/10 rounded-lg">
              <Info className="w-5 h-5 text-brand" />
           </div>
           <div>
              <p className="text-sm font-bold text-white uppercase tracking-tighter italic">Cronograma de Medição</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">A soma deve ser exatamente 100%</p>
           </div>
        </div>

        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all duration-300 ${isComplete ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
           {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4 animate-pulse" />}
           <span className="text-xs font-black uppercase tracking-widest">{currentTotal}% / 100%</span>
        </div>
      </div>

      <div className="overflow-hidden border border-surface-border rounded-2xl bg-slate-950/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-surface-border">
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Etapa / Marco</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24">%</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição (Opcional)</th>
              <th className="p-4 w-12 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50">
            {fields.map((field, index) => (
              <tr key={field.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="p-3">
                  <input 
                    {...register(`milestones.${index}.name`)}
                    placeholder="Ex: Entrega de Material"
                    className="w-full bg-transparent border-none p-2 text-xs text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-brand/30 rounded-lg"
                  />
                  {errors.milestones?.[index]?.name && (
                    <p className="text-[8px] text-rose-500 font-bold ml-2">{errors.milestones[index].name?.message}</p>
                  )}
                </td>
                <td className="p-3">
                  <input 
                    type="number"
                    {...register(`milestones.${index}.percentage`, { valueAsNumber: true })}
                    className="w-full bg-slate-900 border border-surface-border p-2 text-xs text-center text-white rounded-xl outline-none focus:border-brand transition-all"
                  />
                </td>
                <td className="p-3">
                  <input 
                    {...register(`milestones.${index}.description`)}
                    placeholder="Detalhes..."
                    className="w-full bg-transparent border-none p-2 text-xs text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-brand/30 rounded-lg"
                  />
                </td>
                <td className="p-3 text-center">
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="p-2 hover:bg-rose-500/10 hover:text-rose-500 text-slate-600 transition-all rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {fields.length === 0 && (
          <div className="p-10 text-center space-y-2 opacity-30">
             <MessageSquareQuote className="w-8 h-8 mx-auto text-slate-600" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nenhuma etapa definida</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => append({ name: '', percentage: 0, description: '' })}
        className="w-full py-4 border-2 border-dashed border-surface-border rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-brand hover:border-brand font-black text-[10px] uppercase tracking-widest transition-all"
      >
        <Plus className="w-4 h-4" /> Adicionar Etapa de Pagamento
      </button>

      <div className="p-4 bg-slate-900/50 rounded-2xl border border-surface-border flex items-start gap-4">
         <Info className="w-5 h-5 text-slate-500 shrink-0" />
         <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">
            Mensagem educativa: As etapas de medição são apenas informativas para o financeiro. O sistema aprova o valor total da requisição.
         </p>
      </div>

      {errors.milestones && !Array.isArray(errors.milestones) && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 animate-bounce">
           <AlertCircle className="w-5 h-5 text-rose-500" />
           <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
              {(errors.milestones as any).message}
           </p>
        </div>
      )}
    </div>
  );
};
