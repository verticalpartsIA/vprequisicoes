import { vi } from 'vitest';

export const mockProductRequestEndpoint = vi.fn().mockResolvedValue({
  status: 'success',
  data: { ticket_number: 'M1-TEST-123' }
});

export const mockQuotationEndpoint = vi.fn().mockResolvedValue({
  status: 'success',
  data: { quotation_id: 'Q-456' }
});

export const mockApprovalEndpoint = vi.fn().mockResolvedValue({
  status: 'success',
  data: { approved: true }
});
