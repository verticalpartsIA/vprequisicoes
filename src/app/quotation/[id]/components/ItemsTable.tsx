'use client';

import React from 'react';
import { Plus, Trash2, Store, CheckCircle2, Clock, DollarSign, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAX_SUPPLIERS = 3;

export type WinReason = 'price' | 'deadline' | 'both';

export interface Supplier {
  name: string;
  price: number;
  delivery_days: number;
  is_winner: boolean;
  win_reason?: WinReason;
}

export interface QuotationItem {
  nome?: string;
  description?: string;
  especificacao?: string;
  quantidade: number;
  suppliers: Supplier[];
}

interface ItemsTableProps {
  items: QuotationItem[];
  onAddSupplier: (itemIdx: number) => void;
  onRemoveSupplier: (itemIdx: number, supplierIdx: number) => void;
  onUpdateSupplier: (itemIdx: number, supplierIdx: number, field: 'name' | 'price' | 'delivery_days' | 'win_reason', value: string | number) => void;
  onSetWinner: (itemIdx: number, supplierIdx: number) => void;
}

const WIN_REASON_OPTIONS: { value: WinReason; label: string; icon: React.ReactNode }[] = [
  { value: 'price',    label: 'Melhor Preço',    icon: <DollarSign className="w-3 h-3" /> },
  { value: 'deadline', label: 'Melhor Prazo',    icon: <Clock className="w-3 h-3" /> },
  { value: 'both',     label: 'Preço e Prazo',   icon: <Trophy className="w-3 h-3" /> },
];

export const ItemsTable = ({ items, onAddSupplier, onRemoveSupplier, onUpdateSupplier, onSetWinner }: ItemsTableProps) => {
  const grandTotal = items.reduce((acc, item) => {
    const winner = item.suppliers.find(s => s.is_winner);
    return acc + (winner ? winner.price * item.quantidade : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {items.map((item, itemIdx) => {
        const winner = item.suppliers.find(s => s.is_winner);
        const itemTotal = winner ? winner.price * item.quantidade : 0;

        return (
          <div key={itemIdx} className="rounded-xl border border-white/5 bg-slate-900/20 overflow-hidden">
            {/* Cabeçalho do item */}
            <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono text-xs">{(itemIdx + 1).toString().padStart(2, '0')}</span>
                <div>
                  <p className="text-white font-medium">{item.nome || item.description}</p>
                  {item.especificacao && (
                    <p className="text-[10px] text-slate-500">{item.especificacao}</p>
                  )}
                </div>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 text-xs font-bold">
                  Qtd: {item.quantidade}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Vencedor</p>
                  <p className={`text-lg font-black ${itemTotal > 0 ? 'text-brand' : 'text-slate-600'}`}>
                    {itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={item.suppliers.length >= MAX_SUPPLIERS}
                  onClick={() => onAddSupplier(itemIdx)}
                  className="text-xs border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Fornecedor
                </Button>
              </div>
            </div>

            {/* Cabeçalho da tabela de fornecedores */}
            {item.suppliers.length > 0 && (
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/5 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                <div className="col-span-1" />
                <div className="col-span-4">Fornecedor</div>
                <div className="col-span-2 text-right">Preço Unit.</div>
                <div className="col-span-2 text-right">Prazo (dias)</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1" />
              </div>
            )}

            {/* Linhas de fornecedores */}
            <div className="divide-y divide-white/5">
              {item.suppliers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm border-2 border-dashed border-white/10 m-4 rounded-lg">
                  Nenhum fornecedor adicionado. Clique em &quot;+ Fornecedor&quot; para começar.
                </div>
              ) : (
                item.suppliers.map((supplier, supIdx) => (
                  <div key={supIdx}>
                    {/* Linha principal do fornecedor */}
                    <div
                      className={`grid grid-cols-12 gap-2 items-center px-4 py-3 transition-colors ${
                        supplier.is_winner ? 'bg-brand/5' : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Número */}
                      <div className="col-span-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          supplier.is_winner ? 'bg-brand text-slate-950' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {supIdx + 1}
                        </div>
                      </div>

                      {/* Nome */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-2 bg-slate-950/50 px-2 py-1.5 rounded-lg border border-white/5">
                          <Store className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                          <Input
                            placeholder="Nome do Fornecedor"
                            className="h-7 bg-transparent border-none focus:ring-0 text-sm p-0"
                            defaultValue={supplier.name}
                            onBlur={(e) => onUpdateSupplier(itemIdx, supIdx, 'name', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Preço */}
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="0,00"
                          className={`h-7 text-right font-bold text-sm ${
                            supplier.is_winner
                              ? 'bg-brand/10 border-brand/40 text-brand'
                              : 'bg-brand/5 border-brand/20 text-brand'
                          }`}
                          defaultValue={supplier.price || ''}
                          onChange={(e) => onUpdateSupplier(itemIdx, supIdx, 'price', Number(e.target.value))}
                        />
                      </div>

                      {/* Prazo */}
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="0"
                          className={`h-7 text-right font-bold text-sm ${
                            supplier.is_winner
                              ? 'bg-brand/10 border-brand/40 text-slate-200'
                              : 'bg-white/5 border-white/10 text-slate-300'
                          }`}
                          defaultValue={supplier.delivery_days || ''}
                          onChange={(e) => onUpdateSupplier(itemIdx, supIdx, 'delivery_days', Number(e.target.value))}
                        />
                      </div>

                      {/* Total linha */}
                      <div className="col-span-2 text-right">
                        <span className={`font-mono text-sm font-bold ${supplier.is_winner ? 'text-brand' : 'text-slate-400'}`}>
                          {(supplier.price * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>

                      {/* Ações */}
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onSetWinner(itemIdx, supIdx)}
                          title={supplier.is_winner ? 'Vencedor' : 'Marcar como Vencedor'}
                          className={`p-1.5 rounded-full transition-all ${
                            supplier.is_winner
                              ? 'bg-brand text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSupplier(itemIdx, supIdx)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Seletor de motivo — só aparece na linha vencedora */}
                    {supplier.is_winner && (
                      <div className="px-4 py-3 bg-brand/5 border-t border-brand/10 flex items-center gap-3 flex-wrap">
                        <span className="text-[10px] text-brand uppercase font-black tracking-widest flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Por que venceu:
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {WIN_REASON_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => onUpdateSupplier(itemIdx, supIdx, 'win_reason', opt.value)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                supplier.win_reason === opt.value
                                  ? 'bg-brand text-slate-950 border-brand'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-brand/40 hover:text-brand'
                              }`}
                            >
                              {opt.icon}
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {!supplier.win_reason && (
                          <span className="text-[10px] text-amber-400 font-bold">⚠ Selecione o motivo</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Rodapé do item */}
            {item.suppliers.length > 0 && (
              <div className="px-4 py-2 flex justify-between items-center bg-white/5 border-t border-white/5">
                <span className="text-xs text-slate-500">
                  {winner
                    ? `Vencedor: ${winner.name || '(sem nome)'}`
                    : 'Nenhum vencedor selecionado'}
                </span>
                <span className="text-xs text-slate-500">
                  {item.suppliers.length}/{MAX_SUPPLIERS} fornecedores
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Total geral */}
      <div className="flex justify-end p-4 bg-white/5 rounded-xl border border-white/5">
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Geral (Vencedores)</p>
          <p className="text-2xl font-black text-brand">
            {grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
    </div>
  );
};
