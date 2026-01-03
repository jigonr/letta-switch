# Installation

## Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Letta CLI**: Must be installed and authenticated
- **Letta API Key**: Required for agent sync

## Install with Bun (Recommended)

```bash
bun add -g @jigonr/letta-switch
```

## Install with npm

```bash
npm install -g @jigonr/letta-switch
```

## Verify Installation

```bash
letta-switch --version
```

## Authentication

Ensure you have a valid Letta API key:

```bash
export LETTA_API_KEY="your-api-key"
```

Or authenticate via Letta CLI:

```bash
letta auth
```

## Uninstall

```bash
# With Bun
bun remove -g @jigonr/letta-switch

# With npm
npm uninstall -g @jigonr/letta-switch
```
