/**
 * Test fixtures for letta-switch
 */

import type {
  Agent,
  Config,
  LettaAgent,
  Profile,
} from '../../src/config/schema.js';

/**
 * Valid minimal configuration for testing
 */
export const validConfig: Config = {
  version: '1.0',
  currentProfile: 'default',
  profiles: {
    default: {
      agent: 'co',
      model: 'claude-pro-max/claude-opus-4-5',
      memoryBlocks: ['human', 'persona'],
      description: 'Default profile',
    },
  },
  agents: [
    {
      id: 'agent-co-123',
      name: 'co',
      description: 'Main coding assistant',
      created: '2024-01-01T00:00:00.000Z',
      tags: ['coding'],
      favorite: false,
    },
    {
      id: 'agent-research-456',
      name: 'research',
      description: 'Research agent',
      created: '2024-01-02T00:00:00.000Z',
      tags: ['research'],
      favorite: false,
    },
  ],
  models: {
    'claude-pro-max/claude-opus-4-5': { tier: 'subscription', speed: 'slow' },
    'anthropic/claude-3-5-sonnet': { tier: 'api', speed: 'fast' },
  },
  filters: {
    excludePatterns: ['-sleeptime$', '^test-'],
  },
  lastSync: '2024-01-01T00:00:00.000Z',
};

/**
 * Configuration with multiple profiles
 */
export const multiProfileConfig: Config = {
  ...validConfig,
  profiles: {
    default: validConfig.profiles.default,
    research: {
      agent: 'agent-research-456',
      model: 'claude-pro-max/claude-opus-4-5',
      memoryBlocks: ['human', 'persona', 'research-docs'],
      description: 'Research profile',
    },
    coding: {
      agent: 'agent-coding-789',
      model: 'anthropic/claude-3-5-sonnet',
      memoryBlocks: ['human', 'persona', 'code-standards'],
      description: 'Coding profile',
    },
  },
};

/**
 * Valid profile for testing
 */
export const validProfile: Profile = {
  agent: 'agent-test-123',
  model: 'claude-pro-max/claude-opus-4-5',
  memoryBlocks: ['human', 'persona'],
  description: 'A valid test profile',
};

/**
 * Valid agent for testing
 */
export const validAgent: Agent = {
  id: 'agent-test-123',
  name: 'test-agent',
  description: 'A test agent',
  created: '2024-01-01T00:00:00.000Z',
  tags: ['test'],
  favorite: false,
};

/**
 * Mock Letta API agents response
 */
export const mockLettaAgents: LettaAgent[] = [
  {
    id: 'agent-123',
    name: 'main-agent',
    description: 'Main agent for testing',
    created_at: '2024-01-01T00:00:00.000Z',
    agent_type: 'chat',
  },
  {
    id: 'agent-456',
    name: 'research-agent',
    description: 'Research agent',
    created_at: '2024-01-02T00:00:00.000Z',
    agent_type: 'chat',
  },
  {
    id: 'agent-789',
    name: 'coding-sleeptime',
    description: 'Should be filtered out',
    created_at: '2024-01-03T00:00:00.000Z',
    agent_type: 'internal',
  },
  {
    id: 'agent-101',
    name: 'test-agent',
    description: 'Test agent - should be filtered',
    created_at: '2024-01-04T00:00:00.000Z',
    agent_type: 'test',
  },
];

/**
 * Invalid configuration samples for error testing
 */
export const invalidConfigs = {
  missingVersion: {
    currentProfile: 'default',
    profiles: {},
    agents: [],
    models: {},
    filters: { excludePatterns: [] },
  },
  wrongVersion: {
    version: '2.0',
    currentProfile: 'default',
    profiles: {},
    agents: [],
    models: {},
    filters: { excludePatterns: [] },
  },
  invalidProfile: {
    version: '1.0',
    profiles: {
      bad: {
        agent: 'missing-model', // missing required fields
      },
    },
    agents: [],
    models: {},
    filters: { excludePatterns: [] },
  },
};
