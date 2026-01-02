/**
 * Tests for logger utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock chalk to return plain text for easier testing
vi.mock('chalk', () => ({
  default: {
    blue: (s: string) => s,
    green: (s: string) => s,
    yellow: (s: string) => s,
    red: (s: string) => s,
    gray: (s: string) => s,
  },
}));

// Import after mocks
import { logger, redactApiKey } from '../../../src/utils/logger.js';

describe('Logger', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;
  const originalDebug = process.env.DEBUG;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.DEBUG = originalDebug;
  });

  describe('logger.info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');

      expect(consoleLogSpy).toHaveBeenCalledWith('ℹ', 'Test info message');
    });
  });

  describe('logger.success', () => {
    it('should log success messages', () => {
      logger.success('Test success message');

      expect(consoleLogSpy).toHaveBeenCalledWith('✓', 'Test success message');
    });
  });

  describe('logger.warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠', 'Test warning message');
    });
  });

  describe('logger.error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('✖', 'Test error message');
    });
  });

  describe('logger.debug', () => {
    it('should log debug messages when DEBUG is set', () => {
      process.env.DEBUG = 'true';

      logger.debug('Test debug message');

      expect(consoleLogSpy).toHaveBeenCalledWith('→', 'Test debug message');
    });

    it('should not log debug messages when DEBUG is not set', () => {
      delete process.env.DEBUG;

      logger.debug('Test debug message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});

describe('redactApiKey', () => {
  it('should redact valid API keys', () => {
    const apiKey = 'at-let-' + 'a'.repeat(64);
    const input = `The key is ${apiKey} here`;
    const redacted = redactApiKey(input);

    expect(redacted).not.toContain(apiKey);
    expect(redacted).toContain('at-let-***REDACTED***');
  });

  it('should handle strings without API keys', () => {
    const input = 'No API key here';
    const redacted = redactApiKey(input);

    expect(redacted).toBe(input);
  });

  it('should handle multiple API keys', () => {
    const key1 = 'at-let-' + 'a'.repeat(64);
    const key2 = 'at-let-' + 'b'.repeat(64);
    const input = `Key 1: ${key1} and Key 2: ${key2}`;
    const redacted = redactApiKey(input);

    expect(redacted).not.toContain(key1);
    expect(redacted).not.toContain(key2);
    const matches = redacted.match(/at-let-\*\*\*REDACTED\*\*\*/g);
    expect(matches).toHaveLength(2);
  });

  it('should handle empty strings', () => {
    const redacted = redactApiKey('');
    expect(redacted).toBe('');
  });

  it('should not redact short keys', () => {
    const input = 'Short key: at-let-abc';
    const redacted = redactApiKey(input);
    // Short keys shouldn't be redacted
    expect(redacted).toBe(input);
  });
});
