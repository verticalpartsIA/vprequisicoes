'use client';

import React from 'react';
import { Gavel, ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';
import { AUCTION_MIN_VALUE } from '@modules/purchasing/constants';

interface PurchaseMethodSelectorProps {
  amount: number;
  method: 'auction' | 'direct';
  onChange: (method: 'auction' | 'direct') => void;
}

export const PurchaseMethodSelector = ({ amount, method, onChange }: PurchaseMethodSelectorProps) => {
  const isAuctionRecommended = amount >= AUCTION_MIN_VALUE;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Método de Aquisição</label>
        {isAuctionRecommended ? (
          <span className="flex items-center text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Leilão Recomendado
          </span>
        ) : (
          <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Compra Direta Recomendada
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('auction')}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
            method === 'auction'
              ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10'
              : 'border-surface-border bg-slate-50 hover:border-slate-300'
          }`}
        >
          <Gavel className={`w-8 h-8 mb-3 ${method === 'auction' ? 'text-brand' : 'text-slate-600'}`} />
          <span className={`text-sm font-bold uppercase tracking-tight ${method === 'auction' ? 'text-slate-900' : 'text-slate-500'}`}>
            Leilão Digital
          </span>
          <p className="text-[10px] text-slate-500 mt-2 text-center opacity-70">Redução de custo via disputa entre fornecedores</p>
        </button>

        <button
          type="button"
          onClick={() => onChange('direct')}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
            method === 'direct'
              ? 'border-brand-success bg-brand-success/5 shadow-lg shadow-brand-success/10'
              : 'border-surface-border bg-slate-50 hover:border-slate-300'
          }`}
        >
          <ShoppingCart className={`w-8 h-8 mb-3 ${method === 'direct' ? 'text-brand-success' : 'text-slate-600'}`} />
          <span className={`text-sm font-bold uppercase tracking-tight ${method === 'direct' ? 'text-slate-900' : 'text-slate-500'}`}>
            Compra Direta
          </span>
          <p className="text-[10px] text-slate-500 mt-2 text-center opacity-70">Execução imediata baseada na melhor cotação atual</p>
        </button>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-surface-border flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-slate-500 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          {method === 'auction'
            ? "O leilão digital convida fornecedores para uma rodada de lances reversos. Ideal para volumes acima de R$ 500,00 visando economia extra."
            : "A compra direta emite a Ordem de Compra imediatamente para o fornecedor vencedor da etapa anterior. Recomendado para urgências ou valores baixos."
          }
        </p>
      </div>
    </div>
  );
};
