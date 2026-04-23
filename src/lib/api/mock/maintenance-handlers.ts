import { MaintenanceRequestInput } from '../../validation/schemas';

/**
 * Handlers de Mock para o Módulo M4 - Manutenção
 */
export const maintenanceHandlers = {
  create: async (data: MaintenanceRequestInput) => {
    const ticketNumber = `MNT-2026-${Math.floor(100 + Math.random() * 899)}`;
    
    // Lógica de Bypass de Contrato
    const status = data.covered_by_contract ? 'APPROVED' : 'SUBMITTED';
    
    const newIdNum = Math.floor(Math.random() * 1000000);
    const request = {
      id: newIdNum,
      ticket_number: ticketNumber,
      userId: 1,
      username: 'Gelson Filho',
      type: 'M4',
      status,
      submittedAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      details: {
        ...data,
        justificativa: data.description 
      }
    };

    // Persistência Mock (Sincronizado com mock-db)
    if (typeof window !== 'undefined') {
      const { mockTicketList } = require('@core/db/mock-db');
      mockTicketList.unshift(request);
      localStorage.setItem('vp_tickets', JSON.stringify(mockTicketList));
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
