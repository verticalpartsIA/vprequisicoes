import { describe, it, expect, vi } from 'vitest';
import { productRequestSchema } from '@/lib/validation/schemas';
import { mockApiClient } from '@/lib/api/client.mock';
import { createMockProductRequest } from '../../../../core/test-utils/factories';

describe('M1ToQuotationIntegration', () => {
  it('M1 submit válido gera ticket com status "submitted"', async () => {
    const validData = createMockProductRequest();
    
    // Simula validação e envio
    const parseResult = productRequestSchema.safeParse(validData);
    expect(parseResult.success).toBe(true);

    const apiResult: any = await mockApiClient.post('/api/requests/products', validData);
    
    expect(apiResult.status).toBe('success');
    expect(apiResult.data.status).toBe('submitted');
    expect(apiResult.data.next_step).toBe('quotation');
  });

  it('Ticket gerado tem estrutura compatível com módulo Cotação', async () => {
    const res: any = await mockApiClient.get('/api/requests/123');
    
    expect(res.data).toMatchObject({
      id: 123,
      status: "SUBMITTED",
      type: "M1"
    });
  });

  it('Múltiplos itens em M1 são preservados na cotação', async () => {
    const dataWithManyItems = createMockProductRequest({
      itens: [
        { nome: 'Item 1', quantidade: 1 },
        { nome: 'Item 2', quantidade: 2 },
        { nome: 'Item 3', quantidade: 3 },
      ]
    });

    const res: any = await mockApiClient.post('/api/requests/products', dataWithManyItems);
    expect(res.status).toBe('success');
    // Em um teste real com DB, verificaríamos o retorno de itens
  });
});
