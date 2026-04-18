'use client';

import React from 'react';
import { Award, ShoppingCart, DollarSign } from 'lucide-react';
import { TopSupplier } from '@core/analytics/types';

interface TopSuppliersTableProps {
  suppliers: TopSupplier[];
}

export const TopSuppliersTable = ({ suppliers }: TopSuppliersTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-surface-border/30 text-slate-500 text-[9px] uppercase font-black tracking-[0.2em]">
            <th className="pb-4 pl-4">Ranking</th>
            <th className="pb-4">Fornecedor</th>
            <th className="pb-4 text-center">Pedidos</th>
            <th className="pb-4 text-right pr-4">Total Gasto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border/10">
          {suppliers.map((s, i) => (
            <tr key={i} className="group hover:bg-white/5 transition-colors">
              <td className="py-5 pl-4">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  i === 0 ? 'bg-brand text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{i + 1}
                </div>
              </td>
              <td className="py-5">
                <span className="text-xs font-bold text-slate-200 group-hover:text-brand transition-colors">{s.name}</span>
              </td>
              <td className="py-5 text-center">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
                  <ShoppingCart className="w-3 h-3" /> {s.order_count}
                </div>
              </td>
              <td className="py-5 text-right pr-4">
                <div className="flex items-center justify-end gap-1 text-sm font-mono font-black text-brand-success">
                  <DollarSign className="w-3 h-3" />
                  {s.total_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
