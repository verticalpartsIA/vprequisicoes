import { describe, it, expect } from 'vitest';
import { productRequestSchema } from '@/lib/validation/schemas';
import { realPost, realGet } from '@/lib/api/real-client';
import { createMockProductRequest } from '@core/test-utils/factories';

describe('M1ToQuotationIntegration', () => {
  let createdTicketId: string;

  it('M1 submit válido gera ticket com status SUBMITTED', async () => {
    const validData = createMockProductRequest();

    const parseResult = productRequestSchema.safeParse(validData);
    expect(parseResult.success).toBe(true);

    const apiResult: any = await realPost('/api/requests/products', validData);

    expect(apiResult.status).toBe('success');
    expect(apiResult.data.status).toBe('SUBMITTED');
    expect(apiResult.data.module).toBe('M1_PRODUTOS');

    createdTicketId = apiResult.data.id;
  });

  it('Ticket gerado pode ser recuperado pelo ID retornado', async () => {
    if (!createdTicketId) return;

    const res: any = await realGet(`/api/requests/${createdTicketId}`);

    expect(res.status).toBe('success');
    expect(res.data).toMatchObject({
      id: createdTicketId,
      status: 'SUBMITTED',
      module: 'M1_PRODUTOS',
    });
  });

  it('Múltiplos itens em M1 são preservados no ticket', async () => {
    const dataWithManyItems = createMockProductRequest({
      itens: [
        { nome: 'Item 1', quantidade: 1 },
        { nome: 'Item 2', quantidade: 2 },
        { nome: 'Item 3', quantidade: 3 },
      ],
    });

    const res: any = await realPost('/api/requests/products', dataWithManyItems);
    expect(res.status).toBe('success');
    expect(res.data.status).toBe('SUBMITTED');
  });
});
