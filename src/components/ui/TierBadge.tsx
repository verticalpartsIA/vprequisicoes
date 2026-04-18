'use client';

import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import { getTierLabel } from '@core/validation/approvalTiers';

interface TierBadgeProps {
  tier: 1 | 2 | 3;
  hasPermission?: boolean;
}

export const TierBadge = ({ tier, hasPermission = true }: TierBadgeProps) => {
  const configs = {
    1: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: ShieldCheck },
    2: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Shield },
    3: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: ShieldAlert },
  };

  const current = configs[tier] || configs[1];
  const Icon = hasPermission ? current.icon : Lock;
  const label = getTierLabel(tier);

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${current.color}`}>
      <Icon className="w-3 h-3 mr-1.5" />
      {label}
      {!hasPermission && <span className="ml-1 text-[8px] opacity-70">(Sem Alçada)</span>}
    </div>
  );
};
