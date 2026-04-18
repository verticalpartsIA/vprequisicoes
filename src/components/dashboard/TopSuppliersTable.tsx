'use client';

import React from 'react';
import { ShoppingCart, DollarSign } from 'lucide-react';
import { TopSupplier } from '@core/analytics/types';

interface TopSuppliersTableProps {
  suppliers: TopSupplier[];
}

export const TopSuppliersTable = ({ suppliers }: TopSuppliersTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <th className="pb-4 pl-4">#</th>
            <th className="pb-4">Fornecedor</th>
            <th className="pb-4 text-center">Pedidos</th>
            <th className="pb-4 text-right pr-4">Total Gasto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {suppliers.map((s, i) => (
            <tr key={i} className="group hover:bg-slate-50 transition-colors">
              <td className="py-4 pl-4">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  i === 0 ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {i + 1}
                </div>
              </td>
              <td className="py-4">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-brand transition-colors">{s.name}</span>
              </td>
              <td className="py-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                  <ShoppingCart className="w-3 h-3" /> {s.order_count}
                </div>
              </td>
              <td className="py-4 text-right pr-4">
                <div className="flex items-center justify-end gap-1 text-sm font-mono font-bold text-emerald-700">
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
