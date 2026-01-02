/**
 * Tests for launch command
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import { EventEmitter } from 'node:events';

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

// Mock child_process
const mockSpawn = vi.fn();
vi.mock('node:child_process', () => ({
  spawn: (...args: any[]) => mockSpawn(...args),
}));

// Import fixtures
import { validConfig } from '../../fixtures/config.js';

// Import after mocks
import { launchAgent, launchProfile } from '../../../src/commands/launch.js';
import { ErrorCode, LettaSwitchError } from '../../../src/utils/errors.js';
import { logger } from '../../../src/utils/logger.js';

describe('Launch Command', () => {
  let mockProcess: EventEmitter;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up mock process
    mockProcess = new EventEmitter();
    mockSpawn.mockReturnValue(mockProcess);

    // Default fs mocks
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(validConfig));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  describe('launchAgent', () => {
    it('should launch agent with default configuration', async () => {
      const launchPromise = launchAgent('co');

      // Emit exit to complete the launch
      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        'letta',
        expect.arrayContaining(['--agent', 'agent-co-123']),
        expect.objectContaining({ stdio: 'inherit', shell: true }),
      );
    });

    it('should throw AGENT_NOT_FOUND for non-existent agent', async () => {
      await expect(launchAgent('non-existent')).rejects.toThrow(
        LettaSwitchError,
      );
      await expect(launchAgent('non-existent')).rejects.toMatchObject({
        code: ErrorCode.AGENT_NOT_FOUND,
      });
    });

    it('should use specified model option', async () => {
      const launchPromise = launchAgent('co', {
        model: 'custom-model',
      });

      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        'letta',
        expect.arrayContaining(['--model', 'custom-model']),
        expect.anything(),
      );
    });

    it('should include init-blocks when specified', async () => {
      const launchPromise = launchAgent('co', {
        initBlocks: ['block1', 'block2'],
      });

      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        'letta',
        expect.arrayContaining(['--init-blocks', 'block1,block2']),
        expect.anything(),
      );
    });

    it('should include base-tools when specified', async () => {
      const launchPromise = launchAgent('co', {
        baseTools: ['tool1', 'tool2'],
      });

      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        'letta',
        expect.arrayContaining(['--base-tools', 'tool1,tool2']),
        expect.anything(),
      );
    });

    it('should use named profile when specified', async () => {
      const launchPromise = launchAgent('co', {
        profile: 'default',
      });

      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should throw PROFILE_NOT_FOUND for non-existent profile', async () => {
      await expect(
        launchAgent('co', { profile: 'non-existent' }),
      ).rejects.toThrow(LettaSwitchError);
      await expect(
        launchAgent('co', { profile: 'non-existent' }),
      ).rejects.toMatchObject({
        code: ErrorCode.PROFILE_NOT_FOUND,
      });
    });

    it('should save as new profile when saveAs specified', async () => {
      const launchPromise = launchAgent('co', {
        saveAs: 'new-profile',
      });

      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('new-profile'),
      );
    });

    it('should log launch information', async () => {
      const launchPromise = launchAgent('co');

      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('co'));
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Agent ID'),
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Model'),
      );
    });

    it('should update last launched timestamp', async () => {
      const launchPromise = launchAgent('co');

      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      // Verify writeFile was called (from updateLastLaunched)
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('launchProfile', () => {
    it('should launch using named profile', async () => {
      const launchPromise = launchProfile('default');

      setImmediate(() => mockProcess.emit('exit', 0));

      await launchPromise;

      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should throw PROFILE_NOT_FOUND for non-existent profile', async () => {
      await expect(launchProfile('non-existent')).rejects.toThrow(
        LettaSwitchError,
      );
      await expect(launchProfile('non-existent')).rejects.toMatchObject({
        code: ErrorCode.PROFILE_NOT_FOUND,
      });
    });
  });
});
