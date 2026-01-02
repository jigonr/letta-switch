/**
 * Application constants
 *
 * All magic numbers and hardcoded values are centralized here.
 * This follows the DRY principle and makes configuration changes easier.
 */

// =============================================================================
// API Configuration
// =============================================================================

/** Default Letta API base URL */
export const API_BASE_URL = 'https://api.letta.com/v1';

/** API request timeout in milliseconds (30 seconds) */
export const API_TIMEOUT_MS = 30_000;

// =============================================================================
// HTTP Status Codes
// =============================================================================

/** HTTP 401 Unauthorized - Authentication failed */
export const HTTP_UNAUTHORIZED = 401;

/** HTTP 404 Not Found - Resource doesn't exist */
export const HTTP_NOT_FOUND = 404;

// =============================================================================
// Configuration
// =============================================================================

/** Current configuration schema version */
export const CONFIG_VERSION = '1.0' as const;

/** Configuration file name */
export const CONFIG_FILE_NAME = 'letta-config.json';

/** Letta settings file name (contains API key) */
export const SETTINGS_FILE_NAME = 'settings.json';

/** Letta configuration directory name (relative to home) */
export const LETTA_DIR_NAME = '.letta';

/** Project-specific config file name */
export const PROJECT_CONFIG_FILE_NAME = '.letta-switch.json';

// =============================================================================
// Default Values
// =============================================================================

/** Default AI model for new profiles */
export const DEFAULT_MODEL = 'claude-pro-max/claude-opus-4-5';

/** Default memory blocks for new profiles */
export const DEFAULT_MEMORY_BLOCKS: readonly string[] = ['human', 'persona'];

/** Default agent name for empty config */
export const DEFAULT_AGENT_NAME = 'default';

/** Default profile name */
export const DEFAULT_PROFILE_NAME = 'default';

/** Default profile description */
export const DEFAULT_PROFILE_DESCRIPTION = 'Default profile';

// =============================================================================
// Model Definitions
// =============================================================================

/** Available model tiers */
export type ModelTier = 'subscription' | 'api';

/** Available model speeds */
export type ModelSpeed = 'slow' | 'fast';

/** Default model configurations */
export const DEFAULT_MODELS = {
  'claude-pro-max/claude-opus-4-5': {
    tier: 'subscription' as ModelTier,
    speed: 'slow' as ModelSpeed,
  },
  'claude-pro-max/claude-sonnet-4-5': {
    tier: 'subscription' as ModelTier,
    speed: 'fast' as ModelSpeed,
  },
  'anthropic/claude-opus-4-5': {
    tier: 'api' as ModelTier,
    speed: 'slow' as ModelSpeed,
  },
  'z.ai/glm-4.7': { tier: 'api' as ModelTier, speed: 'fast' as ModelSpeed },
} as const;

// =============================================================================
// Agent Filtering
// =============================================================================

/**
 * Default patterns to exclude agents from listing
 * - Agents ending with "-sleeptime" (internal Letta agents)
 * - Agents starting with "test-" (test agents)
 */
export const DEFAULT_EXCLUDE_PATTERNS: readonly string[] = [
  '-sleeptime$',
  '^test-',
];

// =============================================================================
// Logging & Security
// =============================================================================

/**
 * Regex pattern for redacting API keys in logs
 * Matches Letta API key format: at-let-[64 alphanumeric chars]
 */
export const API_KEY_REDACTION_PATTERN = /at-let-[a-zA-Z0-9]{64}/g;

/** Replacement text for redacted API keys */
export const API_KEY_REDACTED_TEXT = '***REDACTED***';

// =============================================================================
// File Permissions
// =============================================================================

/** File permission mode for sensitive files (owner read/write only) */
export const SECURE_FILE_MODE = 0o600;

/** Directory permission mode */
export const DIRECTORY_MODE = 0o755;
