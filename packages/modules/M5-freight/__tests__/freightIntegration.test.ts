import { describe, it, expect } from 'vitest';
import { freightRequestSchema } from '@/lib/validation/schemas';
import { workflowMachine, getNextEvent } from '@/../packages/core/workflow/machine';

describe('M5 Freight — Fluxo de Estados Correto', () => {
  it('deve seguir DRAFT → SUBMITTED → QUOTING → PENDING_APPROVAL → APPROVED → PURCHASING', () => {
    expect(workflowMachine.states.DRAFT.on.SUBMIT).toBe('SUBMITTED');
    expect(workflowMachine.states.SUBMITTED.on.START_QUOTE).toBe('QUOTING');
    expect(workflowMachine.states.QUOTING.on.COMPLETE_QUOTE).toBe('PENDING_APPROVAL');
    expect(workflowMachine.states.PENDING_APPROVAL.on.APPROVE).toBe('APPROVED');
    expect(workflowMachine.states.APPROVED.on.FINALIZE_PURCHASE).toBe('PURCHASING');
  });

  it('M5 (frete) deve ir de PURCHASING para RELEASING (ateste digital), não IN_TRANSIT', () => {
    expect(workflowMachine.states.PURCHASING.on.ATTEST_DIGITAL).toBe('RELEASING');
    expect(workflowMachine.states.RELEASING.on.CONFIRM_ATTESTATION).toBe('RELEASED');
    expect(getNextEvent('M5')).toBe('ATTEST_DIGITAL');
  });

  it('M1/M4 (físico) deve ir de PURCHASING para RECEIVING → RELEASED', () => {
    expect(workflowMachine.states.PURCHASING.on.RECEIVE_PHYSICAL).toBe('RECEIVING');
    expect(workflowMachine.states.RECEIVING.on.CONFIRM_RECEIPT).toBe('RELEASED');
    expect(getNextEvent('M1')).toBe('RECEIVE_PHYSICAL');
    expect(getNextEvent('M4')).toBe('RECEIVE_PHYSICAL');
  });

  it('M6 (locação) deve ir PURCHASING → IN_USE → RETURNED → RELEASED', () => {
    expect(workflowMachine.states.PURCHASING.on.CHECKIN_EQUIPMENT).toBe('IN_USE');
    expect(workflowMachine.states.IN_USE.on.CHECKOUT_EQUIPMENT).toBe('RETURNED');
    expect(workflowMachine.states.RETURNED.on.CONFIRM_RETURN).toBe('RELEASED');
    expect(getNextEvent('M6')).toBe('CHECKIN_EQUIPMENT');
  });

  it('PENDING_APPROVAL rejeitado deve voltar para SUBMITTED (não REJECTED final)', () => {
    expect(workflowMachine.states.PENDING_APPROVAL.on.SEND_TO_REVISION).toBe('SUBMITTED');
    expect(workflowMachine.states.PENDING_APPROVAL.on.REJECT).toBe('REJECTED');
  });

  it('M4 com contrato deve pular cotação: SUBMITTED → PENDING_APPROVAL', () => {
    expect(workflowMachine.states.SUBMITTED.on.SKIP_QUOTE).toBe('PENDING_APPROVAL');
  });

  it('deve validar schema de requisição de frete M5', () => {
    const parsed = freightRequestSchema.safeParse({
      direction: 'inbound' as const,
      origin: 'Curitiba, PR',
      destination: 'VerticalParts, Curitiba',
      cargo_type: 'small',
      justification: 'Reposição de estoque urgente para manutenção M4.',
      desired_date: '2026-05-10',
    });
    expect(parsed.success).toBe(true);
  });

  it('deve rejeitar frete com origem igual ao destino', () => {
    const parsed = freightRequestSchema.safeParse({
      direction: 'inbound',
      origin: 'Curitiba, PR',
      destination: 'Curitiba, PR',
      cargo_type: 'small',
      justification: 'Teste de validação de origem e destino iguais.',
      desired_date: '2026-05-10',
    });
    expect(parsed.success).toBe(false);
  });
});
