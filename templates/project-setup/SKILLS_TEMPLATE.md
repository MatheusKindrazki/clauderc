# Skills Templates

## debug-workflow/SKILL.md

```markdown
# Debug Workflow

Systematic approach to debugging issues.

## When to Use
- Bug reports
- Failing tests without obvious cause
- Performance issues
- Production errors

## Workflow

### 1. Reproduce
- [ ] Create minimal reproduction
- [ ] Document steps to reproduce
- [ ] Identify expected vs actual behavior

### 2. Isolate
- [ ] Add debug logging
- [ ] Check recent changes in related files
- [ ] Bisect if needed: `git bisect`

### 3. Fix
- [ ] Implement minimal fix
- [ ] Add regression test
- [ ] Verify locally

### 4. Validate
- [ ] Run full test suite
- [ ] Check for side effects
- [ ] Update docs if needed
```

---

## verification-workflow/SKILL.md

```markdown
# Verification-First Development

Write Test -> Write Code -> Verify

## Workflow

### 1. Write Test First
Create failing test that defines expected behavior.

### 2. Implement
Write minimal code to make test pass.

### 3. Verify
\`\`\`bash
/test    # Should pass
/lint    # Should pass
/verify  # Full validation
\`\`\`

### 4. Refactor (if needed)
Improve code while keeping tests green.

## Checklist Before Commit
- [ ] All tests pass
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Feature works (manual test)
- [ ] Docs updated
```

---

## parallel-work/SKILL.md

```markdown
# Parallel Work with Multiple Claudes

## When to Parallelize
- Independent test files
- Separate features/modules
- Documentation updates
- Code review of different areas

## When NOT to Parallelize
- Interdependent changes
- Database migrations
- Breaking API changes
- Cross-cutting refactors

## How To

### Using Worktrees (Recommended)
\`\`\`bash
claude --worktree feature-auth
claude --worktree feature-dashboard
claude --worktree docs-update
\`\`\`

### Patterns

**Test Suite Split**
- Claude 1: Unit tests (src/utils)
- Claude 2: Unit tests (src/components)
- Claude 3: Integration tests

**Feature Development**
- Claude 1: Backend API
- Claude 2: Frontend UI
- Claude 3: Tests + Docs
```
