'use client';

import React from 'react';
import { Briefcase, ShieldCheck, ClipboardCheck } from 'lucide-react';
import { ServiceRequestForm } from '@/components/forms/M3/ServiceRequestForm';

export default function ServicesPage() {
  return (
    <div className="container mx-auto py-16 px-6 max-w-6xl animate-in fade-in duration-1000">
      
      {/* HEADER ESTRATÉGICO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="px-4 py-1.5 bg-brand/10 border border-brand/30 rounded-full shadow-lg shadow-brand/5">
                <span className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">Módulo M3</span>
             </div>
             <div className="h-1 w-12 bg-slate-800 rounded-full" />
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Serviços e Mão de Obra</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
            Requisição <br /> de <span className="text-brand">Serviços</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-tight max-w-2xl text-lg leading-relaxed">
            Contrate mão de obra terceirizada para manutenção, reparos ou instalações complexas. 
            Defina etapas de medição claras para garantir a qualidade da entrega.
          </p>
        </div>

        <div className="flex flex-col gap-4">
           <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-surface-border rounded-3xl flex items-center gap-6 shadow-2xl">
              <div className="p-4 bg-brand/10 rounded-2xl">
                 <ShieldCheck className="w-8 h-8 text-brand" />
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Compliance de Terceiros</p>
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">Verificação de Documentação Ativa</p>
              </div>
           </div>
           
           <div className="p-6 bg-slate-950 border border-surface-border/50 rounded-3xl flex items-center gap-6 shadow-xl">
              <div className="p-4 bg-emerald-500/10 rounded-2xl">
                 <ClipboardCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Pagamento por Medição</p>
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">Acompanhe cronogramas financeiros</p>
              </div>
           </div>
        </div>
      </div>

      {/* FORMULÁRIO PRINCIPAL */}
      <ServiceRequestForm />

      {/* FOOTER INFORMATIVO */}
      <div className="mt-24 border-t-2 border-surface-border/20 pt-16 text-center space-y-6 pb-24">
         <Briefcase className="w-12 h-12 text-slate-800 mx-auto opacity-20" />
         <div className="space-y-2">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">VerticalParts • Labor Procurement Engine</p>
            <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">v3.0.1 • Protocolo SDD Validado</p>
         </div>
      </div>
    </div>
  );
}
