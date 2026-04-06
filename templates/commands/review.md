# Code Review

Review code changes for quality, security, and best practices.

## Input

Accepts: PR number, branch name, or file paths. Defaults to current uncommitted changes.

## Workflow

1. **Gather changes** - Get diff from PR, branch, or working tree
2. **Analyze** - Check for bugs, security issues, performance, readability
3. **Report** - Structured feedback with severity levels

## Review Checklist

| Category | What to Check |
|----------|---------------|
| **Correctness** | Logic errors, edge cases, off-by-one |
| **Security** | Injection, XSS, secrets, OWASP top 10 |
| **Performance** | N+1 queries, unnecessary allocations, missing indexes |
| **Readability** | Naming, complexity, dead code |
| **Testing** | Coverage gaps, missing edge case tests |
| **Breaking** | API changes, migration needs, backwards compatibility |

## Output Format

```markdown
## Review: [scope]

### Critical (must fix)
- [issue + file:line + suggestion]

### Warnings (should fix)
- [issue + file:line + suggestion]

### Suggestions (nice to have)
- [improvement + rationale]

### Approved
- [things done well]
```

## Usage Examples

```bash
# Review current changes
/review

# Review a PR
/review #123

# Review specific files
/review src/auth.js src/middleware.js
```
