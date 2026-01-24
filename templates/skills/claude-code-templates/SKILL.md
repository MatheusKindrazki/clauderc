# Claude Code Templates Skill

Quick access to templates for setting up Claude Code in projects.

## When to Use

- Creating CLAUDE.md for a project
- Setting up slash commands
- Creating custom skills
- Adding subagents to a project

## Quick Reference

### CLAUDE.md Structure

```markdown
# Project Name

## Stack
- Language: X
- Framework: Y
- Package Manager: Z

## Commands
\`\`\`bash
# Dev
npm run dev

# Test
npm test

# Build
npm run build
\`\`\`

## Code Style
- [Key conventions]

## Workflow
- Plan Mode for: refactors, new features, architecture
- Always verify before commit

## Docs
@README.md
@docs/architecture.md
```

**Keep under 100 lines. Link to detailed docs with @imports.**

---

### Slash Command Template

Location: `.claude/commands/<name>.md`

```markdown
# Command description in one line

## What it does
1. Step one
2. Step two

## Implementation
\`\`\`bash
your-command-here
\`\`\`
```

---

### Skill Template

Location: `.claude/skills/<name>/SKILL.md`

```markdown
# Skill Name

Brief description.

## When to Use
- Scenario 1
- Scenario 2

## Workflow
1. Step one
2. Step two

## Checklist
- [ ] Item 1
- [ ] Item 2
```

---

### Subagent Template

Location: `.claude/agents/<name>.md`

```markdown
---
name: agent-name
description: One-line description
model: inherit
---

You are a [ROLE].

## Responsibilities
1. Task one
2. Task two

## Output Format
[How to structure output]
```

---

### settings.json Template

Location: `.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(git:*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": ["npm run lint --fix || true"]
      }
    ]
  }
}
```

---

## Stack-Specific Templates

### Node.js/TypeScript

**CLAUDE.md commands:**
```bash
# Dev
npm run dev

# Test
npm test

# Lint
npm run lint

# Build
npm run build

# Verify
npm run lint && npm test && npm run build
```

**settings.json hooks:**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": ["npx eslint --fix ${file} || true"]
    }]
  }
}
```

### Python

**CLAUDE.md commands:**
```bash
# Dev
python -m uvicorn app.main:app --reload

# Test
pytest

# Lint
ruff check --fix .

# Type Check
mypy .

# Verify
ruff check . && mypy . && pytest
```

**settings.json hooks:**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": ["ruff format ${file} || true"]
    }]
  }
}
```

### Go

**CLAUDE.md commands:**
```bash
# Dev
go run ./cmd/server

# Test
go test ./...

# Lint
golangci-lint run

# Build
go build ./...

# Verify
golangci-lint run && go test ./... && go build ./...
```

### Rust

**CLAUDE.md commands:**
```bash
# Dev
cargo run

# Test
cargo test

# Lint
cargo clippy

# Format
cargo fmt

# Verify
cargo fmt --check && cargo clippy && cargo test && cargo build
```

---

## Full Templates Location

For complete templates with examples, see:
`~/.claude/templates/project-setup/`

- `CLAUDE_MD_TEMPLATE.md` - Full CLAUDE.md template
- `COMMANDS_TEMPLATE.md` - All standard commands
- `SKILLS_TEMPLATE.md` - Skill examples
- `AGENTS_TEMPLATE.md` - Subagent examples
- `TEAM_DOCS_TEMPLATE.md` - Team documentation
