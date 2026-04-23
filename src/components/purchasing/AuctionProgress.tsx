'use client';

import React, { useEffect, useState } from 'react';
import { Gavel, Loader2, Trophy, Users, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuctionResult } from '@modules/purchasing/types';

interface AuctionProgressProps {
  onComplete: (result: AuctionResult) => void;
  initialPrice: number;
}

export const AuctionProgress = ({ onComplete, initialPrice }: AuctionProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Iniciando sala digital de negociação...",
    "Validando credenciais dos fornecedores participantes...",
    "Primeira rodada de lances em andamento...",
    "Disputa agressiva detectada! Reduzindo valor...",
    "Processando lance final vencedor...",
    "Leilão concluído com sucesso!"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 20); // 2 segundos total aprox

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 350);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <div className="p-8 bg-slate-900 border border-brand/30 rounded-3xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-brand/10 rounded-2xl animate-pulse">
            <Gavel className="w-8 h-8 text-brand" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Leilão Digital em Tempo Real</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Simulando Rodada de Lances Reversos</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Status</span>
          <div className="flex items-center text-brand font-black animate-pulse">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            AO VIVO
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{steps[currentStep]}</span>
          <span className="text-2xl font-mono font-black text-brand italic">{progress}%</span>
        </div>
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-brand-success to-brand rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center text-slate-500 gap-2 mb-1">
            <Users className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase">Participantes</span>
          </div>
          <p className="text-lg font-black text-white">3 Ativos</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-slate-500 gap-2 mb-1">
            <TrendingDown className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase">Preço Base</span>
          </div>
          <p className="text-lg font-black text-slate-400 line-through">
            {initialPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-brand gap-2 mb-1">
            <Trophy className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase">Menor Lance</span>
          </div>
          <p className="text-lg font-black text-brand-success animate-bounce">
            {(initialPrice * (1 - (progress * 0.0015))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
    </div>
  );
};
