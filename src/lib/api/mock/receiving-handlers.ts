import { mockTicketList } from '@core/db/mock-db';

export const mockReceivingListHandler = (purchaseStatus: string = 'PURCHASED') => {
  return mockTicketList.filter(t => t.status === purchaseStatus);
};

export const mockPhysicalReceivingHandler = (id: string, body: any) => {
  console.log(`[Mock API] Recebimento Físico processado para ticket ${id}:`, body);
  
  // Transição de estado baseada no corpo
  const hasDivergence = body.items.some((i: any) => i.condition !== 'ok');
  const nextStatus = hasDivergence ? 'DIVERGENCE_REPORTED' : 'RECEIVED';

  return {
    status: 'success',
    data: {
      receipt_id: `REC-${id}-${Date.now()}`,
      status: nextStatus,
      timestamp: new Date().toISOString()
    }
  };
};

export const mockDigitalAttestationHandler = (id: string, body: any) => {
  console.log(`[Mock API] Ateste Digital processado para ticket ${id}:`, body);

  return {
    status: 'success',
    data: {
      attestation_id: `ATT-${id}-${Date.now()}`,
      status: 'RELEASED',
      timestamp: new Date().toISOString()
    }
  };
};
