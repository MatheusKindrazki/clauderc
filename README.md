# clauderc

<p align="center">
  <strong>Setup Claude Code with best practices - agents, skills, commands, and templates.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#what-gets-installed">What's Included</a> •
  <a href="#commands">Commands</a> •
  <a href="#best-practices">Best Practices</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/clauderc?color=blue" alt="npm version">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey" alt="platform">
  <img src="https://img.shields.io/badge/node-%3E%3D16.7-green" alt="node version">
</p>

---

Based on my experiences and tips from [ Boris Cherny ](https://twitter.com/bcherny) (creator of the Claude Code) and official documentation.

## Quick Start

```bash
# Global setup (agents, skills, commands, templates)
npx clauderc init

# Project setup (CLAUDE.md, .claude/, settings)
npx clauderc project

# Update to latest version
npx clauderc update
```

Works on **macOS**, **Linux**, and **Windows**.

## Two-Level Setup

### Global (`~/.claude/`)

Shared components available to all projects:

```bash
npx clauderc init
```

```
~/.claude/
├── agents/
│   └── project-setup-wizard.md    # Setup Claude Code for any project
├── skills/
│   ├── project-analysis/          # Systematic project analysis
│   └── claude-code-templates/     # Quick reference for templates
├── commands/
│   ├── test.md                    # /test - run tests
│   ├── lint.md                    # /lint - lint and format
│   ├── verify.md                  # /verify - full validation
│   ├── pr.md                      # /pr - create pull request
│   └── setup.md                   # /setup - install dependencies
└── templates/project-setup/
    └── ...                        # Reference templates
```

### Project (`.claude/` + `CLAUDE.md`)

Project-specific configuration:

```bash
cd your-project
npx clauderc project
```

```
your-project/
├── CLAUDE.md                      # Project context for Claude
└── .claude/
    ├── settings.json              # Permissions & hooks
    └── commands/                  # Project-specific commands
        ├── dev.md
        ├── test.md
        ├── lint.md
        └── ...
```

## Supported Stacks

Auto-detection for 11+ languages:

| Stack | Detection | Package Managers |
|-------|-----------|------------------|
| Node.js/TypeScript | `package.json` | npm, pnpm, yarn, bun |
| Python | `pyproject.toml`, `requirements.txt` | poetry, pipenv, uv, pip |
| Go | `go.mod` | go mod |
| Rust | `Cargo.toml` | cargo |
| Java/Kotlin | `pom.xml`, `build.gradle` | maven, gradle |
| PHP | `composer.json` | composer |
| Ruby | `Gemfile` | bundler |
| C#/.NET | `*.csproj`, `*.sln` | dotnet |
| Elixir | `mix.exs` | mix |
| Swift | `Package.swift` | swift |
| Dart/Flutter | `pubspec.yaml` | pub, flutter |

Also detects: Monorepos (Turborepo, Nx, Lerna), CI/CD (GitHub Actions, GitLab CI, etc.)

## Commands

### init

Install global components to `~/.claude/`:

```bash
npx clauderc init

# Force overwrite existing files
npx clauderc init --force

# Preview changes without applying
npx clauderc init --dry-run
```

### project

Setup current project with interactive wizard:

```bash
npx clauderc project
```

Features:
- Auto-detects stack, package manager, framework
- Generates appropriate `CLAUDE.md`
- Creates `.claude/settings.json` with permissions
- Creates project-specific commands

### update

Update global components to latest version:

```bash
npx clauderc update

# Preview what would be updated
npx clauderc update --dry-run
```

Features:
- Automatic backup of modified files
- Shows changelog between versions
- Only updates files that changed

### list

Show installed components:

```bash
npx clauderc list
```

### changelog

Show version history:

```bash
npx clauderc changelog
```

## Usage in Claude Code

After installation:

```bash
# Setup wizard for any project
"Use the project-setup-wizard agent to configure Claude Code for this project"

# Quick commands
/test      # Run project tests
/lint      # Lint and format code
/verify    # Full verification (lint + test + build)
/pr        # Create a pull request
/setup     # Install dependencies

# Skills
"Use project-analysis skill to analyze this codebase"
```

## Best Practices (from Boris Cherny)

1. **Multiple instances** - Run 5+ Claudes in parallel for independent tasks
2. **Opus 4.5 with thinking** - Best model for coding, faster overall
3. **Shared CLAUDE.md** - Team commits and updates regularly
4. **Plan Mode** - Use for complex tasks (Shift+Tab twice)
5. **Slash commands** - Automate repetitive workflows
6. **PostToolUse hooks** - Auto-format code after edits
7. **Permissions** - Pre-authorize safe commands instead of `--dangerously-skip-permissions`
8. **Feedback loop** - Give Claude a way to verify its work

## Contributing

Contributions are welcome! Feel free to:
- Add new commands, skills, or agents
- Improve existing templates
- Report issues or suggest features

## Author

**Matheus Kindrazki**

- GitHub: [@matheuskindrazki](https://github.com/matheuskindrazki)
- Twitter: [@kindraScript](https://x.com/kindraScript)

## License

MIT

---

<p align="center">
  <strong>⭐ If this helped you, consider giving it a star!</strong>
</p>
