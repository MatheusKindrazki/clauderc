/**
 * Project setup wizard
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { detectStack, generateCommands, analyzeWithClaude } from './detector.js';
import { getProviderChoices, resolveProviders } from './providers/index.js';

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
 * Run project setup wizard
 */
export async function runProjectWizard(options = {}) {
  const { dryRun = false, silent = false, provider = null } = options;
  const projectPath = process.cwd();
  const projectName = basename(projectPath);

  const log = silent ? () => {} : console.log;
  const prompt = createPrompt();

  try {
    log('\n  AI Coding Assistant Project Setup\n');
    log('  This wizard will configure your project for AI coding tools.\n');

    // Provider selection - first step (skip if --provider flag was passed)
    let providers;
    if (provider) {
      providers = resolveProviders(provider);
      const providerLabel = providers.map(p => p.name).join(' + ');
      log(`  Provider: ${providerLabel}\n`);
    } else {
      const providerChoice = await prompt.select('  Which AI coding tool(s) do you use?', getProviderChoices());
      providers = resolveProviders(providerChoice.id);
    }

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
      projectPath,
      stack,
      commands,
      customRules,
    };

    // Check existing provider artifacts
    let hasExisting = false;
    for (const provider of providers) {
      if (existsSync(join(projectPath, provider.projectDir)) ||
          existsSync(join(projectPath, provider.instructionFile))) {
        hasExisting = true;
        break;
      }
    }

    let useMerge = false;

    if (hasExisting) {
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
      for (const provider of providers) {
        log(`    [${provider.name}]`);
        const files = provider.generateProjectFiles(config);
        for (const file of files) {
          log(`    ${file.path.replace(projectPath, '.')}`);
        }
      }
      if (useMerge) {
        log('\n  Note: Claude will intelligently merge with existing files.\n');
      }
      return config;
    }

    // Generate files for each provider
    for (const provider of providers) {
      const providerDir = join(projectPath, provider.projectDir);
      for (const subDir of provider.getDirectories()) {
        mkdirSync(join(providerDir, subDir), { recursive: true });
      }

      const files = provider.generateProjectFiles(config);
      for (const file of files) {
        const result = smartWrite(file.path, file.content, file.type, useMerge);
        const symbol = result.merged ? '~' : '+';
        const action = result.merged ? 'merged' : 'created';
        log(`  ${symbol} ${file.path.replace(projectPath, '.')} (${action})`);
      }
    }

    log('\n  Project setup complete!\n');
    if (useMerge) {
      log('  Files were merged with existing configuration.');
      log('  Your custom settings and preferences were preserved.\n');
    }

    const providerNames = providers.map(p => p.name).join(' & ');
    log(`  Configured for: ${providerNames}\n`);
    log('  Next steps:');
    for (const provider of providers) {
      log(`    - Review ${provider.instructionFile} and adjust as needed`);
      log(`    - Commit ${provider.projectDir}/ to your repository`);
    }
    log('');

    return config;
  } catch (error) {
    prompt.close();
    throw error;
  }
}

export default { runProjectWizard, detectStack, generateCommands };
