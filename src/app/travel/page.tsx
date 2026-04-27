'use client';

import React from 'react';
import { Plane, Info, ShieldCheck } from 'lucide-react';
import { TravelRequestForm } from '@/components/forms/M2/TravelRequestForm';
import { PageFooterTutorial } from "@/components/layout/PageFooterTutorial";

export default function TravelPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Módulo M2</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">VerticalParts Travel</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Requisição de <span className="text-brand">Viagem</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Gestão de deslocamento corporativo, hospedagem e logística. Suas solicitações passam por cotação competitiva automática.
          </p>
        </div>

        <div className="hidden lg:flex flex-col items-end text-right">
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700">Compliance Ativo</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">SLA de Cotação: 24h</p>
            </div>
            <ShieldCheck className="w-7 h-7 text-brand" />
          </div>
        </div>
      </div>

      {/* ALERTA DE POLÍTICA */}
      <div className="mb-8 p-4 bg-amber-50 border-l-4 border-brand rounded-r-xl flex items-center gap-4">
        <Info className="w-5 h-5 text-brand shrink-0" />
        <p className="text-xs font-medium text-slate-600 leading-relaxed">
          Viagens com menos de <span className="font-bold text-slate-900">5 dias de antecedência</span> exigem justificativa mandatória para a diretoria.
          Certifique-se de que seu destino possua cobertura do seguro corporativo.
        </p>
      </div>

      <TravelRequestForm />

      <PageFooterTutorial
        steps={[
          "Informe origem/destino",
          "Escolha as datas",
          "Defina transporte/hospedagem",
          "Solicite reserva"
        ]}
      />

      <div className="mt-16 border-t border-slate-200 pt-8 text-center pb-16">
        <Plane className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">VerticalParts • Procurement Engine v2</p>
      </div>
    </div>
  );
}
