/**
 * CLI integration tests
 *
 * These tests verify the complete CLI workflow by executing
 * commands through the actual command handlers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Real imports for integration testing
import { ProfileManager } from '../../src/config/manager.js';
import { AgentRegistry } from '../../src/agents/registry.js';
import { listAgents, listProfiles } from '../../src/commands/list.js';

// Mock only console and logger to capture output
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
vi.mock('chalk', () => ({
  default: {
    blue: { bold: (s: string) => s },
    cyan: { bold: (s: string) => s },
    green: (s: string) => s,
    gray: (s: string) => s,
    white: (s: string) => s,
    yellow: (s: string) => s,
  },
}));
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('CLI Integration', () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'letta-switch-cli-test-'));
    configPath = path.join(tempDir, 'letta-config.json');
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Complete Profile Workflow', () => {
    it('should create, list, use, and delete a profile', async () => {
      const manager = new ProfileManager(configPath);
      const registry = new AgentRegistry(configPath);

      // 1. Create initial config
      await registry.load();

      // 2. Add some agents to work with
      const config = await registry.load();
      config.agents = [
        {
          id: 'agent-workflow-1',
          name: 'workflow-agent',
          description: 'Test agent for workflow',
          created: new Date().toISOString(),
        },
      ];
      await registry.save(config);

      // 3. Create a new profile
      await manager.saveProfile('workflow-profile', {
        agent: 'workflow-agent',
        memoryBlocks: ['human', 'persona'],
        description: 'Profile for workflow test',
      });

      // 4. List profiles - should include new profile
      const profiles = await manager.listProfiles();
      expect(profiles).toHaveProperty('workflow-profile');
      expect(profiles['workflow-profile'].agent).toBe('workflow-agent');

      // 5. Set as current
      await manager.setCurrentProfile('workflow-profile');
      const current = await manager.getCurrentProfile();
      expect(current?.name).toBe('workflow-profile');

      // 6. Delete the profile
      await manager.deleteProfile('workflow-profile');
      const afterDelete = await manager.listProfiles();
      expect(afterDelete).not.toHaveProperty('workflow-profile');
    });
  });

  describe('Agent Management Workflow', () => {
    it('should manage agents through registry', async () => {
      const registry = new AgentRegistry(configPath);

      // 1. Load creates default config
      const config = await registry.load();
      expect(config.version).toBe('1.0');

      // 2. Add test agents
      config.agents = [
        {
          id: 'agent-mgmt-1',
          name: 'mgmt-agent-1',
          description: 'First management test agent',
          created: new Date().toISOString(),
          tags: ['test'],
        },
        {
          id: 'agent-mgmt-2',
          name: 'mgmt-agent-2',
          description: 'Second management test agent',
          created: new Date().toISOString(),
        },
      ];
      await registry.save(config);

      // 3. Get specific agent
      const agent1 = await registry.getAgent('mgmt-agent-1');
      expect(agent1?.description).toBe('First management test agent');

      // 4. Get by ID
      const agentById = await registry.getAgent('agent-mgmt-2');
      expect(agentById?.name).toBe('mgmt-agent-2');

      // 5. Set favorite
      await registry.setFavorite('mgmt-agent-1');
      const afterFavorite = await registry.getAgent('mgmt-agent-1');
      expect(afterFavorite?.favorite).toBe(true);

      // 6. Update last launched
      await registry.updateLastLaunched('mgmt-agent-1');
      const afterLaunch = await registry.getAgent('mgmt-agent-1');
      expect(afterLaunch?.lastLaunched).toBeDefined();
    });
  });

  describe('Multiple Profiles Scenario', () => {
    it('should manage multiple profiles independently', async () => {
      const manager = new ProfileManager(configPath);
      const registry = new AgentRegistry(configPath);

      // Initialize
      await registry.load();

      // Create multiple profiles
      const profiles = [
        { name: 'dev', agent: 'dev-agent', memory: ['human', 'persona'] },
        { name: 'prod', agent: 'prod-agent', memory: ['human'] },
        { name: 'test', agent: 'test-agent', memory: ['human', 'persona', 'context'] },
      ];

      for (const p of profiles) {
        await manager.saveProfile(p.name, {
          agent: p.agent,
          memoryBlocks: p.memory,
        });
      }

      // Verify all exist
      const all = await manager.listProfiles();
      expect(Object.keys(all)).toHaveLength(4); // 3 + default

      // Switch between profiles
      await manager.setCurrentProfile('dev');
      expect((await manager.getCurrentProfile())?.name).toBe('dev');

      await manager.setCurrentProfile('prod');
      expect((await manager.getCurrentProfile())?.name).toBe('prod');

      // Delete one, others should remain
      await manager.deleteProfile('test');
      const afterDelete = await manager.listProfiles();
      expect(afterDelete).not.toHaveProperty('test');
      expect(afterDelete).toHaveProperty('dev');
      expect(afterDelete).toHaveProperty('prod');
    });
  });

  describe('Config Persistence Across Sessions', () => {
    it('should persist changes across manager instances', async () => {
      // Session 1: Create profile
      const session1 = new ProfileManager(configPath);
      const reg1 = new AgentRegistry(configPath);
      await reg1.load();

      await session1.saveProfile('session-test', {
        agent: 'session-agent',
        memoryBlocks: ['human'],
      });
      await session1.setCurrentProfile('session-test');

      // Session 2: Different instance, same file
      const session2 = new ProfileManager(configPath);

      const current = await session2.getCurrentProfile();
      expect(current?.name).toBe('session-test');
      expect(current?.profile.agent).toBe('session-agent');

      // Session 2: Modify
      await session2.saveProfile('session-test', {
        agent: 'modified-agent',
        memoryBlocks: ['human', 'persona'],
      });

      // Session 3: Verify modification persisted
      const session3 = new ProfileManager(configPath);
      const final = await session3.getProfile('session-test');
      expect(final?.agent).toBe('modified-agent');
      expect(final?.memoryBlocks).toEqual(['human', 'persona']);
    });
  });
});
