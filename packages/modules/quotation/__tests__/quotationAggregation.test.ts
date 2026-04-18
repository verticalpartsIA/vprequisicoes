import { describe, it, expect } from 'vitest';
import { groupTicketsByRequesterAndDay, selectTopSuppliers } from '../logic';

describe('QuotationAggregationLogic', () => {
  it('Agrupar tickets do mesmo requisitante no mesmo dia', () => {
    const input = [
      { requester_id: 'user1', module: 'M1', created_at: '2024-01-15T10:00:00Z' },
      { requester_id: 'user1', module: 'M2', created_at: '2024-01-15T11:00:00Z' }
    ];
    
    const groups = groupTicketsByRequesterAndDay(input);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });

  it('Não agrupar tickets de requisitantes diferentes', () => {
    const input = [
      { requester_id: 'user1', module: 'M1', created_at: '2024-01-15T10:00:00Z' },
      { requester_id: 'user2', module: 'M1', created_at: '2024-01-15T10:00:00Z' }
    ];
    
    expect(groupTicketsByRequesterAndDay(input)).toHaveLength(2);
  });

  it('Cotação suporta até 3 fornecedores por item', () => {
    const suppliers = ['supA', 'supB', 'supC', 'supD'];
    expect(selectTopSuppliers(suppliers)).toHaveLength(3);
    expect(selectTopSuppliers(suppliers)).toContain('supC');
    expect(selectTopSuppliers(suppliers)).not.toContain('supD');
  });
});
