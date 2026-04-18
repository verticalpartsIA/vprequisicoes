export const AUCTION_MIN_VALUE = 500.00;
export const OC_NUMBER_PREFIX = 'OC';

export const PAYMENT_TERMS_OPTIONS = [
  { value: '30_days', label: '30 Dias Líquido' },
  { value: '15_30_days', label: '15/30 Dias' },
  { value: '7_days', label: '7 Dias (Urgente)' },
  { value: 'cash', label: 'À Vista' },
  { value: 'installments_3x', label: '3x Sem Juros' },
];

export const DELIVERY_STATUS_MAP = {
  STOCKED: { label: 'Em Estoque', color: 'text-emerald-500' },
  TRANSIT: { label: 'Em Trânsito', color: 'text-amber-500' },
  PENDING: { label: 'Pendente', color: 'text-slate-500' },
};
