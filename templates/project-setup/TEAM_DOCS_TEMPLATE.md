# Team Documentation Templates

## CLAUDE_CODE_GUIDE.md

```markdown
# Claude Code Guide - {{PROJECT_NAME}}

## Quick Start

1. Install: `npm i -g @anthropic-ai/claude-code` (or appropriate method)
2. Run: `cd {{PROJECT_PATH}} && claude`
3. Try: `/test`, `/lint`, `/verify`

## Commands

| Command | Purpose |
|---------|---------|
| `/test` | Run test suite |
| `/lint` | Check code quality |
| `/verify` | Full validation (build + test + lint) |
| `/pr` | Create pull request |

## Workflows

### New Feature
1. Enter Plan Mode (Shift+Tab 2x)
2. Describe feature requirements
3. Approve plan
4. Implement with verification-first approach

### Bug Fix
1. Use: "Investigate bug: [description]"
2. Claude will reproduce, isolate, fix
3. Run `/verify` before committing

### Parallel Work
```bash
claude --worktree feature-a
claude --worktree feature-b
```

## Tips
- Use Plan Mode for changes > 3 files
- Reference existing code: "similar to src/utils/auth.ts"
- Always run `/verify` before committing
```

---

## CONTRIBUTING_WITH_CLAUDE.md

```markdown
# Contributing with Claude Code

## Setup
1. Clone repo
2. Run `/setup` in Claude
3. Verify with `/verify`

## Workflow
1. Create branch: `git checkout -b feature/description`
2. Use Plan Mode for non-trivial changes
3. Implement with tests
4. Run `/verify`
5. Create PR with `/pr`

## Standards
- All code must have tests
- Must pass linter
- Update docs for new features
```

---

## TROUBLESHOOTING.md

```markdown
# Troubleshooting

## "Tests failing"
```bash
/test  # See failures
# Share errors with Claude
```

## "Build broken"
```bash
/verify  # See build errors
```

## "Need fresh context"
```bash
/clear
# Start with focused prompt
```

## Decision Tree
- Bug? → "Use debug workflow"
- New feature? → Plan Mode + verification-first
- Refactor? → Plan Mode
- Quick fix (< 10 lines)? → Direct execution
```
