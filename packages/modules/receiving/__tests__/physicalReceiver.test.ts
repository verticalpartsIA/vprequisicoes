import { describe, it, expect } from 'vitest';
import { processPhysicalReceipt } from '../../../core/services/physicalReceiver';

describe('Receiving Module - Physical Receiver Service', () => {
  it('should mark status as received for full receipt', () => {
    const items: any = [
      { purchase_order_item_id: '1', quantity_purchased: 10, quantity_received: 10, condition: 'ok' }
    ];
    const receipt = processPhysicalReceipt('ticket-1', items, 'Admin');
    expect(receipt.status).toBe('received');
  });

  it('should mark status as partial_received for quantity mismatch', () => {
    const items: any = [
      { purchase_order_item_id: '1', quantity_purchased: 10, quantity_received: 5, condition: 'ok' }
    ];
    const receipt = processPhysicalReceipt('ticket-1', items, 'Admin');
    expect(receipt.status).toBe('partial_received');
  });

  it('should mark status as divergence_reported if item is damaged', () => {
    const items: any = [
      { purchase_order_item_id: '1', quantity_purchased: 10, quantity_received: 10, condition: 'damaged' }
    ];
    const receipt = processPhysicalReceipt('ticket-1', items, 'Admin');
    expect(receipt.status).toBe('divergence_reported');
  });
});
