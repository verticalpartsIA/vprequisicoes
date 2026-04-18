import { Ticket, RequestStatus, QuotationTicket, QuotationItem, SupplierOffer } from '../types';

export const createMockUser = (overrides?: any) => ({
  id: 1,
  username: 'joao.silva',
  role: 'common',
  ...overrides,
});

export const createMockTicket = (overrides?: Partial<Ticket>): Ticket => ({
  id: 123,
  userId: 1,
  username: 'joao.silva',
  type: 'M1',
  status: 'SUBMITTED' as RequestStatus,
  submittedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockProductRequest = (overrides?: any) => ({
  solicitante: 'Gelson Filho',
  departamento: 'TI',
  centroCusto: 'CC-001',
  justificativa: 'Necessidade de novos equipamentos para o time.',
  itens: [
    { nome: 'Notebook Dell Latitude', quantidade: 2 },
    { nome: 'Monitor UltraSharp 27', quantidade: 2 }
  ],
  ...overrides,
});

export const createMockSupplierOffer = (overrides?: Partial<SupplierOffer>): SupplierOffer => ({
  id: 'off-1',
  name: 'Fornecedor A',
  unitPrice: 100,
  totalPrice: 1000,
  deliveryDays: 5,
  ...overrides,
});

export const createMockQuotationItem = (overrides?: Partial<QuotationItem>): QuotationItem => ({
  id: 'item-1',
  productId: 'prod-1',
  name: 'Parafuso M8',
  quantity: 10,
  specifications: 'Aço Inox',
  offers: [
    createMockSupplierOffer({ name: 'Fornecedor A' }),
    createMockSupplierOffer({ id: 'off-2', name: 'Fornecedor B', unitPrice: 95 }),
  ],
  ...overrides,
});

export const createMockQuotationTicket = (overrides?: Partial<QuotationTicket>): QuotationTicket => ({
  id: 'quot-123',
  requestId: 'req-456',
  module: 'M1',
  status: 'draft',
  items: [createMockQuotationItem()],
  buyerId: 'buyer-001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
