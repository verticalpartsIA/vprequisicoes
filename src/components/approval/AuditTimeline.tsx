'use client';

import React from 'react';
import { History, User, Clock, MessageSquare, Shield } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  performed_at: string | Date;
  metadata?: any;
}

interface AuditTimelineProps {
  logs: AuditLog[];
}

const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const AuditTimeline = ({ logs }: AuditTimelineProps) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-30">
        <History className="w-10 h-10 mb-2" />
        <p className="text-sm font-bold uppercase tracking-widest">Nenhuma atividade</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand/50 before:via-slate-800 before:to-transparent">
      {logs.map((log, index) => (
        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:border-brand transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
             {log.action.includes('Apro') ? <Shield className="w-4 h-4 text-brand-success" /> : 
              log.action.includes('Cota') ? <Clock className="w-4 h-4 text-brand" /> :
              log.action.includes('Revis') ? <MessageSquare className="w-4 h-4 text-amber-500" /> :
              <User className="w-4 h-4 text-slate-400" />}
          </div>
          
          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-surface-border bg-surface-card/50 hover:bg-surface-card transition-all shadow-lg group-hover:shadow-brand/5">
            <div className="flex items-center justify-between mb-1">
              <time className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                {formatDate(log.performed_at)}
              </time>
              <span className="text-[10px] font-bold text-brand uppercase tracking-tighter">
                {log.action}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-200">{log.performed_by}</span>
            </div>
            
            {log.metadata?.reason && (
              <div className="mt-3 p-2 bg-slate-800/50 rounded border-l-2 border-brand/50 italic text-xs text-slate-400">
                "{log.metadata.reason}"
              </div>
            )}
            
            {log.metadata?.comment && (
              <div className="mt-3 p-2 bg-slate-800/50 rounded border-l-2 border-amber-500/50 italic text-xs text-slate-400">
                "{log.metadata.comment}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
