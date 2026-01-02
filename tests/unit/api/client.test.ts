/**
 * Tests for Letta API client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios, { AxiosError, type AxiosInstance } from 'axios';
import { LettaAPIClient } from '../../../src/api/client.js';
import { ErrorCode, LettaSwitchError } from '../../../src/utils/errors.js';
import { mockLettaAgents } from '../../fixtures/config.js';

// Mock axios
vi.mock('axios');

// Mock logger
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  redactApiKey: vi.fn((msg: string) => msg.replace(/at-let-[a-zA-Z0-9]+/g, '***REDACTED***')),
}));

describe('LettaAPIClient', () => {
  let mockAxiosInstance: Partial<AxiosInstance>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
        request: {
          use: vi.fn(),
        },
      },
    } as unknown as Partial<AxiosInstance>;

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as AxiosInstance);
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      const client = new LettaAPIClient('test-api-key');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.letta.com/v1',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    });

    it('should accept custom base URL', () => {
      const customURL = 'https://custom.api.com/v2';
      const client = new LettaAPIClient('test-key', customURL);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: customURL,
        }),
      );
    });

    it('should set up response interceptors', () => {
      const client = new LettaAPIClient('test-key');

      expect(mockAxiosInstance.interceptors?.response.use).toHaveBeenCalled();
    });
  });

  describe('fetchAgents', () => {
    it('should fetch and validate agents', async () => {
      vi.mocked(mockAxiosInstance.get!).mockResolvedValue({ data: mockLettaAgents });

      const client = new LettaAPIClient('test-key');
      const result = await client.fetchAgents();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/agents');
      expect(result).toHaveLength(mockLettaAgents.length);
    });

    it('should throw on non-array response', async () => {
      vi.mocked(mockAxiosInstance.get!).mockResolvedValue({ data: { not: 'array' } });

      const client = new LettaAPIClient('test-key');

      await expect(client.fetchAgents()).rejects.toThrow(LettaSwitchError);
      await expect(client.fetchAgents()).rejects.toMatchObject({
        code: ErrorCode.API_ERROR,
      });
    });

    it('should throw API_KEY_MISSING on 401', async () => {
      const axiosError = new Error('Unauthorized') as AxiosError;
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 401,
        data: { message: 'Invalid API key' },
      } as any;

      vi.mocked(mockAxiosInstance.get!).mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const client = new LettaAPIClient('bad-key');

      await expect(client.fetchAgents()).rejects.toThrow(LettaSwitchError);
      await expect(client.fetchAgents()).rejects.toMatchObject({
        code: ErrorCode.API_KEY_MISSING,
      });
    });

    it('should throw API_ERROR on other HTTP errors', async () => {
      const axiosError = new Error('Server error') as AxiosError;
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
      } as any;

      vi.mocked(mockAxiosInstance.get!).mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const client = new LettaAPIClient('test-key');

      await expect(client.fetchAgents()).rejects.toThrow(LettaSwitchError);
      await expect(client.fetchAgents()).rejects.toMatchObject({
        code: ErrorCode.API_ERROR,
      });
    });

    it('should propagate non-axios errors', async () => {
      const genericError = new Error('Network failure');
      vi.mocked(mockAxiosInstance.get!).mockRejectedValue(genericError);
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      const client = new LettaAPIClient('test-key');

      await expect(client.fetchAgents()).rejects.toThrow('Network failure');
    });
  });

  describe('getAgent', () => {
    it('should fetch single agent by ID', async () => {
      const singleAgent = mockLettaAgents[0];
      vi.mocked(mockAxiosInstance.get!).mockResolvedValue({ data: singleAgent });

      const client = new LettaAPIClient('test-key');
      const result = await client.getAgent('agent-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/agents/agent-123');
      expect(result.id).toBe(singleAgent.id);
    });

    it('should throw AGENT_NOT_FOUND on 404', async () => {
      const axiosError = new Error('Not found') as AxiosError;
      axiosError.isAxiosError = true;
      axiosError.response = { status: 404 } as any;

      vi.mocked(mockAxiosInstance.get!).mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const client = new LettaAPIClient('test-key');

      await expect(client.getAgent('nonexistent')).rejects.toThrow(LettaSwitchError);
      await expect(client.getAgent('nonexistent')).rejects.toMatchObject({
        code: ErrorCode.AGENT_NOT_FOUND,
      });
    });

    it('should throw API_ERROR on other errors', async () => {
      const axiosError = new Error('Server error') as AxiosError;
      axiosError.isAxiosError = true;
      axiosError.response = { status: 503 } as any;
      axiosError.message = 'Service unavailable';

      vi.mocked(mockAxiosInstance.get!).mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const client = new LettaAPIClient('test-key');

      await expect(client.getAgent('agent-123')).rejects.toMatchObject({
        code: ErrorCode.API_ERROR,
      });
    });
  });
});
