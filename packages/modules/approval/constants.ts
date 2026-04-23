export const APPROVAL_TIERS_CONFIG = {
  tier_1: { min: 0, max: 1500.00, role: 'manager_level_1', label: 'Nível 1' },
  tier_2: { min: 1500.01, max: 3500.00, role: 'manager_level_2', label: 'Nível 2' },
  tier_3: { min: 3500.01, max: Infinity, role: 'director', label: 'Diretoria' }
} as const;

export const MIN_REASON_LENGTH = 10;
export const MIN_COMMENT_LENGTH = 5;

export const DECISION_OPTIONS = [
  { value: 'approve', label: 'Aprovar', color: 'success' },
  { value: 'reject', label: 'Reprovar', color: 'danger' },
  { value: 'revision', label: 'Solicitar Revisão', color: 'warning' }
];
