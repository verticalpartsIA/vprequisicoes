'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: number;
  icon: React.ReactNode;
  suffix?: string;
  inverse?: boolean;
}

export const KPICard = ({ label, value, delta, icon, suffix, inverse = false }: KPICardProps) => {
  const isPositive = delta && delta > 0;
  
  return (
    <div className="p-6 bg-surface-card border border-surface-border rounded-2xl shadow-sm hover:shadow-md hover:border-brand/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-brand/10 rounded-xl border border-brand/20 group-hover:bg-brand/20 transition-colors">
          {icon}
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
            isPositive
              ? (inverse ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700')
              : (inverse ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-slate-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
        {suffix && <span className="text-sm font-medium text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
};
