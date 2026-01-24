# Agents

## Syncing Agents

Fetch agents from the Letta API:

```bash
letta-switch sync
```

This caches agent information locally in `~/.letta/letta-config.json` for faster
access.

To use a custom API URL:

```bash
letta-switch sync --api-url https://custom-letta.example.com
```

## Listing Agents

View all synced agents:

```bash
letta-switch agents
```

Or use the alias:

```bash
letta-switch list
```

### Searching

Search by name or description:

```bash
letta-switch agents --search "dev"
```

### Filtering by Tag

```bash
letta-switch agents --tag production
```

### JSON Output

```bash
letta-switch agents --json
```

## Agent Information

View detailed information about an agent:

```bash
letta-switch info my-agent
```

Output includes:

- Agent ID
- Description
- Created date
- Tags
- Favorite status
- Last launched time
- Available memory blocks

## Launching an Agent

```bash
letta-switch <agent-name>
```

With specific memory blocks:

```bash
letta-switch my-agent --memory human,persona,project
```

With init blocks:

```bash
letta-switch my-agent --init-blocks setup,context
```

With base tools:

```bash
letta-switch my-agent --base-tools web_search,calculator
```

## Favoriting Agents

Mark frequently-used agents as favorites:

```bash
letta-switch favorite my-agent
```

Favorite agents appear with a star marker in the agents list.

## Agent Storage

Agent information is stored in `~/.letta/letta-config.json`.
