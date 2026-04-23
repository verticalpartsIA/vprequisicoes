export const getApprovalTier = (amount: number): number => {
  if (amount < 0) throw new Error('INVALID_AMOUNT');
  if (amount <= 1500) return 1;
  if (amount <= 3000) return 2;
  return 3;
};

export const getRequiredRoleForTier = (tier: number): string => {
  const roles: Record<number, string> = {
    1: 'manager_level_1',
    2: 'manager_level_2',
    3: 'director',
  };
  return roles[tier] || 'unknown';
};

export const canApprove = (userRole: string, amount: number): boolean => {
  const tier = getApprovalTier(amount);
  
  if (userRole === 'admin') return true;
  if (userRole === 'director') return true;
  if (userRole === 'manager_level_2' && tier <= 2) return true;
  if (userRole === 'manager_level_1' && tier === 1) return true;
  
  return false;
};
