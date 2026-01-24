# Create a Pull Request

Commit changes, push to remote, and create a PR with generated description.

## Workflow
1. Stage all changes
2. Generate commit message from diff
3. Push to current branch
4. Create PR with description

## Prerequisites
- `gh` CLI installed and authenticated
- Changes ready to commit

## Implementation
```bash
# Get current branch
BRANCH=$(git branch --show-current)

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit"
  exit 0
fi

# Stage changes
git add -A

# Show what will be committed
echo "📝 Changes to commit:"
git status --short

# Commit (message should be provided by Claude)
# git commit -m "..."

# Push
git push -u origin $BRANCH

# Create PR
gh pr create --fill
```

## Notes
- Claude will generate an appropriate commit message
- PR description is auto-generated from commits
- Use `--draft` flag for draft PRs
