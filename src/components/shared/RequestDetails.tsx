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
  ClipboardText 
} from 'lucide-react';

interface RequestDetailsProps {
  ticket: any;
}

export const RequestDetails = ({ ticket }: RequestDetailsProps) => {
  const module = ticket.module || ticket.type || '';
  const metadata = ticket.metadata || {};

  const renderM1 = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
        <Package className="w-4 h-4 mr-2 text-brand" /> Itens Solicitados
      </h4>
      <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-950/30">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-slate-500 uppercase font-bold">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3 text-center">Qtd</th>
              <th className="p-3">Fornecedor</th>
              <th className="p-3 text-right">Preço</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(metadata.quotation?.items || ticket._itens || []).map((item: any, idx: number) => (
              <tr key={idx} className="text-slate-300">
                <td className="p-3 font-medium text-white">{item.nome || item.description}</td>
                <td className="p-3 text-center font-bold">{item.quantidade || item.quantity}</td>
                <td className="p-3 text-brand">{item.supplier_name || '—'}</td>
                <td className="p-3 text-right font-mono text-white">
                  {(item.quoted_price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
