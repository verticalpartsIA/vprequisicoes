import { sleep } from './handlers';

export const mockQuotationSubmitHandler = async (id: string, data: any) => {
  await sleep(1500); // Maior latência para simular processamento financeiro
  
  console.log(`[MOCK API] Quotation submitted for ticket ${id}`, data);
  
  return {
    status: 'success',
    data: {
      quotation_id: `QUO-${Math.floor(Math.random() * 999999)}`,
      ticket_id: id,
      next_step: 'PENDING_APPROVAL',
      total_amount: data.total_amount
    }
  };
};

export const mockQuotationDraftHandler = async (id: string, data: any) => {
  await sleep(500);
  console.log(`[MOCK API] Draft saved for ticket ${id}`, data);
  return { status: 'success' };
};
