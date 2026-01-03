# Commands

## Default Command (Launch Agent)

```bash
letta-switch [agent] [options]
```

Launches an agent with optional model and memory configuration.

### Options

| Option | Description |
|--------|-------------|
| `--model`, `-m` | Model to use (e.g., `claude-pro-max/claude-sonnet-4`) |
| `--memory` | Memory blocks to include (comma-separated) |
| `--profile`, `-p` | Use a saved profile |
| `--save-as` | Save configuration as a new profile |

## sync

Sync agents from the Letta API.

```bash
letta-switch sync
```

Fetches all agents associated with your Letta account and caches them locally.

## list

List available agents.

```bash
letta-switch list [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--filter`, `-f` | Filter agents by name |
| `--favorites` | Show only favorited agents |
| `--all` | Show all agents (including archived) |

## profiles

Manage saved profiles.

```bash
letta-switch profiles [subcommand]
```

### Subcommands

- `list` - List all saved profiles
- `show <name>` - Show profile details
- `delete <name>` - Delete a profile

## favorite

Toggle favorite status for an agent.

```bash
letta-switch favorite <agent>
```
