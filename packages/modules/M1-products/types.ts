import { Ticket } from "@core/types";

export interface ProductItem {
  id?: number;
  requestId?: number;
  name: string;
  description?: string;
  dimensions?: string;
  quantity: number;
  unitPrice?: number;
}

export interface ProductRequest extends Ticket {
  department: string;
  costCenter: string;
  justification: string;
  items: ProductItem[];
}
