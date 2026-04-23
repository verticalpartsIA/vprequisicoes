export type ApprovalDecisionType = 'approved' | 'rejected' | 'revision_requested';

export interface ApprovalDecision {
  id: string;
  ticket_id: string;
  decision: ApprovalDecisionType;
  reason: string | null;
  decided_by: string;
  decided_at: Date;
  approval_tier: 1 | 2 | 3;
  user_role_at_decision: string;
  previous_status: string;
  next_status: string;
}

export interface ApprovalAuditLog {
  id: string;
  ticket_id: string;
  action: string;
  performed_by: string;
  performed_at: Date;
  metadata?: any;
}

export interface ApprovalInput {
  decision: 'approve' | 'reject' | 'revision';
  reason?: string;
  comment?: string;
}
