export type DateRange = {
  from: string;
  to: string;
};

export type ModuleType = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'ALL';

export interface KPIResult {
  total_tickets: number;
  tickets_pending_approval: number;
  total_auction_savings: number;
  avg_savings_percent: number;
  avg_sla_hours: number;
  delta_tickets: number; // Percentual vs período anterior
}

export interface ChartDataItem {
  label: string;
  value: number;
  date?: string;
  color?: string;
}

export interface TopSupplier {
  name: string;
  total_spent: number;
  order_count: number;
}

export interface DashboardData {
  kpis: KPIResult;
  status_distribution: ChartDataItem[];
  savings_timeline: ChartDataItem[];
  module_distribution: ChartDataItem[];
  top_suppliers: TopSupplier[];
}
