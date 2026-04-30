import { describe, it, expect } from 'vitest';
import { realGet } from '@/lib/api/real-client';

describe('Purchasing Module Integration', () => {
  it('should list tickets with APPROVED status', async () => {
    const res: any = await realGet('/api/purchasing/tickets', { status: 'APPROVED' });
    expect(res.status).toBe('success');
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should list tickets with PURCHASING status', async () => {
    const res: any = await realGet('/api/purchasing/tickets', { status: 'PURCHASING' });
    expect(res.status).toBe('success');
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('should list tickets pending approval', async () => {
    const res: any = await realGet('/api/approval/tickets');
    expect(res.status).toBe('success');
    expect(Array.isArray(res.data)).toBe(true);
  });
});
