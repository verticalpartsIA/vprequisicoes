export type ServiceType = 'maintenance' | 'installation';
export type ProviderType = 'PF' | 'PJ';

export interface Milestone {
  name: string;
  percentage: number;
  description: string;
}

export interface ServiceRequest {
  id: string;
  ticket_number: string;
  status: string;
  created_at: string;
  
  // Traveler Info (inherited or standard)
  requester_name: string;
  requester_department: string;

  // Service Specifics
  service_type: ServiceType;
  scope_description: string;
  location_address: string;
  
  // Conditional Installation Fields
  work_code?: string;
  work_address?: string;
  
  // Payment Logic
  payment_by_milestone: boolean;
  milestones?: Milestone[];
  
  // Provider Info
  provider_type: ProviderType;
  provider_name: string;
  provider_document: string; // CPF or CNPJ
  provider_contact?: string;
  
  estimated_value?: number;
}
