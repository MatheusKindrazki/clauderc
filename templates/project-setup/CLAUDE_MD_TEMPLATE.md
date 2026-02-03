# CLAUDE.md Template

Use this template as base for generating project-specific CLAUDE.md files.

---

```markdown
# {{PROJECT_NAME}}

## Stack
{{STACK_SUMMARY}}

## Commands

```bash
# Dev
{{DEV_COMMANDS}}

# Test
{{TEST_COMMANDS}}

# Build
{{BUILD_COMMANDS}}

# Full verification
{{VERIFY_COMMAND}}
```

## Code Style
{{CODE_STYLE_RULES}}

## Workflow

### Plan Mode
Use Plan Mode (Shift+Tab 2x) for:
- Refactoring > 3 files
- New feature implementation
- Architecture changes
- Database migrations

### Parallel Workflow (Worktrees)
For parallel tasks, use git worktrees:
- Run `/worktree` to set up parallel workspaces
- Use aliases: `za` (feature), `zb` (bugfix), `zc` (experiment), `z0` (main)
- Each worktree runs its own Claude Code session independently
- Merge branches back when done

### Verification
- ALWAYS run `{{VERIFY_COMMAND}}` before committing
- NEVER skip tests without explicit approval

### Advanced Prompting
- When reviewing changes, grill them: "Is this the best approach? What are the edge cases?"
- Ask Claude to reimplement elegantly after a working prototype
- Use subagents for focused tasks (security review, test writing, code review)

### Subagents as Default Pattern
For complex tasks, prefer dispatching subagents:
- Security review: dedicated security reviewer agent
- Test generation: dedicated test writer agent
- Code review: dedicated code reviewer agent
- Each agent has focused context and expertise

## Conventions
- Commits: [Conventional Commits](https://conventionalcommits.org) — `<type>(<scope>): <subject>`
- Types: feat, fix, docs, style, refactor, perf, test, chore, ci
- Breaking changes: `!` suffix or `BREAKING CHANGE:` footer
- PRs: same title format, structured body (Summary, Changes, Test Plan)
- Versioning: feat -> MINOR, fix -> PATCH, breaking -> MAJOR

## Self-Improvement
- After fixing bugs, run `/evolve-claude-md` to capture learnings
- Claude is good at writing rules for itself - let it suggest CLAUDE.md updates
- Review and approve suggestions before applying

## Architecture
{{ARCHITECTURE_NOTES}}

## Docs
{{DOC_REFERENCES}}
```

---

## Guidelines

1. **Keep it under 100 lines** - Be concise, link to detailed docs
2. **Commands must be copy-pasteable** - Test them before adding
3. **Focus on what's different** - Don't repeat language defaults
4. **Use @imports for details** - `@docs/architecture.md` instead of inline
5. **Update the date** - Add `Last updated: YYYY-MM-DD` at bottom
6. **Self-improve** - Run `/evolve-claude-md` after incidents to capture learnings
7. **Parallel-ready** - Document worktree workflow if team uses it
