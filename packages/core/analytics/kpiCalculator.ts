import { mockTicketList } from '../db/mock-db';
import { DateRange, ModuleType, KPIResult, ChartDataItem, TopSupplier } from './types';

export const kpiCalculator = {
  getTickets: (period: DateRange, module?: ModuleType) => {
    return mockTicketList.filter(t => {
      const matchModule = !module || module === 'ALL' || t.type === module;
      // Para mock, ignoramos a data exata mas poderíamos filtrar por timestamp
      return matchModule;
    });
  },

  calculateKPIs: (period: DateRange, module?: ModuleType): KPIResult => {
    const tickets = kpiCalculator.getTickets(period, module);
    const approvedTickets = tickets.filter(t => t.status === 'APPROVED' || t.status === 'PURCHASED' || t.status === 'RECEIVED');
    
    // Simulação de economia (em produção viria do AuctionLog)
    const totalSavings = approvedTickets.reduce((acc, t) => {
      const amount = Number(t.quotation?.total_amount || 0);
      return acc + (amount * 0.12); // Mock 12% economy
    }, 0);

    const result: KPIResult = {
      total_tickets: tickets.length,
      tickets_pending_approval: tickets.filter(t => t.status === 'PENDING' || t.status === 'SUBMITTED').length,
      total_auction_savings: totalSavings,
      avg_savings_percent: 0,
      avg_sla_hours: 0,
      delta_tickets: 0
    };

    if (module === 'M5') {
       (result as any).m5_stats = {
         inbound_volume: tickets.filter(t => t.details?.direction === 'inbound').length,
         outbound_volume: tickets.filter(t => t.details?.direction === 'outbound').length,
         total_weight_kg: tickets.reduce((acc, t) => acc + (t.details?.weight_kg || 0), 0)
       };
    }

    return result;
  },

  getStatusDistribution: (period: DateRange): ChartDataItem[] => {
    const tickets = mockTicketList;
    const stats: Record<string, number> = {};
    tickets.forEach(t => {
      stats[t.status] = (stats[t.status] || 0) + 1;
    });

    return Object.entries(stats).map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1).toLowerCase(),
      value
    }));
  },

  getModuleDistribution: (period: DateRange): ChartDataItem[] => {
    const stats: Record<string, number> = {};
    mockTicketList.forEach(t => {
      stats[t.type] = (stats[t.type] || 0) + 1;
    });
    
    const colors: Record<string, string> = {
      M1: '#3b82f6', M2: '#10b981', M3: '#8b5cf6', M4: '#f59e0b', M5: '#ef4444', M6: '#ec4899'
    };

    return Object.entries(stats).map(([label, value]) => ({
      label: `Módulo ${label}`,
      value,
      color: colors[label] || '#94a3b8'
    }));
  },

  getTopSuppliers: (period: DateRange, limit: number = 5): TopSupplier[] => {
    return [];
  }
};
