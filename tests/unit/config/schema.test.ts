/**
 * Tests for Zod schema validation
 */

import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  ConfigSchema,
  ProfileSchema,
  AgentSchema,
  ModelSchema,
  ProjectConfigSchema,
  LettaAgentSchema,
  ProviderNameSchema,
  MemoryBlockSchema,
} from '../../../src/config/schema.js';
import { validConfig, validProfile, validAgent, invalidConfigs } from '../../fixtures/config.js';

describe('ProviderNameSchema', () => {
  it('should accept valid provider names', () => {
    expect(ProviderNameSchema.parse('claude-pro-max')).toBe('claude-pro-max');
    expect(ProviderNameSchema.parse('anthropic')).toBe('anthropic');
    expect(ProviderNameSchema.parse('z.ai')).toBe('z.ai');
  });

  it('should reject invalid provider names', () => {
    expect(() => ProviderNameSchema.parse('invalid-provider')).toThrow(ZodError);
  });
});

describe('MemoryBlockSchema', () => {
  it('should accept string memory blocks', () => {
    expect(MemoryBlockSchema.parse('human')).toBe('human');
    expect(MemoryBlockSchema.parse('persona')).toBe('persona');
  });

  it('should reject non-string values', () => {
    expect(() => MemoryBlockSchema.parse(123)).toThrow(ZodError);
    expect(() => MemoryBlockSchema.parse(null)).toThrow(ZodError);
  });
});

describe('AgentSchema', () => {
  it('should validate a valid agent', () => {
    const result = AgentSchema.parse(validAgent);
    expect(result.id).toBe(validAgent.id);
    expect(result.name).toBe(validAgent.name);
  });

  it('should require id to start with "agent-"', () => {
    const invalidAgent = { ...validAgent, id: 'invalid-id' };
    expect(() => AgentSchema.parse(invalidAgent)).toThrow(ZodError);
  });

  it('should require name', () => {
    const { name, ...agentWithoutName } = validAgent;
    expect(() => AgentSchema.parse(agentWithoutName)).toThrow(ZodError);
  });

  it('should allow optional fields to be omitted', () => {
    const minimalAgent = {
      id: 'agent-minimal',
      name: 'Minimal Agent',
      created: '2024-01-01T00:00:00.000Z',
    };
    const result = AgentSchema.parse(minimalAgent);
    expect(result.description).toBeUndefined();
    expect(result.tags).toBeUndefined();
    expect(result.favorite).toBeUndefined();
  });

  it('should validate datetime format for created', () => {
    const invalidDate = { ...validAgent, created: 'not-a-date' };
    expect(() => AgentSchema.parse(invalidDate)).toThrow(ZodError);
  });
});

describe('ModelSchema', () => {
  it('should validate model with correct tier and speed', () => {
    const model = { tier: 'subscription', speed: 'slow' };
    const result = ModelSchema.parse(model);
    expect(result.tier).toBe('subscription');
    expect(result.speed).toBe('slow');
  });

  it('should accept api tier', () => {
    const model = { tier: 'api', speed: 'fast' };
    const result = ModelSchema.parse(model);
    expect(result.tier).toBe('api');
  });

  it('should reject invalid tier', () => {
    const model = { tier: 'invalid', speed: 'slow' };
    expect(() => ModelSchema.parse(model)).toThrow(ZodError);
  });

  it('should reject invalid speed', () => {
    const model = { tier: 'subscription', speed: 'medium' };
    expect(() => ModelSchema.parse(model)).toThrow(ZodError);
  });
});

describe('ProfileSchema', () => {
  it('should validate a valid profile', () => {
    const result = ProfileSchema.parse(validProfile);
    expect(result.agent).toBe(validProfile.agent);
    expect(result.model).toBe(validProfile.model);
    expect(result.memoryBlocks).toEqual(validProfile.memoryBlocks);
  });

  it('should require agent, model, and memoryBlocks', () => {
    expect(() => ProfileSchema.parse({})).toThrow(ZodError);
    expect(() => ProfileSchema.parse({ agent: 'test' })).toThrow(ZodError);
    expect(() => ProfileSchema.parse({ agent: 'test', model: 'test' })).toThrow(ZodError);
  });

  it('should allow optional fields', () => {
    const minimalProfile = {
      agent: 'agent-test',
      model: 'test-model',
      memoryBlocks: ['human'],
    };
    const result = ProfileSchema.parse(minimalProfile);
    expect(result.description).toBeUndefined();
    expect(result.initBlocks).toBeUndefined();
  });
});

describe('ConfigSchema', () => {
  it('should validate a valid configuration', () => {
    const result = ConfigSchema.parse(validConfig);
    expect(result.version).toBe('1.0');
    expect(result.profiles).toHaveProperty('default');
  });

  it('should require version 1.0', () => {
    expect(() => ConfigSchema.parse(invalidConfigs.wrongVersion)).toThrow(ZodError);
  });

  it('should reject missing version', () => {
    expect(() => ConfigSchema.parse(invalidConfigs.missingVersion)).toThrow(ZodError);
  });

  it('should allow currentProfile to be optional', () => {
    const configWithoutCurrent = { ...validConfig, currentProfile: undefined };
    const result = ConfigSchema.parse(configWithoutCurrent);
    expect(result.currentProfile).toBeUndefined();
  });

  it('should require profiles object', () => {
    const { profiles, ...configWithoutProfiles } = validConfig;
    expect(() => ConfigSchema.parse(configWithoutProfiles)).toThrow(ZodError);
  });

  it('should validate nested profiles', () => {
    expect(() => ConfigSchema.parse(invalidConfigs.invalidProfile)).toThrow(ZodError);
  });
});

describe('ProjectConfigSchema', () => {
  it('should validate project config with profile', () => {
    const projectConfig = { profile: 'default' };
    const result = ProjectConfigSchema.parse(projectConfig);
    expect(result.profile).toBe('default');
  });

  it('should allow all fields to be optional', () => {
    const result = ProjectConfigSchema.parse({});
    expect(result.profile).toBeUndefined();
    expect(result.agent).toBeUndefined();
    expect(result.model).toBeUndefined();
  });

  it('should accept full project config', () => {
    const fullConfig = {
      profile: 'custom',
      agent: 'agent-custom',
      model: 'custom-model',
      memoryBlocks: ['human', 'persona'],
      inherits: 'default',
    };
    const result = ProjectConfigSchema.parse(fullConfig);
    expect(result).toEqual(fullConfig);
  });
});

describe('LettaAgentSchema', () => {
  it('should validate Letta API agent response', () => {
    const lettaAgent = {
      id: 'agent-123',
      name: 'Test Agent',
      description: 'A test agent',
      created_at: '2024-01-01T00:00:00.000Z',
      agent_type: 'chat',
    };
    const result = LettaAgentSchema.parse(lettaAgent);
    expect(result.id).toBe('agent-123');
    expect(result.name).toBe('Test Agent');
  });

  it('should allow null description', () => {
    const lettaAgent = {
      id: 'agent-123',
      name: 'Test',
      description: null,
      created_at: '2024-01-01T00:00:00.000Z',
    };
    const result = LettaAgentSchema.parse(lettaAgent);
    expect(result.description).toBeNull();
  });

  it('should allow missing optional fields', () => {
    const minimalAgent = {
      id: 'agent-123',
      name: 'Minimal',
      created_at: '2024-01-01T00:00:00.000Z',
    };
    const result = LettaAgentSchema.parse(minimalAgent);
    expect(result.agent_type).toBeUndefined();
  });
});
