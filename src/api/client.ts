/**
 * Letta API client
 */

import axios, { type AxiosInstance } from 'axios';
import { type LettaAgent, LettaAgentSchema } from '../config/schema.js';
import { ErrorCode, LettaSwitchError } from '../utils/errors.js';
import { logger, redactApiKey } from '../utils/logger.js';

export class LettaAPIClient {
  private client: AxiosInstance;

  constructor(apiKey: string, baseURL = 'https://api.letta.com/v1') {
    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      response => {
        logger.debug(`API request successful: ${response.config.url}`);
        return response;
      },
      error => {
        const message = redactApiKey(error.message);
        logger.debug(`API request failed: ${message}`);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Fetch all agents from Letta API
   */
  async fetchAgents(): Promise<LettaAgent[]> {
    try {
      logger.debug('Fetching agents from Letta API');
      const { data } = await this.client.get<LettaAgent[]>('/agents');

      // Validate response
      if (!Array.isArray(data)) {
        throw new LettaSwitchError(
          'Invalid API response: expected array of agents',
          ErrorCode.API_ERROR,
        );
      }

      // Validate each agent with Zod
      const validatedAgents = data.map(agent => LettaAgentSchema.parse(agent));

      logger.debug(`Fetched ${validatedAgents.length} agents`);
      return validatedAgents;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          throw new LettaSwitchError(
            'API authentication failed. Check your LETTA_API_KEY',
            ErrorCode.API_KEY_MISSING,
            { status, message },
          );
        }

        throw new LettaSwitchError(
          `Failed to fetch agents: ${message}`,
          ErrorCode.API_ERROR,
          { status, data: error.response?.data },
        );
      }
      throw error;
    }
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(id: string): Promise<LettaAgent> {
    try {
      logger.debug(`Fetching agent ${id}`);
      const { data } = await this.client.get<LettaAgent>(`/agents/${id}`);

      return LettaAgentSchema.parse(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 404) {
          throw new LettaSwitchError(
            `Agent not found: ${id}`,
            ErrorCode.AGENT_NOT_FOUND,
            { id },
          );
        }

        throw new LettaSwitchError(
          `Failed to fetch agent: ${error.message}`,
          ErrorCode.API_ERROR,
          { status, data: error.response?.data },
        );
      }
      throw error;
    }
  }
}
