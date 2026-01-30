# Create a Semantic Pull Request

Create a PR following Conventional Commits with structured description.

## PR Title Format

Use Conventional Commits format:

```
<type>(<scope>): <description>
```

Examples:
- `feat(auth): add OAuth2 login flow`
- `fix(api): resolve race condition in payment processing`
- `docs(readme): add deployment instructions`

## PR Body Template

```markdown
## Summary
<!-- 1-3 bullet points: WHAT changed and WHY -->

## Type of Change
- [ ] feat: New feature (MINOR version bump)
- [ ] fix: Bug fix (PATCH version bump)
- [ ] docs: Documentation
- [ ] refactor: Code restructuring
- [ ] perf: Performance improvement
- [ ] test: Test changes
- [ ] chore: Build/CI/tooling
- [ ] breaking: Contains breaking changes (MAJOR version bump)

## Changes
<!-- Detailed list of changes -->

## Breaking Changes
<!-- If applicable: what breaks and migration steps -->

## Test Plan
<!-- How was this tested? What should reviewers verify? -->
```

## Steps

1. Verify all changes are committed and tests pass (`/verify`)
2. Analyze all commits on the branch since diverging from base
3. Determine PR type from commits (use highest-impact type: breaking > feat > fix > others)
4. Generate title in Conventional Commits format (max 72 chars)
5. Generate body using template above
6. Push branch to remote
7. Create PR with `gh pr create`

## Implementation

```bash
BRANCH=$(git branch --show-current)

# Ensure clean state
if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes. Run /commit first."
  exit 1
fi

# Push and create PR
git push -u origin $BRANCH
gh pr create --title "<type>(<scope>): <description>" --body "<generated body>"
```

## Rules

- PR title MUST follow Conventional Commits format
- PR title MUST be under 72 characters
- Summary explains WHY, not just WHAT
- Breaking changes: title MUST include `!` after type
- Always run `/verify` before creating a PR
- Prefer small, focused PRs
