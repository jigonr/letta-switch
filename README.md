# letta-switch

> Configuration manager for Letta CLI agents and memory blocks

[![CI](https://github.com/jigonr/letta-switch/workflows/CI/badge.svg)](https://github.com/jigonr/letta-switch/actions)
[![codecov](https://codecov.io/gh/jigonr/letta-switch/branch/main/graph/badge.svg)](https://codecov.io/gh/jigonr/letta-switch)
[![Docs](https://img.shields.io/badge/docs-jigonzalez.com-blue)](https://jigonzalez.com/letta-switch/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Agent Management** - Sync, search, filter, and favorite agents
- **Profile System** - Save and reuse agent + memory configurations
- **Memory Blocks** - Configure custom memory block combinations
- **Project-Aware** - Auto-detect `.letta-switch.json` in projects

## Installation

```bash
# Using Bun (recommended)
bun add -g @jigonr/letta-switch

# Using npm
npm install -g @jigonr/letta-switch
```

## Quick Start

```bash
letta-switch sync                    # Sync agents from Letta API
letta-switch agents                  # List available agents
letta-switch my-agent                # Launch an agent
letta-switch --profile dev-profile   # Launch using a profile
```

## Commands

| Command | Description |
|---------|-------------|
| `letta-switch [agent]` | Launch an agent (default) |
| `letta-switch sync` | Sync agents from Letta API |
| `letta-switch agents` | List all agents |
| `letta-switch profiles` | List all profiles |
| `letta-switch save <name>` | Save a new profile |
| `letta-switch delete <name>` | Delete a profile |
| `letta-switch favorite <agent>` | Set agent as favorite |
| `letta-switch info <agent>` | Show agent details |
| `letta-switch status` | Show current configuration |

## Documentation

Full documentation available at **[jigonzalez.com/letta-switch](https://jigonzalez.com/letta-switch/)**

- [Quick Start](https://jigonzalez.com/letta-switch/getting-started/quickstart/)
- [Agents](https://jigonzalez.com/letta-switch/guide/agents/)
- [Profiles](https://jigonzalez.com/letta-switch/guide/profiles/)
- [CLI Reference](https://jigonzalez.com/letta-switch/reference/cli/)

## Development

```bash
git clone https://github.com/jigonr/letta-switch.git
cd letta-switch
bun install
bun run dev
```

## License

MIT
