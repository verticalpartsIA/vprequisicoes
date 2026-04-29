'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PurchaseOrderPreviewProps {
  order: any;
}

const WIN_REASON_LABEL: Record<string, string> = {
  price:    'Melhor Preço',
  deadline: 'Melhor Prazo',
  both:     'Preço e Prazo',
};

export const PurchaseOrderPreview = ({ order }: PurchaseOrderPreviewProps) => {
  if (!order) return null;

  const acionarImpressao = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between vp-print-hidden">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center">
          <FileText className="w-4 h-4 mr-3 text-brand" />
          Preview da Ordem de Compra
        </h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase" onClick={acionarImpressao} aria-label="Imprimir ordem de compra">
            <Printer className="w-3 h-3 mr-2" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase" onClick={acionarImpressao} aria-label="Salvar como PDF">
            <Download className="w-3 h-3 mr-2" /> PDF
          </Button>
        </div>
      </div>

      <Card className="vp-print-area bg-white text-slate-900 overflow-hidden shadow-2xl origin-top">
        <CardContent className="p-10 space-y-8">

          {/* ─── CABEÇALHO ─── */}
          <div className="flex justify-between border-b-2 border-slate-900 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter">VerticalParts</h2>
              </div>
              <p className="text-[9px] font-bold text-slate-500 leading-tight">
                Rua Armandina Braga de Almeida, 383<br />
                Guarulhos — SP<br />
                CNPJ: 12.345.678/0001-90
              </p>
            </div>
            <div className="text-right space-y-1">
              <h1 className="text-3xl font-black tracking-tighter leading-none">PEDIDO DE COMPRA</h1>
              <p className="text-lg font-mono font-bold text-slate-600">{order.oc_number}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                Emissão: {new Date(order.issued_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* ─── PARTES ENVOLVIDAS ─── */}
          <div className="grid grid-cols-2 gap-8">
            {/* Fornecedor */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black border-l-4 border-slate-900 pl-2 uppercase tracking-widest bg-slate-100 p-1">Fornecedor</h3>
              <div className="space-y-1">
                <p className="text-sm font-black">{order.supplier_name || '—'}</p>
                {order.win_reason && (
                  <p className="text-[9px] text-slate-500 italic">
                    Critério de seleção: {WIN_REASON_LABEL[order.win_reason] || order.win_reason}
                  </p>
                )}
              </div>
            </div>
            {/* Condições */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black border-l-4 border-slate-900 pl-2 uppercase tracking-widest bg-slate-100 p-1">Condições</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black">Pagamento</p>
                  <p className="text-[10px] font-bold">{order.payment_terms || '30 Dias Líquido'}</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black">Frete</p>
                  <p className="text-[10px] font-bold">CIF – Pelo Fornecedor</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RESPONSÁVEIS ─── */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Requisitante</p>
              <p className="text-[11px] font-bold text-slate-800">{order.requester_name || '—'}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Aprovador</p>
              <p className="text-[11px] font-bold text-slate-800">{order.approver_name || 'Gerência VerticalParts'}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Recebimento</p>
              <div className="flex items-center gap-1">
                {order.requires_receiving ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-brand" />
                    <p className="text-[11px] font-bold text-brand">Sim — Almoxarifado</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-emerald-600" />
                    <p className="text-[11px] font-bold text-emerald-700">Não — Entrega Direta</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ─── ITENS ─── */}
          <div className="space-y-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] uppercase font-black">
                  <th className="p-2 border border-slate-900">Descrição</th>
                  <th className="p-2 border border-slate-900 text-center w-20">Qtd</th>
                  <th className="p-2 border border-slate-900 text-right w-32">Unitário</th>
                  <th className="p-2 border border-slate-900 text-right w-32">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item: any, i: number) => (
                  <tr key={i} className="text-[11px] font-bold border border-slate-200">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">
                      {Number(item.unit_price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-2 text-right">
                      {Number(item.subtotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-sm font-black">
                  <td colSpan={3} className="p-3 text-right uppercase">Total do Pedido</td>
                  <td className="p-3 text-right bg-slate-100 border-2 border-slate-900">
                    {Number(order.total_amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ─── ENTREGA E OBSERVAÇÕES ─── */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
            <div className="space-y-2">
              <h3 className="text-[9px] font-black uppercase text-slate-400">Endereço de Entrega</h3>
              <p className="text-[10px] font-bold leading-tight uppercase">{order.delivery_address}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-[9px] font-black uppercase text-slate-400">Observações</h3>
              <p className="text-[9px] font-medium leading-tight">
                O material deve estar acompanhado da respectiva Nota Fiscal eletrônica.
                Reservamo-nos o direito de recusar itens em desacordo com as especificações técnicas.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      <p className="text-[9px] text-center text-slate-500 italic vp-print-hidden">
        Este documento é uma representação digital válida da Ordem de Compra oficial da VerticalParts.
      </p>
    </div>
  );
};
