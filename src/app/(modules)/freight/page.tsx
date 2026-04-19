'use client';

import React from 'react';
import { Truck, ShieldCheck, Clock } from 'lucide-react';
import { FreightRequestForm } from "@/components/forms/M5/FreightRequestForm";
import { PageFooterTutorial } from '@/components/layout/PageFooterTutorial';

export default function FreightPage() {
  const tutorialSteps = [
    {
      title: "Rota de Transporte",
      content: "Defina se o VerticalParts deve 'Trazer' (Inbound) ou 'Levar' (Outbound) a carga.",
      targetId: "m5-rota"
    },
    {
      title: "Cotação Automática",
      content: "Após o envio, o sistema buscará automaticamente as melhores taxas entre transportadoras parceiras.",
      targetId: "m5-cotacao"
    },
    {
      title: "Prazos de Entrega",
      content: "Fique atento à data desejada. Coletas emergenciais podem ter custos adicionais.",
      targetId: "m5-programacao"
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Módulo M5</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Logística e Fretes</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestão de <span className="text-brand">Transportes</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Solicite cotações de frete nacional e internacional. Integramos com as principais
            transportadoras para garantir o melhor custo-benefício e prazo.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-brand/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-brand" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">Seguro de Carga</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Cobertura Ativa para Todos os Envios</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">SLA de Cotação</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Resposta em até 4 horas úteis</p>
            </div>
          </div>
        </div>
      </div>

      <FreightRequestForm />

      <div className="mt-16 border-t border-slate-200 pt-8 text-center pb-16">
        <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">VerticalParts • Logistics Engine</p>
      </div>

      <PageFooterTutorial steps={tutorialSteps} />
    </div>
  );
}
