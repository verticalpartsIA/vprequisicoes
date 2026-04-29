'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Search, Filter, ArrowRight, Clock, Loader2, ClipboardList } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { realGet as realApiClient } from '@/lib/api/real-client';
import QuotationClient from './[id]/QuotationClient';

function QuotationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticketId = searchParams.get('id');
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ticketId) return;

    const fetchTickets = async () => {
      try {
        const response = await realApiClient('/api/quotation/list');
        setTickets(Array.isArray(response.data) ? response.data : (response ?? []));
      } catch (err) {
        console.error('[QuotationList]', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [ticketId]);

  // Se tiver um ID na URL, renderiza a tela de cotação
  if (ticketId) {
    return <QuotationClient overrideId={ticketId} />;
  }

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">Buyer Console</h1>
          <p className="text-slate-500 font-medium">Gerencie cotações pendentes da VerticalParts.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar ticket..."
              className="pl-10 pr-4 py-2 bg-slate-900 border border-white/5 rounded-lg text-sm text-white focus:ring-1 focus:ring-brand outline-none w-64 placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-white/5 shadow-2xl overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/5">
          <CardTitle className="flex items-center text-white">
            <ShoppingBag className="w-5 h-5 mr-3 text-brand" />
            Requisições Aguardando Cotação
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">Itens prontos para o processo de compras.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="p-5 pl-8">Ticket</th>
                  <th className="p-5">Solicitante</th>
                  <th className="p-5">Módulo</th>
                  <th className="p-5">Data</th>
                  <th className="p-5 text-center">Status</th>
                  <th className="p-5 text-right pr-10">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-10">
                        <div className="h-6 bg-white/5 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <ShoppingBag className="w-16 h-16 text-slate-500 mb-4" />
                        <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-[10px]">Tudo limpo por aqui</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-white/5 transition-all duration-300">
                      <td className="p-5 pl-8">
                        <span className="font-black text-white tracking-tighter">#{ticket.ticket_number || ticket.id.slice(0,8)}</span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{ticket.requester_name || '—'}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{ticket.module}</span>
                        </div>
                      </td>
                      <td className="p-5">
                         <span className="px-2 py-1 bg-white/5 text-slate-400 text-[10px] font-bold rounded-md border border-white/5 uppercase">
                           {ticket.module}
                         </span>
                      </td>
                      <td className="p-5 text-slate-500 text-xs font-bold">
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-5 text-center">
                         <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-md border border-amber-500/20 uppercase">
                           Pendente
                         </span>
                      </td>
                      <td className="p-5 text-right pr-10">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="bg-brand text-slate-950 font-black hover:bg-white hover:text-black transition-all"
                          onClick={() => router.push(`/quotation/?id=${ticket.id}`)}
                        >
                          COTAR AGORA
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuotationListPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    }>
      <QuotationContent />
    </Suspense>
  );
}
