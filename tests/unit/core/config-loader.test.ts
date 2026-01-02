/**
 * Tests for ConfigLoader utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

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

// Import after mocks
import { ConfigLoader } from '../../../src/core/config-loader.js';
import { ErrorCode, LettaSwitchError } from '../../../src/utils/errors.js';

// Test schema
const TestSchema = z.object({
  version: z.literal('1.0'),
  name: z.string(),
  count: z.number().optional(),
});

type TestConfig = z.infer<typeof TestSchema>;

describe('ConfigLoader', () => {
  const testConfigPath = '/tmp/test-config/test.json';
  let loader: ConfigLoader<TestConfig>;

  beforeEach(() => {
    vi.clearAllMocks();
    loader = new ConfigLoader(TestSchema, testConfigPath);
  });

  describe('constructor', () => {
    it('should use provided config path', () => {
      const customPath = '/custom/path/config.json';
      const customLoader = new ConfigLoader(TestSchema, customPath);
      expect(customLoader.getPath()).toBe(customPath);
    });

    it('should use default path when none provided', () => {
      const defaultLoader = new ConfigLoader(TestSchema);
      const expectedPath = path.join(os.homedir(), '.letta', 'letta-config.json');
      expect(defaultLoader.getPath()).toBe(expectedPath);
    });
  });

  describe('getPath', () => {
    it('should return the config path', () => {
      expect(loader.getPath()).toBe(testConfigPath);
    });
  });

  describe('load', () => {
    it('should load and validate configuration', async () => {
      const testConfig = { version: '1.0', name: 'test' };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(testConfig));

      const result = await loader.load();

      expect(result).toEqual(testConfig);
      expect(fs.readFile).toHaveBeenCalledWith(testConfigPath, 'utf-8');
    });

    it('should throw CONFIG_NOT_FOUND when file does not exist', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT');
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);

      await expect(loader.load()).rejects.toThrow(LettaSwitchError);
      await expect(loader.load()).rejects.toMatchObject({
        code: ErrorCode.CONFIG_NOT_FOUND,
      });
    });

    it('should throw INVALID_CONFIG on invalid JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{ invalid json');

      await expect(loader.load()).rejects.toThrow(LettaSwitchError);
      await expect(loader.load()).rejects.toMatchObject({
        code: ErrorCode.INVALID_CONFIG,
      });
    });

    it('should throw INVALID_CONFIG on schema validation failure', async () => {
      const invalidConfig = { version: '2.0', name: 'test' };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(invalidConfig));

      await expect(loader.load()).rejects.toThrow(LettaSwitchError);
      await expect(loader.load()).rejects.toMatchObject({
        code: ErrorCode.INVALID_CONFIG,
      });
    });
  });

  describe('loadOrNull', () => {
    it('should return config when file exists', async () => {
      const testConfig = { version: '1.0', name: 'test' };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(testConfig));

      const result = await loader.loadOrNull();

      expect(result).toEqual(testConfig);
    });

    it('should return null when file does not exist', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT');
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);

      const result = await loader.loadOrNull();

      expect(result).toBeNull();
    });

    it('should throw on other errors', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{ invalid json');

      await expect(loader.loadOrNull()).rejects.toThrow(LettaSwitchError);
    });
  });

  describe('save', () => {
    it('should create directory and save config', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const testConfig = { version: '1.0' as const, name: 'test' };
      await loader.save(testConfig);

      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(testConfigPath), {
        recursive: true,
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        testConfigPath,
        JSON.stringify(testConfig, null, 2),
        'utf-8',
      );
    });

    it('should validate config before saving', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const invalidConfig = { version: '2.0', name: 'test' } as any;

      await expect(loader.save(invalidConfig)).rejects.toThrow();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true when file exists', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await loader.exists();

      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const result = await loader.exists();

      expect(result).toBe(false);
    });
  });

  describe('backup', () => {
    it('should create backup file', async () => {
      vi.mocked(fs.copyFile).mockResolvedValue(undefined);

      await loader.backup();

      expect(fs.copyFile).toHaveBeenCalledWith(
        testConfigPath,
        `${testConfigPath}.backup`,
      );
    });

    it('should handle backup failure gracefully', async () => {
      vi.mocked(fs.copyFile).mockRejectedValue(new Error('Permission denied'));

      await expect(loader.backup()).resolves.not.toThrow();
    });
  });

  describe('expandHome', () => {
    it('should expand ~ to home directory', () => {
      const result = ConfigLoader.expandHome('~/test/path');
      expect(result).toBe(path.join(os.homedir(), 'test/path'));
    });

    it('should not modify paths without ~', () => {
      const result = ConfigLoader.expandHome('/absolute/path');
      expect(result).toBe('/absolute/path');
    });

    it('should not expand ~ in the middle of path', () => {
      const result = ConfigLoader.expandHome('/path/to/~/file');
      expect(result).toBe('/path/to/~/file');
    });
  });
});
