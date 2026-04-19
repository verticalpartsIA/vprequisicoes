import { RequestStatus } from '../../core/types';

export type QuotationStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface QuotationSupplier {
  id: string;
  name: string;
  price: number;
  delivery_days: number;
  observations: string | null;
  contact_email: string | null;
  is_winner: boolean;
}

export interface QuotationItem {
  id: string;
  request_item_id: string;
  suppliers: QuotationSupplier[];
  selected_supplier_id: string | null;
  notes: string | null;
}

export interface Quotation {
  id: string;
  request_id: string;
  status: QuotationStatus;
  items: QuotationItem[];
  total_amount: number;
  currency: 'BRL';
  created_by: string;
  created_at: string;
  submitted_at: string | null;
}

export interface QuotationInput {
  items: {
    request_item_id: string;
    suppliers: Omit<QuotationSupplier, 'id'>[];
    selected_supplier_id?: string;
    notes?: string;
  }[];
}
