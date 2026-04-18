import { TravelRequestInput } from '@/lib/validation/schemas';
import { mockTicketList } from '@core/db/mock-db';

export const mockTravelRequestHandler = (data: TravelRequestInput) => {
  const newId = `M2-${Math.floor(100000 + Math.random() * 900000)}`;
  
  const newTicket = {
    id: newId,
    ticket_number: newId,
    type: 'M2' as const,
    title: `Viagem: ${data.origin} para ${data.destination}`,
    description: `Viajante: ${data.traveler_name} | Meio: ${data.transport_mode}`,
    status: 'SUBMITTED' as const,
    priority: data.urgency_justification ? 'URGENT' as const : 'NORMAL' as const,
    requester: 'Gelson Filho',
    created_at: new Date().toISOString(),
    details: data
  };

  mockTicketList.unshift(newTicket as any);
  
  // Persistir no localStorage para o E2E
  if (typeof window !== 'undefined') {
    localStorage.setItem('vp_tickets', JSON.stringify(mockTicketList));
  }

  return newTicket;
};
