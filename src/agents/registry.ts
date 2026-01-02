/**
 * Agent registry manager
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { LettaAPIClient } from '../api/client.js';
import { type Agent, type Config, ConfigSchema } from '../config/schema.js';
import { ErrorCode, LettaSwitchError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { convertLettaAgent, filterAgents } from './filter.js';

export class AgentRegistry {
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath =
      configPath || path.join(os.homedir(), '.letta', 'letta-config.json');
  }

  /**
   * Load configuration
   */
  async load(): Promise<Config> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      const data = JSON.parse(content);
      const config = ConfigSchema.parse(data);
      logger.debug(`Loaded config from ${this.configPath}`);
      return config;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn('Config file not found, creating default');
        return this.createDefault();
      }
      throw new LettaSwitchError(
        `Failed to load configuration: ${(error as Error).message}`,
        ErrorCode.INVALID_CONFIG,
        error,
      );
    }
  }

  /**
   * Save configuration
   */
  async save(config: Config): Promise<void> {
    const validated = ConfigSchema.parse(config);
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
    config.agents.forEach(agent => {
      agent.favorite = false;
    });

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
      version: '1.0',
      profiles: {
        default: {
          agent: 'co',
          model: 'claude-pro-max/claude-opus-4-5',
          memoryBlocks: ['human', 'persona'],
          description: 'Default profile',
        },
      },
      agents: [],
      models: {
        'claude-pro-max/claude-opus-4-5': {
          tier: 'subscription',
          speed: 'slow',
        },
        'claude-pro-max/claude-sonnet-4-5': {
          tier: 'subscription',
          speed: 'fast',
        },
        'anthropic/claude-opus-4-5': { tier: 'api', speed: 'slow' },
        'z.ai/glm-4.7': { tier: 'api', speed: 'fast' },
      },
      filters: {
        excludePatterns: ['-sleeptime$', '^test-'],
      },
    };

    await this.save(defaultConfig);
    logger.info('Created default configuration');
    return defaultConfig;
  }
}
