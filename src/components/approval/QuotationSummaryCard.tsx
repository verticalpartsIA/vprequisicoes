'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, Trophy, DollarSign, Clock, CheckCircle2, Hash } from 'lucide-react';

interface QuotationSummaryCardProps {
  quotation: any;
  items: any[];
  ticketNumber?: string;
}

const WIN_REASON_LABEL: Record<string, { label: string; color: string }> = {
  price:    { label: 'Melhor Preço',  color: 'text-emerald-400' },
  deadline: { label: 'Melhor Prazo',  color: 'text-blue-400' },
  both:     { label: 'Preço e Prazo', color: 'text-brand' },
};

export const QuotationSummaryCard = ({ quotation, items, ticketNumber }: QuotationSummaryCardProps) => {
  if (!quotation) return null;

  const quotationItems: any[] = quotation.items || [];
  const displayItems = quotationItems.length > 0 ? quotationItems : items;

  return (
    <Card className="border-brand/20 bg-brand/5 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-brand/10 border-b border-brand/10 py-4">
        <CardTitle className="text-sm font-bold flex items-center justify-between text-brand">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            Resultado da Cotação
          </div>
          {ticketNumber && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <Hash className="w-3 h-3" />
              {ticketNumber}
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-brand/10">
          {displayItems.map((item: any, idx: number) => {
            const suppliers: any[] = item.suppliers || [];
            const winner = suppliers.find((s: any) => s.is_winner);
            const winInfo = winner?.win_reason ? WIN_REASON_LABEL[winner.win_reason] : null;
            const itemQty = item.quantidade || item.quantity || 1;

            return (
              <div key={idx} className="p-4 space-y-3">
                {/* Cabeçalho do item */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Item {idx + 1}</p>
                    <p className="text-sm font-bold text-slate-200">{item.nome || item.description || '—'}</p>
                  </div>
                  <span className="text-xs text-slate-500">Qtd: {itemQty}</span>
                </div>

                {/* Tabela de fornecedores */}
                {suppliers.length > 0 ? (
                  <div className="space-y-1">
                    {suppliers.map((s: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                          s.is_winner
                            ? 'bg-brand/10 border border-brand/30'
                            : 'bg-slate-900/50 border border-white/5'
                        }`}
                      >
                        {/* Número */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                          s.is_winner ? 'bg-brand text-slate-950' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {sIdx + 1}
                        </div>

                        {/* Nome */}
                        <div className="flex-1 flex items-center gap-1.5">
                          {s.is_winner && <CheckCircle2 className="w-3 h-3 text-brand flex-shrink-0" />}
                          <span className={`font-semibold truncate ${s.is_winner ? 'text-white' : 'text-slate-400'}`}>
                            {s.name || '—'}
                          </span>
                        </div>

                        {/* Preço */}
                        <div className="flex items-center gap-1 text-[10px]">
                          <DollarSign className="w-3 h-3 text-slate-500" />
                          <span className={`font-mono font-bold ${s.is_winner ? 'text-brand' : 'text-slate-400'}`}>
                            {Number(s.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>

                        {/* Prazo */}
                        <div className="flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-400">{s.delivery_days || 0}d</span>
                        </div>

                        {/* Badge vencedor + motivo */}
                        {s.is_winner && winInfo && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 bg-brand/20 rounded-full text-[10px] font-black ${winInfo.color}`}>
                            <Trophy className="w-2.5 h-2.5" />
                            {winInfo.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Formato legado
                  <div className="p-2 bg-slate-900/50 border border-white/5 rounded-lg text-xs text-slate-400">
                    {item.supplier_name || item.winner?.name || 'Aguardando cotação'}
                    {(item.quoted_price || item.winner?.price) && (
                      <span className="ml-2 text-brand font-bold">
                        {Number(item.quoted_price || item.winner?.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    )}
                  </div>
                )}

                {/* Total do item (vencedor) */}
                {winner && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-brand/10">
                    <span className="text-slate-500">Subtotal vencedor</span>
                    <span className="font-black text-white font-mono">
                      {(Number(winner.price || 0) * itemQty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}

                {!winner && suppliers.length === 0 && (
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] text-rose-500 font-bold uppercase">
                    Aguardando Cotação Vencedora
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total geral */}
        <div className="p-4 bg-brand/10 border-t border-brand/20 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Total Consolidado</span>
          <span className="text-xl font-black text-brand font-mono">
            {Number(quotation.total_amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
