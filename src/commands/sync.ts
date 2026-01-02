/**
 * Sync agents from Letta API
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { AgentRegistry } from '../agents/registry.js';
import { ErrorCode, LettaSwitchError } from '../utils/errors.js';

/**
 * Get Letta API key from settings
 */
async function getApiKey(): Promise<string> {
  const settingsPath = path.join(os.homedir(), '.letta', 'settings.json');

  try {
    const content = await fs.readFile(settingsPath, 'utf-8');
    const settings = JSON.parse(content);

    const apiKey = settings.env?.LETTA_API_KEY;
    if (!apiKey) {
      throw new LettaSwitchError(
        'LETTA_API_KEY not found in settings',
        ErrorCode.API_KEY_MISSING,
      );
    }

    return apiKey;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new LettaSwitchError(
        'Letta settings not found. Run `letta` to authenticate first',
        ErrorCode.CONFIG_NOT_FOUND,
      );
    }
    throw error;
  }
}

/**
 * Sync agents from Letta API
 */
export async function syncAgents(apiUrl?: string): Promise<void> {
  const apiKey = await getApiKey();
  const registry = new AgentRegistry();

  await registry.syncFromAPI(apiKey, apiUrl);
}
