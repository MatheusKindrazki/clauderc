# Create a Semantic Commit

Create a well-structured commit following Conventional Commits specification.

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

## Types

| Type | Description | Version Impact |
|------|-------------|----------------|
| feat | New feature | MINOR (0.x.0) |
| fix | Bug fix | PATCH (0.0.x) |
| docs | Documentation only | PATCH |
| style | Formatting, no code change | PATCH |
| refactor | Code restructuring | PATCH |
| perf | Performance improvement | PATCH |
| test | Adding or fixing tests | No release |
| chore | Build, CI, tooling | No release |
| ci | CI/CD configuration | No release |

## Breaking Changes

Add `!` after type or `BREAKING CHANGE:` in footer for MAJOR version bumps:

```
feat!: remove deprecated API endpoints

BREAKING CHANGE: /v1/users removed. Use /v2/users instead.
```

## Steps

1. Run `git diff --staged` to analyze staged changes
2. Determine the appropriate type from the changes
3. Identify the scope (module, component, or area affected)
4. Write a concise subject (imperative mood, no period, max 72 chars)
5. Add body if the change needs explanation (wrap at 72 chars)
6. Add footer for breaking changes or issue references
7. Execute `git commit -m "<message>"`

## Rules

- Subject MUST be imperative mood ("add feature" not "added feature")
- Subject MUST NOT exceed 72 characters
- Subject MUST NOT end with a period
- Body separated from subject by blank line
- Reference issues: `Closes #123` or `Fixes #456` in footer
- Multiple logical changes = separate commits

## Examples

```bash
# Simple feature
git commit -m "feat(auth): add OAuth2 login support"

# Bug fix with issue reference
git commit -m "fix(api): handle null response from payment gateway

The payment gateway returns null when the session expires.
Added null check and automatic session refresh.

Fixes #234"

# Breaking change
git commit -m "feat(api)!: migrate to v2 authentication flow

BREAKING CHANGE: API key format changed from UUID to JWT.
All existing API keys must be regenerated."

# Chore (no release triggered)
git commit -m "chore(deps): upgrade lodash to 4.17.21"
```
