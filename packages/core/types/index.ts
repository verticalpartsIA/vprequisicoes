import { State } from '../workflow/machine';

export type RequestStatus = State;

export * from './quotation';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'common' | 'manager_level_1' | 'manager_level_2' | 'director' | 'buyer';
  createdAt: string;
}

export interface Ticket {
  id: number;
  userId: number;
  username: string;
  type: string; // M1, M2...
  status: RequestStatus;
  submittedAt: string;
  totalAmount?: number; // Preenchido após cotação
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
