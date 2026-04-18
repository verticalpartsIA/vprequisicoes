'use client';

import React from 'react';
import { Plane, Info, ShieldCheck } from 'lucide-react';
import { TravelRequestForm } from '@/components/forms/M2/TravelRequestForm';

export default function TravelPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl animate-in fade-in duration-1000">
      
      {/* HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
                <span className="text-[10px] font-black text-brand uppercase tracking-widest">Módulo M2</span>
             </div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">• VerticalParts Travel</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            Requisição de <span className="text-brand">Viagem</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-tight max-w-xl">
            Gestão de deslocamento corporativo, hospedagem e logística. Suas solicitações passam por cotação competitiva automática.
          </p>
        </div>

        <div className="hidden lg:flex flex-col items-end text-right space-y-2">
           <div className="p-4 bg-slate-900/50 backdrop-blur-md border border-surface-border rounded-2xl flex items-center gap-4">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">Compliance Ativo</p>
                 <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">SLA de Cotação: 24h</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-brand" />
           </div>
        </div>
      </div>

      {/* ALERTA DE POLÍTICA */}
      <div className="mb-10 p-4 bg-slate-950 border-l-4 border-brand rounded-r-2xl flex items-center gap-4 shadow-xl">
        <Info className="w-5 h-5 text-brand shrink-0" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed">
          Lembre-se: Viagens com menos de <span className="text-white">5 dias de antecedência</span> exigem justificativa mandatória para a diretoria. 
          Certifique-se de que seu destino possua cobertura do seguro corporativo.
        </p>
      </div>

      <TravelRequestForm />

      {/* FOOTER INFORMATIVO */}
      <div className="mt-20 border-t border-surface-border/30 pt-10 text-center space-y-4 pb-20">
         <Plane className="w-10 h-10 text-slate-800 mx-auto opacity-30" />
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">VerticalParts • Procurement Engine v2</p>
      </div>
    </div>
  );
}
