export const groupTicketsByRequesterAndDay = (tickets: any[]) => {
  const groups: Record<string, any[]> = {};
  
  tickets.forEach(ticket => {
    const day = ticket.created_at ? ticket.created_at.split('T')[0] : 'undated';
    const key = `${ticket.requester_id}_${day}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(ticket);
  });

  return Object.values(groups);
};

export const selectTopSuppliers = (suppliers: string[], limit: number = 3) => {
  return suppliers.slice(0, limit);
};
