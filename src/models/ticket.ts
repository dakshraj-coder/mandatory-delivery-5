/**
 * Production Models & Schema Types: Ticket QR Code Generator Worker
 * Ticket: ENG-139055 - Ticket QR Code Generator Worker
 *
 * Implements the approved PostgreSQL and OpenAPI 3.1 entity schemas.
 */

export type OrganizationStatus = 'active' | 'suspended' | 'archived';
export type EventStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
export type TicketStatus = 'issued' | 'active' | 'redeemed' | 'revoked' | 'refunded' | 'expired';
export type QRTokenStatus = 'valid' | 'redeemed' | 'expired' | 'revoked';
export type ScanResult =
  | 'success'
  | 'rejected_expired'
  | 'rejected_revoked'
  | 'rejected_tampered'
  | 'rejected_already_redeemed'
  | 'rejected_nonexistent';
export type WorkerJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'dead_letter';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  venue_name: string;
  start_time: string;
  end_time: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  price: number;
  currency: string;
  total_capacity: number;
  available_capacity: number;
  created_at: string;
}

export interface User {
  id: string;
  organization_id?: string;
  email_hash: string;
  display_name_sanitized: string;
  role: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  ticket_tier_id: string;
  user_id: string;
  ticket_reference: string;
  attendee_name_sanitized: string;
  status: TicketStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface QRCodeTokenPayload {
  token_id: string;
  ticket_id: string;
  event_id: string;
  nonce: string;
  issued_at: number;
  expires_at: number;
  signature: string;
}

export interface QRCodeToken {
  id: string;
  ticket_id: string;
  token_hash: string;
  nonce: string;
  version: number;
  issued_at: string;
  expires_at: string;
  status: QRTokenStatus;
  revoked_reason?: string;
  revoked_at?: string;
  created_at: string;
}

export interface ScanAuditLog {
  id: string;
  ticket_id?: string;
  qr_code_token_id?: string;
  scanner_user_id?: string;
  scan_result: ScanResult;
  failure_reason?: string;
  ip_address_hashed?: string;
  user_agent?: string;
  scanned_at: string;
}

export interface WorkerJob {
  id: string;
  job_type: string;
  queue_name: string;
  payload_hash: string;
  payload: Record<string, unknown>;
  status: WorkerJobStatus;
  attempt_count: number;
  max_attempts: number;
  last_error?: string;
  scheduled_at: string;
  locked_until?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
