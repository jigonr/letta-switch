# Commands

## Launch Agent (Default)

```bash
letta-switch [agent] [options]
```

Launches an agent with optional memory configuration. When run without
arguments, shows the current profile status.

### Options

| Option                   | Description                                |
| ------------------------ | ------------------------------------------ |
| `--profile <name>`       | Use a saved profile                        |
| `--memory <blocks>`      | Memory blocks to include (comma-separated) |
| `--init-blocks <blocks>` | Init blocks to include (comma-separated)   |
| `--base-tools <tools>`   | Base tools to include (comma-separated)    |
| `--save-as <name>`       | Save configuration as a new profile        |
| `--json`                 | Output in JSON format                      |

### Examples

```bash
# Launch agent with default settings
letta-switch my-agent

# Launch with custom memory blocks
letta-switch my-agent --memory human,persona,project

# Launch using a saved profile
letta-switch --profile dev-profile

# Launch and save as new profile
letta-switch my-agent --memory human,persona --save-as dev-profile
```

## sync

Sync agents from the Letta API.

```bash
letta-switch sync [--api-url <url>]
```

Fetches all agents associated with your Letta account and caches them locally in
`~/.letta/letta-config.json`.

## agents

List available agents. Alias: `list`

```bash
letta-switch agents [options]
```

### Options

| Option             | Description                          |
| ------------------ | ------------------------------------ |
| `--json`           | Output in JSON format                |
| `--search <query>` | Search agents by name or description |
| `--tag <tag>`      | Filter by tag                        |

### Examples

```bash
# List all agents
letta-switch agents

# Search by name
letta-switch agents --search "dev"

# Filter by tag
letta-switch agents --tag production
```

## profiles

List all saved profiles.

```bash
letta-switch profiles [--json]
```

## save

Save a configuration as a named profile.

```bash
letta-switch save <name> --agent <agent> --memory <blocks> [--description <desc>]
```

### Examples

```bash
# Save a profile
letta-switch save dev-profile --agent my-agent --memory human,persona

# Save with description
letta-switch save research --agent research-agent --memory human,persona --description "Research configuration"
```

## delete

Delete a saved profile.

```bash
letta-switch delete <name>
```

## favorite

Set an agent as favorite for quick access.

```bash
letta-switch favorite <agent>
```

## info

Show detailed agent information.

```bash
letta-switch info <agent> [--json]
```

Displays: ID, description, created date, tags, favorite status, last launched
time, and available memory blocks.

## status

Show current configuration status.

```bash
letta-switch status [--json]
```

Displays: current profile, total agents count, total profiles count, and last
sync time.
