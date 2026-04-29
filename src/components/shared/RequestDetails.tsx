'use client';

import React from 'react';
import {
  Plane,
  Wrench,
  Truck,
  Building,
  Package,
  MapPin,
  Calendar,
  Users,
  Trophy,
  DollarSign,
  Clock,
  CheckCircle2,
  Hash
} from 'lucide-react';

interface RequestDetailsProps {
  ticket: any;
}

export const RequestDetails = ({ ticket }: RequestDetailsProps) => {
  const module = ticket.module || ticket.type || '';
  const metadata = ticket.metadata || {};

  const WIN_REASON_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
    price:    { label: 'Melhor Preço',  icon: <DollarSign className="w-3 h-3" /> },
    deadline: { label: 'Melhor Prazo',  icon: <Clock className="w-3 h-3" /> },
    both:     { label: 'Preço e Prazo', icon: <Trophy className="w-3 h-3" /> },
  };

  const renderM1 = () => {
    const quotationItems: any[] = metadata.quotation?.items || [];
    const rawItems: any[] = ticket._itens || metadata.itens || [];

    // Usa os itens da cotação se disponíveis (têm os fornecedores), senão os originais
    const displayItems = quotationItems.length > 0 ? quotationItems : rawItems;

    return (
      <div className="space-y-6">
        {/* Número do ticket em destaque */}
        <div className="flex items-center gap-3 p-3 bg-brand/5 border border-brand/20 rounded-xl">
          <Hash className="w-4 h-4 text-brand" />
          <div>
            <p className="text-[10px] text-brand uppercase font-black tracking-widest">Número do Ticket</p>
            <p className="text-sm font-black text-white">{ticket._ticketNumber || ticket.ticket_number || '—'}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Módulo</p>
            <p className="text-sm font-bold text-white">{module}</p>
          </div>
        </div>

        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
          <Package className="w-4 h-4 mr-2 text-brand" /> Itens Solicitados e Cotações
        </h4>

        <div className="space-y-4">
          {displayItems.map((item: any, idx: number) => {
            const suppliers: any[] = item.suppliers || [];
            const winner = suppliers.find((s: any) => s.is_winner);
            const winReasonInfo = winner?.win_reason ? WIN_REASON_LABEL[winner.win_reason] : null;

            return (
              <div key={idx} className="rounded-xl border border-white/5 bg-slate-950/30 overflow-hidden">
                {/* Cabeçalho do item */}
                <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Item {idx + 1}</p>
                    <p className="text-sm font-bold text-white">{item.nome || item.description || '—'}</p>
                    {item.especificacao && (
                      <p className="text-[10px] text-slate-500">{item.especificacao}</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 text-xs font-bold">
                    Qtd: {item.quantidade || item.quantity || 1}
                  </span>
                </div>

                {/* Tabela de fornecedores */}
                {suppliers.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-white/[0.02] border-b border-white/5">
                      <div className="col-span-1" />
                      <div className="col-span-5">Fornecedor</div>
                      <div className="col-span-2 text-right">Preço Unit.</div>
                      <div className="col-span-2 text-right">Prazo</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                    {suppliers.map((s: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 border-b border-white/5 last:border-0 ${
                          s.is_winner ? 'bg-brand/5' : ''
                        }`}
                      >
                        <div className="col-span-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            s.is_winner ? 'bg-brand text-slate-950' : 'bg-slate-700 text-slate-400'
                          }`}>
                            {sIdx + 1}
                          </div>
                        </div>
                        <div className="col-span-5 flex items-center gap-1.5">
                          {s.is_winner && <CheckCircle2 className="w-3.5 h-3.5 text-brand flex-shrink-0" />}
                          <span className={`text-xs font-semibold ${s.is_winner ? 'text-white' : 'text-slate-400'}`}>
                            {s.name || '—'}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className={`text-xs font-mono font-bold ${s.is_winner ? 'text-brand' : 'text-slate-400'}`}>
                            {Number(s.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-xs text-slate-400">
                            {s.delivery_days || 0} dias
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className={`text-xs font-mono font-black ${s.is_winner ? 'text-white' : 'text-slate-500'}`}>
                            {(Number(s.price || 0) * (item.quantidade || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Formato legado (sem suppliers array)
                  <div className="p-3">
                    <p className="text-xs text-slate-400">
                      Fornecedor: <span className="text-white font-bold">{item.supplier_name || item.winner?.name || '—'}</span>
                      <span className="ml-4">Preço: <span className="text-brand font-bold">
                        {Number(item.quoted_price || item.winner?.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span></span>
                    </p>
                  </div>
                )}

                {/* Justificativa do vencedor */}
                {winner && (
                  <div className="flex items-center gap-3 px-3 py-2 bg-brand/10 border-t border-brand/20">
                    <Trophy className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-brand uppercase font-black tracking-widest">Vencedor:</span>
                      <span className="text-xs text-white font-bold">{winner.name}</span>
                      {winReasonInfo && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-brand/20 rounded-full text-[10px] text-brand font-black">
                          {winReasonInfo.icon} {winReasonInfo.label}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        — Total: <span className="text-brand font-black">
                          {(Number(winner.price || 0) * (item.quantidade || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total consolidado */}
        {metadata.quotation?.total_amount && (
          <div className="flex justify-end p-4 bg-brand/5 rounded-xl border border-brand/20">
            <div className="text-right">
              <p className="text-[10px] text-brand uppercase font-black tracking-widest">Total Geral (Vencedores)</p>
              <p className="text-2xl font-black text-brand">
                {Number(metadata.quotation.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderM2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
          <Plane className="w-4 h-4 mr-2 text-brand" /> Dados da Viagem
        </h4>
        <div className="space-y-2 text-sm">
          <p className="text-slate-400">Origem: <span className="text-white font-bold">{metadata.origin}</span></p>
          <p className="text-slate-400">Destino: <span className="text-white font-bold">{metadata.destination}</span></p>
          <p className="text-slate-400">Tipo: <span className="text-white font-bold uppercase">{metadata.transport_type}</span></p>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-brand" /> Datas
        </h4>
        <div className="space-y-2 text-sm">
          <p className="text-slate-400">Ida: <span className="text-white font-bold">{metadata.outbound_date}</span></p>
          <p className="text-slate-400">Volta: <span className="text-white font-bold">{metadata.return_date || 'N/A'}</span></p>
          <p className="text-slate-400">Hotel: <span className="text-white font-bold">{metadata.hotel_required ? 'Sim' : 'Não'}</span></p>
        </div>
      </div>
    </div>
  );

  const renderGeneric = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(metadata).map(([key, value]) => {
          if (key === 'quotation' || key === 'itens' || typeof value === 'object') return null;
          return (
            <div key={key} className="p-3 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{key.replace(/_/g, ' ')}</p>
              <p className="text-sm text-white font-medium">{String(value)}</p>
            </div>
          );
        })}
      </div>
      <div className="p-4 bg-brand/5 border border-brand/10 rounded-xl">
        <p className="text-[10px] text-brand uppercase font-black mb-2">Justificativa</p>
        <p className="text-sm text-slate-300 italic">"{metadata.justificativa || 'Sem justificativa informada'}"</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {module === 'M1_PRODUTOS' && renderM1()}
      {module === 'M2_VIAGENS' && renderM2()}
      {module !== 'M1_PRODUTOS' && module !== 'M2_VIAGENS' && renderGeneric()}
      
      {/* Seção de Cotação (se houver e não for M1 que já mostra na tabela) */}
      {module !== 'M1_PRODUTOS' && metadata.quotation && (
        <div className="mt-8 p-6 bg-slate-950/50 rounded-2xl border border-brand/20">
          <h4 className="text-sm font-black text-brand uppercase tracking-[0.2em] mb-4">Resumo da Cotação Vencedora</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Fornecedor</p>
              <p className="text-lg font-black text-white">{metadata.quotation.supplier_id}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Valor Total</p>
              <p className="text-lg font-black text-brand">
                {Number(metadata.quotation.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Prazo Entrega</p>
              <p className="text-lg font-black text-white">{metadata.quotation.delivery_days || 0} dias</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
