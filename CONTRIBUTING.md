# Contributing to clauderc

First off, thank you for considering contributing to clauderc! It's people like you that make this tool better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, Node version, etc.)
- **Include any error messages or logs**

### Suggesting Features

Feature suggestions are welcome! When suggesting a feature:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed feature**
- **Explain why this feature would be useful**
- **Include examples of how it would be used**

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple issues perfect for newcomers
- `help wanted` - Issues where we'd love community help
- `documentation` - Help improve our docs

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the setup instructions** below
3. **Make your changes** with clear, descriptive commits
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Submit your PR** with a clear description

## Development Setup

### Prerequisites

- Node.js >= 16.7.0
- Git

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/clauderc.git
cd clauderc

# Create a branch for your changes
git checkout -b feature/your-feature-name

# Run tests
npm test

# Test the CLI locally
npm run dev init --dry-run
npm run dev project --dry-run
```

### Testing Your Changes

```bash
# Run unit tests
npm test

# Test CLI commands
npm run test:cli

# Manual testing
node bin/cli.js init --dry-run
node bin/cli.js project --dry-run
node bin/cli.js list
```

## Project Structure

```
clauderc/
├── bin/
│   └── cli.js              # CLI entry point
├── src/
│   ├── detector.js         # Stack detection logic
│   ├── project.js          # Project setup logic
│   └── stacks.js           # Stack configurations
├── templates/
│   ├── agents/             # Agent templates
│   ├── commands/           # Command templates
│   ├── skills/             # Skill templates
│   └── project-setup/      # Project setup templates
└── test/
    └── test-detector.js    # Tests
```

### Key Files

| File | Purpose |
|------|---------|
| `src/detector.js` | Detects project stack, framework, package manager |
| `src/stacks.js` | Stack-specific configurations and templates |
| `src/project.js` | Project setup wizard logic |
| `templates/` | All Claude Code templates |

## Style Guidelines

### Code Style

- Use ES modules (`import`/`export`)
- Use `const` and `let`, avoid `var`
- Use template literals for strings with variables
- Add JSDoc comments for functions
- Keep functions small and focused

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for Deno projects
fix: correct detection of pnpm workspaces
docs: update README with new commands
refactor: simplify stack detection logic
test: add tests for Ruby detection
```

### Adding New Features

#### Adding a New Stack

1. Add detection logic in `src/detector.js`
2. Add stack configuration in `src/stacks.js`
3. Add tests in `test/test-detector.js`
4. Update README with new stack

#### Adding a New Command

1. Create `templates/commands/your-command.md`
2. Add to `templates/manifest.json`
3. Document in README

#### Adding a New Agent/Skill

1. Create in `templates/agents/` or `templates/skills/`
2. Add to `templates/manifest.json`
3. Document usage in README

## Community

- **Issues**: [GitHub Issues](https://github.com/matheuskindrazki/clauderc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/matheuskindrazki/clauderc/discussions)

## Recognition

Contributors will be recognized in:
- The project README
- Release notes when their contributions are included

Thank you for contributing! 🎉
