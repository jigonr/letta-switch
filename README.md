# letta-switch

[![CI](https://github.com/jigonr/letta-switch/workflows/CI/badge.svg)](https://github.com/jigonr/letta-switch/actions)
[![codecov](https://codecov.io/gh/jigonr/letta-switch/branch/main/graph/badge.svg)](https://codecov.io/gh/jigonr/letta-switch)
[![npm version](https://badge.fury.io/js/%40jigonr%2Fletta-switch.svg)](https://www.npmjs.com/package/@jigonr/letta-switch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Comprehensive configuration manager for [Letta CLI](https://github.com/letta-ai/letta) - manage agents, models, and memory blocks.

## Features

- **Agent Management**: Sync, search, filter, and favorite agents from Letta API
- **Profile System**: Save and reuse agent+model+memory configurations
- **Memory Blocks**: Configure custom memory block combinations
- **Project-Aware**: Auto-detect `.letta-switch.json` in projects
- **Type-Safe**: Built with TypeScript, Zod validation, and strict types
- **Model Support**: Works with all Letta-supported models (claude-pro-max/*, anthropic/*, etc.)

## Installation

```bash
npm install -g @jigonr/letta-switch
```

## Quick Start

1. **Authenticate with Letta** (if not already done):
   ```bash
   letta
   ```

2. **Sync agents from Letta API**:
   ```bash
   letta-switch sync
   ```

3. **List available agents**:
   ```bash
   letta-switch list
   ```

4. **Launch an agent**:
   ```bash
   letta-switch my-agent --model claude-pro-max/claude-opus-4-5
   ```

5. **Save a profile**:
   ```bash
   letta-switch my-agent --model claude-pro-max/claude-opus-4-5 --memory human,persona --save-as dev-profile
   ```

6. **Launch using a profile**:
   ```bash
   letta-switch --profile dev-profile
   ```

## Commands

### Default Command: Launch Agent

```bash
letta-switch [agent] [options]

# Launch agent with custom model
letta-switch my-agent --model anthropic/claude-3-5-sonnet-20241022

# Launch with custom memory blocks
letta-switch my-agent --memory human,persona,context

# Launch and save as profile
letta-switch my-agent --model claude-pro-max/claude-opus-4-5 --save-as my-profile

# Launch using saved profile
letta-switch --profile my-profile

# Show current status (no arguments)
letta-switch
```

**Options:**
- `--profile <name>` - Use saved profile
- `--model <model>` - Model to use (e.g., `claude-pro-max/claude-opus-4-5`, `anthropic/claude-3-5-sonnet-20241022`)
- `--memory <blocks>` - Comma-separated memory blocks (e.g., `human,persona`)
- `--init-blocks <blocks>` - Comma-separated init blocks
- `--base-tools <tools>` - Comma-separated base tools
- `--save-as <name>` - Save this configuration as a profile
- `--json` - Output in JSON format

### `letta-switch sync`

Sync agents from Letta API:

```bash
# Sync from default API
letta-switch sync

# Sync from custom API URL
letta-switch sync --api-url https://custom-letta-api.com
```

### `letta-switch agents` / `letta-switch list`

List all agents:

```bash
# List all agents
letta-switch agents

# Search agents
letta-switch agents --search "coding"

# Filter by tag
letta-switch agents --tag production

# JSON output
letta-switch agents --json
```

### `letta-switch profiles`

List all saved profiles:

```bash
# List profiles
letta-switch profiles

# JSON output
letta-switch profiles --json
```

### `letta-switch save <name>`

Save a new profile:

```bash
letta-switch save dev-profile \
  --agent my-agent \
  --model claude-pro-max/claude-opus-4-5 \
  --memory human,persona \
  --description "Development profile"
```

### `letta-switch delete <name>`

Delete a saved profile:

```bash
letta-switch delete dev-profile
```

### `letta-switch favorite <agent>`

Mark an agent as favorite:

```bash
letta-switch favorite my-agent
```

### `letta-switch info <agent>`

Show detailed agent information:

```bash
letta-switch info my-agent

# JSON output
letta-switch info my-agent --json
```

### `letta-switch status`

Show current configuration status:

```bash
letta-switch status

# JSON output
letta-switch status --json
```

## Configuration

### Global Configuration

Configuration is stored in `~/.letta/letta-config.json`:

```json
{
  "version": "1.0",
  "currentProfile": "dev-profile",
  "profiles": {
    "dev-profile": {
      "agent": "my-agent",
      "model": "claude-pro-max/claude-opus-4-5",
      "memoryBlocks": ["human", "persona"],
      "description": "Development profile"
    }
  },
  "agents": [
    {
      "id": "agent-123",
      "name": "my-agent",
      "description": "My custom agent",
      "created": "2025-01-01T00:00:00Z",
      "tags": ["coding"],
      "favorite": true,
      "lastLaunched": "2025-01-02T00:00:00Z"
    }
  ],
  "models": {},
  "filters": {
    "excludePatterns": ["-sleeptime$", "^test-"]
  },
  "lastSync": "2025-01-02T00:00:00Z"
}
```

### Project-Specific Configuration

Create `.letta-switch.json` in your project directory:

```json
{
  "version": "1.0",
  "currentProfile": "project-profile",
  "profiles": {
    "project-profile": {
      "agent": "project-agent",
      "model": "anthropic/claude-3-5-sonnet-20241022",
      "memoryBlocks": ["human", "persona", "project-context"]
    }
  }
}
```

letta-switch will automatically detect and merge project configs with global settings.

### Letta API Authentication

The Letta API key is stored separately in `~/.letta/settings.json`:

```json
{
  "env": {
    "LETTA_API_KEY": "your-api-key-here"
  }
}
```

This is automatically created when you run `letta` for the first time.

## Agent Filtering

By default, letta-switch filters out agents matching these patterns:
- `-sleeptime$` - Agents ending with `-sleeptime`
- `^test-` - Agents starting with `test-`

You can customize filters in your config file:

```json
{
  "filters": {
    "excludePatterns": ["-sleeptime$", "^test-", "^temp-"]
  }
}
```

## Model Support

letta-switch supports all Letta-compatible models:

### Subscription Models (claude-pro-max/*)
```bash
letta-switch my-agent --model claude-pro-max/claude-opus-4-5
letta-switch my-agent --model claude-pro-max/claude-sonnet-4-5
```

### API Models (anthropic/*)
```bash
letta-switch my-agent --model anthropic/claude-3-5-sonnet-20241022
letta-switch my-agent --model anthropic/claude-3-5-haiku-20241022
```

### OpenAI Models
```bash
letta-switch my-agent --model openai/gpt-4-turbo
```

## Memory Blocks

Configure custom memory block combinations:

```bash
# Default memory blocks
letta-switch my-agent --memory human,persona

# Custom blocks
letta-switch my-agent --memory human,persona,context,knowledge

# Save for reuse
letta-switch my-agent --memory human,persona,context --save-as my-memory-profile
```

## Examples

### Development Workflow

```bash
# First time setup
letta-switch sync

# Create development profile
letta-switch coding-agent \
  --model claude-pro-max/claude-opus-4-5 \
  --memory human,persona,code-context \
  --save-as dev

# Use the profile
letta-switch --profile dev
```

### Multiple Projects

```bash
# Project A
cd ~/projects/project-a
cat > .letta-switch.json <<EOF
{
  "version": "1.0",
  "profiles": {
    "project-a": {
      "agent": "project-a-agent",
      "model": "anthropic/claude-3-5-sonnet-20241022",
      "memoryBlocks": ["human", "persona", "project-a-context"]
    }
  },
  "currentProfile": "project-a"
}
EOF

# Project B
cd ~/projects/project-b
cat > .letta-switch.json <<EOF
{
  "version": "1.0",
  "profiles": {
    "project-b": {
      "agent": "project-b-agent",
      "model": "claude-pro-max/claude-opus-4-5",
      "memoryBlocks": ["human", "persona", "project-b-context"]
    }
  },
  "currentProfile": "project-b"
}
EOF

# letta-switch will auto-detect the correct config in each directory
cd ~/projects/project-a && letta-switch  # Uses project-a-agent
cd ~/projects/project-b && letta-switch  # Uses project-b-agent
```

### Favorite Agents

```bash
# Mark agents as favorites for quick access
letta-switch favorite my-main-agent
letta-switch favorite coding-helper

# List agents (favorites shown first with ★)
letta-switch agents
```

## Troubleshooting

### "Letta settings not found"

Run `letta` to authenticate first:
```bash
letta
```

### "LETTA_API_KEY not found in settings"

Check your Letta settings file:
```bash
cat ~/.letta/settings.json
```

Make sure it contains:
```json
{
  "env": {
    "LETTA_API_KEY": "your-api-key"
  }
}
```

### "Agent not found"

Make sure you've synced agents from the API:
```bash
letta-switch sync
letta-switch agents  # Verify agent exists
```

### "Profile not found"

List available profiles:
```bash
letta-switch profiles
```

### API Connection Issues

Test with custom API URL:
```bash
letta-switch sync --api-url https://api.letta.com/v1
```

## Development

### Requirements

- Node.js 18+
- Bun (for development)

### Setup

```bash
# Clone repository
git clone https://github.com/jigonr/letta-switch.git
cd letta-switch

# Install dependencies
bun install

# Build
bun run build

# Test locally
node dist/index.js --help
```

### Project Structure

```
letta-switch/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # Command implementations
│   │   ├── launch.ts         # Launch agent
│   │   ├── sync.ts           # Sync from API
│   │   └── list.ts           # List agents/profiles
│   ├── config/               # Configuration management
│   │   ├── schema.ts         # Zod schemas
│   │   └── manager.ts        # Profile manager
│   ├── agents/               # Agent management
│   │   ├── registry.ts       # Agent registry
│   │   └── filter.ts         # Filtering logic
│   ├── api/                  # API client
│   │   └── client.ts         # Letta API client
│   └── utils/                # Utilities
│       ├── errors.ts         # Error types
│       └── logger.ts         # Logging
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── biome.json
```

### Scripts

```bash
# Build
bun run build

# Lint and format
bun run lint

# Type check
bun run typecheck
```

## Security

- **API keys** are stored separately in `~/.letta/settings.json` (not in config files)
- **File permissions**: settings files are chmod 600 (read/write for owner only)
- **Path validation**: all file paths are validated to prevent traversal attacks
- **API key redaction**: API keys are redacted in logs

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `bun run lint` and `bun run typecheck`
6. Submit a pull request

## License

MIT - see [LICENSE](LICENSE)

## Links

- [GitHub Repository](https://github.com/jigonr/letta-switch)
- [npm Package](https://www.npmjs.com/package/@jigonr/letta-switch)
- [Letta Documentation](https://docs.letta.com)
- [Issue Tracker](https://github.com/jigonr/letta-switch/issues)

## Changelog

### 0.1.0 (2025-01-02)

Initial release:
- Agent management with sync, search, filter, favorites
- Profile system for saving configurations
- Memory block configuration
- Project-specific config detection
- Type-safe with Zod validation
- Support for all Letta-compatible models
