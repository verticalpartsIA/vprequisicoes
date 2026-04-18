/**
 * Máquina de Estados Finita para o Fluxo de Requisições v2
 * Fluxo: Requisição (M1-M11) → Cotação → Aprovação → Compra → [Recebimento ou Liberação]
 */

export type State = 
  | 'DRAFT'              // Rascunho
  | 'SUBMITTED'          // Enviado, aguardando início de cotação
  | 'QUOTING'            // Em processo de cotação (comprador trabalhando)
  | 'PENDING_APPROVAL'   // Cotado, aguardando alçada de aprovação (Tier 1/2/3)
  | 'APPROVED'           // Aprovado pelo gestor
  | 'PURCHASED'          // Ordem de compra gerada / Pago
  | 'RECEIVING'          // Em trânsito / Aguardando conferência (M1, M4, M6)
  | 'RECEIVED'           // Finalizado com entrada em estoque
  | 'RELEASED'           // Finalizado com entrega de serviço/voucher (M2, M3, M5)
  | 'REJECTED'           // Reprovado (pode precisar de revisão)
  | 'REVISION_REQUESTED';// Devolvido para o requisitante ajustar

export type Event = 
  | 'SUBMIT'             // Enviar rascunho
  | 'START_QUOTE'        // Comprador assume o ticket
  | 'COMPLETE_QUOTE'     // Preços definidos, enviar para aprovação
  | 'APPROVE'            // Gestor aprova o valor cotado
  | 'REJECT'             // Gestor reprova definitivamente
  | 'REQUEST_REVISION'   // Gestor ou Comprador pede ajuste ao usuário
  | 'RESUBMIT'           // Usuário ajusta e reenvia
  | 'FINALIZE_PURCHASE'  // Comprador fecha com fornecedor
  | 'START_RECEIVING'    // Nota fiscal emitida / Produto saiu
  | 'RECEIVE'            // Almoxarifado confirma chegada
  | 'RELEASE_SERVICE';   // Serviço prestado / Voucher enviado (não-recebível)

export const workflowMachine = {
  initial: 'DRAFT',
  states: {
    DRAFT: {
      on: { SUBMIT: 'SUBMITTED' }
    },
    SUBMITTED: {
      on: { 
        START_QUOTE: 'QUOTING',
        REQUEST_REVISION: 'REVISION_REQUESTED'
      }
    },
    REVISION_REQUESTED: {
      on: { RESUBMIT: 'SUBMITTED' }
    },
    QUOTING: {
      on: { 
        COMPLETE_QUOTE: 'PENDING_APPROVAL',
        REQUEST_REVISION: 'REVISION_REQUESTED'
      }
    },
    PENDING_APPROVAL: {
      on: { 
        APPROVE: 'APPROVED',
        REJECT: 'REJECTED',
        REQUEST_REVISION: 'REVISION_REQUESTED'
      }
    },
    APPROVED: {
      on: { FINALIZE_PURCHASE: 'PURCHASED' }
    },
    PURCHASED: {
      on: { 
        START_RECEIVING: 'RECEIVING',  // Para produtos (M1, M6...)
        RELEASE_SERVICE: 'RELEASED'    // Para serviços/viagens (M2, M3...)
      }
    },
    RECEIVING: {
      on: { RECEIVE: 'RECEIVED' }
    },
    RECEIVED: {
      type: 'final'
    },
    RELEASED: {
      type: 'final'
    },
    REJECTED: {
      type: 'final'
    }
  }
};

/**
 * Helper para verificar se um módulo é "Recebível" (Logística/Almoxarifado)
 */
export const isModuleReceivable = (moduleCode: string): boolean => {
  const receivables = ['M1', 'M4', 'M6'];
  return receivables.includes(moduleCode);
};
