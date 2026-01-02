/**
 * Profile configuration manager
 */

import { ConfigLoader } from '../core/config-loader.js';
import { ErrorCode, LettaSwitchError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import {
  type Config,
  ConfigSchema,
  type Profile,
  ProfileSchema,
} from './schema.js';

export class ProfileManager {
  private readonly loader: ConfigLoader<Config>;

  constructor(configPath?: string) {
    this.loader = new ConfigLoader(ConfigSchema, configPath);
  }

  /**
   * Load configuration
   */
  async load(): Promise<Config> {
    try {
      return await this.loader.load();
    } catch (error) {
      if (
        error instanceof LettaSwitchError &&
        error.code === ErrorCode.CONFIG_NOT_FOUND
      ) {
        throw new LettaSwitchError(
          'Configuration not found. Run `letta-switch sync` first',
          ErrorCode.CONFIG_NOT_FOUND,
        );
      }
      throw error;
    }
  }

  /**
   * Save configuration
   */
  async save(config: Config): Promise<void> {
    await this.loader.save(config);
  }

  /**
   * Get profile by name
   */
  async getProfile(name: string): Promise<Profile | undefined> {
    const config = await this.load();
    return config.profiles[name];
  }

  /**
   * Save a new profile
   */
  async saveProfile(name: string, profile: Profile): Promise<void> {
    const validated = ProfileSchema.parse(profile);
    const config = await this.load();

    config.profiles[name] = validated;
    await this.save(config);

    logger.success(`Saved profile: ${name}`);
  }

  /**
   * Delete a profile
   */
  async deleteProfile(name: string): Promise<void> {
    const config = await this.load();

    if (!config.profiles[name]) {
      throw new LettaSwitchError(
        `Profile not found: ${name}`,
        ErrorCode.PROFILE_NOT_FOUND,
      );
    }

    delete config.profiles[name];

    // If this was the current profile, unset it
    if (config.currentProfile === name) {
      config.currentProfile = undefined;
    }

    await this.save(config);
    logger.success(`Deleted profile: ${name}`);
  }

  /**
   * List all profiles
   */
  async listProfiles(): Promise<Record<string, Profile>> {
    const config = await this.load();
    return config.profiles;
  }

  /**
   * Set current profile
   */
  async setCurrentProfile(name: string): Promise<void> {
    const config = await this.load();

    if (!config.profiles[name]) {
      throw new LettaSwitchError(
        `Profile not found: ${name}`,
        ErrorCode.PROFILE_NOT_FOUND,
      );
    }

    config.currentProfile = name;
    await this.save(config);

    logger.success(`Set current profile: ${name}`);
  }

  /**
   * Get current profile
   */
  async getCurrentProfile(): Promise<
    { name: string; profile: Profile } | undefined
  > {
    const config = await this.load();

    if (!config.currentProfile) {
      return undefined;
    }

    const profile = config.profiles[config.currentProfile];
    if (!profile) {
      return undefined;
    }

    return {
      name: config.currentProfile,
      profile,
    };
  }
}
