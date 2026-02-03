/**
 * Claude Code provider
 * Generates CLAUDE.md, .claude/settings.json, .claude/commands/*.md
 */

import { join } from 'path';
import { homedir } from 'os';

export function generateInstructionFile(config) {
  const { projectName, stack, commands, customRules } = config;

  let content = `# ${projectName}

## Stack
`;

  if (stack.stacks.length > 0) {
    content += `- **Language**: ${stack.stacks.map(s => s.name).join(', ')}\n`;
  }
  if (stack.framework) {
    content += `- **Framework**: ${stack.framework.name}\n`;
  }
  if (stack.packageManager) {
    content += `- **Package Manager**: ${stack.packageManager.name}\n`;
  }
  if (stack.monorepo) {
    content += `- **Monorepo**: ${stack.monorepo.name}\n`;
  }

  content += `
## Commands

\`\`\`bash
# Setup
${commands.setup || '# No setup command detected'}

# Development
${commands.dev || '# No dev command detected'}

# Test
${commands.test || '# No test command detected'}

# Lint
${commands.lint || '# No lint command detected'}

# Build
${commands.build || '# No build command detected'}

# Full verification
${commands.verify || '# No verify command detected'}
\`\`\`

## Workflow

### Plan Mode
Use Plan Mode (Shift+Tab 2x) for:
- Refactoring > 3 files
- New feature implementation
- Architecture changes
- Database migrations

### Parallel Workflow (Worktrees)
For parallel tasks, use git worktrees:
- Run \`/worktree\` to set up parallel workspaces
- Use aliases: \`za\` (feature), \`zb\` (bugfix), \`zc\` (experiment), \`z0\` (main)
- Each worktree runs its own Claude Code session independently

### Verification
- ALWAYS run \`${commands.verify || 'tests'}\` before committing
- NEVER skip tests without explicit approval

### Advanced Prompting
- Grill your changes: "Is this the best approach? What are the edge cases?"
- Ask Claude to reimplement elegantly after a working prototype
- Use subagents for focused tasks (security review, test writing)

### Self-Improvement
- Run \`/evolve-claude-md\` after fixing bugs to capture learnings
- Claude is good at writing rules for itself - review its suggestions
`;

  content += `
## Conventions

### Commits (Conventional Commits)
- Format: \`<type>(<scope>): <subject>\`
- Types: \`feat\` | \`fix\` | \`docs\` | \`style\` | \`refactor\` | \`perf\` | \`test\` | \`chore\` | \`ci\`
- Subject: imperative mood, max 72 chars, no period
- Breaking changes: add \`!\` after type or \`BREAKING CHANGE:\` in footer

### Semantic Versioning
- \`feat\` → MINOR (1.x.0)
- \`fix\`, \`docs\`, \`refactor\`, \`perf\`, \`style\` → PATCH (1.0.x)
- \`BREAKING CHANGE\` or \`!\` → MAJOR (x.0.0)
- \`test\`, \`chore\`, \`ci\` → no version change

### Pull Requests
- PR title: same Conventional Commits format
- PR body: Summary (why), Changes (what), Test Plan
- Run \`/verify\` before every PR
`;

  if (config.stack.commitConvention) {
    const tools = [];
    if (config.stack.commitConvention.commitlint) tools.push('commitlint');
    if (config.stack.commitConvention.husky) tools.push('husky');
    if (config.stack.commitConvention.semanticRelease) tools.push('semantic-release');
    if (config.stack.commitConvention.commitizen) tools.push('commitizen');
    if (tools.length > 0) {
      content += `> This project uses ${tools.join(', ')} — follow its configured rules.\n\n`;
    }
  }

  if (customRules && customRules.length > 0) {
    content += `
## Project Rules

${customRules.map(r => `- ${r}`).join('\n')}
`;
  }

  content += `
## Documentation
@README.md
`;

  return content;
}

export function generateSettings(config) {
  const { stack, commands } = config;
  const pm = stack.packageManager?.name || 'npm';

  const allowedCommands = [];

  switch (pm) {
    case 'bun':
      allowedCommands.push('Bash(bun:*)');
      break;
    case 'pnpm':
      allowedCommands.push('Bash(pnpm:*)');
      break;
    case 'yarn':
      allowedCommands.push('Bash(yarn:*)');
      break;
    case 'npm':
      allowedCommands.push('Bash(npm:*)');
      break;
    case 'poetry':
      allowedCommands.push('Bash(poetry:*)');
      break;
    case 'cargo':
      allowedCommands.push('Bash(cargo:*)');
      break;
  }

  allowedCommands.push('Bash(git:*)');
  allowedCommands.push('Bash(gh:*)');

  const stackId = stack.stacks[0]?.id;
  switch (stackId) {
    case 'go':
      allowedCommands.push('Bash(go:*)');
      allowedCommands.push('Bash(golangci-lint:*)');
      break;
    case 'rust':
      allowedCommands.push('Bash(cargo:*)');
      break;
    case 'python':
      allowedCommands.push('Bash(pytest:*)');
      allowedCommands.push('Bash(ruff:*)');
      allowedCommands.push('Bash(mypy:*)');
      break;
    case 'dotnet':
      allowedCommands.push('Bash(dotnet:*)');
      break;
    case 'elixir':
      allowedCommands.push('Bash(mix:*)');
      break;
    case 'ruby':
      allowedCommands.push('Bash(bundle:*)');
      allowedCommands.push('Bash(rails:*)');
      break;
    case 'php':
      allowedCommands.push('Bash(composer:*)');
      allowedCommands.push('Bash(php:*)');
      break;
    case 'java':
      allowedCommands.push('Bash(mvn:*)');
      allowedCommands.push('Bash(gradle:*)');
      break;
  }

  const settings = {
    permissions: {
      allow: allowedCommands,
    },
  };

  if (commands.format || commands.lint) {
    const hookCommand = commands.format || `${commands.lint} --fix`;
    settings.hooks = {
      PostToolUse: [
        {
          matcher: 'Edit|Write',
          hooks: [
            {
              type: 'command',
              command: `${hookCommand} || true`,
            },
          ],
        },
      ],
    };
  }

  return settings;
}

export function generateCommandFile(name, config) {
  const { commands, stack } = config;
  const stackName = stack.stacks[0]?.name || 'Unknown';

  const templates = {
    test: `# Run ${stackName} tests

Runs the project test suite.

## Command
\`\`\`bash
${commands.test || '# No test command detected - configure in CLAUDE.md'}
\`\`\`

## Usage
Run this command to execute all project tests before committing changes.
`,

    lint: `# Lint ${stackName} code

Runs linter and optionally fixes issues.

## Command
\`\`\`bash
${commands.lint || '# No lint command detected - configure in CLAUDE.md'}
\`\`\`

## Auto-fix
\`\`\`bash
${commands.format || (commands.lint ? commands.lint + ' --fix' : '# No format command detected')}
\`\`\`
`,

    verify: `# Full verification

Runs all checks: lint, test, and build.

## Command
\`\`\`bash
${commands.verify || [commands.lint, commands.test, commands.build].filter(Boolean).join(' && ') || '# Configure verify steps in CLAUDE.md'}
\`\`\`

## When to use
- Before committing changes
- Before creating a PR
- After major refactoring
`,

    setup: `# Project setup

Install dependencies and prepare the development environment.

## Command
\`\`\`bash
${commands.setup || '# No setup command detected - configure in CLAUDE.md'}
\`\`\`
`,

    pr: `# Create a Semantic Pull Request

Create a PR following Conventional Commits with structured description.

## PR Title
\`\`\`
<type>(<scope>): <description>
\`\`\`

## PR Body Template
- **Summary**: 1-3 bullets explaining WHAT and WHY
- **Type of Change**: feat / fix / docs / refactor / perf / test / chore / breaking
- **Changes**: Detailed list
- **Breaking Changes**: If applicable, what breaks and migration steps
- **Test Plan**: How it was tested

## Steps
1. Run \`/verify\` to ensure all checks pass
2. Analyze all commits on branch since base
3. Determine PR type (highest-impact: breaking > feat > fix > others)
4. Generate title in Conventional Commits format (max 72 chars)
5. Generate structured body
6. Push branch and create PR with \`gh pr create\`

## Prerequisites
- \`gh\` CLI installed and authenticated
- All tests passing (\`/verify\`)
- Changes committed with \`/commit\`
`,

    commit: `# Create a Semantic Commit

Create a well-structured commit following Conventional Commits.

## Format
\`\`\`
<type>(<scope>): <subject>
\`\`\`

## Types
| Type | Description | Version Impact |
|------|-------------|----------------|
| feat | New feature | MINOR |
| fix | Bug fix | PATCH |
| docs | Documentation | PATCH |
| refactor | Code restructuring | PATCH |
| perf | Performance improvement | PATCH |
| test | Tests | No release |
| chore | Build/CI/tooling | No release |

## Rules
- Imperative mood ("add" not "added")
- Max 72 chars subject line
- No period at end
- Breaking changes: \`!\` after type or \`BREAKING CHANGE:\` footer
- Reference issues: \`Fixes #123\` in footer

## Steps
1. Analyze staged changes with \`git diff --staged\`
2. Determine type from nature of changes
3. Identify scope (module/component affected)
4. Write subject in imperative mood
5. Add body if change needs explanation
6. Execute \`git commit -m "<message>"\`
`,

    worktree: `# Git Worktree Management

Manage parallel workspaces using git worktrees for concurrent Claude Code sessions.

## Setup Worktrees

\`\`\`bash
REPO_NAME="$(basename "$(git rev-parse --show-toplevel)")"
WORKTREE_BASE="../\${REPO_NAME}-worktrees"
mkdir -p "\$WORKTREE_BASE"

CURRENT="$(git branch --show-current)"
for SUFFIX in a b c; do
  BRANCH="\${CURRENT}-wt-\${SUFFIX}"
  TREE_PATH="\${WORKTREE_BASE}/\${SUFFIX}"
  if [ ! -d "\$TREE_PATH" ]; then
    git worktree add -b "\$BRANCH" "\$TREE_PATH" HEAD
    echo "Created worktree: \$TREE_PATH (\$BRANCH)"
  else
    echo "Worktree exists: \$TREE_PATH"
  fi
done
\`\`\`

## Shell Aliases

Add to your shell profile:

\`\`\`bash
alias za='cd "\$(git rev-parse --show-toplevel)/../\$(basename "\$(git rev-parse --show-toplevel)")-worktrees/a"'
alias zb='cd "\$(git rev-parse --show-toplevel)/../\$(basename "\$(git rev-parse --show-toplevel)")-worktrees/b"'
alias zc='cd "\$(git rev-parse --show-toplevel)/../\$(basename "\$(git rev-parse --show-toplevel)")-worktrees/c"'
alias z0='cd "\$(git rev-parse --show-toplevel)"'
\`\`\`

## Parallel Workflow

1. Main tree (z0): Primary development
2. Worktree A (za): Feature work with Claude Code
3. Worktree B (zb): Bug fixes with Claude Code
4. Worktree C (zc): Experiments

## Cleanup

\`\`\`bash
git worktree remove "../\${REPO_NAME}-worktrees/a"
git worktree prune
\`\`\`
`,

    fix: `# Autonomous Bug Fix

Investigate and fix a bug from a description or issue link.

## Input

Accepts: bug description, GitHub issue link, or error message/stack trace.

## Workflow

1. **Understand** - Fetch issue details, search for related errors
2. **Reproduce** - Confirm the bug exists with a test or manual steps
3. **Investigate** - Trace code path, identify root cause
4. **Fix** - Write failing test, implement minimal fix, verify
5. **Commit** - Use \`fix(<scope>): <description>\` format

## Rules

- ALWAYS write a reproducing test before fixing
- NEVER fix more than the reported issue
- ALWAYS run \`/verify\` after the fix
- If fix spans > 5 files, stop and plan first
`,
  };

  return templates[name] || '';
}

export function generateProjectFiles(config) {
  const { projectPath } = config;
  const claudeDir = join(projectPath, '.claude');
  const files = [];

  files.push({
    path: join(projectPath, 'CLAUDE.md'),
    content: generateInstructionFile(config),
    type: 'CLAUDE.md',
  });

  files.push({
    path: join(claudeDir, 'settings.json'),
    content: JSON.stringify(generateSettings(config), null, 2),
    type: 'settings.json',
  });

  for (const cmd of ['test', 'lint', 'verify', 'setup', 'pr', 'commit', 'worktree', 'fix']) {
    files.push({
      path: join(claudeDir, 'commands', `${cmd}.md`),
      content: generateCommandFile(cmd, config),
      type: 'command file',
    });
  }

  return files;
}

export function getDirectories() {
  return ['commands'];
}

export const claudeProvider = {
  id: 'claude',
  name: 'Claude Code',
  globalDir: () => join(homedir(), '.claude'),
  projectDir: '.claude',
  instructionFile: 'CLAUDE.md',
  generateInstructionFile,
  generateSettings,
  generateCommandFile,
  generateProjectFiles,
  getDirectories,
};
