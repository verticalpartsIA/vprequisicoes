'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Search, Filter, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { mockApiClient } from '@/lib/api/client.mock';

export default function QuotationListPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res: any = await mockApiClient.get('/api/requests');
        // Filtrar apenas os que estão em 'SUBMITTED' ou 'QUOTING'
        const pending = res.data.filter((t: any) => t.status === 'SUBMITTED' || t.status === 'QUOTING');
        setTickets(pending);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Buyer Console</h1>
          <p className="text-slate-400">Gerencie e realize cotações para as requisições pendentes.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por ticket ou produto..." 
              className="pl-10 pr-4 py-2 bg-surface-card border border-surface-border rounded-lg text-sm focus:ring-1 focus:ring-brand outline-none w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <Card className="border-surface-border/60 bg-surface-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ShoppingBag className="w-5 h-5 mr-3 text-brand" />
            Tickets Aguardando Cotação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-border/50 text-slate-500 text-xs uppercase tracking-widest">
                  <th className="pb-4 pl-4">Ticket</th>
                  <th className="pb-4">Módulo</th>
                  <th className="pb-4">Solicitante</th>
                  <th className="pb-4">Data Envio</th>
                  <th className="pb-4 text-center">Urgência</th>
                  <th className="pb-4 text-right pr-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/30">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-8 bg-slate-800/20 rounded-lg"></td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <ShoppingBag className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-500 font-medium">Nenhuma requisição pendente de cotação.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-brand/5 transition-colors">
                      <td className="py-5 pl-4">
                        <span className="font-mono font-bold text-brand">#{ticket.type}-{ticket.id.toString().padStart(4, '0')}</span>
                      </td>
                      <td className="py-5">
                        <span className="text-sm px-2 py-1 bg-slate-800 rounded font-bold text-slate-400 text-xs">
                          {ticket.type}
                        </span>
                      </td>
                      <td className="py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{ticket.username}</span>
                          <span className="text-xs text-slate-500">Almoxarifado</span>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="text-sm text-slate-400">{new Date(ticket.submittedAt).toLocaleDateString('pt-BR')}</span>
                      </td>
                      <td className="py-5 text-center">
                        <div className="flex justify-center">
                           <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                      </td>
                      <td className="py-5 text-right pr-4">
                        <Link href={`/quotation/${ticket.id}`}>
                          <Button size="sm" className="bg-brand/10 text-brand border-brand/20 hover:bg-brand hover:text-white transition-all">
                            Cotar Agora
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
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
