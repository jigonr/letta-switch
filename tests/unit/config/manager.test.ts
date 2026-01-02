/**
 * Tests for ProfileManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ProfileManager } from '../../../src/config/manager.js';
import { ErrorCode, LettaSwitchError } from '../../../src/utils/errors.js';
import { validConfig, validProfile, multiProfileConfig } from '../../fixtures/config.js';

// Mock the fs module
vi.mock('node:fs/promises');

// Mock the logger to prevent console output during tests
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ProfileManager', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let manager: ProfileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ProfileManager(testConfigPath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use provided config path', () => {
      const customPath = '/custom/path/config.json';
      const customManager = new ProfileManager(customPath);
      expect(customManager).toBeDefined();
    });

    it('should use default path when none provided', () => {
      const defaultManager = new ProfileManager();
      expect(defaultManager).toBeDefined();
    });
  });

  describe('load', () => {
    it('should load and parse valid configuration', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const result = await manager.load();

      expect(result).toEqual(validConfig);
      expect(fs.readFile).toHaveBeenCalledWith(testConfigPath, 'utf-8');
    });

    it('should throw CONFIG_NOT_FOUND when file does not exist', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT');
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);

      await expect(manager.load()).rejects.toThrow(LettaSwitchError);
      await expect(manager.load()).rejects.toMatchObject({
        code: ErrorCode.CONFIG_NOT_FOUND,
      });
    });

    it('should throw on invalid JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{ invalid json');

      await expect(manager.load()).rejects.toThrow();
    });

    it('should throw on invalid config structure', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ invalid: 'config' }));

      await expect(manager.load()).rejects.toThrow();
    });

    it('should propagate other filesystem errors', async () => {
      const permError = new Error('Permission denied');
      vi.mocked(fs.readFile).mockRejectedValue(permError);

      await expect(manager.load()).rejects.toThrow('Permission denied');
    });
  });

  describe('save', () => {
    it('should create directory and save config', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await manager.save(validConfig);

      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(testConfigPath), { recursive: true });
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

      await expect(manager.save(invalidConfig)).rejects.toThrow();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return profile by name', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const result = await manager.getProfile('default');

      expect(result).toEqual(validConfig.profiles.default);
    });

    it('should return undefined for non-existent profile', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const result = await manager.getProfile('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('saveProfile', () => {
    it('should save a new profile', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const newProfile = {
        agent: 'agent-new',
        model: 'new-model',
        memoryBlocks: ['human'],
        description: 'New profile',
      };

      await manager.saveProfile('new-profile', newProfile);

      expect(fs.writeFile).toHaveBeenCalled();
      const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
      expect(savedData.profiles['new-profile']).toEqual(newProfile);
    });

    it('should validate profile before saving', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const invalidProfile = { agent: 'test' } as any;

      await expect(manager.saveProfile('bad', invalidProfile)).rejects.toThrow();
    });
  });

  describe('deleteProfile', () => {
    it('should delete an existing profile', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(multiProfileConfig));
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await manager.deleteProfile('research');

      expect(fs.writeFile).toHaveBeenCalled();
      const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
      expect(savedData.profiles.research).toBeUndefined();
    });

    it('should throw PROFILE_NOT_FOUND for non-existent profile', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      await expect(manager.deleteProfile('nonexistent')).rejects.toThrow(LettaSwitchError);
      await expect(manager.deleteProfile('nonexistent')).rejects.toMatchObject({
        code: ErrorCode.PROFILE_NOT_FOUND,
      });
    });

    it('should unset currentProfile if deleting current', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await manager.deleteProfile('default');

      const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
      expect(savedData.currentProfile).toBeUndefined();
    });
  });

  describe('listProfiles', () => {
    it('should return all profiles', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(multiProfileConfig));

      const result = await manager.listProfiles();

      expect(Object.keys(result)).toEqual(['default', 'research', 'coding']);
    });

    it('should return empty object when no profiles', async () => {
      const configNoProfiles = { ...validConfig, profiles: {} };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(configNoProfiles));

      const result = await manager.listProfiles();

      expect(result).toEqual({});
    });
  });

  describe('setCurrentProfile', () => {
    it('should set current profile', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(multiProfileConfig));
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await manager.setCurrentProfile('research');

      const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
      expect(savedData.currentProfile).toBe('research');
    });

    it('should throw PROFILE_NOT_FOUND for non-existent profile', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      await expect(manager.setCurrentProfile('nonexistent')).rejects.toThrow(LettaSwitchError);
      await expect(manager.setCurrentProfile('nonexistent')).rejects.toMatchObject({
        code: ErrorCode.PROFILE_NOT_FOUND,
      });
    });
  });

  describe('getCurrentProfile', () => {
    it('should return current profile with name', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

      const result = await manager.getCurrentProfile();

      expect(result).toEqual({
        name: 'default',
        profile: validConfig.profiles.default,
      });
    });

    it('should return undefined when no current profile set', async () => {
      const configNoCurrent = { ...validConfig, currentProfile: undefined };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(configNoCurrent));

      const result = await manager.getCurrentProfile();

      expect(result).toBeUndefined();
    });

    it('should return undefined when current profile not in profiles', async () => {
      const configBadCurrent = { ...validConfig, currentProfile: 'deleted' };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(configBadCurrent));

      const result = await manager.getCurrentProfile();

      expect(result).toBeUndefined();
    });
  });
});
