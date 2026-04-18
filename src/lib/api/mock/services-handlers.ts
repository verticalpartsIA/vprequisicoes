// src/lib/api/mock/services-handlers.ts
// Versão simplificada sem depender de mock-db inexistente

export const servicesHandlers = {
  submitServiceRequest: async (data: any) => {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Retorna um ticket mock
    return {
      success: true,
      data: {
        ticket_number: `M3-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "pending",
        message: "Requisição enviada para cotação com sucesso",
        createdAt: new Date().toISOString()
      }
    };
  },

  // Outros handlers que possam ser usados no futuro
  getServiceRequests: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: []
    };
  }
};

export default servicesHandlers;