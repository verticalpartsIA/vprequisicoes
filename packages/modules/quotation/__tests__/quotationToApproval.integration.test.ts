import { describe, it, expect } from 'vitest';
import { quotationSchema, approvalDecisionSchema } from '@/lib/validation/schemas';

const mockQuotationApi = {
  submit: async (data: any) => ({
    data: {
      id: 'QUOT-001',
      ticket_id: data.ticket_id,
      status: 'QUOTED',
      winner_supplier: data.items[0]?.suppliers.find((s: any) => s.is_winner)?.name,
      total_value: data.items[0]?.suppliers.find((s: any) => s.is_winner)?.price ?? 0,
      ready_for_approval: true,
    }
  }),
  sendToApproval: async (quotationId: string, decision: any) => ({
    data: {
      quotation_id: quotationId,
      decision: decision.decision,
      status: decision.decision === 'approve' ? 'APPROVED' : 'REJECTED',
      processed_at: new Date().toISOString(),
    }
  })
};

describe('Quotation → Approval Integration', () => {
  const validQuotation = {
    ticket_id: 'M1-0123',
    items: [{
      request_item_id: 'item-1',
      suppliers: [
        { name: 'Parafusos Brasil', price: 110, delivery_days: 3, is_winner: true },
        { name: 'Metalúrgica XYZ', price: 130, delivery_days: 5, is_winner: false },
      ],
    }],
    notes: 'Cotação com menor preço selecionada.',
  };

  it('deve validar cotação e submetê-la', async () => {
    const parsed = quotationSchema.safeParse(validQuotation);
    expect(parsed.success).toBe(true);

    const res = await mockQuotationApi.submit(validQuotation);
    expect(res.data.status).toBe('QUOTED');
    expect(res.data.winner_supplier).toBe('Parafusos Brasil');
    expect(res.data.ready_for_approval).toBe(true);
  });

  it('deve aprovar cotação válida', async () => {
    const decision = { decision: 'approve' };
    const parsed = approvalDecisionSchema.safeParse(decision);
    expect(parsed.success).toBe(true);

    const res = await mockQuotationApi.sendToApproval('QUOT-001', decision);
    expect(res.data.status).toBe('APPROVED');
  });

  it('deve rejeitar cotação com motivo', async () => {
    const decision = { decision: 'reject', reason: 'Fornecedor sem histórico aprovado pela área.' };
    const parsed = approvalDecisionSchema.safeParse(decision);
    expect(parsed.success).toBe(true);

    const res = await mockQuotationApi.sendToApproval('QUOT-001', decision);
    expect(res.data.status).toBe('REJECTED');
  });

  it('deve rejeitar cotação sem fornecedor vencedor', () => {
    const sem_vencedor = {
      ...validQuotation,
      items: [{
        request_item_id: 'item-1',
        suppliers: [
          { name: 'Fornecedor A', price: 100, delivery_days: 2, is_winner: false },
        ],
      }],
    };
    const parsed = quotationSchema.safeParse(sem_vencedor);
    expect(parsed.success).toBe(false);
  });
});
