# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4](https://github.com/jigonr/letta-switch/compare/letta-switch-v0.1.3...letta-switch-v0.1.4) (2026-01-04)


### Features

* **ci:** add Claude Code workflows and yamllint config ([a4eae04](https://github.com/jigonr/letta-switch/commit/a4eae04fd27fb382d721109987c961eede2dd314))


### Bug Fixes

* use 'ts' instead of 'typescript' for pre-commit types ([37e6cd5](https://github.com/jigonr/letta-switch/commit/37e6cd56ed918e2501950875edb820fe8f2f91ad))

## [0.1.3](https://github.com/jigonr/letta-switch/compare/letta-switch-v0.1.2...letta-switch-v0.1.3) (2026-01-03)


### Bug Fixes

* read version dynamically from package.json ([d448018](https://github.com/jigonr/letta-switch/commit/d4480182acf2289784da09d96c97a605eccfe938))

## [0.1.2](https://github.com/jigonr/letta-switch/compare/letta-switch-v0.1.1...letta-switch-v0.1.2) (2026-01-03)


### Bug Fixes

* remove prepare script to fix npm publish ([ffbf957](https://github.com/jigonr/letta-switch/commit/ffbf9575fd537b388d9d8e49db897ea1a4da85e0))

## [0.1.1](https://github.com/jigonr/letta-switch/compare/letta-switch-v0.1.0...letta-switch-v0.1.1) (2026-01-03)


### Features

* configure publishing to GitHub Packages ([7d431fd](https://github.com/jigonr/letta-switch/commit/7d431fd4197b0c6f21e35983170832cbc5dd9aa0))


### Bug Fixes

* **ci:** remove invalid yaml document separator from release-please workflow ([993182b](https://github.com/jigonr/letta-switch/commit/993182b8bad6d586606ab34a8e4a3754b29d764b))

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
