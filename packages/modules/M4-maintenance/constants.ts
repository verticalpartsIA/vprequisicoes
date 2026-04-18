import { MaintenanceType, Priority, Recurrence } from './types';

export const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'preventive', label: 'Preventiva' },
  { value: 'corrective', label: 'Corretiva / Emergencial' }
];

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'emergency', label: '🚨 Emergência' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' }
];

export const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'one_time', label: 'Ponto Único (Sob Demanda)' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'annual', label: 'Anual' }
];
