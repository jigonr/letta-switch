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

| Option | Short | Description |
|--------|-------|-------------|
| `--model` | `-m` | Model to use |
| `--memory` | | Memory blocks (comma-separated) |
| `--profile` | `-p` | Use saved profile |
| `--save-as` | | Save as new profile |

### sync

```bash
letta-switch sync [options]
```

| Option | Description |
|--------|-------------|
| `--force` | Force refresh cache |

### list

```bash
letta-switch list [options]
```

| Option | Short | Description |
|--------|-------|-------------|
| `--filter` | `-f` | Filter by name |
| `--favorites` | | Show only favorites |
| `--all` | | Include archived |

### profiles

```bash
letta-switch profiles <subcommand>
```

Subcommands: `list`, `show <name>`, `delete <name>`

### favorite

```bash
letta-switch favorite <agent>
```

## Global Options

| Option | Description |
|--------|-------------|
| `--version`, `-v` | Show version |
| `--help`, `-h` | Show help |

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | Error |
