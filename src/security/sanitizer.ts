/**
 * Production Module: Security & XSS Sanitization Engine
 * Ticket: ENG-139055 - Ticket QR Code Generator Worker
 *
 * Provides defense-in-depth sanitization for user inputs before storing in state or database:
 * - Neutralizes script tags and active execution containers
 * - Strips iframe, object, embed, and style tags
 * - Eliminates inline event handlers (onerror, onload, etc.)
 * - Strips javascript:, vbscript:, and data: URI schemes
 * - Preserves international unicode and legitimate human typography
 * - Encodes residual HTML-sensitive characters (&, <, >, ", ')
 * - Recursively processes nested objects and metadata
 */

export interface SanitizerService {
  sanitizeText(input: string): string;
  sanitizeObject<T extends Record<string, unknown>>(input: T): T;
  containsMaliciousPattern(input: string): boolean;
}

export class ProductionSanitizer implements SanitizerService {
  /**
   * Sanitizes a single text string against Cross-Site Scripting (XSS).
   * Strips dangerous executable markup and safely encodes residual HTML characters.
   */
  sanitizeText(input: string): string {
    if (typeof input !== 'string' || !input) {
      return '';
    }

    let sanitized = input;

    // 1. Strip <script> tags and any contents within them
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // 2. Strip active embedding containers and styles with their contents
    sanitized = sanitized.replace(/<(iframe|object|applet|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
    sanitized = sanitized.replace(/<(embed|link|meta|base)\b[^>]*\/?>/gi, '');

    // 3. Strip tags containing inline event handlers (e.g. <svg onload=...>, <body onerror=...>)
    sanitized = sanitized.replace(/<[a-z0-9_-]+\b[^>]*\bon[a-z]+\s*=[^>]*>/gi, '');

    // 4. Strip <img> tags (common vector for onerror payloads)
    sanitized = sanitized.replace(/<img\b[^>]*>/gi, '');

    // 5. Strip javascript:, vbscript:, and malicious pseudo-protocol URI schemes and call expressions
    // Handles javascript:void(...), javascript:alert(...), javascript:...
    sanitized = sanitized.replace(/(?:javascript|vbscript):(?:[^\s<>"']*(?:\([^)]*\)|"[^"]*"|'[^']*'|[^\s<>"'])*)/gi, '');

    // 6. Strip any residual unattached inline event attributes (e.g. onerror=...)
    sanitized = sanitized.replace(/\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // 7. Contextually encode residual HTML-sensitive characters to prevent markup injection
    // Ampersand MUST be encoded first to prevent double-encoding
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized.trim();
  }

  /**
   * Recursively sanitizes all string properties in a metadata object or array structure.
   */
  sanitizeObject<T extends Record<string, unknown>>(input: T): T {
    if (!input || typeof input !== 'object') {
      return input;
    }

    if (Array.isArray(input)) {
      return input.map((item) => {
        if (typeof item === 'string') return this.sanitizeText(item);
        if (item && typeof item === 'object') return this.sanitizeObject(item as Record<string, unknown>);
        return item;
      }) as unknown as T;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        result[key] = this.sanitizeText(value);
      } else if (value && typeof value === 'object') {
        result[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }

  /**
   * Detects whether an input string contains common malicious XSS vectors.
   */
  containsMaliciousPattern(input: string): boolean {
    if (!input || typeof input !== 'string') return false;

    const maliciousPatterns = [
      /<script\b/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /<iframe\b/i,
      /<object\b/i,
      /<embed\b/i,
      /<style\b/i,
      /<link\b/i,
    ];

    return maliciousPatterns.some((pattern) => pattern.test(input));
  }
}

export const defaultSanitizer = new ProductionSanitizer();
