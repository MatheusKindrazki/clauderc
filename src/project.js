/**
 * Project setup wizard
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { createInterface } from 'readline';
import { detectStack, generateCommands } from './detector.js';

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

    pr: `# Create Pull Request

Commit, push, and create a PR.

## Steps
1. Stage all changes
2. Commit with descriptive message
3. Push to remote
4. Create PR with \`gh pr create\`

## Prerequisites
- \`gh\` CLI installed and authenticated
- All tests passing (\`/verify\`)
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
    log('\n  Analyzing project...\n');

    // Detect stack
    const stack = detectStack(projectPath);
    const commands = generateCommands(stack);

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

    if (hasExisting) {
      const overwrite = await prompt.confirm('\n  .claude/ already exists. Overwrite?');
      if (!overwrite) {
        log('\n  Setup cancelled.\n');
        prompt.close();
        return null;
      }
    }

    prompt.close();

    if (dryRun) {
      log('\n  DRY RUN - Would create:\n');
      log('    .claude/');
      log('    ├── commands/test.md');
      log('    ├── commands/lint.md');
      log('    ├── commands/verify.md');
      log('    ├── commands/setup.md');
      log('    ├── commands/pr.md');
      log('    ├── settings.json');
      log('    CLAUDE.md\n');
      return config;
    }

    // Create directories
    mkdirSync(join(claudeDir, 'commands'), { recursive: true });

    // Write files
    const files = [
      { path: join(projectPath, 'CLAUDE.md'), content: generateClaudeMd(config) },
      { path: join(claudeDir, 'settings.json'), content: JSON.stringify(generateSettings(config), null, 2) },
      { path: join(claudeDir, 'commands', 'test.md'), content: generateCommandFile('test', config) },
      { path: join(claudeDir, 'commands', 'lint.md'), content: generateCommandFile('lint', config) },
      { path: join(claudeDir, 'commands', 'verify.md'), content: generateCommandFile('verify', config) },
      { path: join(claudeDir, 'commands', 'setup.md'), content: generateCommandFile('setup', config) },
      { path: join(claudeDir, 'commands', 'pr.md'), content: generateCommandFile('pr', config) },
    ];

    for (const file of files) {
      writeFileSync(file.path, file.content);
      log(`  + ${file.path.replace(projectPath, '.')}`);
    }

    log('\n  Project setup complete!\n');
    log('  Next steps:');
    log('    1. Review CLAUDE.md and adjust as needed');
    log('    2. Commit .claude/ to your repository');
    log('    3. Run /test, /lint, /verify in Claude Code\n');

    return config;
  } catch (error) {
    prompt.close();
    throw error;
  }
}

export default { runProjectWizard, detectStack, generateCommands };
