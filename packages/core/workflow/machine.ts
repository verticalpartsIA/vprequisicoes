export type State =
  | 'DRAFT'              // Rascunho inicial
  | 'SUBMITTED'          // Enviado — aguarda cotação ou aprovação direta
  | 'QUOTING'            // Em cotação (sem contrato vigente)
  | 'PENDING_APPROVAL'   // Aguardando alçada (Tier 1/2/3)
  | 'APPROVED'           // Aprovado pelo gestor
  | 'PURCHASING'         // OC sendo gerada / leilão em andamento
  | 'RECEIVING'          // Entrada física em estoque (M1, M4)
  | 'RELEASING'          // Ateste digital de entrega (M2, M3, M5)
  | 'IN_USE'             // Equipamento em uso — check-in (M6)
  | 'RETURNED'           // Equipamento devolvido — check-out (M6)
  | 'RELEASED'           // Finalizado — estado terminal único
  | 'REJECTED';          // Reprovado definitivamente

export type Event =
  | 'SUBMIT'             // DRAFT → SUBMITTED
  | 'START_QUOTE'        // SUBMITTED → QUOTING (sem contrato)
  | 'SKIP_QUOTE'         // SUBMITTED → PENDING_APPROVAL (com contrato, ex: M4)
  | 'COMPLETE_QUOTE'     // QUOTING → PENDING_APPROVAL (preços definidos)
  | 'APPROVE'            // PENDING_APPROVAL → APPROVED
  | 'REJECT'             // PENDING_APPROVAL → REJECTED (definitivo)
  | 'SEND_TO_REVISION'   // PENDING_APPROVAL → SUBMITTED (revisão/rejeição para retrabalho)
  | 'FINALIZE_PURCHASE'  // APPROVED → PURCHASING (compra direta ou leilão)
  | 'RECEIVE_PHYSICAL'   // PURCHASING → RECEIVING (M1, M4 — item físico)
  | 'ATTEST_DIGITAL'     // PURCHASING → RELEASING (M2, M3, M5 — serviço/viagem/frete)
  | 'CHECKIN_EQUIPMENT'  // PURCHASING → IN_USE (M6 — locação)
  | 'CONFIRM_RECEIPT'    // RECEIVING → RELEASED (almoxarifado confirma entrada)
  | 'CONFIRM_ATTESTATION'// RELEASING → RELEASED (gestor atesta execução)
  | 'CHECKOUT_EQUIPMENT' // IN_USE → RETURNED (devolução do equipamento)
  | 'CONFIRM_RETURN';    // RETURNED → RELEASED (check-out concluído)

export const workflowMachine = {
  initial: 'DRAFT' as State,
  states: {
    DRAFT: {
      on: { SUBMIT: 'SUBMITTED' as State }
    },
    SUBMITTED: {
      on: {
        START_QUOTE:  'QUOTING' as State,          // sem contrato vigente
        SKIP_QUOTE:   'PENDING_APPROVAL' as State, // M4 com contrato ativo
      }
    },
    QUOTING: {
      on: {
        COMPLETE_QUOTE: 'PENDING_APPROVAL' as State,
      }
    },
    PENDING_APPROVAL: {
      on: {
        APPROVE:          'APPROVED' as State,
        REJECT:           'REJECTED' as State,   // definitivo
        SEND_TO_REVISION: 'SUBMITTED' as State,  // volta para retrabalho
      }
    },
    APPROVED: {
      on: {
        FINALIZE_PURCHASE: 'PURCHASING' as State,
      }
    },
    PURCHASING: {
      on: {
        RECEIVE_PHYSICAL:   'RECEIVING' as State,  // M1, M4
        ATTEST_DIGITAL:     'RELEASING' as State,  // M2, M3, M5
        CHECKIN_EQUIPMENT:  'IN_USE' as State,     // M6
      }
    },
    RECEIVING: {
      on: { CONFIRM_RECEIPT: 'RELEASED' as State }
    },
    RELEASING: {
      on: { CONFIRM_ATTESTATION: 'RELEASED' as State }
    },
    IN_USE: {
      on: { CHECKOUT_EQUIPMENT: 'RETURNED' as State }
    },
    RETURNED: {
      on: { CONFIRM_RETURN: 'RELEASED' as State }
    },
    RELEASED: {
      type: 'final' as const
    },
    REJECTED: {
      type: 'final' as const
    },
  }
};

export const getNextEvent = (moduleCode: string): Event => {
  if (['M1', 'M4'].includes(moduleCode)) return 'RECEIVE_PHYSICAL';
  if (['M2', 'M3', 'M5'].includes(moduleCode)) return 'ATTEST_DIGITAL';
  if (moduleCode === 'M6') return 'CHECKIN_EQUIPMENT';
  return 'ATTEST_DIGITAL';
};

export const isModuleReceivable = (moduleCode: string): boolean =>
  ['M1', 'M4'].includes(moduleCode);
