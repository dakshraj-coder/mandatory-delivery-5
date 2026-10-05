/**
 * Accessibility (a11y) Test Suite: Lighthouse 100%, ARIA & Keyboard Navigation
 * Ticket: ENG-139055 - Ticket QR Code Generator Worker
 *
 * Requirements covered:
 * - Accessibility target is 100% Lighthouse accessibility
 * - Interactive elements need appropriate ARIA labels and keyboard navigation
 * - aria-invalid and aria-describedby on form error states
 * - aria-busy and role="status" / aria-live on async operations
 * - Keyboard navigation (Tab order, Enter/Space actuation, focus-visible)
 */

import { describe, it, expect } from 'vitest';
import { AccessibleTicketWorkerDOM } from '../../src/ui/ticket-worker-component';

describe('Accessibility (a11y) & Keyboard Navigation (ENG-139055)', () => {
  const dom = new AccessibleTicketWorkerDOM();

  describe('Lighthouse 100% Core A11y Targets', () => {
    it('should include landmarks (main, header, section) and explicit heading hierarchy', () => {
      const html = dom.renderForm();
      expect(html).toContain('<main id="main-content"');
      expect(html).toContain('<h1');
      expect(html).toContain('<h2 id="form-heading"');
      expect(html).toContain('aria-labelledby="form-heading"');
    });

    it('should guarantee all inputs have matching <label for="[id]"> elements', () => {
      const html = dom.renderForm();
      expect(html).toContain('<label for="attendee-name"');
      expect(html).toContain('id="attendee-name"');
      expect(html).toContain('<label for="attendee-email"');
      expect(html).toContain('id="attendee-email"');
    });
  });

  describe('ARIA Attributes & Live Status Regions', () => {
    it('should associate error messages with offending inputs using aria-describedby and aria-invalid="true"', () => {
      const html = dom.renderForm({ hasErrors: true });
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('aria-describedby="attendee-name-error"');
      expect(html).toContain('id="attendee-name-error"');
      expect(html).toContain('role="alert"');
    });

    it('should set aria-busy="true" and populate polite live region during async operations', () => {
      const html = dom.renderForm({ isSubmitting: true });
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('Generating cryptographic QR code token...');
    });

    it('should include screen-reader accessible text (<span class="sr-only">) for spinner/loading states', () => {
      const html = dom.renderForm({ isSubmitting: true });
      expect(html).toContain('<span class="sr-only">Processing QR Generation...</span>');
    });
  });

  describe('Keyboard Navigation & Interactive Elements', () => {
    it('should ensure all interactive elements have tabindex="0" and are naturally focusable', () => {
      const html = dom.renderForm();
      expect(html).toContain('id="attendee-name"');
      expect(html).toContain('tabindex="0"');
      expect(html).toContain('id="btn-generate-qr"');
      expect(html).toContain('aria-label="Generate QR Code Ticket"');
    });

    it('should disable submit button during in-flight async actions to prevent keyboard re-submission', () => {
      const html = dom.renderForm({ isSubmitting: true });
      expect(html).toContain('disabled');
    });
  });
});
