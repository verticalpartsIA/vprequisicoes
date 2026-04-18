import { mockApiClient } from '@/lib/api/client.mock';

describe('Purchasing Module Integration', () => {
  it('should list tickets with APPROVED status', async () => {
    const res: any = await mockApiClient.get('/api/purchasing/tickets', { status: 'APPROVED' });
    expect(res.status).toBe('success');
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should process a direct purchase and return a purchased status', async () => {
    const ticketId = '123';
    const body = {
      method: 'direct',
      supplier_id: 'Parafusos Brasil',
      supplier_name: 'Parafusos Brasil',
      items: [
        { description: 'Parafuso M8', quantity: 100, unit_price: 1.10, subtotal: 110 }
      ],
      total_amount: 110.00,
      delivery_address: 'Rua Principal, 123',
      oc_number: 'OC-20240416-9999'
    };

    const res: any = await mockApiClient.post(`/api/purchasing/tickets/${ticketId}/direct`, body);
    
    expect(res.status).toBe('success');
    expect(res.data.status).toBe('PURCHASED');
    expect(res.data.oc_number).toBe('OC-20240416-9999');
  });

  it('should initiate an auction session', async () => {
    const ticketId = '123';
    const body = { supplier_list: ['Supp A', 'Supp B'] };

    const res: any = await mockApiClient.post(`/api/purchasing/tickets/${ticketId}/auction`, body);
    
    expect(res.status).toBe('success');
    expect(res.data.status).toBe('in_progress');
    expect(res.data.auction_id).toBeDefined();
  });
});
