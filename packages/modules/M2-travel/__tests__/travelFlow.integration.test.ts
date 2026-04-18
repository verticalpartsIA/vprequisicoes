import { describe, it, expect } from 'vitest';
import { travelRequestSchema } from '@/lib/validation/schemas';

const mockTravelApiClient = {
  post: async (url: string, data: any) => {
    if (!data.traveler_name) throw new Error('traveler_name obrigatório');
    return {
      data: {
        id: 'TRAVEL-001',
        ticket_number: 'M2-88001',
        status: 'SUBMITTED',
        module: 'M2',
        traveler: data.traveler_name,
        route: `${data.origin} → ${data.destination}`,
        requires_approval: data.is_international || data.travel_type === 'evento',
      }
    };
  }
};

describe('Travel Flow Integration (M2)', () => {
  const validTravel = {
    traveler_name: 'Ana Lima',
    traveler_department: 'Comercial',
    origin: 'Curitiba',
    destination: 'São Paulo',
    departure_date: '2026-07-01',
    return_date: '2026-07-03',
    travel_type: 'visita_tecnica' as const,
    is_international: false,
    transport_mode: 'aviao' as const,
    needs_lodging: true,
    hotel_name: 'Hotel Ibis',
    nights: 2,
    needs_destination_car: false,
  };

  it('deve validar e submeter requisição de viagem doméstica', async () => {
    const parsed = travelRequestSchema.safeParse(validTravel);
    expect(parsed.success).toBe(true);

    const res = await mockTravelApiClient.post('/api/travel', validTravel);
    expect(res.data.status).toBe('SUBMITTED');
    expect(res.data.module).toBe('M2');
    expect(res.data.route).toBe('Curitiba → São Paulo');
  });

  it('viagem internacional deve exigir aprovação', async () => {
    const intl = { ...validTravel, is_international: true, destination_country: 'Chile' };
    const res = await mockTravelApiClient.post('/api/travel', intl);
    expect(res.data.requires_approval).toBe(true);
  });

  it('deve rejeitar viagem com dados inválidos antes de submeter', async () => {
    const invalid = { ...validTravel, traveler_name: '' };
    const parsed = travelRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('viagem tipo evento deve exigir aprovação', async () => {
    const evento = { ...validTravel, travel_type: 'evento' as const };
    const res = await mockTravelApiClient.post('/api/travel', evento);
    expect(res.data.requires_approval).toBe(true);
  });
});
