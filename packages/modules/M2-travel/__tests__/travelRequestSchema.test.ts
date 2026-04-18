import { describe, it, expect } from 'vitest';
import { travelRequestSchema } from '@/lib/validation/schemas';

describe('travelRequestSchema (M2)', () => {
  const base = {
    traveler_name: 'Gelson Simões',
    traveler_department: 'TI',
    origin: 'Curitiba',
    destination: 'São Paulo',
    departure_date: '2026-06-01',
    return_date: '2026-06-05',
    travel_type: 'visita_tecnica',
    is_international: false,
    transport_mode: 'aviao',
    needs_lodging: false,
    needs_destination_car: false,
  } as const;

  it('deve aceitar viagem doméstica válida', () => {
    const result = travelRequestSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar nome do viajante vazio', () => {
    const result = travelRequestSchema.safeParse({ ...base, traveler_name: '' });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar data de retorno antes da partida', () => {
    const result = travelRequestSchema.safeParse({
      ...base,
      departure_date: '2026-06-10',
      return_date: '2026-06-05',
    });
    expect(result.success).toBe(false);
  });

  it('deve aceitar viagem internacional com campos extras', () => {
    const result = travelRequestSchema.safeParse({
      ...base,
      is_international: true,
      destination_country: 'Argentina',
      passport_number: 'BR1234567',
      visa_required: false,
      travel_insurance: true,
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar transport_mode inválido', () => {
    const result = travelRequestSchema.safeParse({ ...base, transport_mode: 'bicicleta' });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar travel_type inválido', () => {
    const result = travelRequestSchema.safeParse({ ...base, travel_type: 'ferias' });
    expect(result.success).toBe(false);
  });
});
