import { describe, it, expect } from 'vitest';
import { getApprovalTier, canApprove, getRequiredRoleForTier } from '../approvalTiers';

describe('Approval Tiers Engine', () => {
  it('deve retornar Tier 1 para valores até R$ 1.500,00', () => {
    expect(getApprovalTier(0)).toBe(1);
    expect(getApprovalTier(1500)).toBe(1);
  });

  it('deve retornar Tier 2 para valores entre R$ 1.500,01 e R$ 3.500,00', () => {
    expect(getApprovalTier(1500.01)).toBe(2);
    expect(getApprovalTier(3500)).toBe(2);
  });

  it('deve retornar Tier 3 para valores acima de R$ 3.500,00', () => {
    expect(getApprovalTier(3500.01)).toBe(3);
    expect(getApprovalTier(100000)).toBe(3);
  });

  it('deve validar canApprove com base na hierarquia', () => {
    // manager_level_1 só aprova tier 1
    expect(canApprove('manager_level_1', 1000)).toBe(true);
    expect(canApprove('manager_level_1', 2000)).toBe(false);

    // manager_level_2 aprova tier 1 e 2
    expect(canApprove('manager_level_2', 1000)).toBe(true);
    expect(canApprove('manager_level_2', 2000)).toBe(true);
    expect(canApprove('manager_level_2', 4000)).toBe(false);

    // director aprova tudo
    expect(canApprove('director', 10000)).toBe(true);
  });

  it('deve lançar erro para valores negativos', () => {
    expect(() => getApprovalTier(-10)).toThrow('INVALID_AMOUNT');
  });
});
