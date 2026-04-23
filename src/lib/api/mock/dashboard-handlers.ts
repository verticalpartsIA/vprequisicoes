import { kpiCalculator } from '@core/analytics/kpiCalculator';
import { DateRange, ModuleType } from '@core/analytics/types';

export const mockDashboardDataHandler = (periodStr: string = '30d', moduleStr: string = 'ALL') => {
  const period: DateRange = { from: '2026-03-16', to: '2026-04-16' };
  const module = moduleStr as ModuleType;

  return {
    kpis: kpiCalculator.calculateKPIs(period, module),
    status_distribution: kpiCalculator.getStatusDistribution(period),
    module_distribution: kpiCalculator.getModuleDistribution(period),
    top_suppliers: kpiCalculator.getTopSuppliers(period),
    savings_timeline: []
  };
};
