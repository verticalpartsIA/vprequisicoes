export const getApprovalTier = (amount: number): number => {
  if (amount <= 0) throw new Error('INVALID_AMOUNT');
  if (amount <= 1500) return 1;
  if (amount <= 3000) return 2;
  return 3;
};

export const getApproverRoleByTier = (tier: number): string => {
  const roles: Record<number, string> = {
    1: 'manager_level_1',
    2: 'manager_level_2',
    3: 'director',
  };
  return roles[tier] || 'unknown';
};

export const canApprove = (userRole: string, amount: number): boolean => {
  const tier = getApprovalTier(amount);
  const requiredRole = getApproverRoleByTier(tier);
  return userRole === requiredRole || userRole === 'admin';
};
