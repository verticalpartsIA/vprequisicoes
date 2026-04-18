import { RentalRequestInput } from '@/lib/validation/schemas';
import { mockTicketList } from '@core/db/mock-db';

export const mockRentalRequestHandler = (data: RentalRequestInput) => {
  const newIdNum = Math.floor(100000 + Math.random() * 900000);
  const newId = `M6-${newIdNum}`;

  const rentalDays = data.start_date && data.end_date
    ? Math.ceil((new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const newTicket = {
    id: newIdNum,
    ticket_number: newId,
    userId: 1,
    username: data.requester_name,
    type: 'M6' as const,
    title: `Locação: ${data.equipment_name}`,
    description: `Categoria: ${data.equipment_category} | ${rentalDays} dias | ${data.usage_location}`,
    status: 'SUBMITTED' as const,
    priority: 'NORMAL' as const,
    requester: data.requester_name,
    submittedAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    details: data
  };

  mockTicketList.unshift(newTicket as any);

  if (typeof window !== 'undefined') {
    localStorage.setItem('vp_tickets', JSON.stringify(mockTicketList));
  }

  return { status: 'success', data: newTicket };
};

export const mockRentalListHandler = () => {
  return mockTicketList.filter(t => t.type === 'M6');
};
