# Configuration

## Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| Global config | `~/.config/letta-switch/config.json` | Global settings |
| Agents cache | `~/.config/letta-switch/agents.json` | Cached agent data |
| Profiles | `~/.config/letta-switch/profiles.json` | Saved profiles |
| Project config | `.letta-switch.json` | Project-specific settings |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LETTA_API_KEY` | Letta API key for authentication |
| `LETTA_BASE_URL` | Custom Letta API base URL (optional) |

## Project Configuration

Create `.letta-switch.json` in your project root:

```json
{
  "agent": "my-agent",
  "model": "claude-pro-max/claude-sonnet-4",
  "memory": ["human", "persona", "project"]
}
```

## Global Configuration

Edit `~/.config/letta-switch/config.json`:

```json
{
  "defaultModel": "claude-pro-max/claude-sonnet-4",
  "defaultMemory": ["human", "persona"],
  "syncInterval": 3600
}
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `defaultModel` | string | Default model for all agents |
| `defaultMemory` | array | Default memory blocks |
| `syncInterval` | number | Auto-sync interval in seconds (0 to disable) |
