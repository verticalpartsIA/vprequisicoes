export type ReceiptType = 'physical' | 'digital';
export type ReceiptStatus = 'received' | 'partial_received' | 'divergence_reported' | 'released';
export type ItemCondition = 'ok' | 'damaged' | 'missing';

export interface ReceivedItem {
  id: string;
  purchase_order_item_id: string;
  description: string;
  quantity_purchased: number;
  quantity_received: number;
  condition: ItemCondition;
  divergence_reason?: string;
}

export interface ReceiptInput {
  type: ReceiptType;
  received_by: string;
  notes?: string;
  // Para físico
  items?: ReceivedItem[];
  // Para digital
  execution_confirmed?: boolean;
}

export interface Receipt {
  id: string;
  ticket_id: string;
  receipt_type: ReceiptType;
  status: ReceiptStatus;
  received_by: string;
  received_at: string;
  items: ReceivedItem[];
  notes?: string;
}

export interface ReceiptLog {
  id: string;
  ticket_id: string;
  action: string;
  performed_by: string;
  performed_at: string;
  metadata?: any;
}
