# Profiles

Profiles save agent+memory configurations for quick reuse.

## Creating a Profile

Save your current launch configuration:

```bash
letta-switch my-agent \
  --memory human,persona,project \
  --save-as my-profile
```

## Using a Profile

Launch with a saved profile:

```bash
letta-switch --profile my-profile
```

## Listing Profiles

```bash
letta-switch profiles list
```

## Profile Details

```bash
letta-switch profiles show my-profile
```

## Deleting a Profile

```bash
letta-switch profiles delete my-profile
```

## Profile Storage

Profiles are stored in `~/.config/letta-switch/profiles.json`.

## Project-Specific Profiles

Create a `.letta-switch.json` in your project root:

```json
{
  "agent": "project-agent",
  "memoryBlocks": ["human", "persona", "project"]
}
```

This configuration is automatically used when running `letta-switch` in that directory.
