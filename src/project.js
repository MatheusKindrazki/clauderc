/**
 * Project setup wizard
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { detectStack, generateCommands, analyzeWithClaude } from './detector.js';

/**
 * Use Claude CLI to intelligently merge existing and new content
 * @param {string} existingContent - The current file content
 * @param {string} newContent - The proposed new content
 * @param {string} fileType - Type of file for context (e.g., 'CLAUDE.md', 'settings.json')
 * @returns {string} - The merged content
 */
function mergeWithClaude(existingContent, newContent, fileType) {
  const prompt = `You are merging two versions of a ${fileType} configuration file.

EXISTING content (user's current configuration - PRESERVE user preferences and customizations):
---
${existingContent}
---

NEW content (auto-generated with updated stack detection):
---
${newContent}
---

IMPORTANT RULES:
1. PRESERVE any custom rules, preferences, or configurations the user added in EXISTING
2. UPDATE commands and stack info from NEW if they are more accurate
3. MERGE sections intelligently - don't duplicate, combine them
4. Keep user's custom sections that don't exist in NEW
5. If EXISTING has custom hooks, permissions, or rules - KEEP THEM
6. Output ONLY the merged content, no explanations

Output the merged ${fileType}:`;

  try {
    // Use stdin to avoid shell escaping issues with large prompts
    const result = execSync('claude -p --model haiku', {
      input: prompt,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      timeout: 60000, // 60 second timeout
    });

    const trimmed = result.trim();

    // Validate the response is not an error message
    if (trimmed.includes('Error:') || trimmed.includes('error:') || trimmed.length < 100) {
      console.warn('  ⚠ Claude merge returned invalid response, using new content');
      return newContent;
    }

    return trimmed;
  } catch (error) {
    // If Claude CLI fails, return new content with a warning
    console.warn('  ⚠ Could not use Claude for merge (CLI not available), using new content');
    console.warn(`  ⚠ Error: ${error.message}`);
    return newContent;
  }
}

/**
 * Smart write that merges with existing content if file exists
 * @param {string} filePath - Path to the file
 * @param {string} newContent - New content to write
 * @param {string} fileType - Type of file for merge context
 * @param {boolean} useMerge - Whether to use Claude merge
 */
function smartWrite(filePath, newContent, fileType, useMerge = true) {
  if (useMerge && existsSync(filePath)) {
    const existingContent = readFileSync(filePath, 'utf-8');
    const mergedContent = mergeWithClaude(existingContent, newContent, fileType);
    writeFileSync(filePath, mergedContent);
    return { merged: true, path: filePath };
  }
  writeFileSync(filePath, newContent);
  return { merged: false, path: filePath };
}

/**
 * Interactive prompt helper
 */
function createPrompt() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    ask: (question) => new Promise((resolve) => {
      rl.question(question, (answer) => resolve(answer.trim()));
    }),
    select: async (question, options) => {
      console.log(`\n${question}\n`);
      options.forEach((opt, i) => {
        console.log(`  ${i + 1}) ${opt.label}${opt.description ? ` - ${opt.description}` : ''}`);
      });
      const answer = await new Promise((resolve) => {
        rl.question('\n  Enter number: ', resolve);
      });
      const index = parseInt(answer) - 1;
      return options[index] || options[0];
    },
    confirm: async (question) => {
      const answer = await new Promise((resolve) => {
        rl.question(`${question} (Y/n): `, resolve);
      });
      return answer.toLowerCase() !== 'n';
    },
    close: () => rl.close(),
  };
}

/**
 * Generate CLAUDE.md content
 */
function generateClaudeMd(config) {
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

### Verification
- ALWAYS run \`${commands.verify || 'tests'}\` before committing
- NEVER skip tests without explicit approval
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

/**
 * Generate settings.json
 */
function generateSettings(config) {
  const { stack, commands } = config;
  const pm = stack.packageManager?.name || 'npm';

  const allowedCommands = [];

  // Add package manager commands
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

  // Add common commands
  allowedCommands.push('Bash(git:*)');
  allowedCommands.push('Bash(gh:*)');

  // Add stack-specific commands
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

  // Add hooks for formatting
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

/**
 * Generate universal command files
 */
function generateCommandFile(name, config) {
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
${commands.format || commands.lint + ' --fix' || '# No format command detected'}
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
  };

  return templates[name] || '';
}

/**
 * Run project setup wizard
 */
export async function runProjectWizard(options = {}) {
  const { dryRun = false, silent = false } = options;
  const projectPath = process.cwd();
  const projectName = basename(projectPath);

  const log = silent ? () => {} : console.log;
  const prompt = createPrompt();

  try {
    log('\n  Claude Code Project Setup\n');
    log('  This wizard will configure Claude Code for your project.\n');

    // Ask about AI analysis
    const useAI = await prompt.confirm('  Use Claude AI for smarter detection? (recommended)');

    let stack;
    let commands;
    let aiAnalysis = null;

    if (useAI) {
      log('\n  Analyzing project with Claude AI...\n');
      aiAnalysis = analyzeWithClaude(projectPath);

      if (aiAnalysis) {
        stack = aiAnalysis.stack;
        commands = aiAnalysis.commands;

        if (aiAnalysis.preferences?.notes) {
          log(`  Notes: ${aiAnalysis.preferences.notes}\n`);
        }
      } else {
        log('  AI analysis failed, falling back to deterministic detection...\n');
        stack = detectStack(projectPath);
        commands = generateCommands(stack);
      }
    } else {
      log('\n  Analyzing project...\n');
      stack = detectStack(projectPath);
      commands = generateCommands(stack);
    }

    // Show detection results
    log('  Detected configuration:\n');

    if (stack.stacks.length > 0) {
      log(`    Language:        ${stack.stacks.map(s => s.name).join(', ')}`);
    } else {
      log('    Language:        Not detected');
    }

    if (stack.framework) {
      log(`    Framework:       ${stack.framework.name}`);
    }

    if (stack.packageManager) {
      log(`    Package Manager: ${stack.packageManager.name}`);
    }

    if (stack.monorepo) {
      log(`    Monorepo:        ${stack.monorepo.name}`);
    }

    if (stack.ci) {
      log(`    CI/CD:           ${stack.ci.name}`);
    }

    log('\n  Generated commands:\n');
    if (commands.setup) log(`    Setup:    ${commands.setup}`);
    if (commands.dev) log(`    Dev:      ${commands.dev}`);
    if (commands.test) log(`    Test:     ${commands.test}`);
    if (commands.lint) log(`    Lint:     ${commands.lint}`);
    if (commands.build) log(`    Build:    ${commands.build}`);

    // Confirm or customize
    log('');
    const confirmed = await prompt.confirm('  Proceed with this configuration?');

    if (!confirmed) {
      log('\n  Setup cancelled.\n');
      prompt.close();
      return null;
    }

    // Ask for custom rules
    log('\n  Any project-specific rules? (one per line, empty line to finish)\n');
    const customRules = [];
    let rule = await prompt.ask('    Rule: ');
    while (rule) {
      customRules.push(rule);
      rule = await prompt.ask('    Rule: ');
    }

    // Generate config
    const config = {
      projectName,
      stack,
      commands,
      customRules,
    };

    // Check existing .claude directory
    const claudeDir = join(projectPath, '.claude');
    const hasExisting = existsSync(claudeDir);
    const hasExistingClaudeMd = existsSync(join(projectPath, 'CLAUDE.md'));
    let useMerge = false;

    if (hasExisting || hasExistingClaudeMd) {
      log('\n  Existing configuration detected.\n');
      const mergeChoice = await prompt.select('  How would you like to proceed?', [
        { label: 'Merge', description: 'Use Claude CLI to intelligently merge with existing config (recommended)' },
        { label: 'Overwrite', description: 'Replace all existing configuration' },
        { label: 'Cancel', description: 'Keep existing configuration unchanged' },
      ]);

      if (mergeChoice.label === 'Cancel') {
        log('\n  Setup cancelled.\n');
        prompt.close();
        return null;
      }

      useMerge = mergeChoice.label === 'Merge';

      if (useMerge) {
        log('\n  Will use Claude CLI to merge configurations intelligently.');
        log('  Note: If Claude CLI is not available, new content will be used.\n');
      }
    }

    prompt.close();

    if (dryRun) {
      const action = useMerge ? 'merge with' : 'create';
      log(`\n  DRY RUN - Would ${action}:\n`);
      log('    .claude/');
      log('    ├── commands/test.md');
      log('    ├── commands/lint.md');
      log('    ├── commands/verify.md');
      log('    ├── commands/setup.md');
      log('    ├── commands/pr.md');
      log('    ├── commands/commit.md');
      log('    ├── settings.json');
      log('    CLAUDE.md');
      if (useMerge) {
        log('\n  Note: Claude will intelligently merge with existing files.\n');
      }
      return config;
    }

    // Create directories
    mkdirSync(join(claudeDir, 'commands'), { recursive: true });

    // Write files with smart merge
    const files = [
      { path: join(projectPath, 'CLAUDE.md'), content: generateClaudeMd(config), type: 'CLAUDE.md' },
      { path: join(claudeDir, 'settings.json'), content: JSON.stringify(generateSettings(config), null, 2), type: 'settings.json' },
      { path: join(claudeDir, 'commands', 'test.md'), content: generateCommandFile('test', config), type: 'command file' },
      { path: join(claudeDir, 'commands', 'lint.md'), content: generateCommandFile('lint', config), type: 'command file' },
      { path: join(claudeDir, 'commands', 'verify.md'), content: generateCommandFile('verify', config), type: 'command file' },
      { path: join(claudeDir, 'commands', 'setup.md'), content: generateCommandFile('setup', config), type: 'command file' },
      { path: join(claudeDir, 'commands', 'pr.md'), content: generateCommandFile('pr', config), type: 'command file' },
      { path: join(claudeDir, 'commands', 'commit.md'), content: generateCommandFile('commit', config), type: 'command file' },
    ];

    for (const file of files) {
      const result = smartWrite(file.path, file.content, file.type, useMerge);
      const symbol = result.merged ? '~' : '+';
      const action = result.merged ? 'merged' : 'created';
      log(`  ${symbol} ${file.path.replace(projectPath, '.')} (${action})`);
    }

    log('\n  Project setup complete!\n');
    if (useMerge) {
      log('  Files were merged with existing configuration.');
      log('  Your custom settings and preferences were preserved.\n');
    }
    log('  Next steps:');
    log('    1. Review CLAUDE.md and adjust as needed');
    log('    2. Commit .claude/ to your repository');
    log('    3. Run /test, /lint, /verify, /commit, /pr in Claude Code\n');

    return config;
  } catch (error) {
    prompt.close();
    throw error;
  }
}

export default { runProjectWizard, detectStack, generateCommands };
