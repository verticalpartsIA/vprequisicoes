import { APPROVAL_TIERS_CONFIG } from '../../modules/approval/constants';

export function getApprovalTier(amount: number): 1 | 2 | 3 {
  if (amount < 0) throw new Error("INVALID_AMOUNT");
  
  if (amount <= APPROVAL_TIERS_CONFIG.tier_1.max) return 1;
  if (amount <= APPROVAL_TIERS_CONFIG.tier_2.max) return 2;
  return 3;
}

export function getRequiredRoleForTier(tier: number): string {
  switch (tier) {
    case 1: return APPROVAL_TIERS_CONFIG.tier_1.role;
    case 2: return APPROVAL_TIERS_CONFIG.tier_2.role;
    case 3: return APPROVAL_TIERS_CONFIG.tier_3.role;
    default: return APPROVAL_TIERS_CONFIG.tier_3.role;
  }
}

export function getTierLabel(tier: number): string {
  switch (tier) {
    case 1: return APPROVAL_TIERS_CONFIG.tier_1.label;
    case 2: return APPROVAL_TIERS_CONFIG.tier_2.label;
    case 3: return APPROVAL_TIERS_CONFIG.tier_3.label;
    default: return 'Desconhecido';
  }
}

/**
 * Verifica se um papel de usuário tem alçada para aprovar um determinado valor.
 * A hierarquia é respeitada: Diretor pode aprovar tudo.
 */
export function canApprove(userRole: string, amount: number): boolean {
  const tier = getApprovalTier(amount);
  
  const roleHierarchy: Record<string, number> = {
    'common': 0,
    'buyer': 0,
    'manager_level_1': 1,
    'manager_level_2': 2,
    'director': 3,
    'admin': 4
  };

  const userLevel = roleHierarchy[userRole] || 0;
  return userLevel >= tier;
}
