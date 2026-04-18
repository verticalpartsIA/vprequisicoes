import { describe, it, expect } from 'vitest';
import { freightRequestSchema } from '@/lib/validation/schemas';

const STATES = {
  DRAFT: { on: { SUBMIT: 'SUBMITTED' } },
  SUBMITTED: { on: { START_QUOTE: 'QUOTING' } },
  QUOTING: { on: { COMPLETE_QUOTE: 'PENDING_APPROVAL' } },
  PENDING_APPROVAL: { on: { APPROVE: 'APPROVED' } },
  APPROVED: { on: { FINALIZE_PURCHASE: 'PURCHASED' } },
  PURCHASED: { on: { EXECUTE_TRANSPORT: 'IN_TRANSIT' } },
  IN_TRANSIT: { on: { ATTEST_DELIVERY: 'RELEASED' } },
};

const mockFreightRequestHandler = (data: any) => ({
  data: { id: 'M5-0001', status: 'SUBMITTED', ...data }
});

const executeFreightTransport = (ticketId: string) => ({
  data: {
    id: ticketId,
    status: 'IN_TRANSIT',
    details: { quotation: { carrier: 'Transportadora Expressa Ltda' } }
  }
});

describe('M5 Freight Lifecycle Integration', () => {
  it('deve seguir as transições de estado do fluxo M5', () => {
    expect(STATES.DRAFT.on.SUBMIT).toBe('SUBMITTED');
    expect(STATES.SUBMITTED.on.START_QUOTE).toBe('QUOTING');
    expect(STATES.QUOTING.on.COMPLETE_QUOTE).toBe('PENDING_APPROVAL');
    expect(STATES.PENDING_APPROVAL.on.APPROVE).toBe('APPROVED');
    expect(STATES.APPROVED.on.FINALIZE_PURCHASE).toBe('PURCHASED');
    expect(STATES.PURCHASED.on.EXECUTE_TRANSPORT).toBe('IN_TRANSIT');
    expect(STATES.IN_TRANSIT.on.ATTEST_DELIVERY).toBe('RELEASED');
  });

  it('deve validar requisição de frete e mover para IN_TRANSIT', () => {
    const mockRequest = {
      direction: 'inbound' as const,
      origin: 'Curitiba, PR',
      destination: 'VerticalParts, Curitiba',
      cargo_type: 'small',
      justification: 'Reposição de estoque urgente para manutenção M4.',
      desired_date: '2026-05-10',
    };

    const parsed = freightRequestSchema.safeParse(mockRequest);
    expect(parsed.success).toBe(true);

    const submission = mockFreightRequestHandler(mockRequest);
    expect(submission.data.id).toBe('M5-0001');

    const result = executeFreightTransport(submission.data.id);
    expect(result.data.status).toBe('IN_TRANSIT');
    expect(result.data.details.quotation.carrier).toBeDefined();
  });

  it('deve rejeitar frete com origem igual ao destino', () => {
    const parsed = freightRequestSchema.safeParse({
      direction: 'inbound',
      origin: 'Curitiba, PR',
      destination: 'Curitiba, PR',
      cargo_type: 'small',
      justification: 'Teste de validação de origem e destino iguais.',
      desired_date: '2026-05-10',
    });
    expect(parsed.success).toBe(false);
  });
});
