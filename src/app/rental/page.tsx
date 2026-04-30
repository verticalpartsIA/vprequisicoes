'use client';

import React, { useEffect, useState } from 'react';
import { PackageSearch, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { RentalRequestForm } from '@/components/forms/M6/RentalRequestForm';
import { realGet } from '@/lib/api/real-client';

export default function RentalPage() {
  const [activeTickets, setActiveTickets] = useState(0);

  useEffect(() => {
    realGet('/api/requests/rental')
      .then((res: any) => setActiveTickets(res.data?.length || 0))
      .catch(() => setActiveTickets(0));
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Módulo M6</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Locação de Equipamentos</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Requisição de <span className="text-brand">Locação</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Solicite a locação de equipamentos como munck, andaimes, empilhadeiras e ferramentais especiais.
            Cotação automática com as principais locadoras parceiras.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-brand/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-brand" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">Seguro de Equipamento</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">Cobertura durante todo o período</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">
                {activeTickets > 0 ? `${activeTickets} Locação(ões) Ativa(s)` : 'SLA de Cotação: 4h'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest">
                {activeTickets > 0 ? 'Equipamentos em uso' : 'Resposta garantida'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <RentalRequestForm />

      <div className="mt-16 border-t border-slate-200 pt-8 text-center pb-16">
        <PackageSearch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">VerticalParts • Equipment Rental Engine</p>
      </div>

    </div>
  );
}
