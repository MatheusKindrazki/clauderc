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
```

## Code Style
{{CODE_STYLE_RULES}}

## Workflow
- Plan Mode for: refactors > 3 files, new features, architecture changes
- Always run `{{VERIFY_COMMAND}}` before commit
- Parallel work OK for: independent modules, test files, docs

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
