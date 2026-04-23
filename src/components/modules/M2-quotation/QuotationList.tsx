'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function QuotationList() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('req_tickets')
        .select('*')
        .or('status.eq.SUBMITTED,status.eq.QUOTING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Console do Comprador</h1>
          <p className="text-slate-400">Gerencie cotações e negociações pendentes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Cotação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <Badge variant="outline" className="text-blue-500 border-blue-500/20">Aguardando</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">{tickets.length}</div>
              <p className="text-sm text-slate-400">Tickets para cotar</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <Badge variant="outline" className="text-amber-500 border-amber-500/20">Em Aberto</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">8</div>
              <p className="text-sm text-slate-400">Cotações expirando hoje</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <Badge variant="outline" className="text-green-500 border-green-500/20">Concluído</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">124</div>
              <p className="text-sm text-slate-400">Finalizadas este mês</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-white">Fila de Trabalho</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar ticket ou fornecedor..."
                className="w-full bg-slate-950 border-slate-800 rounded-md py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Carregando tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhum ticket aguardando cotação.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                        #{ticket.id.toString().slice(-4)}
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          Ticket #{ticket.id}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Criado em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-slate-300">Status</div>
                        <Badge className="mt-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                          {ticket.status}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => router.push(`/quotation/?id=${ticket.id}`)}
                        size="sm" 
                        className="bg-slate-800 hover:bg-blue-600 text-white border-slate-700"
                      >
                        Cotar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
