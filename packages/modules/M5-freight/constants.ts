export const CARGO_TYPES = [
  { value: 'documents', label: 'Documentos' },
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
  { value: 'special', label: 'Especial' },
] as const;

export const FREIGHT_DIRECTIONS = [
  { value: 'inbound', label: 'Trazer PARA VerticalParts' },
  { value: 'outbound', label: 'Levar DA VerticalParts' },
] as const;
