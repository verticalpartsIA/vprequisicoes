import { describe, it, expect } from 'vitest';
import { serviceRequestSchema } from '@/lib/validation/schemas';

describe('ServiceRequest Schema (M3)', () => {
  const validBase = {
    requester_name: 'Gelson Filho',
    requester_department: 'Manutençao',
    service_type: 'maintenance',
    scope_description: 'Reparo elétrico preventivo no prédio principal',
    location_address: 'Rua das Flores, 123',
    provider_type: 'PJ',
    provider_name: 'Eletro Corp',
    provider_document: '12345678000199', // 14 digits
    estimated_value: 5000
  };

  it('deve validar um pedido de manutenção simples', () => {
    const res = serviceRequestSchema.safeParse(validBase);
    expect(res.success).toBe(true);
  });

  it('deve falhar se for instalação e não tiver código da obra', () => {
    const res = serviceRequestSchema.safeParse({
      ...validBase,
      service_type: 'installation'
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain('Código da obra');
    }
  });

  it('deve falhar se o CPF for inválido (menos de 11 dígitos)', () => {
    const res = serviceRequestSchema.safeParse({
      ...validBase,
      provider_type: 'PF',
      provider_document: '123456789' // 9 digits
    });
    expect(res.success).toBe(false);
  });

  it('deve validar se a soma dos milestones for exatamente 100%', () => {
    const res = serviceRequestSchema.safeParse({
      ...validBase,
      payment_by_milestone: true,
      milestones: [
        { name: 'Inicio', percentage: 30 },
        { name: 'Entrega', percentage: 70 }
      ]
    });
    expect(res.success).toBe(true);
  });

  it('deve falhar se a soma dos milestones for diferente de 100%', () => {
    const res = serviceRequestSchema.safeParse({
      ...validBase,
      payment_by_milestone: true,
      milestones: [
        { name: 'Inicio', percentage: 30 },
        { name: 'Meio', percentage: 30 }
      ]
    });
    expect(res.success).toBe(false);
    if (!res.success) {
       expect(res.error.errors[0].message).toContain('exatamente 100%');
    }
  });
});
