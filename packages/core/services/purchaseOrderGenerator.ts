import { PurchaseOrderInput, PurchaseOrder } from '@modules/purchasing/types';
import { OC_NUMBER_PREFIX } from '@modules/purchasing/constants';

export const generateOCNumber = (): string => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${OC_NUMBER_PREFIX}-${yyyy}${mm}${dd}-${random}`;
};

export const formatPurchaseOrder = (
  ticketId: string,
  input: PurchaseOrderInput
): PurchaseOrder => {
  return {
    id: `PO-${Date.now()}`,
    ticket_id: ticketId,
    oc_number: generateOCNumber(),
    issued_at: new Date().toISOString(),
    ...input,
    items: input.items.map((item, idx) => ({
      ...item,
      id: `ITEM-${ticketId}-${idx + 1}`
    })),
    currency: 'BRL'
  };
};

export const exportToPDF = (order: PurchaseOrder) => {
  console.log(`[OC Generator] Exportando OC ${order.oc_number} para PDF...`);
  
  // Como temos restrição de dependências, utilizamos o window.print() 
  // com um CSS específico de @media print ou simplesmente alertamos o mock.
  if (typeof window !== 'undefined') {
    window.print();
  }
  
  return true;
};
