import { mockTicketList } from '@core/db/mock-db';

export const mockApprovalListHandler = (role: string) => {
  // Simular filtragem por status PENDING_APPROVAL
  // Em prod, o backend filtraria também pela alçada já aqui, mas para o mock enviamos tudo
  // e o frontend mostra se pode ou não.
  return mockTicketList.map(t => ({
    ...t,
    status: 'PENDING_APPROVAL' // Forçar status para o console de aprovação no mock
  }));
};

export const mockApprovalDecideHandler = (id: string, body: any) => {
  console.log(`[Mock API] Decisão recebida para ticket ${id}:`, body);
  
  const statusMap: Record<string, string> = {
    approve: 'APPROVED',
    reject: 'REJECTED',
    revision: 'REVISION_REQUESTED'
  };

  return {
    status: 'success',
    data: {
      ticket_id: id,
      decision: body.decision,
      new_status: statusMap[body.decision] || 'UNKNOWN',
      timestamp: new Date().toISOString()
    }
  };
};

export const mockAuditLogHandler = (id: string) => {
  const logs = [
    {
      id: 'a1',
      ticket_id: id,
      action: 'Requisição Submetida',
      performed_by: 'João Silva',
      performed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
      metadata: {}
    },
    {
      id: 'a2',
      ticket_id: id,
      action: 'Cotação Iniciada',
      performed_by: 'Comprador Lucas',
      performed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
      metadata: {}
    },
    {
      id: 'a3',
      ticket_id: id,
      action: 'Fornecedores Comparados',
      performed_by: 'Comprador Lucas',
      performed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
      metadata: { items: 1 }
    }
  ];

  return logs;
};
