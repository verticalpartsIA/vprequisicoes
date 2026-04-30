import { describe, it, expect, vi } from 'vitest';
import { mockFreightRequestHandler } from '@/lib/api/mock/freight-handlers';

describe('Freight Request Flow Integration (M5)', () => {
  it('should process a freight request submission and return a ticket', async () => {
    const mockData = {
      direction: 'outbound' as const,
      origin: 'VerticalParts',
      destination: 'São Paulo, SP',
      cargo_type: 'medium',
      weight_kg: 150,
      dimensions: '120x100x80',
      justification: 'Envio de material para a feira de tecnologia industrial.',
      desired_date: '2026-06-15'
    };

    const response = mockFreightRequestHandler(mockData);

    expect(response.status).toBe('success');
    expect(response.data.ticket_number).toContain('FRT-2026-');
    expect(response.data.status).toBe('SUBMITTED');
    expect(response.data.details.destination).toBe('São Paulo, SP');
  });
});
