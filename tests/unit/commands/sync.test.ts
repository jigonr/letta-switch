/**
 * Tests for sync command
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
    fetchAgents: vi.fn().mockResolvedValue([]),
    healthCheck: vi.fn().mockResolvedValue(true),
  })),
}));

// Import fixtures
import { validConfig } from '../../fixtures/config.js';

// Import after mocks
import { syncAgents } from '../../../src/commands/sync.js';
import { ErrorCode, LettaSwitchError } from '../../../src/utils/errors.js';

describe('Sync Command', () => {
  const settingsPath = path.join(os.homedir(), '.letta', 'settings.json');
  const settingsWithKey = {
    env: {
      LETTA_API_KEY: 'at-let-' + 'a'.repeat(64),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default setup: valid settings and config files
    vi.mocked(fs.readFile).mockImplementation((filePath: any) => {
      if (filePath === settingsPath) {
        return Promise.resolve(JSON.stringify(settingsWithKey));
      }
      return Promise.resolve(JSON.stringify(validConfig));
    });
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  describe('syncAgents', () => {
    it('should sync agents from API', async () => {
      await expect(syncAgents()).resolves.not.toThrow();
    });

    it('should throw API_KEY_MISSING when no key in settings', async () => {
      vi.mocked(fs.readFile).mockImplementation((filePath: any) => {
        if (filePath === settingsPath) {
          return Promise.resolve(JSON.stringify({ env: {} }));
        }
        return Promise.resolve(JSON.stringify(validConfig));
      });

      await expect(syncAgents()).rejects.toThrow(LettaSwitchError);
      await expect(syncAgents()).rejects.toMatchObject({
        code: ErrorCode.API_KEY_MISSING,
      });
    });

    it('should throw CONFIG_NOT_FOUND when settings file missing', async () => {
      const enoent: NodeJS.ErrnoException = new Error('ENOENT');
      enoent.code = 'ENOENT';

      vi.mocked(fs.readFile).mockImplementation((filePath: any) => {
        if (filePath === settingsPath) {
          return Promise.reject(enoent);
        }
        return Promise.resolve(JSON.stringify(validConfig));
      });

      await expect(syncAgents()).rejects.toThrow(LettaSwitchError);
      await expect(syncAgents()).rejects.toMatchObject({
        code: ErrorCode.CONFIG_NOT_FOUND,
      });
    });

    it('should pass custom API URL when provided', async () => {
      await expect(syncAgents('https://custom.api.url')).resolves.not.toThrow();
    });

    it('should propagate other errors from settings read', async () => {
      vi.mocked(fs.readFile).mockImplementation((filePath: any) => {
        if (filePath === settingsPath) {
          return Promise.reject(new Error('Permission denied'));
        }
        return Promise.resolve(JSON.stringify(validConfig));
      });

      await expect(syncAgents()).rejects.toThrow('Permission denied');
    });
  });
});
