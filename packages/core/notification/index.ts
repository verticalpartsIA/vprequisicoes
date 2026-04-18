/**
 * packages/core/notification/index.ts
 * Notification stubs — will be replaced by Supabase Realtime + Edge Functions.
 */

export type NotificationChannel = 'in_app' | 'email' | 'whatsapp';

export type NotificationEvent =
  | 'ticket_submitted'
  | 'ticket_approved'
  | 'ticket_rejected'
  | 'ticket_revision'
  | 'quotation_started'
  | 'quotation_complete'
  | 'purchase_order_generated'
  | 'item_received'
  | 'ticket_released';

export interface NotificationPayload {
  event: NotificationEvent;
  ticketId: number;
  ticketNumber: string;
  recipientId: string;
  channel?: NotificationChannel;
  metadata?: Record<string, unknown>;
}

/**
 * Sends a notification. Currently logs to console.
 * Replace with: supabase.functions.invoke('send-notification', { body: payload })
 */
export const sendNotification = async (payload: NotificationPayload): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.info('[Notification]', payload.event, payload.ticketNumber);
  }
  // TODO: supabase.functions.invoke('send-notification', { body: payload });
};
