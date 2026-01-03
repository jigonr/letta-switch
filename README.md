# letta-switch

> Comprehensive configuration manager for Letta CLI

[![CI](https://github.com/jigonr/letta-switch/workflows/CI/badge.svg)](https://github.com/jigonr/letta-switch/actions)
[![codecov](https://codecov.io/gh/jigonr/letta-switch/branch/main/graph/badge.svg)](https://codecov.io/gh/jigonr/letta-switch)
[![Docs](https://img.shields.io/badge/docs-jigonzalez.com-blue)](https://jigonzalez.com/letta-switch/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **🤖 Agent Management** - Sync, search, filter, and favorite agents
- **📋 Profile System** - Save and reuse configurations
- **🧠 Memory Blocks** - Configure custom memory block combinations
- **📁 Project-Aware** - Auto-detect `.letta-switch.json` in projects
- **⚡ Fast** - Built with Bun and TypeScript

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
letta-switch list                    # List available agents
letta-switch my-agent                # Launch an agent
letta-switch --profile dev-profile   # Launch using a profile
```

## Development

```bash
git clone https://github.com/jigonr/letta-switch.git
cd letta-switch
bun install
bun run dev
```

## License

MIT © [J.I. Gonzalez-Rojas](https://github.com/jigonr)

## Related

- [claude-switch](https://github.com/jigonr/claude-switch) - API provider switcher for Claude Code CLI
