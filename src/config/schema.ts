/**
 * Zod schemas for letta-switch configuration
 */

import { z } from 'zod';

/**
 * Provider name for models
 */
export const ProviderNameSchema = z.enum([
  'claude-pro-max',
  'anthropic',
  'z.ai',
]);

/**
 * Memory block schema
 */
export const MemoryBlockSchema = z.string();

/**
 * Agent schema
 */
export const AgentSchema = z.object({
  id: z.string().startsWith('agent-'),
  name: z.string(),
  description: z.string().optional(),
  created: z.string().datetime(),
  tags: z.array(z.string()).optional(),
  favorite: z.boolean().optional(),
  availableMemoryBlocks: z.array(z.string()).optional(),
  lastLaunched: z.string().datetime().optional(),
});

/**
 * Model configuration schema
 */
export const ModelSchema = z.object({
  tier: z.enum(['subscription', 'api']),
  speed: z.enum(['slow', 'fast']),
});

/**
 * Profile schema - combination of agent + model + memory
 */
export const ProfileSchema = z.object({
  agent: z.string(),
  model: z.string(),
  memoryBlocks: z.array(z.string()),
  description: z.string().optional(),
  initBlocks: z.array(z.string()).optional(),
  baseTools: z.array(z.string()).optional(),
});

/**
 * Main configuration schema
 */
export const ConfigSchema = z.object({
  version: z.literal('1.0'),
  currentProfile: z.string().optional(),
  profiles: z.record(z.string(), ProfileSchema),
  agents: z.array(AgentSchema),
  models: z.record(z.string(), ModelSchema),
  filters: z.object({
    excludePatterns: z.array(z.string()),
  }),
  lastSync: z.string().datetime().optional(),
});

/**
 * Project-specific configuration schema
 */
export const ProjectConfigSchema = z.object({
  profile: z.string().optional(),
  agent: z.string().optional(),
  model: z.string().optional(),
  memoryBlocks: z.array(z.string()).optional(),
  inherits: z.string().optional(),
});

/**
 * Letta API agent response schema
 */
export const LettaAgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  created_at: z.string(),
  agent_type: z.string().optional(),
});

/**
 * Export inferred types
 */
export type ProviderName = z.infer<typeof ProviderNameSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Model = z.infer<typeof ModelSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type LettaAgent = z.infer<typeof LettaAgentSchema>;
