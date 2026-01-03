# Quick Start

## 1. Sync Agents

First, sync your agents from the Letta API:

```bash
letta-switch sync
```

This fetches all agents associated with your account.

## 2. List Agents

View available agents:

```bash
letta-switch list
```

Filter by name:

```bash
letta-switch list --filter "dev"
```

## 3. Launch an Agent

```bash
letta-switch my-agent
```

With a specific model:

```bash
letta-switch my-agent --model claude-pro-max/claude-sonnet-4
```

## 4. Save a Profile

Save your current configuration as a reusable profile:

```bash
letta-switch my-agent --model claude-pro-max/claude-sonnet-4 --memory human,persona --save-as dev-profile
```

## 5. Use a Profile

Launch using a saved profile:

```bash
letta-switch --profile dev-profile
```

## Next Steps

- Learn about [Profiles](../guide/profiles.md)
- Manage [Agents](../guide/agents.md)
- Configure [Memory Blocks](../guide/memory.md)
