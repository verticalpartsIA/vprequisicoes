import { simulateAuction, formatAuctionLog } from '../auction-mock';

describe('Auction Engine Mock', () => {
  it('should return an auction result with lower price after delay', async () => {
    const initialPrice = 1000.00;
    const suppliers = ['Supplier A', 'Supplier B', 'Supplier C'];
    
    const result = await simulateAuction('123', suppliers, initialPrice);
    
    expect(result.final_price).toBeLessThan(initialPrice);
    expect(suppliers).toContain(result.winning_supplier);
    expect(result.participants).toBe(suppliers.length);
    expect(result.log.length).toBeGreaterThan(0);
  });

  it('should format logs correctly for audit', async () => {
    const result = {
      auction_id: 'AUC-1',
      winning_supplier: 'Winner',
      final_price: 100,
      participants: 2,
      completed_at: new Date().toISOString(),
      log: ['Step 1', 'Step 2']
    };
    
    const formatted = formatAuctionLog(result);
    expect(formatted).toBe('Step 1\nStep 2');
  });
});
