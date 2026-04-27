'use client';

import React from 'react';
import { Plus, Trash2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ItemsTableProps {
  items: any[];
  onUpdatePrice: (idx: number, supplier: string, price: number) => void;
}

export const ItemsTable = ({ items, onUpdatePrice }: ItemsTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
            <th className="p-4 font-bold">Item</th>
            <th className="p-4 font-bold">Descrição</th>
            <th className="p-4 font-bold text-center">Qtd</th>
            <th className="p-4 font-bold">Fornecedor</th>
            <th className="p-4 font-bold">Preço Unit (R$)</th>
            <th className="p-4 font-bold">Total (R$)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors group">
              <td className="p-4 text-slate-500 font-mono text-xs">{(idx + 1).toString().padStart(2, '0')}</td>
              <td className="p-4">
                <p className="text-white font-medium">{item.nome || item.description}</p>
                <p className="text-[10px] text-slate-500">{item.especificacao || 'Sem especificações'}</p>
              </td>
              <td className="p-4 text-center text-slate-300 font-bold">{item.quantidade}</td>
              <td className="p-4">
                <div className="flex items-center space-x-2 bg-slate-950/50 p-2 rounded-lg border border-white/5">
                  <Store className="w-4 h-4 text-brand" />
                  <Input 
                    placeholder="Nome do Fornecedor"
                    className="h-8 bg-transparent border-none focus:ring-0 text-sm p-0"
                    defaultValue={item.supplier_name || ''}
                    onBlur={(e) => onUpdatePrice(idx, e.target.value, item.quoted_price || 0)}
                  />
                </div>
              </td>
              <td className="p-4">
                <Input 
                  type="number"
                  placeholder="0,00"
                  className="h-8 w-24 bg-brand/5 border-brand/20 text-brand font-bold text-right"
                  defaultValue={item.quoted_price || ''}
                  onChange={(e) => onUpdatePrice(idx, item.supplier_name || '', Number(e.target.value))}
                />
              </td>
              <td className="p-4 text-right">
                <span className="text-white font-black">
                  {((item.quoted_price || 0) * (item.quantidade || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="p-4 flex justify-end items-center bg-white/5">
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Geral</p>
          <p className="text-2xl font-black text-brand">
            {items.reduce((acc, curr) => acc + ((curr.quoted_price || 0) * (curr.quantidade || 0)), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
    </div>
  );
};
