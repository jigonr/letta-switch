/**
 * Tests for list command
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';

// Mock console.log
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

// Mock chalk to return plain text for easier testing
vi.mock('chalk', () => ({
  default: {
    blue: { bold: (s: string) => s },
    green: (s: string) => s,
    gray: (s: string) => s,
    white: (s: string) => s,
    yellow: (s: string) => s,
    cyan: { bold: (s: string) => s },
  },
}));

// Mock fs module
vi.mock('node:fs/promises');

// Mock logger
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Import fixtures
import { validConfig } from '../../fixtures/config.js';

// Import after mocks
import { listAgents, listProfiles } from '../../../src/commands/list.js';

describe('List Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  describe('listAgents', () => {
    it('should list all agents', async () => {
      await listAgents();

      expect(consoleSpy).toHaveBeenCalled();

      const allCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allCalls).toContain('co');
    });

    it('should show agent IDs', async () => {
      await listAgents();

      const allCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allCalls).toContain('ID:');
    });

    it('should show favorite marker for favorite agents', async () => {
      const configWithFavorite = {
        ...validConfig,
        agents: validConfig.agents.map(a => ({ ...a, favorite: true })),
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(configWithFavorite),
      );

      await listAgents();

      // Favorite agents should show star marker
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should output JSON when json option is true', async () => {
      await listAgents({ json: true });

      const jsonCall = consoleSpy.mock.calls.find(call => {
        try {
          JSON.parse(call[0]);
          return true;
        } catch {
          return false;
        }
      });

      expect(jsonCall).toBeDefined();

      const output = JSON.parse(jsonCall![0]);
      expect(Array.isArray(output)).toBe(true);
    });

    it('should filter by search query', async () => {
      await listAgents({ search: 'co' });

      // Should still work with search filter
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should filter by tag', async () => {
      const configWithTags = {
        ...validConfig,
        agents: validConfig.agents.map(a => ({ ...a, tags: ['test-tag'] })),
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(configWithTags),
      );

      await listAgents({ tag: 'test-tag' });

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should show last sync time', async () => {
      const configWithSync = {
        ...validConfig,
        lastSync: '2024-01-01T00:00:00Z',
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(configWithSync),
      );

      await listAgents();

      const allCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allCalls).toContain('Last synced');
    });

    it('should show last launched time for agents', async () => {
      const configWithLaunched = {
        ...validConfig,
        agents: validConfig.agents.map(a => ({
          ...a,
          lastLaunched: '2024-01-01T00:00:00Z',
        })),
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(configWithLaunched),
      );

      await listAgents();

      const allCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allCalls).toContain('Last launched');
    });

    it('should show agent tags', async () => {
      const configWithTags = {
        ...validConfig,
        agents: validConfig.agents.map(a => ({
          ...a,
          tags: ['tag1', 'tag2'],
        })),
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(configWithTags),
      );

      await listAgents();

      const allCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allCalls).toContain('Tags:');
    });
  });

  describe('listProfiles', () => {
    it('should list all profiles', async () => {
      await listProfiles();

      expect(consoleSpy).toHaveBeenCalled();

      const allCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allCalls).toContain('default');
    });

    it('should show profile details', async () => {
      await listProfiles();

      const allCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allCalls).toContain('Agent:');
      expect(allCalls).toContain('Model:');
      expect(allCalls).toContain('Memory:');
    });

    it('should output JSON when json option is true', async () => {
      await listProfiles({ json: true });

      const jsonCall = consoleSpy.mock.calls.find(call => {
        try {
          JSON.parse(call[0]);
          return true;
        } catch {
          return false;
        }
      });

      expect(jsonCall).toBeDefined();

      const output = JSON.parse(jsonCall![0]);
      expect(output).toHaveProperty('default');
    });

    it('should show profile descriptions', async () => {
      await listProfiles();

      const allCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allCalls).toContain('Default profile');
    });
  });
});
