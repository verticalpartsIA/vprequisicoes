'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, Truck, Calendar, Info } from 'lucide-react';

interface QuotationSummaryCardProps {
  quotation: any;
  items: any[];
}

export const QuotationSummaryCard = ({ quotation, items }: QuotationSummaryCardProps) => {
  if (!quotation || !quotation.items) return null;

  return (
    <Card className="border-brand/20 bg-brand/5 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-brand/10 border-b border-brand/10 py-4">
        <CardTitle className="text-sm font-bold flex items-center text-brand">
          <BadgeCheck className="w-4 h-4 mr-2" />
          Resultado da Cotação
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-brand/10">
          {items.map((item: any, idx: number) => {
            const winners = quotation.items[idx]?.suppliers?.filter((s: any) => s.is_winner) || [];
            const winner = winners[0];

            return (
              <div key={idx} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Item {idx + 1}</p>
                    <p className="text-sm font-bold text-slate-200">{item.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Qtd: {item.quantidade}</p>
                  </div>
                </div>

                {winner ? (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-brand-success/10 rounded-lg">
                        <BadgeCheck className="w-4 h-4 text-brand-success" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Fornecedor</p>
                        <p className="text-xs font-semibold text-slate-300">{winner.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-brand/10 rounded-lg">
                        <Truck className="w-4 h-4 text-brand" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Prazo</p>
                        <p className="text-xs font-semibold text-slate-300">{winner.delivery_days} dias</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-slate-800 rounded-lg">
                        <Calendar className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Preço Unitário</p>
                        <p className="text-xs font-bold text-brand-success">
                          {Number(winner.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-brand/20 rounded-lg">
                        <Info className="w-4 h-4 text-brand" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Subtotal</p>
                        <p className="text-xs font-black text-white">
                          {(Number(winner.price) * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] text-rose-500 font-bold uppercase">
                    Aguardando Cotação Vencedora
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-brand/10 border-t border-brand/20 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Total Consolidado</span>
          <span className="text-xl font-black text-brand-success font-mono">
            {Number(quotation.total_amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
