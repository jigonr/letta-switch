# letta-switch

**Comprehensive configuration manager for Letta CLI.**

[![CI](https://github.com/jigonr/letta-switch/workflows/CI/badge.svg)](https://github.com/jigonr/letta-switch/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **🤖 Agent Management** - Sync, search, filter, and favorite agents from Letta API
- **📋 Profile System** - Save and reuse agent+model+memory configurations
- **🧠 Memory Blocks** - Configure custom memory block combinations
- **📁 Project-Aware** - Auto-detect `.letta-switch.json` in projects
- **🛡️ Type-Safe** - Built with TypeScript, Zod validation, and strict types

## Quick Start

```bash
# Install with Bun (recommended)
bun add -g @jigonr/letta-switch

# Install with npm
npm install -g @jigonr/letta-switch

# Sync agents from Letta API
letta-switch sync

# List available agents
letta-switch list

# Launch an agent
letta-switch my-agent --model claude-pro-max/claude-sonnet-4
```

## Getting Started

1. [Installation](getting-started/installation.md)
2. [Quick Start](getting-started/quickstart.md)

## License

MIT License - see [LICENSE](https://github.com/jigonr/letta-switch/blob/main/LICENSE) for details.
