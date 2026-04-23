'use client';

import React from 'react';
import { Wrench, ShieldCheck, Zap } from 'lucide-react';
import { MaintenanceRequestForm } from '@/components/forms/M4/MaintenanceRequestForm';
import { PageFooterTutorial } from "@/components/layout/PageFooterTutorial";

export default function MaintenancePage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Módulo M4</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Gestão de Ativos e Manutenção</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Requisição de <span className="text-brand">Manutenção</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Solicite reparos corretivos ou manutenções preventivas em ativos prediais e equipamentos.
            Utilize contratos vigentes para acelerar a aprovação e execução.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">Bypass de Cotação</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Contratos Ativos Prioritários</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <Zap className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">Fluxo de Urgência</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Atendimento Imediato Corretivo</p>
            </div>
          </div>
        </div>
      </div>

      <MaintenanceRequestForm />

      <PageFooterTutorial
        steps={[
          "Selecione o ativo",
          "Descreva o problema",
          "Verifique se há contrato",
          "Confirme manutenção"
        ]}
      />

      <div className="mt-16 border-t border-slate-200 pt-8 text-center pb-16">
        <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">VerticalParts • Asset Maintenance Engine</p>
      </div>
    </div>
  );
}
