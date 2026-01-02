/**
 * Tests for AgentRegistry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

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

// Mock API client
vi.mock('../../../src/api/client.js', () => ({
  LettaAPIClient: vi.fn().mockImplementation(() => ({
    fetchAgents: vi.fn().mockResolvedValue([
      {
        id: 'agent-1',
        name: 'main-agent',
        description: 'Main agent for work',
        created_at: '2024-01-01T00:00:00Z',
        agent_type: 'memgpt_agent',
        llm_config: { model: 'gpt-4' },
        embedding_config: { embedding_model: 'text-embedding-3-small' },
        memory: {
          memory: {
            human: { value: 'Human block' },
            persona: { value: 'Persona block' },
          },
        },
      },
    ]),
    healthCheck: vi.fn().mockResolvedValue(true),
  })),
}));

// Import after mocks
import { AgentRegistry } from '../../../src/agents/registry.js';
import { ErrorCode, LettaSwitchError } from '../../../src/utils/errors.js';
import { logger } from '../../../src/utils/logger.js';
import { validConfig } from '../../fixtures/config.js';

describe('AgentRegistry', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let registry: AgentRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = new AgentRegistry(testConfigPath);
  });

  describe('constructor', () => {
    it('should use provided config path', () => {
      const customPath = '/custom/path/config.json';
      const customRegistry = new AgentRegistry(customPath);
      expect(customRegistry).toBeDefined();
    });

    it('should use default path when none provided', () => {
      const defaultRegistry = new AgentRegistry();
      expect(defaultRegistry).toBeDefined();
    });
  });

  describe('load', () => {
    it('should load and parse valid configuration', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const result = await registry.load();

      expect(result).toEqual(validConfig);
      expect(fs.readFile).toHaveBeenCalledWith(testConfigPath, 'utf-8');
    });

    it('should create default config when file does not exist', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT');
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const result = await registry.load();

      expect(result.version).toBe('1.0');
      expect(result.profiles).toBeDefined();
      expect(result.agents).toEqual([]);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Config file not found'),
      );
    });

    it('should throw INVALID_CONFIG on invalid JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{ invalid json');

      await expect(registry.load()).rejects.toThrow(LettaSwitchError);
      await expect(registry.load()).rejects.toMatchObject({
        code: ErrorCode.INVALID_CONFIG,
      });
    });
  });

  describe('save', () => {
    it('should create directory and save config', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await registry.save(validConfig);

      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(testConfigPath), {
        recursive: true,
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        testConfigPath,
        JSON.stringify(validConfig, null, 2),
        'utf-8',
      );
    });

    it('should validate config before saving', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const invalidConfig = { version: '2.0' } as any;

      await expect(registry.save(invalidConfig)).rejects.toThrow();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('getAgent', () => {
    it('should find agent by name', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const agent = await registry.getAgent('co');

      expect(agent).toBeDefined();
      expect(agent?.name).toBe('co');
    });

    it('should find agent by id', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const agent = await registry.getAgent('agent-co-123');

      expect(agent).toBeDefined();
      expect(agent?.id).toBe('agent-co-123');
    });

    it('should return undefined for non-existent agent', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const agent = await registry.getAgent('non-existent');

      expect(agent).toBeUndefined();
    });
  });

  describe('setFavorite', () => {
    it('should set agent as favorite', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await registry.setFavorite('co');

      expect(fs.writeFile).toHaveBeenCalled();
      const savedData = JSON.parse(
        vi.mocked(fs.writeFile).mock.calls[0][1] as string,
      );
      const coAgent = savedData.agents.find(
        (a: { name: string }) => a.name === 'co',
      );
      expect(coAgent.favorite).toBe(true);
    });

    it('should remove favorite from other agents', async () => {
      const configWithFavorite = {
        ...validConfig,
        agents: validConfig.agents.map(a => ({ ...a, favorite: true })),
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(configWithFavorite),
      );
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await registry.setFavorite('co');

      const savedData = JSON.parse(
        vi.mocked(fs.writeFile).mock.calls[0][1] as string,
      );
      const favoriteAgents = savedData.agents.filter(
        (a: { favorite: boolean }) => a.favorite,
      );
      expect(favoriteAgents).toHaveLength(1);
      expect(favoriteAgents[0].name).toBe('co');
    });

    it('should throw AGENT_NOT_FOUND for non-existent agent', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      await expect(registry.setFavorite('non-existent')).rejects.toThrow(
        LettaSwitchError,
      );
      await expect(registry.setFavorite('non-existent')).rejects.toMatchObject({
        code: ErrorCode.AGENT_NOT_FOUND,
      });
    });
  });

  describe('updateLastLaunched', () => {
    it('should update lastLaunched timestamp', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await registry.updateLastLaunched('co');

      expect(fs.writeFile).toHaveBeenCalled();
      const savedData = JSON.parse(
        vi.mocked(fs.writeFile).mock.calls[0][1] as string,
      );
      const coAgent = savedData.agents.find(
        (a: { name: string }) => a.name === 'co',
      );
      expect(coAgent.lastLaunched).toBeDefined();
    });

    it('should not throw for non-existent agent', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      await expect(
        registry.updateLastLaunched('non-existent'),
      ).resolves.not.toThrow();
    });
  });

  describe('syncFromAPI', () => {
    it('should sync agents from API', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await registry.syncFromAPI('test-api-key');

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Syncing agents'),
      );
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Synced'),
      );
    });

    it('should update lastSync timestamp', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await registry.syncFromAPI('test-api-key');

      const savedData = JSON.parse(
        vi.mocked(fs.writeFile).mock.calls[0][1] as string,
      );
      expect(savedData.lastSync).toBeDefined();
    });

    it('should preserve existing agent metadata during sync', async () => {
      const configWithMetadata = {
        ...validConfig,
        agents: [
          {
            id: 'agent-1',
            name: 'main-agent',
            description: 'Main agent for work',
            created: '2024-01-01T00:00:00Z',
            tags: ['important', 'production'],
            favorite: true,
            lastLaunched: '2024-01-01T00:00:00Z',
          },
        ],
      };
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify(configWithMetadata),
      );
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await registry.syncFromAPI('test-api-key');

      const savedData = JSON.parse(
        vi.mocked(fs.writeFile).mock.calls[0][1] as string,
      );
      const syncedAgent = savedData.agents.find(
        (a: { id: string }) => a.id === 'agent-1',
      );
      expect(syncedAgent.tags).toEqual(['important', 'production']);
      expect(syncedAgent.favorite).toBe(true);
      expect(syncedAgent.lastLaunched).toBe('2024-01-01T00:00:00Z');
    });
  });
});
