import { maintenanceRequestSchema } from '../../../../src/lib/validation/schemas';

describe('M4 Maintenance Request Schema Validation', () => {
  it('should validate a correct maintenance request without contract', () => {
    const validData = {
      requester_name: 'Gelson Filho',
      requester_department: 'Manutenção',
      maintenance_type: 'preventive',
      asset_name: 'Ar Condicionado',
      location: 'Andar 1',
      description: 'Limpeza de filtros semestral.',
      priority: 'medium',
      covered_by_contract: false,
      estimated_value: 500,
      recurrence: 'one_time'
    };
    
    const result = maintenanceRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if no estimated_value provided and not covered by contract', () => {
    const invalidData = {
      requester_name: 'Gelson Filho',
      requester_department: 'Manutenção',
      maintenance_type: 'preventive',
      asset_name: 'Ar Condicionado',
      location: 'Andar 1',
      description: 'Limpeza de filtros semestral.',
      priority: 'medium',
      covered_by_contract: false,
      // missing estimated_value
      recurrence: 'one_time'
    };
    
    const result = maintenanceRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('estimated_value');
    }
  });

  it('should validate if covered by contract even without estimated_value', () => {
    const validData = {
      requester_name: 'Gelson Filho',
      requester_department: 'Manutenção',
      maintenance_type: 'preventive',
      asset_name: 'Ar Condicionado',
      location: 'Andar 1',
      description: 'Limpeza de filtros semestral.',
      priority: 'medium',
      covered_by_contract: true,
      contract_number: 'CT-2024-001',
      // next_due_date obrigatório quando há contrato, deve ser data futura
      next_due_date: '2028-12-31',
      recurrence: 'one_time'
    };

    const result = maintenanceRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if emergency corrective request has short description', () => {
    const invalidData = {
      requester_name: 'Gelson Filho',
      requester_department: 'Manutenção',
      maintenance_type: 'corrective',
      asset_name: 'Gerador',
      location: 'Subsolo',
      description: 'Curto circuito.', // Too short for emergency
      priority: 'emergency',
      covered_by_contract: false,
      estimated_value: 2000,
      recurrence: 'one_time'
    };
    
    const result = maintenanceRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('mais detalhes técnicos');
    }
  });
});
