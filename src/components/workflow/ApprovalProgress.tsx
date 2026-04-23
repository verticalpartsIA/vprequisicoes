'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalProgressProps {
  currentLevel: number;
  status: string;
}

export const ApprovalProgress = ({ currentLevel, status }: ApprovalProgressProps) => {
  const steps = [
    { level: 1, label: 'Gestor Direto', role: 'L1' },
    { level: 2, label: 'Gerência Depto', role: 'L2' },
    { level: 3, label: 'Diretoria Executiva', role: 'L3' },
  ];

  const isRejected = status === 'REJECTED';
  const isApproved = status === 'APPROVED';

  return (
    <div className="w-full py-6 px-4 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner">
      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
        {/* Linha de fundo */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />
        
        {steps.map((step, idx) => {
          const isActive = currentLevel === step.level && !isApproved && !isRejected;
          const isCompleted = currentLevel > step.level || isApproved;
          
          return (
            <div key={step.level} className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                isCompleted ? "bg-brand border-brand text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.4)]" :
                isActive ? "bg-slate-900 border-brand text-brand animate-pulse" :
                "bg-slate-900 border-white/20 text-white/40"
              )}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                 isActive ? <Clock className="w-6 h-6" /> :
                 <Circle className="w-6 h-6" />}
              </div>
              <div className="mt-3 text-center">
                <p className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isActive ? "text-brand" : isCompleted ? "text-white" : "text-white/30"
                )}>
                  {step.role}
                </p>
                <p className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isActive || isCompleted ? "text-slate-300" : "text-white/20"
                )}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {isRejected && (
        <div className="mt-6 text-center animate-bounce">
          <span className="px-4 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 uppercase tracking-widest">
            Fluxo Interrompido: Requisição Rejeitada
          </span>
        </div>
      )}
      
      {isApproved && (
        <div className="mt-6 text-center animate-in fade-in zoom-in duration-700">
          <span className="px-4 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30 uppercase tracking-widest">
            Fluxo Concluído: Totalmente Aprovado
          </span>
        </div>
      )}
    </div>
  );
};
