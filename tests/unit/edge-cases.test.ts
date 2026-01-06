/**
 * Edge case tests for letta-switch
 *
 * Tests unusual inputs, boundary conditions, and error handling scenarios.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import { ZodError } from 'zod';

// Mock fs module
vi.mock('node:fs/promises');

// Mock logger
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { ProfileManager } from '../../src/config/manager.js';
import { AgentRegistry } from '../../src/agents/registry.js';
import { ConfigSchema, ProfileSchema, AgentSchema } from '../../src/config/schema.js';
import { ErrorCode, LettaSwitchError } from '../../src/utils/errors.js';
import { validConfig } from '../fixtures/config.js';

describe('Edge Cases: Profile Names', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let manager: ProfileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ProfileManager(testConfigPath);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should handle profile names with special characters', async () => {
    const profile = {
      agent: 'test-agent',
      memoryBlocks: ['human'],
    };

    // Valid special characters
    await manager.saveProfile('my-profile-v2', profile);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should handle profile names with spaces', async () => {
    const profile = {
      agent: 'test-agent',
      memoryBlocks: ['human'],
    };

    // Spaces in profile name (allowed by schema)
    await manager.saveProfile('my profile', profile);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should handle empty string profile name', async () => {
    const profile = {
      agent: 'test-agent',
      memoryBlocks: ['human'],
    };

    // Empty profile name is technically allowed by the current schema
    await manager.saveProfile('', profile);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should handle very long profile names', async () => {
    const profile = {
      agent: 'test-agent',
      memoryBlocks: ['human'],
    };

    const longName = 'a'.repeat(1000);
    await manager.saveProfile(longName, profile);
    expect(fs.writeFile).toHaveBeenCalled();
  });
});

describe('Edge Cases: Memory Blocks', () => {
  it('should accept empty memory blocks array', () => {
    const profile = {
      agent: 'test-agent',
      memoryBlocks: [],
    };

    const result = ProfileSchema.parse(profile);
    expect(result.memoryBlocks).toHaveLength(0);
  });

  it('should accept single memory block', () => {
    const profile = {
      agent: 'test-agent',
      memoryBlocks: ['human'],
    };

    const result = ProfileSchema.parse(profile);
    expect(result.memoryBlocks).toHaveLength(1);
  });

  it('should accept many memory blocks', () => {
    const profile = {
      agent: 'test-agent',
      memoryBlocks: ['human', 'persona', 'project', 'context', 'history', 'docs'],
    };

    const result = ProfileSchema.parse(profile);
    expect(result.memoryBlocks).toHaveLength(6);
  });

  it('should accept memory blocks with special characters', () => {
    const profile = {
      agent: 'test-agent',
      memoryBlocks: ['human-context', 'persona_v2', 'project.docs'],
    };

    const result = ProfileSchema.parse(profile);
    expect(result.memoryBlocks).toContain('human-context');
  });
});

describe('Edge Cases: Agent IDs', () => {
  it('should require agent- prefix', () => {
    const invalidAgent = {
      id: 'invalid-id',
      name: 'test',
      created: '2024-01-01T00:00:00.000Z',
    };

    expect(() => AgentSchema.parse(invalidAgent)).toThrow(ZodError);
  });

  it('should accept valid agent ID formats', () => {
    const validIds = [
      'agent-123',
      'agent-abc-def',
      'agent-uuid-4f3a-9c2e-1234567890ab',
    ];

    for (const id of validIds) {
      const agent = {
        id,
        name: 'test',
        created: '2024-01-01T00:00:00.000Z',
      };
      expect(() => AgentSchema.parse(agent)).not.toThrow();
    }
  });
});

describe('Edge Cases: Filesystem Errors', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let manager: ProfileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ProfileManager(testConfigPath);
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
  });

  it('should handle ENOENT error when loading config', async () => {
    const error: NodeJS.ErrnoException = new Error('ENOENT: no such file');
    error.code = 'ENOENT';
    vi.mocked(fs.readFile).mockRejectedValue(error);

    await expect(manager.load()).rejects.toThrow(LettaSwitchError);
    await expect(manager.load()).rejects.toMatchObject({
      code: ErrorCode.CONFIG_NOT_FOUND,
    });
  });

  it('should handle EACCES permission error', async () => {
    const error = new Error('EACCES: permission denied');
    vi.mocked(fs.readFile).mockRejectedValue(error);

    await expect(manager.load()).rejects.toThrow('EACCES');
  });

  it('should handle corrupted JSON', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('{ invalid json: }');

    await expect(manager.load()).rejects.toThrow();
  });

  it('should handle empty file', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('');

    await expect(manager.load()).rejects.toThrow();
  });

  it('should handle file with only whitespace', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('   \n\t   ');

    await expect(manager.load()).rejects.toThrow();
  });
});

describe('Edge Cases: Config Schema Validation', () => {
  it('should reject version other than 1.0', () => {
    const config = {
      version: '2.0',
      profiles: {},
      agents: [],
      filters: { excludePatterns: [] },
    };

    expect(() => ConfigSchema.parse(config)).toThrow(ZodError);
  });

  it('should accept config without currentProfile', () => {
    const config = {
      version: '1.0',
      profiles: {},
      agents: [],
      filters: { excludePatterns: [] },
    };

    const result = ConfigSchema.parse(config);
    expect(result.currentProfile).toBeUndefined();
  });

  it('should accept config without lastSync', () => {
    const config = {
      version: '1.0',
      profiles: {},
      agents: [],
      filters: { excludePatterns: [] },
    };

    const result = ConfigSchema.parse(config);
    expect(result.lastSync).toBeUndefined();
  });

  it('should reject invalid datetime format for lastSync', () => {
    const config = {
      version: '1.0',
      profiles: {},
      agents: [],
      filters: { excludePatterns: [] },
      lastSync: 'not-a-date',
    };

    expect(() => ConfigSchema.parse(config)).toThrow(ZodError);
  });

  it('should accept ISO datetime for lastSync', () => {
    const config = {
      version: '1.0',
      profiles: {},
      agents: [],
      filters: { excludePatterns: [] },
      lastSync: '2024-06-15T10:30:00.000Z',
    };

    const result = ConfigSchema.parse(config);
    expect(result.lastSync).toBe('2024-06-15T10:30:00.000Z');
  });
});

describe('Edge Cases: Concurrent Operations', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let manager: ProfileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ProfileManager(testConfigPath);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should handle multiple concurrent loads', async () => {
    const loadPromises = [
      manager.load(),
      manager.load(),
      manager.load(),
    ];

    const results = await Promise.all(loadPromises);

    // All should return the same config
    expect(results[0]).toEqual(results[1]);
    expect(results[1]).toEqual(results[2]);
  });

  it('should handle concurrent saves', async () => {
    const profiles = [
      { agent: 'agent-1', memoryBlocks: ['human'] },
      { agent: 'agent-2', memoryBlocks: ['persona'] },
    ];

    // This may cause race conditions in real usage
    await Promise.all([
      manager.saveProfile('profile-1', profiles[0]),
      manager.saveProfile('profile-2', profiles[1]),
    ]);

    // Both writes should have been called
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
  });
});

describe('Edge Cases: API Filter Patterns', () => {
  it('should handle empty exclude patterns', () => {
    const config = {
      version: '1.0',
      profiles: {},
      agents: [],
      filters: { excludePatterns: [] },
    };

    const result = ConfigSchema.parse(config);
    expect(result.filters.excludePatterns).toHaveLength(0);
  });

  it('should accept valid regex patterns', () => {
    const patterns = [
      '-sleeptime$',  // ends with
      '^test-',       // starts with
      '.*internal.*', // contains
      'agent-\\d+',   // with escapes
    ];

    // All should be valid regex
    for (const pattern of patterns) {
      expect(() => new RegExp(pattern)).not.toThrow();
    }
  });
});
