/**
 * Agent registry manager
 */

import { LettaAPIClient } from '../api/client.js';
import { type Agent, type Config, ConfigSchema } from '../config/schema.js';
import { ConfigLoader } from '../core/config-loader.js';
import {
  CONFIG_VERSION,
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_MEMORY_BLOCKS,
  DEFAULT_MODEL,
  DEFAULT_MODELS,
  DEFAULT_PROFILE_DESCRIPTION,
} from '../core/constants.js';
import { ErrorCode, LettaSwitchError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { convertLettaAgent, filterAgents } from './filter.js';

export class AgentRegistry {
  private readonly loader: ConfigLoader<Config>;

  constructor(configPath?: string) {
    this.loader = new ConfigLoader(ConfigSchema, configPath);
  }

  /**
   * Load configuration
   */
  async load(): Promise<Config> {
    const existing = await this.loader.loadOrNull();
    if (existing) {
      return existing;
    }
    logger.warn('Config file not found, creating default');
    return this.createDefault();
  }

  /**
   * Save configuration
   */
  async save(config: Config): Promise<void> {
    await this.loader.save(config);
  }

  /**
   * Sync agents from Letta API
   */
  async syncFromAPI(apiKey: string, apiUrl?: string): Promise<void> {
    const client = new LettaAPIClient(apiKey, apiUrl);
    const config = await this.load();

    logger.info('Syncing agents from Letta API...');

    // Fetch agents
    const lettaAgents = await client.fetchAgents();

    // Filter out excluded patterns
    const filtered = filterAgents(lettaAgents, config.filters.excludePatterns);

    // Convert to internal format
    const newAgents = filtered.map(convertLettaAgent);

    // Merge with existing agents, preserving custom metadata
    const existingAgentMap = new Map(config.agents.map(a => [a.id, a]));

    const mergedAgents = newAgents.map(newAgent => {
      const existing = existingAgentMap.get(newAgent.id);
      if (existing) {
        // Preserve custom metadata
        return {
          ...newAgent,
          tags: existing.tags,
          favorite: existing.favorite,
          lastLaunched: existing.lastLaunched,
        };
      }
      return newAgent;
    });

    // Update config
    config.agents = mergedAgents;
    config.lastSync = new Date().toISOString();

    await this.save(config);

    logger.success(
      `Synced ${mergedAgents.length} agents (filtered ${lettaAgents.length - filtered.length} excluded)`,
    );
  }

  /**
   * Get agent by name or ID
   */
  async getAgent(nameOrId: string): Promise<Agent | undefined> {
    const config = await this.load();
    return config.agents.find(a => a.name === nameOrId || a.id === nameOrId);
  }

  /**
   * Set favorite agent
   */
  async setFavorite(agentName: string): Promise<void> {
    const config = await this.load();

    // Remove favorite from all agents
    for (const agent of config.agents) {
      agent.favorite = false;
    }

    // Set favorite
    const agent = config.agents.find(a => a.name === agentName);
    if (!agent) {
      throw new LettaSwitchError(
        `Agent not found: ${agentName}`,
        ErrorCode.AGENT_NOT_FOUND,
      );
    }

    agent.favorite = true;
    await this.save(config);

    logger.success(`Set ${agentName} as favorite agent`);
  }

  /**
   * Update last launched timestamp
   */
  async updateLastLaunched(agentName: string): Promise<void> {
    const config = await this.load();
    const agent = config.agents.find(a => a.name === agentName);
    if (agent) {
      agent.lastLaunched = new Date().toISOString();
      await this.save(config);
    }
  }

  /**
   * Create default configuration
   */
  private async createDefault(): Promise<Config> {
    const defaultConfig: Config = {
      version: CONFIG_VERSION,
      profiles: {
        default: {
          agent: 'co',
          model: DEFAULT_MODEL,
          memoryBlocks: [...DEFAULT_MEMORY_BLOCKS],
          description: DEFAULT_PROFILE_DESCRIPTION,
        },
      },
      agents: [],
      models: { ...DEFAULT_MODELS },
      filters: {
        excludePatterns: [...DEFAULT_EXCLUDE_PATTERNS],
      },
    };

    await this.save(defaultConfig);
    logger.info('Created default configuration');
    return defaultConfig;
  }
}
