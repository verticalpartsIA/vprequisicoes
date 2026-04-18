import { describe, it, expect } from 'vitest';
import { freightRequestSchema } from '@/lib/validation/schemas';

describe('Freight Request Schema (M5)', () => {
  it('should validate a correct freight request', () => {
    const validData = {
      direction: 'inbound',
      origin: 'Curitiba, PR',
      destination: 'VerticalParts',
      cargo_type: 'small',
      weight_kg: 10,
      dimensions: '50x40x30',
      justification: 'Necessidade de envio de peças urgentes para estoque.',
      desired_date: '2026-05-20'
    };

    const result = freightRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if origin and destination are the same', () => {
    const invalidData = {
      direction: 'inbound',
      origin: 'VerticalParts',
      destination: 'VerticalParts',
      cargo_type: 'small',
      justification: 'Teste de origem e destino iguais.',
      desired_date: '2026-05-20'
    };

    const result = freightRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Origem e destino não podem ser iguais');
    }
  });

  it('should fail if justification is too short', () => {
    const invalidData = {
      direction: 'inbound',
      origin: 'Curitiba',
      destination: 'VerticalParts',
      cargo_type: 'small',
      justification: 'Curta demais',
      desired_date: '2026-05-20'
    };

    const result = freightRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 20 caracteres');
    }
  });

  it('should fail if required fields are missing', () => {
    const result = freightRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
