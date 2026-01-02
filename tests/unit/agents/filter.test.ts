/**
 * Tests for agent filtering utilities
 */

import { describe, it, expect } from 'vitest';
import {
  filterAgents,
  convertLettaAgent,
  searchAgents,
  filterByTag,
} from '../../../src/agents/filter.js';
import { mockLettaAgents, validAgent } from '../../fixtures/config.js';
import type { Agent, LettaAgent } from '../../../src/config/schema.js';

describe('filterAgents', () => {
  it('should filter out agents matching exclude patterns', () => {
    const excludePatterns = ['-sleeptime$', '^test-'];
    const result = filterAgents(mockLettaAgents, excludePatterns);

    expect(result).toHaveLength(2);
    expect(result.map(a => a.name)).toEqual(['main-agent', 'research-agent']);
  });

  it('should return all agents when no patterns match', () => {
    const excludePatterns = ['nonexistent-pattern'];
    const result = filterAgents(mockLettaAgents, excludePatterns);

    expect(result).toHaveLength(mockLettaAgents.length);
  });

  it('should return all agents when excludePatterns is empty', () => {
    const result = filterAgents(mockLettaAgents, []);

    expect(result).toHaveLength(mockLettaAgents.length);
  });

  it('should handle empty agents array', () => {
    const result = filterAgents([], ['-sleeptime$']);

    expect(result).toEqual([]);
  });

  it('should handle case-insensitive pattern matching', () => {
    const agents: LettaAgent[] = [
      { id: 'agent-1', name: 'TEST-Agent', description: null, created_at: '2024-01-01T00:00:00Z' },
      { id: 'agent-2', name: 'regular-agent', description: null, created_at: '2024-01-01T00:00:00Z' },
    ];
    const excludePatterns = ['^test-'];
    const result = filterAgents(agents, excludePatterns);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('regular-agent');
  });

  it('should apply all patterns in order', () => {
    const agents: LettaAgent[] = [
      { id: 'agent-1', name: 'agent-sleeptime', description: null, created_at: '2024-01-01T00:00:00Z' },
      { id: 'agent-2', name: 'test-something', description: null, created_at: '2024-01-01T00:00:00Z' },
      { id: 'agent-3', name: 'normal-agent', description: null, created_at: '2024-01-01T00:00:00Z' },
    ];
    const excludePatterns = ['-sleeptime$', '^test-'];
    const result = filterAgents(agents, excludePatterns);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('normal-agent');
  });
});

describe('convertLettaAgent', () => {
  it('should convert Letta API agent to internal Agent format', () => {
    const lettaAgent: LettaAgent = {
      id: 'agent-123',
      name: 'test-agent',
      description: 'A test agent',
      created_at: '2024-01-01T00:00:00.000Z',
      agent_type: 'chat',
    };

    const result = convertLettaAgent(lettaAgent);

    expect(result).toEqual({
      id: 'agent-123',
      name: 'test-agent',
      description: 'A test agent',
      created: '2024-01-01T00:00:00.000Z',
      tags: [],
      favorite: false,
    });
  });

  it('should handle null description', () => {
    const lettaAgent: LettaAgent = {
      id: 'agent-456',
      name: 'no-desc-agent',
      description: null,
      created_at: '2024-01-01T00:00:00.000Z',
    };

    const result = convertLettaAgent(lettaAgent);

    expect(result.description).toBeUndefined();
  });

  it('should handle missing optional agent_type', () => {
    const lettaAgent: LettaAgent = {
      id: 'agent-789',
      name: 'minimal-agent',
      created_at: '2024-01-01T00:00:00.000Z',
    };

    const result = convertLettaAgent(lettaAgent);

    expect(result.id).toBe('agent-789');
    expect(result.name).toBe('minimal-agent');
  });
});

describe('searchAgents', () => {
  const testAgents: Agent[] = [
    { id: 'agent-1', name: 'coding-assistant', description: 'Helps with code', created: '2024-01-01T00:00:00Z', tags: ['dev'] },
    { id: 'agent-2', name: 'research-agent', description: 'Academic research', created: '2024-01-01T00:00:00Z', tags: ['research'] },
    { id: 'agent-3', name: 'general-helper', description: 'General purpose', created: '2024-01-01T00:00:00Z', tags: [] },
  ];

  it('should search agents by name', () => {
    const result = searchAgents(testAgents, 'coding');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('coding-assistant');
  });

  it('should search agents by description', () => {
    const result = searchAgents(testAgents, 'academic');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('research-agent');
  });

  it('should be case-insensitive', () => {
    const result = searchAgents(testAgents, 'RESEARCH');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('research-agent');
  });

  it('should return empty array for no matches', () => {
    const result = searchAgents(testAgents, 'nonexistent');

    expect(result).toEqual([]);
  });

  it('should return all matching agents', () => {
    const result = searchAgents(testAgents, 'agent');

    // Only 'research-agent' has 'agent' in the name
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('research-agent');
  });

  it('should handle empty query', () => {
    const result = searchAgents(testAgents, '');

    expect(result).toHaveLength(testAgents.length);
  });

  it('should handle agents without description', () => {
    const agentsNoDesc: Agent[] = [
      { id: 'agent-1', name: 'test-agent', created: '2024-01-01T00:00:00Z' },
    ];
    const result = searchAgents(agentsNoDesc, 'test');

    expect(result).toHaveLength(1);
  });
});

describe('filterByTag', () => {
  const taggedAgents: Agent[] = [
    { id: 'agent-1', name: 'agent-a', created: '2024-01-01T00:00:00Z', tags: ['dev', 'python'] },
    { id: 'agent-2', name: 'agent-b', created: '2024-01-01T00:00:00Z', tags: ['research'] },
    { id: 'agent-3', name: 'agent-c', created: '2024-01-01T00:00:00Z', tags: ['dev', 'js'] },
    { id: 'agent-4', name: 'agent-d', created: '2024-01-01T00:00:00Z', tags: [] },
  ];

  it('should filter agents by tag', () => {
    const result = filterByTag(taggedAgents, 'dev');

    expect(result).toHaveLength(2);
    expect(result.map(a => a.name)).toEqual(['agent-a', 'agent-c']);
  });

  it('should return empty array for non-existent tag', () => {
    const result = filterByTag(taggedAgents, 'nonexistent');

    expect(result).toEqual([]);
  });

  it('should handle agents without tags', () => {
    const agentsNoTags: Agent[] = [
      { id: 'agent-1', name: 'agent-a', created: '2024-01-01T00:00:00Z' },
    ];
    const result = filterByTag(agentsNoTags, 'any');

    expect(result).toEqual([]);
  });

  it('should match exact tag only', () => {
    const result = filterByTag(taggedAgents, 'python');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('agent-a');
  });
});
