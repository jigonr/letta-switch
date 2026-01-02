#!/usr/bin/env node

/**
 * letta-switch - Comprehensive configuration manager for Letta CLI
 * Entry point for the CLI
 */

import chalk from 'chalk';
import { Command } from 'commander';
import { AgentRegistry } from './agents/registry.js';
import { launchAgent, launchProfile } from './commands/launch.js';
import { listAgents, listProfiles } from './commands/list.js';
import { syncAgents } from './commands/sync.js';
import { ProfileManager } from './config/manager.js';
import { LettaSwitchError } from './utils/errors.js';
import { logger } from './utils/logger.js';

const program = new Command();

program
  .name('letta-switch')
  .description(
    'Comprehensive configuration manager for Letta CLI (agents + models + memory blocks)',
  )
  .version('0.1.0');

// Launch agent command (default action)
program
  .argument('[agent]', 'Agent name or ID to launch')
  .option('--profile <name>', 'Use saved profile')
  .option(
    '--model <model>',
    'Model to use (e.g., claude-pro-max/claude-opus-4-5)',
  )
  .option('--memory <blocks>', 'Comma-separated memory blocks')
  .option('--init-blocks <blocks>', 'Comma-separated init blocks')
  .option('--base-tools <tools>', 'Comma-separated base tools')
  .option('--save-as <name>', 'Save this configuration as a profile')
  .option('--json', 'Output in JSON format')
  .action(async (agent, options) => {
    try {
      if (!agent && !options.profile) {
        // Show status
        const profileManager = new ProfileManager();
        const current = await profileManager.getCurrentProfile();

        if (current) {
          console.log(chalk.blue.bold('\nCurrent Profile:\n'));
          console.log(`  ${chalk.cyan(current.name)}`);
          console.log(`  Agent: ${current.profile.agent}`);
          console.log(`  Model: ${current.profile.model}`);
          console.log(`  Memory: ${current.profile.memoryBlocks.join(', ')}\n`);
        } else {
          logger.info('No current profile set');
          logger.info('Run `letta-switch <agent>` to launch an agent');
        }
        return;
      }

      if (options.profile && !agent) {
        // Launch by profile
        await launchProfile(options.profile);
        return;
      }

      // Parse options
      const launchOptions = {
        profile: options.profile,
        model: options.model,
        memory: options.memory?.split(','),
        initBlocks: options.initBlocks?.split(','),
        baseTools: options.baseTools?.split(','),
        saveAs: options.saveAs,
      };

      await launchAgent(agent, launchOptions);
    } catch (error) {
      if (error instanceof LettaSwitchError) {
        logger.error(error.message);
        if (error.details && process.env.DEBUG) {
          console.error(chalk.gray(JSON.stringify(error.details, null, 2)));
        }
      } else {
        logger.error((error as Error).message);
      }
      process.exit(1);
    }
  });

// Sync command
program
  .command('sync')
  .description('Sync agents from Letta API')
  .option('--api-url <url>', 'Custom Letta API URL')
  .action(async options => {
    try {
      await syncAgents(options.apiUrl);
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// List agents command
program
  .command('agents')
  .alias('list')
  .description('List all agents')
  .option('--json', 'Output in JSON format')
  .option('--search <query>', 'Search agents by name or description')
  .option('--tag <tag>', 'Filter by tag')
  .action(async options => {
    try {
      await listAgents(options);
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// List profiles command
program
  .command('profiles')
  .description('List all saved profiles')
  .option('--json', 'Output in JSON format')
  .action(async options => {
    try {
      await listProfiles(options);
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Save profile command
program
  .command('save <name>')
  .description('Save current configuration as a profile')
  .requiredOption('--agent <name>', 'Agent name')
  .requiredOption('--model <model>', 'Model')
  .requiredOption('--memory <blocks>', 'Comma-separated memory blocks')
  .option('--description <desc>', 'Profile description')
  .action(async (name, options) => {
    try {
      const profileManager = new ProfileManager();
      await profileManager.saveProfile(name, {
        agent: options.agent,
        model: options.model,
        memoryBlocks: options.memory.split(','),
        description: options.description,
      });
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Delete profile command
program
  .command('delete <name>')
  .description('Delete a saved profile')
  .action(async name => {
    try {
      const profileManager = new ProfileManager();
      await profileManager.deleteProfile(name);
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Favorite command
program
  .command('favorite <agent>')
  .description('Set an agent as favorite')
  .action(async agent => {
    try {
      const registry = new AgentRegistry();
      await registry.setFavorite(agent);
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Info command
program
  .command('info <agent>')
  .description('Show agent information')
  .option('--json', 'Output in JSON format')
  .action(async (agentName, options) => {
    try {
      const registry = new AgentRegistry();
      const agent = await registry.getAgent(agentName);

      if (!agent) {
        logger.error(`Agent not found: ${agentName}`);
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(agent, null, 2));
        return;
      }

      console.log(chalk.blue.bold(`\nAgent: ${agent.name}\n`));
      console.log(`  ID: ${agent.id}`);
      if (agent.description) {
        console.log(`  Description: ${agent.description}`);
      }
      console.log(`  Created: ${new Date(agent.created).toLocaleString()}`);
      if (agent.tags && agent.tags.length > 0) {
        console.log(`  Tags: ${agent.tags.join(', ')}`);
      }
      if (agent.favorite) {
        console.log(`  ${chalk.yellow('★ Favorite')}`);
      }
      if (agent.lastLaunched) {
        console.log(
          `  Last launched: ${new Date(agent.lastLaunched).toLocaleString()}`,
        );
      }
      if (
        agent.availableMemoryBlocks &&
        agent.availableMemoryBlocks.length > 0
      ) {
        console.log(
          `  Available memory blocks: ${agent.availableMemoryBlocks.join(', ')}`,
        );
      }
      console.log();
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show current configuration status')
  .option('--json', 'Output in JSON format')
  .action(async options => {
    try {
      const profileManager = new ProfileManager();
      const registry = new AgentRegistry();
      const config = await registry.load();
      const current = await profileManager.getCurrentProfile();

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              currentProfile: current,
              totalAgents: config.agents.length,
              totalProfiles: Object.keys(config.profiles).length,
              lastSync: config.lastSync,
            },
            null,
            2,
          ),
        );
        return;
      }

      console.log(chalk.blue.bold('\nLetta Switch Status:\n'));

      if (current) {
        console.log(`  Current profile: ${chalk.cyan(current.name)}`);
        console.log(`    Agent: ${current.profile.agent}`);
        console.log(`    Model: ${current.profile.model}`);
        console.log(`    Memory: ${current.profile.memoryBlocks.join(', ')}`);
      } else {
        console.log('  No current profile set');
      }

      console.log();
      console.log(`  Total agents: ${config.agents.length}`);
      console.log(`  Total profiles: ${Object.keys(config.profiles).length}`);

      if (config.lastSync) {
        console.log(
          `  Last synced: ${new Date(config.lastSync).toLocaleString()}`,
        );
      } else {
        console.log(chalk.yellow('  Not synced yet - run `letta-switch sync`'));
      }

      console.log();
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
