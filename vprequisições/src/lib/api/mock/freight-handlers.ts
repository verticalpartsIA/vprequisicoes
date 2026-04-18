import { FreightRequestInput } from '@/lib/validation/schemas';
import { mockTicketList } from '@core/db/mock-db';

export const mockFreightRequestHandler = (data: FreightRequestInput) => {
  const newIdNum = Math.floor(100000 + Math.random() * 900000);
  const newId = `M5-${newIdNum}`;
  
  const newTicket = {
    id: newIdNum, // Usando número para ID interno conforme padrão mock-db
    ticket_number: newId,
    type: 'M5' as const,
    title: `Frete: ${data.origin} ➔ ${data.destination}`,
    description: `Carga: ${data.cargo_type} | Data: ${data.desired_date}`,
    status: 'SUBMITTED' as const,
    priority: 'NORMAL' as const,
    requester: 'Gelson Filho',
    created_at: new Date().toISOString(),
    details: data
  };

  mockTicketList.unshift(newTicket);
  
  // Persistir no localStorage para o E2E/Dashboard
  if (typeof window !== 'undefined') {
    localStorage.setItem('vp_tickets', JSON.stringify(mockTicketList));
  }

  return { status: 'success', data: newTicket };
};
