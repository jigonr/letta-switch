/**
 * Launch agent command
 */

import { spawn } from 'node:child_process';
import { AgentRegistry } from '../agents/registry.js';
import { ProfileManager } from '../config/manager.js';
import type { Profile } from '../config/schema.js';
import { ErrorCode, LettaSwitchError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface LaunchOptions {
  profile?: string;
  model?: string;
  memory?: string[];
  initBlocks?: string[];
  baseTools?: string[];
  saveAs?: string;
}

/**
 * Launch a Letta agent with specified configuration
 */
export async function launchAgent(
  agentNameOrId: string,
  options: LaunchOptions = {},
): Promise<void> {
  const registry = new AgentRegistry();
  const profileManager = new ProfileManager();

  // Get agent
  const agent = await registry.getAgent(agentNameOrId);
  if (!agent) {
    throw new LettaSwitchError(
      `Agent not found: ${agentNameOrId}`,
      ErrorCode.AGENT_NOT_FOUND,
    );
  }

  // Determine configuration
  let config: Profile;

  if (options.profile) {
    // Use named profile
    const profile = await profileManager.getProfile(options.profile);
    if (!profile) {
      throw new LettaSwitchError(
        `Profile not found: ${options.profile}`,
        ErrorCode.PROFILE_NOT_FOUND,
      );
    }
    config = profile;
  } else {
    // Build config from options or use defaults
    config = {
      agent: agent.name,
      model: options.model || 'claude-pro-max/claude-opus-4-5',
      memoryBlocks: options.memory || ['human', 'persona'],
      initBlocks: options.initBlocks,
      baseTools: options.baseTools,
    };
  }

  // Save as new profile if requested
  if (options.saveAs) {
    await profileManager.saveProfile(options.saveAs, config);
    logger.success(`Saved configuration as profile: ${options.saveAs}`);
  }

  // Update last launched
  await registry.updateLastLaunched(agent.name);

  // Build letta command
  const args = ['--agent', agent.id];

  if (config.model) {
    args.push('--model', config.model);
  }

  if (config.initBlocks && config.initBlocks.length > 0) {
    args.push('--init-blocks', config.initBlocks.join(','));
  }

  if (config.baseTools && config.baseTools.length > 0) {
    args.push('--base-tools', config.baseTools.join(','));
  }

  // Log launch info
  logger.info(`Launching ${agent.name}...`);
  logger.info(`  Agent ID: ${agent.id}`);
  logger.info(`  Model: ${config.model}`);
  logger.info(`  Memory: ${config.memoryBlocks.join(', ')}`);

  // Execute letta command
  const letta = spawn('letta', args, {
    stdio: 'inherit',
    shell: true,
  });

  letta.on('error', error => {
    logger.error(`Failed to launch letta: ${error.message}`);
    process.exit(1);
  });

  letta.on('exit', code => {
    if (code !== 0 && code !== null) {
      logger.error(`letta exited with code ${code}`);
      process.exit(code);
    }
  });
}

/**
 * Launch using a named profile
 */
export async function launchProfile(profileName: string): Promise<void> {
  const profileManager = new ProfileManager();
  const profile = await profileManager.getProfile(profileName);

  if (!profile) {
    throw new LettaSwitchError(
      `Profile not found: ${profileName}`,
      ErrorCode.PROFILE_NOT_FOUND,
    );
  }

  await launchAgent(profile.agent, {
    model: profile.model,
    memory: profile.memoryBlocks,
    initBlocks: profile.initBlocks,
    baseTools: profile.baseTools,
  });
}
