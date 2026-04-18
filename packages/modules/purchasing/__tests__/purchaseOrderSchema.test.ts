import { describe, it, expect } from 'vitest';
import { purchaseOrderSchema } from '@/lib/validation/schemas';

describe('purchaseOrderSchema (Purchasing)', () => {
  const baseItem = {
    product_name: 'Parafuso M8',
    quantity: 100,
    unit_price: 1.10,
    total_price: 110,
  };

  const base = {
    method: 'direct' as const,
    supplier_id: 'SUP-001',
    supplier_name: 'Parafusos Brasil',
    items: [baseItem],
    total_amount: 110,
    delivery_address: 'Rua Principal, 123, Curitiba',
  };

  it('deve aceitar OC direta válida', () => {
    const result = purchaseOrderSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('deve aceitar OC via leilão', () => {
    const result = purchaseOrderSchema.safeParse({ ...base, method: 'auction' });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar OC sem fornecedor', () => {
    const result = purchaseOrderSchema.safeParse({ ...base, supplier_id: '' });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar OC sem itens', () => {
    const result = purchaseOrderSchema.safeParse({ ...base, items: [] });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar total_amount zero ou negativo', () => {
    const result = purchaseOrderSchema.safeParse({ ...base, total_amount: 0 });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar endereço de entrega muito curto', () => {
    const result = purchaseOrderSchema.safeParse({ ...base, delivery_address: 'Rua X' });
    expect(result.success).toBe(false);
  });
});
