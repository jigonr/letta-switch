# Agents

## Syncing Agents

Fetch agents from the Letta API:

```bash
letta-switch sync
```

This caches agent information locally for faster access.

## Listing Agents

View all synced agents:

```bash
letta-switch list
```

### Filtering

Filter by name:

```bash
letta-switch list --filter "dev"
```

Show only favorites:

```bash
letta-switch list --favorites
```

## Launching an Agent

```bash
letta-switch <agent-name>
```

With a specific model:

```bash
letta-switch my-agent --model anthropic/claude-3-opus
```

## Favoriting Agents

Mark frequently-used agents as favorites:

```bash
letta-switch favorite my-agent
```

Toggle off:

```bash
letta-switch favorite my-agent
```

## Agent Cache

Agent information is cached in `~/.config/letta-switch/agents.json`.

Force refresh:

```bash
letta-switch sync --force
```
