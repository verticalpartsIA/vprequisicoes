import { maintenanceHandlers } from '@/lib/api/mock/maintenance-handlers';
import { MaintenanceRequestInput } from '@/lib/validation/schemas';

describe('M4 Maintenance Workflow Integration (Mock)', () => {
  it('should flow to APPROVED status when covered_by_contract is true', async () => {
    const data: MaintenanceRequestInput = {
      requester_name: 'Gelson Filho',
      requester_department: 'Manutenção',
      maintenance_type: 'preventive',
      asset_name: 'Elevador 1',
      location: 'Torre A',
      description: 'Manutenção mensal conforme contrato vigente.',
      priority: 'low',
      covered_by_contract: true,
      contract_number: 'ELEV-2024',
      recurrence: 'monthly'
    };

    const result = await maintenanceHandlers.create(data);
    expect(result.data.status).toBe('APPROVED');
    expect(result.data.skips_quotation).toBe(true);
  });

  it('should flow to SUBMITTED status when covered_by_contract is false', async () => {
    const data: MaintenanceRequestInput = {
      requester_name: 'Gelson Filho',
      requester_department: 'Manutenção',
      maintenance_type: 'corrective',
      asset_name: 'Vazamento Cano',
      location: 'Cozinha',
      description: 'Vazamento de água na pia principal da cozinha industrial.',
      priority: 'high',
      covered_by_contract: false,
      estimated_value: 350,
      recurrence: 'one_time'
    };

    const result = await maintenanceHandlers.create(data);
    expect(result.data.status).toBe('SUBMITTED');
    expect(result.data.skips_quotation).toBe(false);
  });
});
