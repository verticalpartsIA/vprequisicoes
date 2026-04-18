export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockProductRequestHandler = async (data: any) => {
  await sleep(800); // Simulate network latency
  
  // Basic validation bypass for mock
  if (!data.itens || data.itens.length === 0) {
    throw new Error("Lote de itens vazio no mock");
  }

  const timestamp = new Date().getTime();
  const randomTicket = Math.floor(100000 + Math.random() * 900000);

  return {
    status: "success",
    data: {
      request_id: `REQ-${timestamp}`,
      ticket_number: `M1-${randomTicket}`,
      status: "submitted",
      next_step: "quotation",
      submitted_at: new Date().toISOString(),
    }
  };
};

export const getMockRequestHandler = async (id: string) => {
  await sleep(300);
  return {
    status: "success",
    data: { 
      id, 
      status: "submitted", 
      module: "M1",
      history: [
        { status: 'DRAFT', date: '2026-04-16T10:00:00Z' },
        { status: 'SUBMITTED', date: new Date().toISOString() }
      ]
    }
  };
};
