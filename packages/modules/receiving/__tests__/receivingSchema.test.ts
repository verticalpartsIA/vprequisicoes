import { describe, it, expect } from 'vitest';
import { receivingSchema } from '@/lib/validation/schemas';

describe('Receiving Module - Validation Schema', () => {
  it('should validate valid physical receiving data', () => {
    const data = {
      type: 'physical',
      received_by: 'John Doe',
      items: [
        {
          purchase_order_item_id: 'item-1',
          description: 'Parafuso M8',
          quantity_purchased: 10,
          quantity_received: 10,
          condition: 'ok'
        }
      ]
    };
    const result = receivingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should validate valid digital attestation data', () => {
    const data = {
      type: 'digital',
      received_by: 'Jane Smith',
      execution_confirmed: true,
      notes: 'O serviço de manutenção foi realizado conforme o esperado.'
    };
    const result = receivingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should fail if digital attestation description is too short', () => {
    const data = {
      type: 'digital',
      received_by: 'Jane Smith',
      execution_confirmed: true,
      notes: 'Too short'
    };
    const result = receivingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should fail if physical items are empty', () => {
    const data = {
      type: 'physical',
      received_by: 'John Doe',
      items: []
    };
    const result = receivingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
