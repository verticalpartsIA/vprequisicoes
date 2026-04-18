import { FreightRequestInput } from '@/lib/validation/schemas';
import { mockTicketList } from '@core/db/mock-db';
import { FreightRequest } from '../../../../packages/modules/M5-freight/types';

export const mockFreightRequestHandler = (data: FreightRequestInput) => {
  const newIdNum = Math.floor(100000 + Math.random() * 900000);
  const newId = `M5-${newIdNum}`;
  
  const newTicket = {
    id: newIdNum,
    ticket_number: newId,
    type: 'M5' as const,
    title: `Frete: ${data.origin} ➔ ${data.destination}`,
    description: `Carga: ${data.cargo_type} | Data Desejada: ${data.desired_date}`,
    status: 'SUBMITTED' as const,
    priority: 'NORMAL' as const,
    requester: 'Gelson Filho',
    created_at: new Date().toISOString(),
    details: data
  };

  mockTicketList.unshift(newTicket);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('vp_tickets', JSON.stringify(mockTicketList));
  }

  return { status: 'success', data: newTicket };
};

/**
 * Simula a transição para IN_TRANSIT após a "compra" do frete
 */
export const executeFreightTransport = (ticketId: number) => {
  const ticket = mockTicketList.find(t => t.id === ticketId);
  if (ticket && ticket.type === 'M5') {
    ticket.status = 'IN_TRANSIT';
    
    // Simula atribuição de transportadora se não existir
    if (!ticket.details.quotation) {
      ticket.details.quotation = {
        carrier: 'Transportadora TransBR',
        price: 450.00,
        estimated_delivery_days: 3,
        tracking_code: 'TRK-998877',
        quoted_at: new Date().toISOString()
      };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('vp_tickets', JSON.stringify(mockTicketList));
    }
  }
  return { status: 'success', data: ticket };
};
