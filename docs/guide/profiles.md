# Profiles

Profiles save agent + memory block configurations for quick reuse.

## Creating a Profile

### Method 1: Using save command

```bash
letta-switch save my-profile --agent my-agent --memory human,persona
```

With description:

```bash
letta-switch save my-profile --agent my-agent --memory human,persona --description "Development profile"
```

### Method 2: Using --save-as when launching

```bash
letta-switch my-agent --memory human,persona,project --save-as my-profile
```

## Using a Profile

Launch with a saved profile:

```bash
letta-switch --profile my-profile
```

## Listing Profiles

```bash
letta-switch profiles
```

JSON output:

```bash
letta-switch profiles --json
```

## Deleting a Profile

```bash
letta-switch delete my-profile
```

## Profile Storage

Profiles are stored in `~/.letta/letta-config.json` under the `profiles` key.

## Project-Specific Configuration

Create a `.letta-switch.json` in your project root:

```json
{
  "profile": "dev-profile",
  "agent": "project-agent",
  "memoryBlocks": ["human", "persona", "project"],
  "inherits": "default"
}
```

| Field          | Description                    |
| -------------- | ------------------------------ |
| `profile`      | Named profile to use           |
| `agent`        | Agent name override            |
| `memoryBlocks` | Memory blocks override         |
| `inherits`     | Parent profile to inherit from |

This configuration is automatically detected when running `letta-switch` in that
directory.
