# Autonomous Bug Fix

Investigate and fix a bug from a description or issue link. Works autonomously through investigation, root cause analysis, fix, and verification.

## Input

Accepts one of:
- Bug description in natural language
- GitHub issue link (`gh issue view <number>`)
- Error message or stack trace

## Workflow

### 1. Understand the Bug

```bash
# If given an issue number, fetch details
gh issue view <number> --json title,body,comments

# Search for related error messages in codebase
grep -r "error message" src/ --include="*.{js,ts,py,go,rs}" -l

# Check recent commits that might have introduced the bug
git log --oneline -20 --all
```

### 2. Reproduce

- Identify the reproduction steps from the bug report
- Run the relevant test or command to confirm the bug exists
- If no test exists, note the manual reproduction steps

### 3. Investigate Root Cause

- Read the relevant source files identified from error traces
- Trace the code path from entry point to error
- Identify the exact line/logic causing the issue
- Check git blame to understand when/why the code was written this way

### 4. Implement Fix

- Write a failing test that reproduces the bug
- Implement the minimal fix
- Run the test to verify it passes
- Run the full test suite to check for regressions

### 5. Verify

```bash
# Run full verification
/verify

# Check that the fix doesn't break anything
git diff --stat
```

### 6. Commit

```bash
# Commit with fix type and reference the issue
git add .
git commit -m "fix(<scope>): <description>

Fixes #<issue-number>"
```

## Rules

- ALWAYS write a test that reproduces the bug before fixing
- NEVER fix more than the reported issue (avoid scope creep)
- ALWAYS run full verification after the fix
- If the fix requires changes to more than 5 files, stop and plan first
- Reference the issue number in the commit message
