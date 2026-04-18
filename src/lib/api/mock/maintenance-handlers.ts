import { MaintenanceRequestInput } from '../../validation/schemas';

/**
 * Handlers de Mock para o Módulo M4 - Manutenção
 */
export const maintenanceHandlers = {
  create: async (data: MaintenanceRequestInput) => {
    const ticketNumber = `M4-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Lógica de Bypass de Contrato
    const status = data.covered_by_contract ? 'APPROVED' : 'SUBMITTED';
    
    const request = {
      id: Math.random().toString(36).substr(2, 9),
      ticket_number: ticketNumber,
      type: 'M4',
      status,
      created_at: new Date().toISOString(),
      details: {
        ...data,
        justificativa: data.description // Mapeando para o campo genérico do dashboard
      }
    };

    // Persistência Mock (Dashboard)
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('vp_requests_mock') || '[]');
      localStorage.setItem('vp_requests_mock', JSON.stringify([request, ...existing]));
    }

    return {
      success: true,
      data: {
        ...request,
        skips_quotation: data.covered_by_contract
      }
    };
  }
};
