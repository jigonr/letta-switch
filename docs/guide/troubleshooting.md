# Troubleshooting

## Common Issues

### "Agent not found"

**Cause**: Agent not synced or name misspelled.

**Solution**: Sync agents and check the name:

```bash
letta-switch sync
letta-switch list
```

### "Authentication failed"

**Cause**: Invalid or missing Letta API key.

**Solution**: Set your API key:

```bash
export LETTA_API_KEY="your-api-key"
```

Or authenticate via Letta CLI:

```bash
letta auth
```

### "Profile not found"

**Cause**: Profile doesn't exist or was deleted.

**Solution**: List available profiles:

```bash
letta-switch profiles list
```

### Sync not updating

**Cause**: Cached data not refreshed.

**Solution**: Force sync:

```bash
letta-switch sync --force
```

### Project config not detected

**Cause**: `.letta-switch.json` not in current directory.

**Solution**: Ensure the file exists in your project root:

```bash
ls -la .letta-switch.json
```

## Debug Mode

Check configuration:

```bash
cat ~/.config/letta-switch/config.json
cat ~/.config/letta-switch/agents.json
```

## Getting Help

- [GitHub Issues](https://github.com/jigonr/letta-switch/issues)
- [Documentation](https://jigonzalez.com/letta-switch/)
