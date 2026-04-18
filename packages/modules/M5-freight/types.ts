import { z } from 'zod';

export type FreightDirection = 'inbound' | 'outbound';

export interface FreightQuotation {
  carrier: string;
  price: number;
  estimated_delivery_days: number;
  tracking_code?: string;
  quoted_at: string;
}

export interface FreightAttestation {
  pickup_confirmed: boolean;
  delivery_confirmed: boolean;
  actual_delivery_date?: string;
  notes?: string;
  attested_at: string;
}

export interface FreightRequest {
  id: string;
  ticket_number: string;
  status: string;
  direction: FreightDirection;
  origin: string;
  destination: string;
  cargo_type: string;
  weight_kg?: number;
  dimensions?: string;
  justification: string;
  desired_date: string;
  created_at: string;
  
  // Integrações core
  quotation?: FreightQuotation;
  attestation?: FreightAttestation;
}
