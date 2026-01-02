# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-02

### Added

- **Agent Management**
  - Sync agents from Letta API with automatic filtering
  - Search and filter agents by name, tag, or pattern
  - Mark agents as favorites for quick access
  - Track last launched timestamp for each agent
  - Exclude patterns for filtering out system agents

- **Profile System**
  - Save agent + model + memory configurations as profiles
  - Switch between profiles with a single command
  - Project-specific profiles with `.letta-switch.json`
  - Global profiles at `~/.letta/letta-config.json`

- **Launch Command**
  - Launch agents with custom model selection
  - Configure memory blocks per launch
  - Specify init blocks and base tools
  - Save launch configuration as new profile

- **Commands**
  - `letta-switch` - Show current status
  - `letta-switch <agent>` - Launch specified agent
  - `letta-switch sync` - Sync agents from API
  - `letta-switch agents` / `list` - List all agents
  - `letta-switch profiles` - List saved profiles
  - `letta-switch --profile <name>` - Launch using profile
  - `letta-switch favorite <agent>` - Mark as favorite

- **Model Support**
  - Subscription models: `claude-pro-max/claude-opus-4-5`, etc.
  - API models: `anthropic/claude-3-5-sonnet-20241022`, etc.
  - Custom model specification via `--model` flag

- **Testing Infrastructure**
  - Vitest test framework with 97%+ code coverage
  - Unit tests for registry, commands, filter, API client
  - Codecov integration for coverage reporting
  - Pre-commit hooks for code quality

- **CI/CD**
  - GitHub Actions for linting, type checking, testing
  - Multi-platform testing (Ubuntu, macOS)
  - Multi-Node.js version testing (18, 20, 22)
  - Automated npm publishing on release

### Security

- API keys stored in Letta settings, not in config files
- Path validation to prevent directory traversal attacks
- API key redaction in logs to prevent accidental exposure
