import { mockProductRequestHandler, getMockRequestHandler } from './mock/handlers';
import { mockQuotationSubmitHandler, mockQuotationDraftHandler } from './mock/quotation-handlers';
import { mockApprovalListHandler, mockApprovalDecideHandler, mockAuditLogHandler } from './mock/approval-handlers';
import { mockPurchaseListHandler, mockAuctionHandler, mockDirectPurchaseHandler } from './mock/purchasing-handlers';
import { mockReceivingListHandler, mockPhysicalReceivingHandler, mockDigitalAttestationHandler } from './mock/receiving-handlers';
import { mockDashboardDataHandler } from './mock/dashboard-handlers';
import { mockTravelRequestHandler } from './mock/travel-handlers';
import { servicesHandlers } from './mock/services-handlers';
import { maintenanceHandlers } from './mock/maintenance-handlers';

import { mockFreightRequestHandler } from './mock/freight-handlers';
import { mockRentalRequestHandler, mockRentalListHandler } from './mock/rental-handlers';

// USE_MOCK = false → dados reais no Supabase via rotas Next.js
// USE_MOCK = true  → dados em memória (desenvolvimento offline)
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

import { mockTicketList } from '@core/db/mock-db';
import { realGet, realPost, realPatch } from './real-client';


export const mockApiClient = {
  async get(path: string, params?: any) {
    if (!USE_MOCK) return realGet(path, params);

    if (path === '/api/requests') {
      return { status: 'success', data: mockTicketList };
    }

    if (path === '/api/requests/rental') {
      return { status: 'success', data: mockRentalListHandler() };
    }

    if (path === '/api/approval/tickets') {
      let tickets = mockApprovalListHandler(params?.role || 'manager_level_1');
      
      // Merge with localStorage decisions
      if (typeof window !== 'undefined') {
        tickets = tickets.filter(t => {
          const decision = localStorage.getItem(`decision_${t.id}`);
          if (decision) {
            const parsed = JSON.parse(decision);
            return parsed.decision !== 'approve' && parsed.decision !== 'reject';
          }
          return true;
        });
      }

      return { status: 'success', data: tickets };
    }

    if (path === '/api/purchasing/tickets') {
      return { status: 'success', data: mockPurchaseListHandler(params?.status || 'APPROVED') };
    }

    if (path === '/api/receiving/tickets') {
      return { status: 'success', data: mockReceivingListHandler(params?.status || 'PURCHASED') };
    }

    if (path === '/api/dashboard/summary') {
      return { status: 'success', data: mockDashboardDataHandler(params?.period, params?.module) };
    }

    if (path.includes('/api/approval/tickets/') && path.endsWith('/audit')) {
      const id = path.split('/')[4];
      return { status: 'success', data: mockAuditLogHandler(id) };
    }

    if (path.includes('/api/requests/')) {
      const idStr = path.split('/').pop() || '0';
      const id = parseInt(idStr);
      
      // Carregar rascunho se existir no localStorage
      if (typeof window !== 'undefined') {
        const savedDraft = localStorage.getItem(`quotation_draft_${id}`);
        if (savedDraft) {
          const ticket = mockTicketList.find(t => t.id === id);
          if (ticket) {
            return { 
              status: 'success', 
              data: { ...ticket, draft: JSON.parse(savedDraft) } 
            };
          }
        }
      }

      const found = mockTicketList.find(t => t.id === id);
      if (found) return { status: 'success', data: found };
      return getMockRequestHandler(idStr);
    }

    throw new Error(`Endpoint GET não mockado: ${path}`);
  },

  async post(path: string, body: any) {
    if (!USE_MOCK) return realPost(path, body);

    if (path === '/api/requests/travel') {
      return { status: 'success', data: mockTravelRequestHandler(body) };
    }

    if (path === '/api/requests/services') {
      const res = await servicesHandlers.submitServiceRequest(body);
      return { status: 'success', data: res.data };
    }

    if (path === '/api/requests/maintenance') {
      const res = await maintenanceHandlers.create(body);
      return { status: 'success', data: res.data };
    }

    if (path === '/api/requests/freight') {
      return mockFreightRequestHandler(body);
    }

    if (path === '/api/requests/rental') {
      return mockRentalRequestHandler(body);
    }

    if (path.includes('/api/requests/products')) {
      return mockProductRequestHandler(body);
    }

    if (path.includes('/api/approval/tickets/') && path.endsWith('/decide')) {
      const id = path.split('/')[4];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(`decision_${id}`, JSON.stringify(body));
      }

      return mockApprovalDecideHandler(id, body);
    }

    if (path.includes('/api/purchasing/tickets/') && path.endsWith('/auction')) {
      const id = path.split('/')[4];
      return mockAuctionHandler(id, body.supplier_list);
    }

    if (path.includes('/api/purchasing/tickets/') && path.endsWith('/direct')) {
      const id = path.split('/')[4];
      return mockDirectPurchaseHandler(id, body);
    }

    if (path.includes('/api/receiving/tickets/') && path.endsWith('/physical')) {
      const id = path.split('/')[4];
      return mockPhysicalReceivingHandler(id, body);
    }

    if (path.includes('/api/receiving/tickets/') && path.endsWith('/digital')) {
      const id = path.split('/')[4];
      return mockDigitalAttestationHandler(id, body);
    }

    if (path.includes('/api/quotation/tickets/')) {
      const id = path.split('/').pop() || '0';
      // Limpar rascunho após envio final
      if (typeof window !== 'undefined') localStorage.removeItem(`quotation_draft_${id}`);
      return mockQuotationSubmitHandler(id, body);
    }

    throw new Error(`Endpoint POST não mockado: ${path}`);
  },

  async patch(path: string, body: any) {
    if (!USE_MOCK) return realPatch(path, body);

    if (path.includes('/api/quotation/tickets/') && path.endsWith('/draft')) {
      const parts = path.split('/');
      const id = parts[parts.length - 2];
      
      // Salvar rascunho no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`quotation_draft_${id}`, JSON.stringify(body));
      }
      
      return mockQuotationDraftHandler(id, body);
    }

    throw new Error(`Endpoint PATCH não mockado: ${path}`);
  }
};

