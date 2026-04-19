import { FreightRequest } from "../../modules/M5-freight/types";

/**
 * Adapta uma requisição de frete para visualização no painel de aprovação do gestor
 */
export const adaptFreightToApprovalView = (request: FreightRequest) => {
  if (!request.quotation) return null;

  return {
    module_badge: 'FRETE',
    title: 'Serviço de Transporte de Carga',
    approver_summary: `${request.direction === 'inbound' ? 'Trazer PARA' : 'Levar DA'} VerticalParts ${request.direction === 'inbound' ? 'DE' : 'PARA'} ${request.direction === 'inbound' ? request.origin : request.destination} | ${request.cargo_type} | ${request.quotation.carrier} | R$ ${request.quotation.price.toLocaleString('pt-BR')}`,
    comparison: {
      from: request.origin,
      to: request.destination,
      carrier: request.quotation.carrier,
      eta: `${request.quotation.estimated_delivery_days} dias`,
    },
    context: [
      { label: 'Tipo de Carga', value: request.cargo_type },
      { label: 'Peso', value: request.weight_kg ? `${request.weight_kg} kg` : 'N/A' },
      { label: 'Justificativa', value: request.justification },
    ]
  };
};
