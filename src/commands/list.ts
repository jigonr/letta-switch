/**
 * List agents and profiles
 */

import chalk from 'chalk';
import { filterByTag, searchAgents } from '../agents/filter.js';
import { AgentRegistry } from '../agents/registry.js';
import { ProfileManager } from '../config/manager.js';

export interface ListOptions {
  json?: boolean;
  search?: string;
  tag?: string;
}

/**
 * List all agents
 */
export async function listAgents(options: ListOptions = {}): Promise<void> {
  const registry = new AgentRegistry();
  const config = await registry.load();

  let agents = config.agents;

  // Apply filters
  if (options.search) {
    agents = searchAgents(agents, options.search);
  }

  if (options.tag) {
    agents = filterByTag(agents, options.tag);
  }

  // Output
  if (options.json) {
    console.log(JSON.stringify(agents, null, 2));
    return;
  }

  console.log(chalk.blue.bold('\nAvailable Agents:\n'));

  for (const agent of agents) {
    const marker = agent.favorite ? chalk.yellow('★') : chalk.gray('○');
    const name = agent.favorite
      ? chalk.cyan.bold(agent.name)
      : chalk.white(agent.name);

    console.log(`  ${marker} ${name}`);
    console.log(`    ${chalk.gray('ID:')} ${agent.id}`);
    if (agent.description) {
      console.log(`    ${chalk.gray(agent.description)}`);
    }
    if (agent.tags && agent.tags.length > 0) {
      console.log(`    ${chalk.gray('Tags:')} ${agent.tags.join(', ')}`);
    }
    if (agent.lastLaunched) {
      console.log(
        `    ${chalk.gray('Last launched:')} ${new Date(agent.lastLaunched).toLocaleString()}`,
      );
    }
    console.log();
  }

  if (config.lastSync) {
    console.log(
      chalk.gray(
        `Last synced: ${new Date(config.lastSync).toLocaleString()}\n`,
      ),
    );
  }
}

/**
 * List all profiles
 */
export async function listProfiles(
  options: { json?: boolean } = {},
): Promise<void> {
  const profileManager = new ProfileManager();
  const profiles = await profileManager.listProfiles();
  const current = await profileManager.getCurrentProfile();

  if (options.json) {
    console.log(JSON.stringify(profiles, null, 2));
    return;
  }

  console.log(chalk.blue.bold('\nSaved Profiles:\n'));

  for (const [name, profile] of Object.entries(profiles)) {
    const isCurrent = current?.name === name;
    const marker = isCurrent ? chalk.green('●') : chalk.gray('○');
    const displayName = isCurrent ? chalk.cyan.bold(name) : chalk.white(name);

    console.log(`  ${marker} ${displayName}`);
    console.log(`    Agent: ${profile.agent}`);
    console.log(`    Model: ${profile.model}`);
    console.log(`    Memory: ${profile.memoryBlocks.join(', ')}`);
    if (profile.description) {
      console.log(`    ${chalk.gray(profile.description)}`);
    }
    console.log();
  }
}
