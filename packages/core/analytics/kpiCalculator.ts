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

    return {
      total_tickets: tickets.length,
      tickets_pending_approval: tickets.filter(t => t.status === 'PENDING').length,
      total_auction_savings: totalSavings,
      avg_savings_percent: 12.5,
      avg_sla_hours: 4.8,
      delta_tickets: 8.5
    };
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
    // Mock data baseado nos fornecedores dos tickets
    return [
      { name: 'Parafusos Brasil Ltd', total_spent: 45200.50, order_count: 12 },
      { name: 'Ferragens Silva & Cia', total_spent: 32100.00, order_count: 8 },
      { name: 'Logística Global Express', total_spent: 18500.20, order_count: 15 },
      { name: 'Manutenção Preventiva SA', total_spent: 12400.00, order_count: 4 },
      { name: 'Viagens & Eventos PR', total_spent: 8900.00, order_count: 6 }
    ].slice(0, limit);
  }
};
