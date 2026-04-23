import { describe, it, expect } from 'vitest';
import { quotationSchema } from '@/lib/validation/schemas';

describe('Quotation Schema (Zod)', () => {
  const validSupplier = {
    name: 'Fornecedor A',
    price: 150.50,
    delivery_days: 5,
    is_winner: true
  };

  const validItem = {
    request_item_id: 'item-1',
    suppliers: [validSupplier],
    notes: 'Preço promocional'
  };

  const validData = {
    items: [validItem]
  };

  it('deve validar uma cotação correta com 1 fornecedor vencedor', () => {
    const result = quotationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar se nenhum fornecedor for marcado como vencedor', () => {
    const data = {
      items: [{
        ...validItem,
        suppliers: [{ ...validSupplier, is_winner: false }]
      }]
    };
    const result = quotationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar se mais de um fornecedor for marcado como vencedor para o mesmo item', () => {
    const data = {
      items: [{
        ...validItem,
        suppliers: [
          { ...validSupplier, is_winner: true, name: 'S1' },
          { ...validSupplier, is_winner: true, name: 'S2' }
        ]
      }]
    };
    const result = quotationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar mais de 3 fornecedores por item', () => {
    const data = {
      items: [{
        ...validItem,
        suppliers: [validSupplier, validSupplier, validSupplier, validSupplier]
      }]
    };
    const result = quotationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar preço zero ou negativo', () => {
    const data = {
      items: [{
        ...validItem,
        suppliers: [{ ...validSupplier, price: 0 }]
      }]
    };
    const result = quotationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
