'use client';

import React from 'react';
import { Briefcase, ShieldCheck, ClipboardCheck } from 'lucide-react';
import { ServiceRequestForm } from '@/components/forms/M3/ServiceRequestForm';

export default function ServicesPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Módulo M3</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Serviços e Mão de Obra</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Requisição de <span className="text-brand">Serviços</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Contrate mão de obra terceirizada para manutenção, reparos ou instalações complexas.
            Defina etapas de medição claras para garantir a qualidade da entrega.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-brand/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-brand" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">Compliance de Terceiros</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Verificação de Documentação Ativa</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">Pagamento por Medição</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Acompanhe cronogramas financeiros</p>
            </div>
          </div>
        </div>
      </div>

      <ServiceRequestForm />

      <div className="mt-16 border-t border-slate-200 pt-8 text-center pb-16">
        <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">VerticalParts • Labor Procurement Engine</p>
      </div>

    </div>
  );
}
