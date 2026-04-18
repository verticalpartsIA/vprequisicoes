import { describe, it, expect } from 'vitest';
import { approvalDecisionSchema } from '@/lib/validation/schemas';

describe('Approval Decision Schema (Zod)', () => {
  it('deve aceitar aprovação sem motivo', () => {
    const result = approvalDecisionSchema.safeParse({ decision: 'approve' });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar reprovação sem motivo', () => {
    const result = approvalDecisionSchema.safeParse({ decision: 'reject' });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar reprovação com motivo muito curto', () => {
    const result = approvalDecisionSchema.safeParse({ 
      decision: 'reject', 
      reason: 'curto' 
    });
    expect(result.success).toBe(false);
  });

  it('deve aceitar reprovação com motivo válido', () => {
    const result = approvalDecisionSchema.safeParse({ 
      decision: 'reject', 
      reason: 'O valor está muito acima do mercado para este item.' 
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar revisão sem comentário', () => {
    const result = approvalDecisionSchema.safeParse({ decision: 'revision' });
    expect(result.success).toBe(false);
  });

  it('deve aceitar revisão com comentário', () => {
    const result = approvalDecisionSchema.safeParse({ 
      decision: 'revision', 
      comment: 'Favor cotar com mais um fornecedor.' 
    });
    expect(result.success).toBe(true);
  });
});
