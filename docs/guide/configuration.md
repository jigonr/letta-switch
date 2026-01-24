# Configuration

## Configuration Files

| File           | Location                     | Purpose                              |
| -------------- | ---------------------------- | ------------------------------------ |
| Main config    | `~/.letta/letta-config.json` | Agents, profiles, and settings       |
| Letta settings | `~/.letta/settings.json`     | Letta API key (managed by Letta CLI) |
| Project config | `.letta-switch.json`         | Project-specific settings            |

## Main Configuration

The main configuration file `~/.letta/letta-config.json` contains:

```json
{
  "version": "1.0",
  "currentProfile": "default",
  "profiles": {
    "default": {
      "agent": "my-agent",
      "memoryBlocks": ["human", "persona"],
      "description": "Default profile"
    }
  },
  "agents": [],
  "filters": {
    "excludePatterns": ["-sleeptime$", "^test-"]
  },
  "lastSync": "2024-01-01T00:00:00.000Z"
}
```

### Fields

| Field                     | Description                                   |
| ------------------------- | --------------------------------------------- |
| `version`                 | Configuration schema version (always "1.0")   |
| `currentProfile`          | Currently active profile name                 |
| `profiles`                | Named profile configurations                  |
| `agents`                  | Cached agent data from Letta API              |
| `filters.excludePatterns` | Regex patterns to exclude agents from listing |
| `lastSync`                | Last sync timestamp                           |

## Project Configuration

Create `.letta-switch.json` in your project root:

```json
{
  "profile": "dev-profile",
  "agent": "my-agent",
  "memoryBlocks": ["human", "persona", "project"],
  "inherits": "default"
}
```

| Field          | Description                             |
| -------------- | --------------------------------------- |
| `profile`      | Named profile to use                    |
| `agent`        | Agent name (overrides profile)          |
| `memoryBlocks` | Memory blocks (overrides profile)       |
| `inherits`     | Parent profile to inherit settings from |

## API Key

letta-switch uses the API key from `~/.letta/settings.json`, which is managed by
the Letta CLI. Run `letta config` to set up your API key.
