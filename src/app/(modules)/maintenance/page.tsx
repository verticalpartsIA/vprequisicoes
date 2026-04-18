'use client';

import React from 'react';
import { Wrench, ShieldCheck, Zap } from 'lucide-react';
import { MaintenanceRequestForm } from '@/components/forms/M4/MaintenanceRequestForm';

export default function MaintenancePage() {
  return (
    <div className="container mx-auto py-16 px-6 max-w-6xl animate-in fade-in duration-1000">
      
      {/* HEADER ESTRATÉGICO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="px-4 py-1.5 bg-brand/10 border border-brand/30 rounded-full shadow-lg shadow-brand/5">
                <span className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">Módulo M4</span>
             </div>
             <div className="h-1 w-12 bg-slate-800 rounded-full" />
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Gestão de Ativos e Manutenção</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
            Requisição <br /> de <span className="text-brand">Manutenção</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-tight max-w-2xl text-lg leading-relaxed">
            Solicite reparos corretivos ou manutenções preventivas em ativos prediais e equipamentos. 
            Utilize contratos vigentes para acelerar a aprovação e execução.
          </p>
        </div>

        <div className="flex flex-col gap-4">
           <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-surface-border rounded-3xl flex items-center gap-6 shadow-2xl">
              <div className="p-4 bg-emerald-500/10 rounded-2xl">
                 <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Bypass de Cotação</p>
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">Contratos Ativos Prioritários</p>
              </div>
           </div>
           
           <div className="p-6 bg-slate-950 border border-surface-border/50 rounded-3xl flex items-center gap-6 shadow-xl">
              <div className="p-4 bg-rose-500/10 rounded-2xl">
                 <Zap className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Fluxo de Urgência</p>
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">Atendimento Imediato Corretivo</p>
              </div>
           </div>
        </div>
      </div>

      {/* FORMULÁRIO PRINCIPAL */}
      <MaintenanceRequestForm />

      {/* FOOTER INFORMATIVO */}
      <div className="mt-24 border-t-2 border-surface-border/20 pt-16 text-center space-y-6 pb-24">
         <Wrench className="w-12 h-12 text-slate-800 mx-auto opacity-20" />
         <div className="space-y-2">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">VerticalParts • Asset Maintenance Engine</p>
            <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">v4.0.0 • Protocolo de Contrato Validado</p>
         </div>
      </div>
    </div>
  );
}
