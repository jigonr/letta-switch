/**
 * Tests for status command
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';

// Mock console.log
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    blue: { bold: (s: string) => s },
    cyan: (s: string) => s,
    yellow: (s: string) => s,
    green: (s: string) => s,
    gray: (s: string) => s,
    white: (s: string) => s,
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

import { ProfileManager } from '../../../src/config/manager.js';
import { AgentRegistry } from '../../../src/agents/registry.js';
import { validConfig, multiProfileConfig } from '../../fixtures/config.js';

describe('Status Command', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  describe('getCurrentProfile', () => {
    it('should return current profile with name', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      const manager = new ProfileManager(testConfigPath);

      const result = await manager.getCurrentProfile();

      expect(result).toEqual({
        name: 'default',
        profile: validConfig.profiles.default,
      });
    });

    it('should return undefined when no current profile', async () => {
      const configNoCurrent = { ...validConfig, currentProfile: undefined };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(configNoCurrent));
      const manager = new ProfileManager(testConfigPath);

      const result = await manager.getCurrentProfile();

      expect(result).toBeUndefined();
    });

    it('should return undefined when currentProfile points to non-existent profile', async () => {
      const configBadRef = { ...validConfig, currentProfile: 'deleted-profile' };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(configBadRef));
      const manager = new ProfileManager(testConfigPath);

      const result = await manager.getCurrentProfile();

      expect(result).toBeUndefined();
    });
  });

  describe('Status Information', () => {
    it('should load config and return status data', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      const registry = new AgentRegistry(testConfigPath);

      const config = await registry.load();

      expect(config.agents.length).toBe(2);
      expect(Object.keys(config.profiles).length).toBe(1);
      expect(config.lastSync).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return correct counts for multi-profile config', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(multiProfileConfig));
      const registry = new AgentRegistry(testConfigPath);

      const config = await registry.load();

      expect(config.agents.length).toBe(2);
      expect(Object.keys(config.profiles).length).toBe(3);
    });

    it('should handle config without lastSync', async () => {
      const configNoSync = { ...validConfig, lastSync: undefined };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(configNoSync));
      const registry = new AgentRegistry(testConfigPath);

      const config = await registry.load();

      expect(config.lastSync).toBeUndefined();
    });
  });

  describe('JSON Output', () => {
    it('should return data suitable for JSON serialization', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      const registry = new AgentRegistry(testConfigPath);
      const manager = new ProfileManager(testConfigPath);

      const config = await registry.load();
      const current = await manager.getCurrentProfile();

      const jsonOutput = {
        currentProfile: current,
        totalAgents: config.agents.length,
        totalProfiles: Object.keys(config.profiles).length,
        lastSync: config.lastSync,
      };

      // Should be serializable
      expect(() => JSON.stringify(jsonOutput)).not.toThrow();

      const parsed = JSON.parse(JSON.stringify(jsonOutput));
      expect(parsed.totalAgents).toBe(2);
      expect(parsed.totalProfiles).toBe(1);
      expect(parsed.currentProfile.name).toBe('default');
    });
  });
});
