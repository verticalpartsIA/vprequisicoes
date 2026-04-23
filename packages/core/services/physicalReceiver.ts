import { Receipt, ReceiptStatus, ReceivedItem } from '../../modules/receiving/types';

export const processPhysicalReceipt = (
  ticketId: string, 
  items: ReceivedItem[], 
  receivedBy: string
): Receipt => {
  let status: ReceiptStatus = 'received';
  
  const hasDivergence = items.some(i => i.condition !== 'ok' || i.divergence_reason);
  const totalPurchased = items.reduce((acc, i) => acc + i.quantity_purchased, 0);
  const totalReceived = items.reduce((acc, i) => acc + i.quantity_received, 0);

  if (hasDivergence) {
    status = 'divergence_reported';
  } else if (totalReceived < totalPurchased) {
    status = 'partial_received';
  }

  return {
    id: `REC-${Date.now()}`,
    ticket_id: ticketId,
    receipt_type: 'physical',
    status,
    received_by: receivedBy,
    received_at: new Date().toISOString(),
    items,
  };
};

export const updateInventoryStock = (items: ReceivedItem[]) => {
  console.log('[Inventory] Atualizando estoque para itens recebidos:', items.length);
  // Simulação de chamada para o sistema de estoque (WMS)
  return true;
};
