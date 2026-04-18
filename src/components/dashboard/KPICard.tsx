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
    <div className="p-6 bg-surface-card border border-surface-border rounded-3xl shadow-xl hover:border-brand/30 transition-all group animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-brand/5 rounded-2xl border border-brand/20 group-hover:bg-brand/10 transition-colors">
          {icon}
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
            isPositive 
              ? (inverse ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500')
              : (inverse ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-white tracking-tighter italic">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
        {suffix && <span className="text-sm font-bold text-slate-600">{suffix}</span>}
      </div>
    </div>
  );
};
