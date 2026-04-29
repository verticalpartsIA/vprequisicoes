'use client';

import React from 'react';
import { Plus, Trash2, Store, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAX_SUPPLIERS = 3;

export interface Supplier {
  name: string;
  price: number;
  is_winner: boolean;
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
  onUpdateSupplier: (itemIdx: number, supplierIdx: number, field: 'name' | 'price', value: string | number) => void;
  onSetWinner: (itemIdx: number, supplierIdx: number) => void;
}

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
            {/* Item header */}
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

            {/* Supplier rows */}
            <div className="divide-y divide-white/5">
              {item.suppliers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm border-2 border-dashed border-white/10 m-4 rounded-lg">
                  Nenhum fornecedor adicionado. Clique em &quot;+ Fornecedor&quot; para começar.
                </div>
              ) : (
                item.suppliers.map((supplier, supIdx) => (
                  <div
                    key={supIdx}
                    className={`p-4 flex items-center gap-3 transition-colors flex-wrap ${
                      supplier.is_winner ? 'bg-brand/5' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Número */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      supplier.is_winner ? 'bg-brand text-slate-950' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {supIdx + 1}
                    </div>

                    {/* Nome do fornecedor */}
                    <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-slate-950/50 p-2 rounded-lg border border-white/5">
                      <Store className="w-4 h-4 text-brand flex-shrink-0" />
                      <Input
                        placeholder="Nome do Fornecedor"
                        className="h-8 bg-transparent border-none focus:ring-0 text-sm p-0"
                        defaultValue={supplier.name}
                        onBlur={(e) => onUpdateSupplier(itemIdx, supIdx, 'name', e.target.value)}
                      />
                    </div>

                    {/* Preço unitário */}
                    <Input
                      type="number"
                      placeholder="0,00"
                      className={`h-8 w-28 text-right font-bold ${
                        supplier.is_winner
                          ? 'bg-brand/10 border-brand/40 text-brand'
                          : 'bg-brand/5 border-brand/20 text-brand'
                      }`}
                      defaultValue={supplier.price || ''}
                      onChange={(e) => onUpdateSupplier(itemIdx, supIdx, 'price', Number(e.target.value))}
                    />

                    {/* Total por fornecedor */}
                    <span className="text-slate-400 text-sm w-28 text-right font-mono">
                      {(supplier.price * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>

                    {/* Botão vencedor */}
                    <button
                      type="button"
                      onClick={() => onSetWinner(itemIdx, supIdx)}
                      className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                        supplier.is_winner
                          ? 'bg-brand text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      {supplier.is_winner ? 'Vencedor' : 'Marcar Vencedor'}
                    </button>

                    {/* Remover */}
                    <button
                      type="button"
                      onClick={() => onRemoveSupplier(itemIdx, supIdx)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer do item */}
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
