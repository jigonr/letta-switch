# CLI Reference

## Synopsis

```bash
letta-switch [command] [options]
```

## Commands

### Default (Launch Agent)

```bash
letta-switch [agent] [options]
```

Launch an agent or display current profile status.

| Option                   | Description                         |
| ------------------------ | ----------------------------------- |
| `--profile <name>`       | Use saved profile                   |
| `--memory <blocks>`      | Comma-separated memory blocks       |
| `--init-blocks <blocks>` | Comma-separated init blocks         |
| `--base-tools <tools>`   | Comma-separated base tools          |
| `--save-as <name>`       | Save configuration as a new profile |
| `--json`                 | Output in JSON format               |

### sync

Sync agents from Letta API.

```bash
letta-switch sync [options]
```

| Option            | Description          |
| ----------------- | -------------------- |
| `--api-url <url>` | Custom Letta API URL |

### agents

List all synced agents. Alias: `list`

```bash
letta-switch agents [options]
```

| Option             | Description                          |
| ------------------ | ------------------------------------ |
| `--json`           | Output in JSON format                |
| `--search <query>` | Search agents by name or description |
| `--tag <tag>`      | Filter by tag                        |

### profiles

List all saved profiles.

```bash
letta-switch profiles [options]
```

| Option   | Description           |
| -------- | --------------------- |
| `--json` | Output in JSON format |

### save

Save a configuration as a named profile.

```bash
letta-switch save <name> --agent <agent> --memory <blocks> [options]
```

| Option                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `--agent <name>`       | Agent name (required)                    |
| `--memory <blocks>`    | Comma-separated memory blocks (required) |
| `--description <desc>` | Profile description                      |

### delete

Delete a saved profile.

```bash
letta-switch delete <name>
```

### favorite

Set an agent as favorite.

```bash
letta-switch favorite <agent>
```

### info

Show detailed agent information.

```bash
letta-switch info <agent> [options]
```

| Option   | Description           |
| -------- | --------------------- |
| `--json` | Output in JSON format |

### status

Show current configuration status.

```bash
letta-switch status [options]
```

| Option   | Description           |
| -------- | --------------------- |
| `--json` | Output in JSON format |

## Global Options

| Option            | Description  |
| ----------------- | ------------ |
| `--version`, `-V` | Show version |
| `--help`, `-h`    | Show help    |

## Exit Codes

| Code | Description |
| ---- | ----------- |
| 0    | Success     |
| 1    | Error       |
