export type MaintenanceType = 'preventive' | 'corrective';
export type Priority = 'emergency' | 'high' | 'medium' | 'low';
export type Recurrence = 'one_time' | 'monthly' | 'quarterly' | 'annual';

export interface MaintenanceRequest {
  id: string;
  ticket_number: string;
  status: string;
  maintenance_type: MaintenanceType;
  asset_name: string;
  location: string;
  description: string;
  priority: Priority;
  covered_by_contract: boolean;
  contract_number?: string;
  contract_provider?: string;
  contract_valid_until?: string;
  estimated_value?: number;
  recurrence: Recurrence;
  created_at: string;
}
