/**
 * Filesystem integration tests
 *
 * These tests use real file system operations to verify
 * config persistence and file handling.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Use real fs - no mocking
import { ProfileManager } from '../../src/config/manager.js';
import { AgentRegistry } from '../../src/agents/registry.js';

describe('Filesystem Integration', () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(async () => {
    // Create unique temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'letta-switch-test-'));
    configPath = path.join(tempDir, 'letta-config.json');
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Config File Creation', () => {
    it('should create config directory if not exists', async () => {
      const nestedPath = path.join(tempDir, 'nested', 'dir', 'config.json');
      const registry = new AgentRegistry(nestedPath);
      const manager = new ProfileManager(nestedPath);

      // Initialize config first (creates default)
      await registry.load();

      const profile = {
        agent: 'test-agent',
        memoryBlocks: ['human', 'persona'],
      };

      await manager.saveProfile('test', profile);

      // Directory should be created
      const stats = await fs.stat(path.dirname(nestedPath));
      expect(stats.isDirectory()).toBe(true);
    });

    it('should persist profile across manager instances', async () => {
      const registry = new AgentRegistry(configPath);
      const manager1 = new ProfileManager(configPath);
      const manager2 = new ProfileManager(configPath);

      // Initialize config first
      await registry.load();

      const profile = {
        agent: 'persist-test-agent',
        memoryBlocks: ['human'],
        description: 'Persistence test',
      };

      // Save with first manager
      await manager1.saveProfile('persist-test', profile);

      // Load with second manager
      const loaded = await manager2.getProfile('persist-test');

      expect(loaded).toEqual(profile);
    });

    it('should handle multiple saves to same profile', async () => {
      const registry = new AgentRegistry(configPath);
      const manager = new ProfileManager(configPath);

      // Initialize config first
      await registry.load();

      // Save initial
      await manager.saveProfile('multi-save', {
        agent: 'agent-1',
        memoryBlocks: ['human'],
      });

      // Overwrite
      await manager.saveProfile('multi-save', {
        agent: 'agent-2',
        memoryBlocks: ['human', 'persona'],
      });

      const loaded = await manager.getProfile('multi-save');
      expect(loaded?.agent).toBe('agent-2');
      expect(loaded?.memoryBlocks).toEqual(['human', 'persona']);
    });
  });

  describe('Config Roundtrip', () => {
    it('should preserve all config fields on save/load', async () => {
      const registry = new AgentRegistry(configPath);

      // Create initial config via load (creates default)
      await registry.load();

      // Save a profile
      const manager = new ProfileManager(configPath);
      await manager.saveProfile('roundtrip-test', {
        agent: 'test-agent',
        memoryBlocks: ['human', 'persona', 'context'],
        description: 'Roundtrip test profile',
        initBlocks: ['init-1'],
        baseTools: ['tool-1', 'tool-2'],
      });

      // Set current profile
      await manager.setCurrentProfile('roundtrip-test');

      // Load fresh and verify
      const freshManager = new ProfileManager(configPath);
      const config = await freshManager.load();

      expect(config.version).toBe('1.0');
      expect(config.currentProfile).toBe('roundtrip-test');
      expect(config.profiles['roundtrip-test'].baseTools).toEqual(['tool-1', 'tool-2']);
    });

    it('should preserve agent metadata across syncs', async () => {
      const registry = new AgentRegistry(configPath);

      // Create initial config
      const config = await registry.load();

      // Manually add an agent with metadata
      config.agents.push({
        id: 'agent-test-123',
        name: 'test-agent',
        description: 'Test',
        created: new Date().toISOString(),
        tags: ['custom-tag'],
        favorite: true,
        lastLaunched: '2024-01-01T00:00:00.000Z',
      });

      await registry.save(config);

      // Load fresh and verify metadata preserved
      const fresh = await registry.load();
      const agent = fresh.agents.find(a => a.id === 'agent-test-123');

      expect(agent?.tags).toContain('custom-tag');
      expect(agent?.favorite).toBe(true);
      expect(agent?.lastLaunched).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('File Format', () => {
    it('should save config as formatted JSON', async () => {
      const registry = new AgentRegistry(configPath);
      const manager = new ProfileManager(configPath);

      // Initialize config first
      await registry.load();

      await manager.saveProfile('format-test', {
        agent: 'test',
        memoryBlocks: ['human'],
      });

      const content = await fs.readFile(configPath, 'utf-8');

      // Should be pretty-printed
      expect(content).toContain('\n');
      expect(content).toMatch(/^\{/);
      expect(content).toMatch(/\}$/);
    });

    it('should produce valid JSON', async () => {
      const registry = new AgentRegistry(configPath);
      const manager = new ProfileManager(configPath);

      // Initialize config first
      await registry.load();

      await manager.saveProfile('json-test', {
        agent: 'test',
        memoryBlocks: ['human'],
      });

      const content = await fs.readFile(configPath, 'utf-8');

      // Should parse without error
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should throw when reading non-existent file without create', async () => {
      const manager = new ProfileManager(path.join(tempDir, 'non-existent.json'));

      await expect(manager.load()).rejects.toThrow();
    });

    it('should handle file with invalid JSON', async () => {
      // Write invalid JSON
      await fs.writeFile(configPath, '{ invalid: json }');

      const manager = new ProfileManager(configPath);

      await expect(manager.load()).rejects.toThrow();
    });
  });
});
