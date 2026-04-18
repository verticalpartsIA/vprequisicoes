export const mockTicketList = [
  { 
    id: 123, 
    userId: 1, 
    username: 'João Silva', 
    type: 'M1', 
    status: 'SUBMITTED', 
    submittedAt: '2024-04-15T10:00:00Z', 
    details: { 
      justificativa: 'Reposição para linha de montagem', 
      itens: [{ nome: 'Parafuso M8', quantidade: 100 }],
      departamento: 'Engenharia'
    },
    quotation: {
      total_amount: 110.00,
      items: [
        {
          suppliers: [
            { name: 'Parafusos Brasil', price: 1.10, is_winner: true, delivery_days: 7 },
            { name: 'Ferragens Silva', price: 1.20, is_winner: false, delivery_days: 5 }
          ]
        }
      ]
    }
  },
  { 
    id: 101, 
    userId: 1, 
    username: 'João Silva', 
    type: 'M1', 
    status: 'SUBMITTED', 
    submittedAt: '2024-04-15T10:00:00Z', 
    details: { 
      justificativa: 'Reposição de estoque', 
      itens: [{ nome: 'Parafuso M8', quantidade: 100 }] 
    } 
  },
  { 
    id: 102, 
    userId: 2, 
    username: 'Maria Oliveira', 
    type: 'M1', 
    status: 'SUBMITTED', 
    submittedAt: '2024-04-16T11:30:00Z', 
    details: { 
      justificativa: 'Manutenção Máquina 5', 
      itens: [{ nome: 'Filtro de Ar', quantidade: 5 }] 
    } 
  },
  {
    id: 501,
    userId: 1,
    username: 'João Silva',
    type: 'M5',
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    details: {
      direction: 'inbound',
      origin: 'São Paulo, SP',
      destination: 'Curitiba, PR',
      cargo_type: 'Componentes Eletrônicos',
      weight_kg: 450,
      justification: 'Reposição urgente de sensores de precisão.'
    }
  },
  {
    id: 502,
    userId: 3,
    username: 'Ricardo Santos',
    type: 'M5',
    status: 'APPROVED',
    submittedAt: new Date().toISOString(),
    details: {
      direction: 'outbound',
      origin: 'Curitiba, PR',
      destination: 'Belo Horizonte, MG',
      cargo_type: 'Equipamento Pesado',
      weight_kg: 2500,
      justification: 'Envio de máquina reparada para o cliente.'
    },
    quotation: {
      total_amount: 1850.00,
      carrier: 'TransLog Brasil'
    }
  }
];
