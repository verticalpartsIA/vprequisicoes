export type PurchaseMethod = 'auction' | 'direct';

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  ticket_id: string;
  oc_number: string;
  method: PurchaseMethod;
  supplier_id: string;
  supplier_name: string;
  items: PurchaseOrderItem[];
  total_amount: number;
  currency: string;
  delivery_address: string;
  payment_terms?: string;
  issued_at: string;
  pdf_url?: string;
}

export interface PurchaseOrderInput {
  method: PurchaseMethod;
  supplier_id: string;
  supplier_name: string;
  items: Omit<PurchaseOrderItem, 'id'>[];
  total_amount: number;
  delivery_address: string;
  payment_terms?: string;
}

export interface AuctionResult {
  winning_supplier: string;
  final_price: number;
  participants: number;
  log: string[];
  auction_id: string;
  completed_at: string;
}

export type AuctionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
