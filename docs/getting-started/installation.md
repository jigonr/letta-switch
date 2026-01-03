# Installation

## Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Letta CLI**: Must be installed and authenticated
- **Letta API Key**: Required for agent sync

## Install with Bun (Recommended)

First, configure npm to use GitHub Packages for the `@jigonr` scope:

```bash
echo "@jigonr:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

Then install globally:

```bash
bun add -g @jigonr/letta-switch
```

## Alternative: Install with npm

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
bun remove -g @jigonr/letta-switch
```
