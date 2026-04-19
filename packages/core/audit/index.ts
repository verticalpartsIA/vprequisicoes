/**
 * packages/core/audit/index.ts
 * Audit trail stubs — will write to Supabase `audit_logs` table.
 */

import { State, Event } from '../workflow/machine';

export interface AuditEntry {
  ticketId: number;
  ticketNumber: string;
  userId: string;
  userName: string;
  fromState?: State;
  toState: State;
  event: Event;
  comment?: string;
  timestamp: string;
}

/**
 * Logs a workflow transition to the audit trail.
 * Replace with: supabase.from('audit_logs').insert(entry)
 */
export const logTransition = async (entry: AuditEntry): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.info('[Audit]', entry.event, `${entry.fromState} → ${entry.toState}`, entry.ticketNumber);
  }
  // TODO: supabase.from('audit_logs').insert(entry)
};

/**
 * Retrieves audit history for a ticket.
 * Replace with: supabase.from('audit_logs').select('*').eq('ticketId', ticketId).order('timestamp')
 */
export const getAuditHistory = async (ticketId: number): Promise<AuditEntry[]> => {
  // TODO: replace with real Supabase query
  return [];
};
