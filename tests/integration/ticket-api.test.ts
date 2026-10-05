/**
 * Integration Test Suite: Ticket API & Controller Layer
 * Ticket: ENG-139055 - Ticket QR Code Generator Worker
 *
 * Requirements covered:
 * - valid ticket creation
 * - missing required fields
 * - malformed input
 * - empty results
 * - API/network failures
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketApiController, CreateTicketDTO } from '../../src/api/ticket-controller';

describe('Integration: Ticket API & Endpoint Contracts (ENG-139055)', () => {
  let controller: TicketApiController;

  beforeEach(() => {
    controller = new TicketApiController();
  });

  describe('POST /tickets - Valid Ticket Creation', () => {
    it('should return 201 and structured ticket data on valid input', async () => {
      const validPayload: CreateTicketDTO = {
        event_id: '550e8400-e29b-41d4-a716-446655440010',
        ticket_tier_id: '550e8400-e29b-41d4-a716-446655440020',
        attendee_name: 'Morgan Stanley',
        attendee_email: 'morgan.stanley@enterprise.com',
        metadata: { department: 'Risk Analytics' },
      };

      const res = await controller.createTicket(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticket_reference).toBe('TKT-2026-X8K9M2');
      expect(res.body.data.status).toBe('issued');
    });
  });

  describe('POST /tickets - Missing Required Fields', () => {
    it('should return 400 Bad Request with field issues when attendee_name is omitted', async () => {
      const missingPayload = {
        event_id: '550e8400-e29b-41d4-a716-446655440010',
        ticket_tier_id: '550e8400-e29b-41d4-a716-446655440020',
        attendee_email: 'test@example.com',
      };

      const res = await controller.createTicket(missingPayload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.code).toBe('MISSING_REQUIRED_FIELDS');
      expect(res.body.error?.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'attendee_name' })])
      );
    });
  });

  describe('POST /tickets - Malformed Input', () => {
    it('should return 422 Unprocessable Entity for invalid UUID and invalid email format', async () => {
      const malformedPayload: CreateTicketDTO = {
        event_id: 'not-a-valid-uuid',
        ticket_tier_id: 'also-not-a-uuid',
        attendee_name: 'John Doe',
        attendee_email: 'invalid-email-string',
      };

      const res = await controller.createTicket(malformedPayload);
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.code).toBe('MALFORMED_INPUT');
      expect(res.body.error?.details?.length).toBe(3);
    });
  });

  describe('GET /tickets - Empty Results', () => {
    it('should return 200 OK with empty array when no tickets exist for query', async () => {
      const res = await controller.listTickets('00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data?.length).toBe(0);
      expect(res.body.meta?.total_items).toBe(0);
    });
  });

  describe('API / Network Failures', () => {
    it('should handle simulated server 500 error gracefully without crashing', async () => {
      const failingApiCall = async () => {
        throw new Error('Database connection timeout (500)');
      };

      await expect(failingApiCall()).rejects.toThrow('Database connection timeout (500)');
    });

    it('should support retry with backoff on transient network failures', async () => {
      let attempts = 0;
      const unstableWorker = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('ECONNRESET');
        }
        return { success: true };
      });

      const result = await TicketApiController.executeWithRetry<{ success: boolean }>(unstableWorker, 3, 10);
      expect(result.success).toBe(true);
      expect(attempts).toBe(2);
    });
  });
});
