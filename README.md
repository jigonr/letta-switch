# letta-switch

> Comprehensive configuration manager for Letta CLI

Manage agents, models, and memory blocks for [Letta CLI](https://github.com/letta-ai/letta) with profiles and project-aware configurations.

[![CI](https://github.com/jigonr/letta-switch/workflows/CI/badge.svg)](https://github.com/jigonr/letta-switch/actions)
[![codecov](https://codecov.io/gh/jigonr/letta-switch/branch/main/graph/badge.svg)](https://codecov.io/gh/jigonr/letta-switch)
[![GitHub Packages](https://img.shields.io/badge/npm-GitHub%20Packages-blue)](https://github.com/jigonr/letta-switch/packages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

📚 **[Documentation](https://jigonzalez.com/letta-switch/)**

## Features

- **🤖 Agent Management** - Sync, search, filter, and favorite agents from Letta API
- **📋 Profile System** - Save and reuse agent+model+memory configurations
- **🧠 Memory Blocks** - Configure custom memory block combinations
- **📁 Project-Aware** - Auto-detect `.letta-switch.json` in projects
- **🛡️ Type-Safe** - Built with TypeScript, Zod validation, and strict types
- **🔄 Model Support** - Works with all Letta-supported models

## Installation

First, configure npm for GitHub Packages:

```bash
echo "@jigonr:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

Then install with Bun (recommended):

```bash
bun add -g @jigonr/letta-switch
```

Or with npm:

```bash
npm install -g @jigonr/letta-switch
```

## Quick Start

```bash
# Sync agents from Letta API
letta-switch sync

# List available agents
letta-switch list

# Launch an agent
letta-switch my-agent --model claude-pro-max/claude-sonnet-4

# Save a profile
letta-switch my-agent --model claude-pro-max/claude-sonnet-4 --memory human,persona --save-as dev-profile

# Launch using a profile
letta-switch --profile dev-profile
```

## Documentation

For full documentation, visit **[jigonzalez.com/letta-switch](https://jigonzalez.com/letta-switch/)**.

- [Installation](https://jigonzalez.com/letta-switch/getting-started/installation/)
- [Quick Start](https://jigonzalez.com/letta-switch/getting-started/quickstart/)
- [Commands](https://jigonzalez.com/letta-switch/guide/commands/)
- [Profiles](https://jigonzalez.com/letta-switch/guide/profiles/)
- [Agents](https://jigonzalez.com/letta-switch/guide/agents/)
- [Memory Blocks](https://jigonzalez.com/letta-switch/guide/memory/)

## Development

```bash
git clone https://github.com/jigonr/letta-switch.git
cd letta-switch
bun install
bun run dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © [J.I. Gonzalez-Rojas](https://github.com/jigonr)

## Related Projects

- [claude-switch](https://github.com/jigonr/claude-switch) - API provider switcher for Claude Code CLI
