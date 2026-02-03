# Git Worktree Management

Manage parallel workspaces using git worktrees for concurrent Claude Code sessions.

## Setup Worktrees

```bash
# Create worktree directory structure
REPO_NAME="$(basename "$(git rev-parse --show-toplevel)")"
WORKTREE_BASE="../${REPO_NAME}-worktrees"
mkdir -p "$WORKTREE_BASE"

# Create worktrees (a, b, c) from current branch
CURRENT="$(git branch --show-current)"
for SUFFIX in a b c; do
  BRANCH="${CURRENT}-wt-${SUFFIX}"
  TREE_PATH="${WORKTREE_BASE}/${SUFFIX}"
  if [ ! -d "$TREE_PATH" ]; then
    git worktree add -b "$BRANCH" "$TREE_PATH" HEAD
    echo "Created worktree: $TREE_PATH ($BRANCH)"
  else
    echo "Worktree exists: $TREE_PATH"
  fi
done
```

## Shell Aliases

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
# Quick worktree switching
alias za='cd "$(git rev-parse --show-toplevel)/../$(basename "$(git rev-parse --show-toplevel)")-worktrees/a"'
alias zb='cd "$(git rev-parse --show-toplevel)/../$(basename "$(git rev-parse --show-toplevel)")-worktrees/b"'
alias zc='cd "$(git rev-parse --show-toplevel)/../$(basename "$(git rev-parse --show-toplevel)")-worktrees/c"'
alias z0='cd "$(git rev-parse --show-toplevel)"'  # back to main
```

## Parallel Workflow

1. **Main tree (z0):** Primary development, integration
2. **Worktree A (za):** Feature work - run `claude` here
3. **Worktree B (zb):** Bug fixes - run `claude` here
4. **Worktree C (zc):** Experiments/spikes - run `claude` here

Each worktree runs its own Claude Code session independently.

## Cleanup

```bash
# Remove a specific worktree
git worktree remove "../${REPO_NAME}-worktrees/a"

# Remove all worktrees
git worktree list | grep -v "bare\|$(git rev-parse --show-toplevel)$" | awk '{print $1}' | xargs -I{} git worktree remove {}

# Prune stale worktree references
git worktree prune
```

## Tips

- Each worktree has its own working directory but shares git history
- Install dependencies separately in each worktree (`npm install` etc.)
- Commits in any worktree are visible from all others
- Merge worktree branches back when done: `git merge feature-wt-a`
