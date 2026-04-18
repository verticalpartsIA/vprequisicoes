import { describe, it, expect } from 'vitest';
import { workflowMachine, State, Event, isModuleReceivable } from '../machine';

const transition = (state: State, event: Event): State => {
  const nextState = (workflowMachine.states as any)[state]?.on?.[event];
  if (!nextState) throw new Error(`INVALID_TRANSITION: ${state} -> ${event}`);
  return nextState as State;
};

describe('WorkflowStateMachine v2 (Enterprise Flow)', () => {
  it('Fluxo Completo de Produtos (M1) - Com Recebimento', () => {
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
    expect(state).toBe('PURCHASED');
    
    // Teste de lógica de ramificação (M1 é recebível)
    expect(isModuleReceivable('M1')).toBe(true);
    state = transition(state, 'START_RECEIVING');
    expect(state).toBe('RECEIVING');
    
    state = transition(state, 'RECEIVE');
    expect(state).toBe('RECEIVED');
  });

  it('Fluxo de Viagens (M2) - Liberação Direta', () => {
    let state: State = 'PURCHASED';
    
    // M2 não é recebível fisicamente
    expect(isModuleReceivable('M2')).toBe(false);
    
    state = transition(state, 'RELEASE_SERVICE');
    expect(state).toBe('RELEASED');
  });

  it('Ciclo de Revisão: Gestor devolve para usuário', () => {
    let state: State = 'PENDING_APPROVAL';
    
    state = transition(state, 'REQUEST_REVISION');
    expect(state).toBe('REVISION_REQUESTED');
    
    state = transition(state, 'RESUBMIT');
    expect(state).toBe('SUBMITTED');
  });

  it('Bloqueio: Não permite aprovar sem cotação prévia', () => {
    expect(() => transition('SUBMITTED', 'APPROVE')).toThrow(/INVALID_TRANSITION/);
  });
});
