/**
 * UI / Component Test Suite: Ticket Worker Component UX & Behaviors
 * Ticket: ENG-139055 - Ticket QR Code Generator Worker
 *
 * Requirements covered:
 * - Loading states (visible loading indicators, aria-busy, disabled actions)
 * - Invalid or malformed inputs prevent submission and highlight offending fields in red (#DC2626)
 * - Empty states must display a user-friendly "No data found" message
 * - After a primary action is completed, log:
 *   [Analytics] User interacted with Ticket QR Code Generator Worker
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketWorkerController } from '../../src/ui/ticket-worker-component';

describe('UI / Component: Ticket Worker Behaviors (ENG-139055)', () => {
  let controller: TicketWorkerController;
  let logSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logSpy = vi.fn();
    controller = new TicketWorkerController(logSpy);
  });

  describe('Form Validation & Error Highlighting', () => {
    it('should prevent submission when form inputs are invalid or empty', async () => {
      const success = await controller.submitPrimaryAction();
      expect(success).toBe(false);
      const state = controller.getState();
      expect(state.errors.attendeeName).toBeDefined();
      expect(state.errors.attendeeEmail).toBeDefined();
      expect(state.errors.eventId).toBeDefined();
    });

    it('should assign error styling (highlighting fields in red) to offending inputs', async () => {
      controller.setField('attendeeName', '');
      controller.validate();

      const className = controller.getFieldClass('attendeeName');
      expect(className).toContain('border-error');
      expect(className).toContain('text-red-600');
    });

    it('should clear offending error highlight once valid input is entered', () => {
      controller.validate();
      expect(controller.getState().errors.attendeeName).toBeDefined();

      controller.setField('attendeeName', 'Jordan Lee');
      expect(controller.getState().errors.attendeeName).toBeUndefined();
      expect(controller.getFieldClass('attendeeName')).not.toContain('border-error');
    });
  });

  describe('Loading States & Busy Indicators', () => {
    it('should toggle isSubmitting to true during asynchronous worker dispatch', async () => {
      controller.setField('eventId', 'evt-100');
      controller.setField('attendeeName', 'Alex Carter');
      controller.setField('attendeeEmail', 'alex@example.com');

      const submitPromise = controller.submitPrimaryAction();
      expect(controller.getState().isSubmitting).toBe(true);

      await submitPromise;
      expect(controller.getState().isSubmitting).toBe(false);
    });
  });

  describe('Empty State Presentation', () => {
    it('should render a friendly "No data found" message when tickets list is empty', () => {
      controller.setTickets([]);
      const renderedHtml = controller.renderEmptyState();
      expect(renderedHtml).toContain('No data found');
      expect(renderedHtml).toContain('class="empty-state"');
    });

    it('should not render empty state message when tickets exist', () => {
      controller.setTickets([{ id: 'tkt-1' }]);
      const renderedHtml = controller.renderEmptyState();
      expect(renderedHtml).toBe('');
    });
  });

  describe('Analytics Logging', () => {
    it('should log exact string "[Analytics] User interacted with Ticket QR Code Generator Worker" upon primary action completion', async () => {
      controller.setField('eventId', 'evt-100');
      controller.setField('attendeeName', 'Alex Carter');
      controller.setField('attendeeEmail', 'alex@example.com');

      const success = await controller.submitPrimaryAction();
      expect(success).toBe(true);
      expect(logSpy).toHaveBeenCalledWith('[Analytics] User interacted with Ticket QR Code Generator Worker');
    });

    it('should not log analytics if the primary action was aborted due to validation errors', async () => {
      await controller.submitPrimaryAction();
      expect(logSpy).not.toHaveBeenCalled();
    });
  });
});
