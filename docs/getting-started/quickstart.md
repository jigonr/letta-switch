# Quick Start

## 1. Set Up Letta API Key

letta-switch uses your existing Letta CLI configuration. If you haven't already, set up your API key:

```bash
letta config
```

## 2. Sync Agents

Fetch your agents from the Letta API:

```bash
letta-switch sync
```

This caches agent information locally for faster access.

## 3. List Agents

View available agents:

```bash
letta-switch agents
```

Search by name:

```bash
letta-switch agents --search "dev"
```

## 4. Launch an Agent

```bash
letta-switch my-agent
```

With specific memory blocks:

```bash
letta-switch my-agent --memory human,persona,project
```

## 5. Save a Profile

Save your configuration for reuse:

```bash
letta-switch save dev-profile --agent my-agent --memory human,persona
```

Or save while launching:

```bash
letta-switch my-agent --memory human,persona --save-as dev-profile
```

## 6. Use a Profile

Launch using a saved profile:

```bash
letta-switch --profile dev-profile
```

## 7. Check Status

View your current configuration:

```bash
letta-switch status
```

## Next Steps

- [Agent Management](../guide/agents.md) - Sync, search, and favorite agents
- [Profile Management](../guide/profiles.md) - Create and manage profiles
- [Configuration](../guide/configuration.md) - Customize settings
- [CLI Reference](../reference/cli.md) - Complete command reference
