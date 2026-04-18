import { mockTicketList } from '@core/db/mock-db';

export const mockPurchaseListHandler = (statusFilter: string = 'APPROVED') => {
  return mockTicketList.filter(t => t.status === statusFilter);
};

export const mockDirectPurchaseHandler = (id: string, body: any) => {
  console.log(`[Mock API] Compra Direta executada para ticket ${id}:`, body);
  
  return {
    status: 'success',
    data: {
      oc_number: body.oc_number || `OC-${Date.now()}`,
      status: 'PURCHASED',
      pdf_url: `/api/purchasing/orders/${body.oc_number}/pdf`,
      timestamp: new Date().toISOString()
    }
  };
};

export const mockAuctionHandler = (id: string, supplier_list: string[]) => {
  console.log(`[Mock API] Leilão Digital iniciado para ticket ${id} com ${supplier_list.length} fornecedores.`);
  
  return {
    status: 'success',
    data: {
      auction_id: `AUC-${id}-${Date.now()}`,
      status: 'in_progress',
      estimated_completion: new Date(Date.now() + 2000).toISOString()
    }
  };
};
