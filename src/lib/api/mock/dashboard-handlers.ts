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
    savings_timeline: [
      { label: '01/04', value: 1200 },
      { label: '04/04', value: 2500 },
      { label: '08/04', value: 1800 },
      { label: '12/04', value: 4200 },
      { label: '16/04', value: 3100 }
    ]
  };
};
