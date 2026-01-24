# Claude Code Setup

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
  <img src="https://img.shields.io/npm/v/claude-code-setup?color=blue" alt="npm version">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey" alt="platform">
  <img src="https://img.shields.io/badge/node-%3E%3D16.7-green" alt="node version">
</p>

---

Based on tips from [Boris Cherny](https://twitter.com/bcherny) (Claude Code creator) and official documentation.

## Quick Start

```bash
# First time install
npx claude-code-setup init

# Update to latest version
npx claude-code-setup update

# Check what's installed
npx claude-code-setup list
```

Works on **macOS**, **Linux**, and **Windows**.

## What Gets Installed

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
    ├── CLAUDE_MD_TEMPLATE.md
    ├── COMMANDS_TEMPLATE.md
    ├── SKILLS_TEMPLATE.md
    ├── AGENTS_TEMPLATE.md
    └── TEAM_DOCS_TEMPLATE.md
```

## Commands

### init

Install all components to `~/.claude/`:

```bash
npx claude-code-setup init

# Force overwrite existing files
npx claude-code-setup init --force

# Preview changes without applying
npx claude-code-setup init --dry-run
```

### update

Update to the latest version:

```bash
npx claude-code-setup update

# Preview what would be updated
npx claude-code-setup update --dry-run
```

Features:
- ✅ Automatic backup of modified files
- ✅ Shows changelog between versions
- ✅ Only updates files that changed
- ✅ Marks deprecated files (doesn't delete)

### list

Show installed components and version:

```bash
npx claude-code-setup list
```

### changelog

Show version history:

```bash
npx claude-code-setup changelog
```

## Usage in Claude Code

After installation, use these in Claude Code:

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
"Use claude-code-templates skill to see template examples"
```

## Customization

After installation, customize files in `~/.claude/`:

- **Add project-specific commands**: Create `.claude/commands/` in your project
- **Add project-specific agents**: Create `.claude/agents/` in your project
- **Share with team**: Commit `.claude/` directory to your repo

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
- Twitter: [@maikiemedia](https://twitter.com/maikiemedia)

## License

MIT

---

<p align="center">
  <strong>⭐ If this helped you, consider giving it a star!</strong>
</p>
