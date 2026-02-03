# Evolve CLAUDE.md

Analyze recent errors, PR feedback, and debugging sessions to suggest improvements to the project's CLAUDE.md. Claude is surprisingly good at writing rules for itself.

## When to Use

- After fixing a bug that could have been prevented by better instructions
- After a PR review reveals missing conventions
- After a debugging session uncovers undocumented patterns
- Periodically (weekly/sprint) to refine project rules
- After onboarding a new team member who hit friction

## Workflow

### 1. Gather Context

Collect recent signals about what went wrong or could be improved:

```bash
# Recent commits (look for fix/refactor patterns)
git log --oneline -20 --grep="fix\|refactor\|revert"

# Recent PR comments (if using GitHub)
gh pr list --state merged --limit 5 --json number,title | head -20
```

### 2. Analyze Current CLAUDE.md

Read the existing CLAUDE.md and identify:
- Missing commands or outdated commands
- Missing conventions that caused recent bugs
- Missing architecture notes that led to wrong approaches
- Missing workflow guidance

### 3. Identify Improvement Categories

| Category | Signal | Example Rule to Add |
|----------|--------|---------------------|
| **Missing Convention** | Repeated style fixes in PRs | "Always use named exports" |
| **Undocumented Pattern** | Bug from wrong usage | "Use `trx` for DB transactions" |
| **Outdated Command** | Command fails or changed | Update test/build commands |
| **Missing Guard Rail** | Repeated mistake | "Never modify migration files" |
| **Architecture Gap** | Wrong file placement | "API routes go in `src/routes/`" |
| **Missing Context** | Wrong assumptions | "This is a multi-tenant app" |

### 4. Generate Suggestions

For each improvement, provide:

```markdown
## Suggested Addition: [Category]

**Signal:** [What happened that revealed this gap]

**Current CLAUDE.md:** [What it says now, or "missing"]

**Proposed Change:**
[Exact text to add/modify in CLAUDE.md]

**Rationale:** [Why this prevents future issues]
```

### 5. Apply Changes

After approval, update CLAUDE.md with the accepted suggestions.
Keep CLAUDE.md under 100 lines - use @imports for detailed docs.

## Rules

- NEVER remove existing rules without explicit approval
- ALWAYS explain WHY a rule is being added (cite the incident)
- PREFER specific rules over vague guidelines
- KEEP rules actionable - "do X" not "consider X"
- GROUP related rules under existing sections when possible
- USE @imports if CLAUDE.md exceeds 100 lines

## Examples

### Example 1: After a bug fix

**Signal:** Fixed a bug where API response wasn't validated

**Proposed Addition to CLAUDE.md:**
```markdown
## API Conventions
- Always validate API responses with zod schemas before using data
- Never trust external API response shapes - they can change
```

### Example 2: After PR feedback

**Signal:** PR reviewer noted inconsistent error handling

**Proposed Addition to CLAUDE.md:**
```markdown
## Error Handling
- Use `AppError` class for all application errors
- Always include error code, message, and context
- Log errors with structured logging (`logger.error({ err, context })`)
```

### Example 3: After debugging session

**Signal:** Spent 30 minutes debugging because test DB wasn't reset

**Proposed Addition to CLAUDE.md:**
```markdown
## Testing
- Run `npm run db:reset:test` before test suites
- Tests use isolated DB transactions (auto-rolled back)
```

## Checklist

- [ ] Reviewed recent git history for fix/refactor commits
- [ ] Checked recent PR comments for recurring feedback
- [ ] Identified gaps in current CLAUDE.md
- [ ] Generated specific, actionable suggestions
- [ ] Each suggestion cites the originating signal
- [ ] CLAUDE.md stays under 100 lines (use @imports if needed)
- [ ] No existing rules were removed without approval
