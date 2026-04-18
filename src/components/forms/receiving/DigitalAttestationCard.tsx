'use client';

import React from 'react';
import { ShieldCheck, MessageSquare, AlertCircle, FileText } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';

interface DigitalAttestationCardProps {
  register: UseFormRegister<any>;
  errors: any;
  ticketType: string;
}

export const DigitalAttestationCard = ({ register, errors, ticketType }: DigitalAttestationCardProps) => {
  const typeLabel = ticketType === 'M2' ? 'Viagem' : 'Serviço';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 bg-brand/5 border border-brand/20 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand/10 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-brand" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Ateste de Execução Digital</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Confirmação de entrega para {typeLabel}</p>
          </div>
        </div>

        <div className="p-6 bg-slate-950/50 rounded-2xl border border-surface-border/50">
          <div className="flex items-start gap-4">
            <div className="pt-1">
              <input 
                type="checkbox"
                id="execution_confirmed"
                {...register('execution_confirmed')}
                className="w-5 h-5 rounded border-surface-border bg-slate-900 text-brand focus:ring-brand"
              />
            </div>
            <label htmlFor="execution_confirmed" className="cursor-pointer">
              <span className="text-sm font-bold text-slate-200 block mb-1">Confirmo que o {typeLabel.toLowerCase()} foi executado conforme o pedido.</span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Ao marcar esta opção, você atesta a veracidade da execução para fins de faturamento e liberação de pagamento ao fornecedor.</p>
              {errors.execution_confirmed && (
                <p className="text-[10px] text-rose-500 font-black mt-2 uppercase flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.execution_confirmed.message}
                </p>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Observações do Ateste</label>
          </div>
          <textarea 
            {...register('notes')}
            placeholder="Descreva brevemente como foi a execução (ex: serviço concluído dentro do prazo, voo realizado etc.)"
            className={`w-full bg-slate-950 border ${errors.notes ? 'border-rose-500' : 'border-surface-border'} rounded-2xl px-5 py-4 text-sm text-slate-300 focus:ring-2 focus:ring-brand outline-none min-h-[120px] shadow-inner`}
          />
          {errors.notes && (
            <p className="text-[10px] text-rose-500 font-black uppercase flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.notes.message}
            </p>
          )}
        </div>
      </div>

      <div className="p-6 bg-slate-900/30 border border-dashed border-surface-border/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <FileText className="w-8 h-8 text-slate-600" />
          <div>
            <p className="text-xs font-bold text-slate-400">Anexar Comprovantes (Opcional)</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-1">PDF, JPG ou PNG até 5MB</p>
          </div>
          <button type="button" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg uppercase tracking-widest transition-colors">
            Selecionar Arquivos
          </button>
      </div>
    </div>
  );
};
