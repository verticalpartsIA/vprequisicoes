import { describe, it, expect } from 'vitest';
import { workflowMachine, State, Event, isModuleReceivable } from '../machine';

const transition = (state: State, event: Event): State => {
  const nextState = (workflowMachine.states as any)[state]?.on?.[event];
  if (!nextState) throw new Error(`INVALID_TRANSITION: ${state} -> ${event}`);
  return nextState as State;
};

describe('WorkflowStateMachine v2 (Enterprise Flow)', () => {
  it('Fluxo Completo de Produtos (M1) - Com Recebimento Físico', () => {
    let state: State = 'DRAFT';

    state = transition(state, 'SUBMIT');
    expect(state).toBe('SUBMITTED');

    state = transition(state, 'START_QUOTE');
    expect(state).toBe('QUOTING');

    state = transition(state, 'COMPLETE_QUOTE');
    expect(state).toBe('PENDING_APPROVAL');

    state = transition(state, 'APPROVE');
    expect(state).toBe('APPROVED');

    state = transition(state, 'FINALIZE_PURCHASE');
    expect(state).toBe('PURCHASING');

    // M1 é recebível fisicamente
    expect(isModuleReceivable('M1')).toBe(true);

    state = transition(state, 'RECEIVE_PHYSICAL');
    expect(state).toBe('RECEIVING');

    state = transition(state, 'CONFIRM_RECEIPT');
    expect(state).toBe('RELEASED');
  });

  it('Fluxo de Viagens (M2) - Ateste Digital + Liberação', () => {
    let state: State = 'APPROVED';

    state = transition(state, 'FINALIZE_PURCHASE');
    expect(state).toBe('PURCHASING');

    // M2 não é recebível fisicamente — usa ateste digital
    expect(isModuleReceivable('M2')).toBe(false);

    state = transition(state, 'ATTEST_DIGITAL');
    expect(state).toBe('RELEASING');

    state = transition(state, 'CONFIRM_ATTESTATION');
    expect(state).toBe('RELEASED');
  });

  it('Ciclo de Revisão: Gestor devolve para retrabalho', () => {
    let state: State = 'PENDING_APPROVAL';

    // Gestor devolve — volta para SUBMITTED para retrabalho
    state = transition(state, 'SEND_TO_REVISION');
    expect(state).toBe('SUBMITTED');

    // Solicitante requota e reenvia para aprovação
    state = transition(state, 'START_QUOTE');
    expect(state).toBe('QUOTING');

    state = transition(state, 'COMPLETE_QUOTE');
    expect(state).toBe('PENDING_APPROVAL');
  });

  it('Bloqueio: Não permite aprovar direto de SUBMITTED sem cotação', () => {
    expect(() => transition('SUBMITTED', 'APPROVE' as Event)).toThrow(/INVALID_TRANSITION/);
  });

  it('Fluxo M6 Locação: Check-in e Check-out de Equipamento', () => {
    let state: State = 'APPROVED';

    state = transition(state, 'FINALIZE_PURCHASE');
    expect(state).toBe('PURCHASING');

    state = transition(state, 'CHECKIN_EQUIPMENT');
    expect(state).toBe('IN_USE');

    state = transition(state, 'CHECKOUT_EQUIPMENT');
    expect(state).toBe('RETURNED');

    state = transition(state, 'CONFIRM_RETURN');
    expect(state).toBe('RELEASED');
  });
});
