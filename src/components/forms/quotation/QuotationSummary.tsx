'use client';

import React from 'react';
import { ShoppingCart, CheckCircle, Calculator } from 'lucide-react';

interface QuotationSummaryProps {
  total: number;
  itemCount: number;
  completedCount: number;
}

export const QuotationSummary = ({ total, itemCount, completedCount }: QuotationSummaryProps) => {
  const isComplete = completedCount === itemCount && itemCount > 0;

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6 shadow-2xl sticky top-24">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center">
        <Calculator className="w-5 h-5 mr-3 text-brand" />
        Resumo da Cotação
      </h3>

      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-surface-border/50">
          <span className="text-slate-400 text-sm">Itens Cotados</span>
          <span className={`text-sm font-bold ${isComplete ? 'text-brand-success' : 'text-brand'}`}>
            {completedCount} / {itemCount}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 text-sm">Total Consolidado (Vencedores)</span>
          <div className="text-3xl font-mono font-bold text-brand-success">
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>

        {isComplete ? (
          <div className="flex items-center p-3 bg-brand-success/10 border border-brand-success/20 rounded-lg text-brand-success text-xs font-semibold">
            <CheckCircle className="w-4 h-4 mr-2" />
            Todos os itens possuem um vencedor selecionado.
          </div>
        ) : (
          <div className="flex items-center p-3 bg-brand/10 border border-brand/20 rounded-lg text-brand text-xs font-semibold animate-pulse">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Aguardando cotação de {itemCount - completedCount} itens.
          </div>
        )}
      </div>
    </div>
  );
};
