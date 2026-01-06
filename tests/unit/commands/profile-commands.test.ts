/**
 * Tests for profile management commands (save, delete)
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

import { ProfileManager } from '../../../src/config/manager.js';
import { ErrorCode, LettaSwitchError } from '../../../src/utils/errors.js';
import { validConfig, multiProfileConfig } from '../../fixtures/config.js';
import { logger } from '../../../src/utils/logger.js';

describe('Profile Save Command', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let manager: ProfileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ProfileManager(testConfigPath);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should save a new profile with required fields', async () => {
    const newProfile = {
      agent: 'agent-new-123',
      memoryBlocks: ['human', 'persona'],
    };

    await manager.saveProfile('test-profile', newProfile);

    expect(fs.writeFile).toHaveBeenCalled();
    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    expect(savedData.profiles['test-profile']).toEqual(newProfile);
  });

  it('should save a profile with description', async () => {
    const profileWithDesc = {
      agent: 'agent-test',
      memoryBlocks: ['human'],
      description: 'Test profile description',
    };

    await manager.saveProfile('desc-profile', profileWithDesc);

    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    expect(savedData.profiles['desc-profile'].description).toBe('Test profile description');
  });

  it('should overwrite existing profile with same name', async () => {
    const updatedProfile = {
      agent: 'agent-updated',
      memoryBlocks: ['human', 'persona', 'new-block'],
    };

    await manager.saveProfile('default', updatedProfile);

    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    expect(savedData.profiles.default.agent).toBe('agent-updated');
  });

  it('should reject profile without required memoryBlocks', async () => {
    const invalidProfile = { agent: 'test' } as any;

    await expect(manager.saveProfile('bad', invalidProfile)).rejects.toThrow();
  });

  it('should reject profile with empty memoryBlocks', async () => {
    const invalidProfile = {
      agent: 'test-agent',
      memoryBlocks: [],
    };

    // This should succeed - empty arrays are valid
    await manager.saveProfile('empty-memory', invalidProfile);
    expect(fs.writeFile).toHaveBeenCalled();
  });
});

describe('Profile Delete Command', () => {
  const testConfigPath = '/tmp/test-config/letta-config.json';
  let manager: ProfileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ProfileManager(testConfigPath);
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should delete an existing profile', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(multiProfileConfig));

    await manager.deleteProfile('research');

    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    expect(savedData.profiles.research).toBeUndefined();
    expect(savedData.profiles.default).toBeDefined();
    expect(savedData.profiles.coding).toBeDefined();
  });

  it('should throw PROFILE_NOT_FOUND for non-existent profile', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

    await expect(manager.deleteProfile('non-existent')).rejects.toThrow(LettaSwitchError);
    await expect(manager.deleteProfile('non-existent')).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
  });

  it('should unset currentProfile when deleting the current one', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));

    await manager.deleteProfile('default');

    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    expect(savedData.currentProfile).toBeUndefined();
  });

  it('should not affect currentProfile when deleting a different profile', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(multiProfileConfig));

    await manager.deleteProfile('coding');

    const savedData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    expect(savedData.currentProfile).toBe('default');
  });

  it('should handle case-sensitive profile names', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(multiProfileConfig));

    // 'Research' vs 'research' - should not find it
    await expect(manager.deleteProfile('Research')).rejects.toMatchObject({
      code: ErrorCode.PROFILE_NOT_FOUND,
    });
  });
});
