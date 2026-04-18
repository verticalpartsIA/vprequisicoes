import { FreightRequest } from "../../modules/M5-freight/types";

/**
 * Adapta uma requisição de frete para visualização no painel de cotação
 */
export const adaptFreightToQuotationView = (request: FreightRequest) => {
  return {
    module_label: 'Frete Logístico (M5)',
    summary: {
      route: `${request.origin} ➔ ${request.destination}`,
      direction: request.direction === 'inbound' ? 'Entrada (Para VP)' : 'Saída (Da VP)',
      cargo: request.cargo_type,
      details: `${request.weight_kg ? request.weight_kg + 'kg' : ''} ${request.dimensions ? '| ' + request.dimensions : ''}`,
      date: request.desired_date,
    },
    quotation_fields: [
      { name: 'carrier', label: 'Transportadora Selecionada', type: 'text', required: true },
      { name: 'price', label: 'Valor do Frete (R$)', type: 'number', required: true },
      { name: 'estimated_delivery_days', label: 'Prazo Previsto (Dias)', type: 'number', required: true },
      { name: 'tracking_code', label: 'Link/Código de Rastreio (Opcional)', type: 'text', required: false },
    ],
    justification_context: request.justification
  };
};
