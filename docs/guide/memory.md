# Memory Blocks

Memory blocks configure what context is available to an agent.

## Available Memory Blocks

| Block | Description |
|-------|-------------|
| `human` | Information about the user |
| `persona` | Agent's personality and behavior |
| `project` | Current project context |
| `skills` | Available skills |
| `loaded_skills` | Currently loaded skills |

## Specifying Memory Blocks

Use the `--memory` flag with comma-separated block names:

```bash
letta-switch my-agent --memory human,persona
```

## Default Memory Blocks

If not specified, the agent uses its default memory configuration.

## Memory in Profiles

Save memory configuration in a profile:

```bash
letta-switch my-agent \
  --memory human,persona,project \
  --save-as dev-profile
```

## Project Memory

The `project` memory block is automatically populated based on the current working directory when a `.letta-switch.json` file exists.
