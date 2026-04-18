export interface SupplierOffer {
  id: string;
  name: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  notes?: string;
  selected?: boolean; // Se esta oferta foi a escolhida pelo comprador
}

export interface QuotationItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  specifications: string;
  offers: [SupplierOffer, SupplierOffer?, SupplierOffer?]; // Contrato: Até 3 fornecedores
}

export interface QuotationTicket {
  id: string;
  requestId: string;
  module: 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6';
  status: 'draft' | 'ready_for_approval';
  items: QuotationItem[];
  buyerId: string;
  createdAt: string;
  updatedAt: string;
}
