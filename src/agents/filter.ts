/**
 * Agent filtering utilities
 */

import type { Agent, LettaAgent } from '../config/schema.js';

/**
 * Filter out sleeptime agents and other excluded patterns
 */
export function filterAgents(
  agents: LettaAgent[],
  excludePatterns: string[],
): LettaAgent[] {
  return agents.filter(agent => {
    // Check each exclude pattern
    for (const pattern of excludePatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(agent.name)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Convert Letta API agent to internal Agent format
 */
export function convertLettaAgent(lettaAgent: LettaAgent): Agent {
  return {
    id: lettaAgent.id,
    name: lettaAgent.name,
    description: lettaAgent.description || undefined,
    created: lettaAgent.created_at,
    tags: [],
    favorite: false,
  };
}

/**
 * Search agents by query (name or description)
 */
export function searchAgents(agents: Agent[], query: string): Agent[] {
  const lowerQuery = query.toLowerCase();
  return agents.filter(
    agent =>
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.description?.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Filter agents by tag
 */
export function filterByTag(agents: Agent[], tag: string): Agent[] {
  return agents.filter(agent => agent.tags?.includes(tag));
}
