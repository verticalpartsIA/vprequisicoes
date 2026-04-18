import { describe, it, expect } from 'vitest';
import { workflowMachine } from '@/../packages/core/workflow/machine';
import { mockFreightRequestHandler, executeFreightTransport } from '@/lib/api/mock/freight-handlers';

describe('M5 Freight Lifecycle Integration', () => {
  it('should follow the M5 specific state transitions', () => {
    // 1. DRAFT -> SUBMITTED
    expect(workflowMachine.states.DRAFT.on.SUBMIT).toBe('SUBMITTED');
    
    // 2. SUBMITTED -> QUOTING
    expect(workflowMachine.states.SUBMITTED.on.START_QUOTE).toBe('QUOTING');
    
    // 3. QUOTING -> PENDING_APPROVAL
    expect(workflowMachine.states.QUOTING.on.COMPLETE_QUOTE).toBe('PENDING_APPROVAL');
    
    // 4. PENDING_APPROVAL -> APPROVED
    expect(workflowMachine.states.PENDING_APPROVAL.on.APPROVE).toBe('APPROVED');
    
    // 5. APPROVED -> PURCHASED
    expect(workflowMachine.states.APPROVED.on.FINALIZE_PURCHASE).toBe('PURCHASED');
    
    // 6. PURCHASED -> IN_TRANSIT (M5 specific)
    expect(workflowMachine.states.PURCHASED.on.EXECUTE_TRANSPORT).toBe('IN_TRANSIT');
    
    // 7. IN_TRANSIT -> RELEASED (Final state for M5)
    expect(workflowMachine.states.IN_TRANSIT.on.ATTEST_DELIVERY).toBe('RELEASED');
  });

  it('should correctly status update via mock handler to IN_TRANSIT', () => {
    const mockRequest = {
      direction: 'inbound' as const,
      origin: 'Curitiba, PR',
      destination: 'VerticalParts',
      cargo_type: 'small',
      justification: 'Reposição de estoque urgente para manutenção M4.',
      desired_date: '2026-05-10',
      weight_kg: 50
    };

    const submission = mockFreightRequestHandler(mockRequest);
    const ticketId = submission.data.id;

    const result = executeFreightTransport(ticketId);
    expect(result.data.status).toBe('IN_TRANSIT');
    expect(result.data.details.quotation.carrier).toBeDefined();
  });
});
