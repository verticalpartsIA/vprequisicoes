export const RECEIPT_STATUS_OPTIONS = [
  { value: 'received', label: 'Recebido Total', color: 'bg-emerald-500' },
  { value: 'partial_received', label: 'Recebido Parcial', color: 'bg-amber-500' },
  { value: 'divergence_reported', label: 'Divergência Reportada', color: 'bg-rose-500' },
  { value: 'released', label: 'Atestado/Liberado', color: 'bg-blue-500' },
];

export const DIVERGENCE_REASONS = [
  { value: 'quantity_short', label: 'Quantidade menor que a NF' },
  { value: 'quantity_excess', label: 'Quantidade maior que a NF' },
  { value: 'damaged_product', label: 'Produto avariado/com defeito' },
  { value: 'wrong_product', label: 'Produto diferente do pedido' },
  { value: 'missing_nf', label: 'Falta de nota fiscal' },
];

export const ITEM_CONDITION_LABELS = {
  ok: 'Em Perfeito Estado',
  damaged: 'Avariado',
  missing: 'Item Faltante',
};
