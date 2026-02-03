/**
 * Cursor provider
 * Generates .cursorrules, .cursor/rules/*.mdc
 */

import { join } from 'path';
import { homedir } from 'os';

const RULE_DESCRIPTIONS = {
  test: 'Run project tests before committing',
  lint: 'Lint and format code',
  verify: 'Full verification before commit or PR',
  setup: 'Install dependencies and setup project',
  pr: 'Create a semantic pull request',
  commit: 'Create a semantic commit',
  worktree: 'Manage git worktrees for parallel development',
  fix: 'Autonomous bug investigation and fixing',
};

function mdcFrontmatter({ description, globs, alwaysApply }) {
  let fm = '---\n';
  fm += `description: ${description}\n`;
  fm += `globs: ${globs || ''}\n`;
  fm += `alwaysApply: ${alwaysApply ? 'true' : 'false'}\n`;
  fm += '---\n\n';
  return fm;
}

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

### Verification
- ALWAYS run \`${commands.verify || 'tests'}\` before committing
- NEVER skip tests without explicit approval

### Best Practices
- For changes spanning > 3 files, plan before implementing
- Break large tasks into smaller, reviewable chunks
- Test each change before proceeding to the next
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
- Run full verification before every PR
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
Refer to README.md for full project documentation.
`;

  return content;
}

export function generateRule(name, config) {
  const { commands, stack } = config;
  const stackName = stack.stacks[0]?.name || 'Unknown';
  const description = RULE_DESCRIPTIONS[name] || name;

  const ruleTemplates = {
    test: mdcFrontmatter({ description, alwaysApply: true }) +
`# Run ${stackName} Tests

Run the project test suite.

## Command
\`\`\`bash
${commands.test || '# No test command detected'}
\`\`\`

Run this command to execute all project tests before committing changes.
`,

    lint: mdcFrontmatter({ description, alwaysApply: true }) +
`# Lint ${stackName} Code

Run linter and optionally fix issues.

## Command
\`\`\`bash
${commands.lint || '# No lint command detected'}
\`\`\`

## Auto-fix
\`\`\`bash
${commands.format || (commands.lint ? commands.lint + ' --fix' : '# No format command detected')}
\`\`\`
`,

    verify: mdcFrontmatter({ description, alwaysApply: true }) +
`# Full Verification

Run all checks: lint, test, and build.

## Command
\`\`\`bash
${commands.verify || [commands.lint, commands.test, commands.build].filter(Boolean).join(' && ') || '# Configure verify steps'}
\`\`\`

## When to Use
- Before committing changes
- Before creating a PR
- After major refactoring
`,

    setup: mdcFrontmatter({ description, alwaysApply: true }) +
`# Project Setup

Install dependencies and prepare the development environment.

## Command
\`\`\`bash
${commands.setup || '# No setup command detected'}
\`\`\`
`,

    pr: mdcFrontmatter({ description, alwaysApply: true }) +
`# Create a Semantic Pull Request

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
1. Run full verification to ensure all checks pass
2. Analyze all commits on branch since base
3. Determine PR type (highest-impact: breaking > feat > fix > others)
4. Generate title in Conventional Commits format (max 72 chars)
5. Generate structured body
6. Push branch and create PR with \`gh pr create\`

## Prerequisites
- \`gh\` CLI installed and authenticated
- All tests passing
`,

    commit: mdcFrontmatter({ description, alwaysApply: true }) +
`# Create a Semantic Commit

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

    worktree: mdcFrontmatter({ description, alwaysApply: false }) +
`# Git Worktree Management

Manage parallel workspaces using git worktrees.

## Setup
\`\`\`bash
REPO_NAME=$(basename $(git rev-parse --show-toplevel))
WORKTREE_BASE="../\${REPO_NAME}-worktrees"
mkdir -p "$WORKTREE_BASE"
CURRENT=$(git branch --show-current)
for SUFFIX in a b c; do
  git worktree add -b "\${CURRENT}-wt-\${SUFFIX}" "\${WORKTREE_BASE}/\${SUFFIX}" HEAD
done
\`\`\`

## Aliases
\`\`\`bash
alias za='cd "$(git rev-parse --show-toplevel)/../$(basename $(git rev-parse --show-toplevel))-worktrees/a"'
alias zb='cd "$(git rev-parse --show-toplevel)/../$(basename $(git rev-parse --show-toplevel))-worktrees/b"'
alias zc='cd "$(git rev-parse --show-toplevel)/../$(basename $(git rev-parse --show-toplevel))-worktrees/c"'
alias z0='cd "$(git rev-parse --show-toplevel)"'
\`\`\`

## Cleanup
\`\`\`bash
git worktree remove "../\${REPO_NAME}-worktrees/a"
git worktree prune
\`\`\`
`,

    fix: mdcFrontmatter({ description, alwaysApply: false }) +
`# Autonomous Bug Fix

Investigate and fix a bug from a description or issue link.

## Workflow

1. **Understand** - Fetch issue details, search for related errors
2. **Reproduce** - Confirm the bug exists
3. **Investigate** - Trace code path, identify root cause
4. **Fix** - Write failing test, implement minimal fix, verify
5. **Commit** - Use \`fix(<scope>): <description>\` format

## Rules

- ALWAYS write a reproducing test before fixing
- NEVER fix more than the reported issue
- Run full verification after the fix
- If fix spans > 5 files, stop and plan first
`,
  };

  return ruleTemplates[name] || '';
}

export function generateProjectFiles(config) {
  const { projectPath } = config;
  const cursorDir = join(projectPath, '.cursor', 'rules');
  const files = [];

  files.push({
    path: join(projectPath, '.cursorrules'),
    content: generateInstructionFile(config),
    type: '.cursorrules',
  });

  for (const name of ['test', 'lint', 'verify', 'setup', 'pr', 'commit', 'worktree', 'fix']) {
    files.push({
      path: join(cursorDir, `${name}.mdc`),
      content: generateRule(name, config),
      type: 'cursor rule',
    });
  }

  return files;
}

export function getDirectories() {
  return ['rules'];
}

export const cursorProvider = {
  id: 'cursor',
  name: 'Cursor',
  globalDir: () => join(homedir(), '.cursor', 'rules'),
  projectDir: '.cursor',
  instructionFile: '.cursorrules',
  generateInstructionFile,
  generateRule,
  generateProjectFiles,
  getDirectories,
};
