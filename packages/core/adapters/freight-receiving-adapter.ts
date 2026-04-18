import { FreightRequest } from "../../modules/M5-freight/types";

/**
 * Adapta uma requisição de frete para o formulário de ateste de transporte (Recebimento Digital)
 */
export const adaptFreightToReceivingView = (request: FreightRequest) => {
  return {
    title: 'Ateste de Transporte (M5)',
    description: 'Confirme a realização da coleta e entrega do transporte contratado.',
    steps: [
      { id: 'pickup', label: 'Coleta Realizada', type: 'checkbox' },
      { id: 'delivery', label: 'Entrega Confirmada', type: 'checkbox' },
      { id: 'actual_date', label: 'Data Real da Entrega', type: 'date' },
      { id: 'notes', label: 'Observação da Entrega', type: 'textarea' },
    ],
    summary: {
      origin: request.origin,
      destination: request.destination,
      carrier: request.quotation?.carrier || 'Não informado',
      tracking: request.quotation?.tracking_code || 'N/A'
    }
  };
};
