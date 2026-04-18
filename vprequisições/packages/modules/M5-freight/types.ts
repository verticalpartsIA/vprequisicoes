import { z } from 'zod';

export type FreightDirection = 'inbound' | 'outbound';

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
}
