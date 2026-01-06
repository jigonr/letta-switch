/**
 * Tests for agent management commands (favorite, info)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';

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

import { AgentRegistry } from '../../../src/agents/registry.js';
import { ErrorCode, LettaSwitchError } from '../../../src/utils/errors.js';
import { validConfig, multiProfileConfig } from '../../fixtures/config.js';
import { logger } from '../../../src/utils/logger.js';

describe('Favorite Command', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let registry: AgentRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = new AgentRegistry(testConfigPath);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should set agent as favorite', async () => {
    await registry.setFavorite('co');

    expect(fs.writeFile).toHaveBeenCalled();
    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    const agent = savedData.agents.find((a: any) => a.name === 'co');
    expect(agent.favorite).toBe(true);
  });

  it('should remove favorite from previous agent', async () => {
    // First set co as favorite
    const configWithFavorite = {
      ...validConfig,
      agents: validConfig.agents.map(a => ({ ...a, favorite: a.name === 'co' })),
    };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(configWithFavorite));

    // Now set research as favorite
    await registry.setFavorite('research');

    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    const coAgent = savedData.agents.find((a: any) => a.name === 'co');
    const researchAgent = savedData.agents.find((a: any) => a.name === 'research');
    expect(coAgent.favorite).toBe(false);
    expect(researchAgent.favorite).toBe(true);
  });

  it('should throw AGENT_NOT_FOUND for non-existent agent', async () => {
    await expect(registry.setFavorite('non-existent')).rejects.toThrow(LettaSwitchError);
    await expect(registry.setFavorite('non-existent')).rejects.toMatchObject({
      code: ErrorCode.AGENT_NOT_FOUND,
    });
  });

  it('should log success message', async () => {
    await registry.setFavorite('co');

    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('co'));
  });

  it('should handle case-sensitive agent names', async () => {
    // 'Co' vs 'co' - should not find it
    await expect(registry.setFavorite('Co')).rejects.toMatchObject({
      code: ErrorCode.AGENT_NOT_FOUND,
    });
  });
});

describe('Info Command (getAgent)', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let registry: AgentRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = new AgentRegistry(testConfigPath);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should return agent by name', async () => {
    const agent = await registry.getAgent('co');

    expect(agent).toBeDefined();
    expect(agent?.name).toBe('co');
    expect(agent?.id).toBe('agent-co-123');
  });

  it('should return agent by ID', async () => {
    const agent = await registry.getAgent('agent-co-123');

    expect(agent).toBeDefined();
    expect(agent?.name).toBe('co');
  });

  it('should return undefined for non-existent agent', async () => {
    const agent = await registry.getAgent('non-existent');

    expect(agent).toBeUndefined();
  });

  it('should return agent with all properties', async () => {
    const agent = await registry.getAgent('co');

    expect(agent).toMatchObject({
      id: 'agent-co-123',
      name: 'co',
      description: 'Main coding assistant',
      created: '2024-01-01T00:00:00.000Z',
      tags: ['coding'],
      favorite: false,
    });
  });

  it('should return agent with lastLaunched if available', async () => {
    const configWithLaunched = {
      ...validConfig,
      agents: validConfig.agents.map(a => ({
        ...a,
        lastLaunched: a.name === 'co' ? '2024-06-01T12:00:00.000Z' : undefined,
      })),
    };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(configWithLaunched));

    const agent = await registry.getAgent('co');

    expect(agent?.lastLaunched).toBe('2024-06-01T12:00:00.000Z');
  });
});

describe('Update Last Launched', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let registry: AgentRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = new AgentRegistry(testConfigPath);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should update lastLaunched timestamp', async () => {
    const beforeTime = new Date().toISOString();
    await registry.updateLastLaunched('co');
    const afterTime = new Date().toISOString();

    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    const agent = savedData.agents.find((a: any) => a.name === 'co');

    expect(agent.lastLaunched).toBeDefined();
    expect(agent.lastLaunched >= beforeTime).toBe(true);
    expect(agent.lastLaunched <= afterTime).toBe(true);
  });

  it('should not throw for non-existent agent', async () => {
    // Should silently succeed
    await expect(registry.updateLastLaunched('non-existent')).resolves.not.toThrow();
  });

  it('should not modify other agents', async () => {
    await registry.updateLastLaunched('co');

    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    const researchAgent = savedData.agents.find((a: any) => a.name === 'research');

    expect(researchAgent.lastLaunched).toBeUndefined();
  });
});
