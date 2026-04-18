export type EquipmentCondition = 'ok' | 'damaged' | 'lost';

export interface EquipmentReturnInput {
  condition_on_return: EquipmentCondition;
  late_return_days: number;
  damage_notes?: string;
}

export interface EquipmentTicket extends EquipmentReturnInput {
  id: string;
  ticket_number: string;
  status: string;
  equipment_name: string;
  requester_name: string;
  assigned_at: string;
  expected_return_date: string;
  actual_return_date?: string;
}
