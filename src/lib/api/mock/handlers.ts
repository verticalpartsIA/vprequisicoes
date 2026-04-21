export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockProductRequestHandler = async (data: any) => {
  await sleep(800); // Simulate network latency
  
  // Basic validation bypass for mock
  if (!data.itens || data.itens.length === 0) {
    throw new Error("Lote de itens vazio no mock");
  }

  const timestamp = new Date().getTime();
  const randomTicket = Math.floor(100000 + Math.random() * 900000);

  const res = {
    status: "success" as const,
    data: {
      id: timestamp,
      request_id: `REQ-${timestamp}`,
      ticket_number: `M1-${randomTicket}`,
      status: "SUBMITTED",
      module: "M1",
      requester_name: data.solicitante,
      submitted_at: new Date().toISOString(),
    }
  };

  if (typeof window !== 'undefined') {
    const { mockTicketList } = require('@core/db/mock-db');
    mockTicketList.unshift(res.data);
  }

  return res;
};

export const getMockRequestHandler = async (id: string) => {
  await sleep(300);
  return {
    status: "success",
    data: {
      id: parseInt(id, 10),
      status: "SUBMITTED",
      type: "M1",
      module: "M1",
      history: [
        { status: 'DRAFT', date: '2026-04-16T10:00:00Z' },
        { status: 'SUBMITTED', date: new Date().toISOString() }
      ]
    }
  };
};
