/**
 * Unit Test Suite: QR Code Generator Worker & Cryptographic Token Engine
 * Ticket: ENG-139055 - Ticket QR Code Generator Worker
 *
 * Requirements covered:
 * - QR generation with cryptographic HMAC-SHA256 signature and nonce
 * - nonexistent ticket handling
 * - invalid QR token rejection (tampered or malformed)
 * - expired QR token rejection
 * - revoked QR token rejection
 * - SVG vector matrix generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductionQRWorker, QRWorkerService, TicketRepository } from '../../src/worker/qr-worker';

describe('Unit: QR Code Generator Worker & Token Lifecycle (ENG-139055)', () => {
  const SIGNING_SECRET = 'test-worker-hmac-secret-32-bytes-long!';
  let existingTickets: Set<string>;
  let revokedTokens: Map<string, string>;
  let worker: QRWorkerService;

  beforeEach(() => {
    existingTickets = new Set(['ticket-uuid-1', 'ticket-uuid-2']);
    revokedTokens = new Map();

    const mockRepo: TicketRepository = {
      exists: async (ticketId: string) => existingTickets.has(ticketId),
      isRevoked: async (tokenId: string) => ({
        revoked: revokedTokens.has(tokenId),
        reason: revokedTokens.get(tokenId),
      }),
      markRevoked: async (tokenId: string, reason: string) => {
        revokedTokens.set(tokenId, reason);
      },
    };

    worker = new ProductionQRWorker(SIGNING_SECRET, mockRepo);
  });

  describe('QR Generation', () => {
    it('should generate a valid signed QR token payload and SVG asset', async () => {
      const result = await worker.generateToken('ticket-uuid-1', 'event-uuid-100', 300);

      expect(result.payload).toBeDefined();
      expect(result.payload.ticket_id).toBe('ticket-uuid-1');
      expect(result.payload.event_id).toBe('event-uuid-100');
      expect(result.payload.signature).toMatch(/^[a-f0-9]{64}$/);
      expect(result.payload.expires_at).toBeGreaterThan(result.payload.issued_at);
      expect(result.svg).toContain('<svg');
      expect(result.svg).toContain('role="img"');
    });

    it('should throw NONEXISTENT_TICKET when generating for invalid ticket ID', async () => {
      await expect(worker.generateToken('non-existent-ticket-999', 'event-uuid-100')).rejects.toThrow(
        'NONEXISTENT_TICKET'
      );
    });
  });

  describe('Verification: Nonexistent Ticket', () => {
    it('should reject verification when ticket is not in database', async () => {
      const { payload } = await worker.generateToken('ticket-uuid-1', 'event-uuid-100');
      // Simulate ticket deletion from database
      existingTickets.delete('ticket-uuid-1');

      const result = await worker.verifyToken(JSON.stringify(payload));
      expect(result.valid).toBe(false);
      expect(result.code).toBe('NONEXISTENT_TICKET');
    });
  });

  describe('Verification: Invalid QR Token', () => {
    it('should reject tokens with tampered signatures', async () => {
      const { payload } = await worker.generateToken('ticket-uuid-1', 'event-uuid-100');
      // Tamper signature
      payload.signature = 'tampered-signature-000000000000000000000000000000000000000000000000';

      const result = await worker.verifyToken(JSON.stringify(payload));
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_TOKEN');
      expect(result.message).toContain('signature mismatch');
    });

    it('should reject malformed or non-JSON payloads', async () => {
      const result = await worker.verifyToken('not-valid-json-string');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Verification: Expired QR', () => {
    it('should reject QR codes whose expiration timestamp is in the past', async () => {
      // Generate with TTL of 1 second
      const { payload } = await worker.generateToken('ticket-uuid-1', 'event-uuid-100', 1);

      // Fast-forward time past expiration
      vi.useFakeTimers();
      vi.advanceTimersByTime(2000);

      const result = await worker.verifyToken(JSON.stringify(payload));
      expect(result.valid).toBe(false);
      expect(result.code).toBe('EXPIRED_QR');
      expect(result.message).toContain('expired');

      vi.useRealTimers();
    });
  });

  describe('Verification: Revoked QR', () => {
    it('should reject QR tokens that have been explicitly revoked', async () => {
      const { payload } = await worker.generateToken('ticket-uuid-1', 'event-uuid-100');

      // Revoke the token
      await worker.revokeToken(payload.token_id, 'Customer reported stolen ticket pass');

      const result = await worker.verifyToken(JSON.stringify(payload));
      expect(result.valid).toBe(false);
      expect(result.code).toBe('REVOKED_QR');
      expect(result.message).toContain('stolen ticket');
    });
  });
});
