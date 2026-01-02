/**
 * Tests for application constants
 */

import { describe, it, expect } from 'vitest';
import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  HTTP_UNAUTHORIZED,
  HTTP_NOT_FOUND,
  CONFIG_VERSION,
  CONFIG_FILE_NAME,
  SETTINGS_FILE_NAME,
  LETTA_DIR_NAME,
  PROJECT_CONFIG_FILE_NAME,
  DEFAULT_MODEL,
  DEFAULT_MEMORY_BLOCKS,
  DEFAULT_AGENT_NAME,
  DEFAULT_PROFILE_NAME,
  DEFAULT_PROFILE_DESCRIPTION,
  DEFAULT_MODELS,
  DEFAULT_EXCLUDE_PATTERNS,
  API_KEY_REDACTION_PATTERN,
  API_KEY_REDACTED_TEXT,
  SECURE_FILE_MODE,
  DIRECTORY_MODE,
} from '../../../src/core/constants.js';

describe('API Configuration', () => {
  it('should have correct API base URL', () => {
    expect(API_BASE_URL).toBe('https://api.letta.com/v1');
    expect(API_BASE_URL).toMatch(/^https:\/\//);
  });

  it('should have reasonable API timeout', () => {
    expect(API_TIMEOUT_MS).toBe(30_000);
    expect(API_TIMEOUT_MS).toBeGreaterThan(0);
    expect(API_TIMEOUT_MS).toBeLessThanOrEqual(60_000);
  });
});

describe('HTTP Status Codes', () => {
  it('should have correct unauthorized status', () => {
    expect(HTTP_UNAUTHORIZED).toBe(401);
  });

  it('should have correct not found status', () => {
    expect(HTTP_NOT_FOUND).toBe(404);
  });
});

describe('Configuration Constants', () => {
  it('should have correct version', () => {
    expect(CONFIG_VERSION).toBe('1.0');
  });

  it('should have correct file names', () => {
    expect(CONFIG_FILE_NAME).toBe('letta-config.json');
    expect(SETTINGS_FILE_NAME).toBe('settings.json');
    expect(PROJECT_CONFIG_FILE_NAME).toBe('.letta-switch.json');
  });

  it('should have correct directory name', () => {
    expect(LETTA_DIR_NAME).toBe('.letta');
    expect(LETTA_DIR_NAME).toMatch(/^\./); // Should be hidden directory
  });
});

describe('Default Values', () => {
  it('should have valid default model', () => {
    expect(DEFAULT_MODEL).toBe('claude-pro-max/claude-opus-4-5');
    expect(DEFAULT_MODEL).toMatch(/\//); // Should have provider/model format
  });

  it('should have required memory blocks', () => {
    expect(DEFAULT_MEMORY_BLOCKS).toContain('human');
    expect(DEFAULT_MEMORY_BLOCKS).toContain('persona');
    expect(DEFAULT_MEMORY_BLOCKS).toHaveLength(2);
  });

  it('should have default agent name', () => {
    expect(DEFAULT_AGENT_NAME).toBe('default');
  });

  it('should have default profile values', () => {
    expect(DEFAULT_PROFILE_NAME).toBe('default');
    expect(DEFAULT_PROFILE_DESCRIPTION).toBe('Default profile');
  });
});

describe('Default Models Configuration', () => {
  it('should have subscription models', () => {
    expect(DEFAULT_MODELS['claude-pro-max/claude-opus-4-5']).toEqual({
      tier: 'subscription',
      speed: 'slow',
    });
    expect(DEFAULT_MODELS['claude-pro-max/claude-sonnet-4-5']).toEqual({
      tier: 'subscription',
      speed: 'fast',
    });
  });

  it('should have API models', () => {
    expect(DEFAULT_MODELS['anthropic/claude-opus-4-5']).toEqual({
      tier: 'api',
      speed: 'slow',
    });
    expect(DEFAULT_MODELS['z.ai/glm-4.7']).toEqual({
      tier: 'api',
      speed: 'fast',
    });
  });
});

describe('Agent Filtering', () => {
  it('should have exclude patterns for internal agents', () => {
    expect(DEFAULT_EXCLUDE_PATTERNS).toContain('-sleeptime$');
    expect(DEFAULT_EXCLUDE_PATTERNS).toContain('^test-');
  });

  it('should have valid regex patterns', () => {
    for (const pattern of DEFAULT_EXCLUDE_PATTERNS) {
      expect(() => new RegExp(pattern)).not.toThrow();
    }
  });
});

describe('Security Constants', () => {
  it('should match Letta API key format', () => {
    const testKey = 'at-let-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    expect(testKey).toMatch(API_KEY_REDACTION_PATTERN);
  });

  it('should not match other strings', () => {
    expect('regular-string').not.toMatch(API_KEY_REDACTION_PATTERN);
    expect('sk-1234').not.toMatch(API_KEY_REDACTION_PATTERN); // Anthropic format
  });

  it('should have redaction text', () => {
    expect(API_KEY_REDACTED_TEXT).toBe('***REDACTED***');
  });
});

describe('File Permissions', () => {
  it('should have secure file mode (600)', () => {
    expect(SECURE_FILE_MODE).toBe(0o600);
  });

  it('should have directory mode (755)', () => {
    expect(DIRECTORY_MODE).toBe(0o755);
  });
});
