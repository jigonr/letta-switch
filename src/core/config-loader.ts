/**
 * Shared configuration loader for file I/O operations
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { ZodSchema } from 'zod';
import { ErrorCode, LettaSwitchError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { CONFIG_FILE_NAME, LETTA_DIR_NAME } from './constants.js';

/**
 * Generic configuration loader with Zod validation
 */
export class ConfigLoader<T> {
  private readonly configPath: string;
  private readonly schema: ZodSchema<T>;

  constructor(schema: ZodSchema<T>, configPath?: string) {
    this.schema = schema;
    this.configPath =
      configPath || path.join(os.homedir(), LETTA_DIR_NAME, CONFIG_FILE_NAME);
  }

  /**
   * Get the configuration file path
   */
  getPath(): string {
    return this.configPath;
  }

  /**
   * Load and validate configuration from file
   */
  async load(): Promise<T> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      const data = JSON.parse(content);
      const validated = this.schema.parse(data);
      logger.debug(`Loaded config from ${this.configPath}`);
      return validated;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new LettaSwitchError(
          `Configuration not found at ${this.configPath}`,
          ErrorCode.CONFIG_NOT_FOUND,
        );
      }
      if (error instanceof SyntaxError) {
        throw new LettaSwitchError(
          `Invalid JSON in configuration file: ${error.message}`,
          ErrorCode.INVALID_CONFIG,
          error,
        );
      }
      throw new LettaSwitchError(
        `Failed to load configuration: ${(error as Error).message}`,
        ErrorCode.INVALID_CONFIG,
        error,
      );
    }
  }

  /**
   * Load configuration, returning undefined if file doesn't exist
   */
  async loadOrNull(): Promise<T | null> {
    try {
      return await this.load();
    } catch (error) {
      if (
        error instanceof LettaSwitchError &&
        error.code === ErrorCode.CONFIG_NOT_FOUND
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Save configuration to file with validation
   */
  async save(config: T): Promise<void> {
    const validated = this.schema.parse(config);
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      this.configPath,
      JSON.stringify(validated, null, 2),
      'utf-8',
    );
    logger.debug(`Config saved to ${this.configPath}`);
  }

  /**
   * Check if configuration file exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a backup of the configuration file
   */
  async backup(): Promise<void> {
    try {
      await fs.copyFile(this.configPath, `${this.configPath}.backup`);
      logger.debug(`Created backup at ${this.configPath}.backup`);
    } catch (error) {
      logger.warn(`Failed to create backup: ${(error as Error).message}`);
    }
  }

  /**
   * Expand home directory in path
   */
  static expandHome(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return path.join(os.homedir(), filePath.slice(2));
    }
    return filePath;
  }
}
