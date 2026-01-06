# Integration Tests

Integration tests verify end-to-end behavior with real file system operations and external dependencies.

## Running Integration Tests

```bash
# Run all tests including integration
bun run test

# Run only integration tests
bun run test -- --dir tests/integration

# Run with real API (requires LETTA_API_KEY)
LETTA_API_KEY=your-key bun run test -- --dir tests/integration
```

## Test Categories

### CLI Integration (`cli.test.ts`)
Tests the full CLI flow including:
- Config file creation and persistence
- Profile save/load cycles
- Command output formatting

### Filesystem Integration (`filesystem.test.ts`)
Tests real file operations:
- Config directory creation
- File permissions
- Concurrent access

### API Integration (`api.test.ts`)
Tests real Letta API interactions:
- Agent sync (requires valid API key)
- Error handling for network failures

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LETTA_API_KEY` | Required for API tests |
| `TEST_SKIP_API` | Set to skip API tests |
| `TEST_TEMP_DIR` | Custom temp directory for tests |

## Writing Integration Tests

Integration tests should:
1. Use real file system (temp directories)
2. Clean up after themselves
3. Be isolated from each other
4. Skip gracefully when dependencies unavailable
