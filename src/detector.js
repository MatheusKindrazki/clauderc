/**
 * Project stack detector
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { STACKS, MONOREPO_TOOLS, CI_PLATFORMS } from './stacks.js';

/**
 * Files to read for LLM analysis
 */
const ANALYSIS_FILES = [
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'go.mod',
  'Cargo.toml',
  'composer.json',
  'Gemfile',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'mix.exs',
  'pubspec.yaml',
  'Package.swift',
  '*.csproj',
  'turbo.json',
  'nx.json',
  'pnpm-workspace.yaml',
  'lerna.json',
  '.github/workflows/*.yml',
  '.gitlab-ci.yml',
  'Jenkinsfile',
  'biome.json',
  'biome.jsonc',
  '.eslintrc*',
  '.prettierrc*',
  'tsconfig.json',
  'vite.config.*',
  'next.config.*',
  'nuxt.config.*',
];

/**
 * Read relevant project files for analysis
 */
function readProjectFiles(projectPath) {
  const files = {};

  for (const pattern of ANALYSIS_FILES) {
    if (pattern.includes('*')) {
      // Handle glob patterns
      const parts = pattern.split('/');
      let searchPath = projectPath;
      let filePattern = pattern;

      if (parts.length > 1) {
        searchPath = join(projectPath, ...parts.slice(0, -1));
        filePattern = parts[parts.length - 1];
      }

      if (existsSync(searchPath)) {
        const dirFiles = safeReadDir(searchPath);
        const regex = new RegExp('^' + filePattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        for (const file of dirFiles) {
          if (regex.test(file)) {
            const fullPath = join(searchPath, file);
            const relativePath = fullPath.replace(projectPath + '/', '');
            const content = safeReadFile(fullPath);
            if (content && content.length < 10000) { // Limit file size
              files[relativePath] = content;
            }
          }
        }
      }
    } else {
      const fullPath = join(projectPath, pattern);
      if (existsSync(fullPath)) {
        const content = safeReadFile(fullPath);
        if (content && content.length < 10000) {
          files[pattern] = content;
        }
      }
    }
  }

  return files;
}

/**
 * Analyze project using Claude LLM
 * @param {string} projectPath - Path to the project
 * @returns {Object} - Detection result compatible with detectStack output
 */
export function analyzeWithClaude(projectPath = process.cwd()) {
  const files = readProjectFiles(projectPath);

  if (Object.keys(files).length === 0) {
    console.warn('  ⚠ No project files found for analysis');
    return null;
  }

  const filesContent = Object.entries(files)
    .map(([name, content]) => `=== ${name} ===\n${content}`)
    .join('\n\n');

  const prompt = `Analyze this project and return a JSON configuration for Claude Code setup.

PROJECT FILES:
${filesContent}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "stack": {
    "language": "Node.js|Python|Go|Rust|Java|PHP|Ruby|.NET|Elixir|Dart|Swift",
    "framework": "Next.js|Nuxt|React|Vue|FastAPI|Django|Flask|Express|Gin|Rails|Laravel|Phoenix|etc or null",
    "packageManager": "npm|pnpm|bun|yarn|pip|poetry|uv|cargo|go|maven|gradle|composer|bundler|mix|etc",
    "monorepo": "turborepo|nx|lerna|pnpm-workspaces|yarn-workspaces or null",
    "testFramework": "vitest|jest|pytest|go test|cargo test|phpunit|rspec|etc or null",
    "linter": "eslint|biome|ruff|golangci-lint|clippy|rubocop|etc or null",
    "formatter": "prettier|biome|black|ruff|gofmt|rustfmt|etc or null",
    "ci": "github-actions|gitlab-ci|jenkins|circleci or null"
  },
  "commands": {
    "setup": "command to install dependencies",
    "dev": "command to run dev server",
    "test": "command to run tests",
    "lint": "command to lint code",
    "format": "command to format code",
    "typecheck": "command to check types or null",
    "build": "command to build or null",
    "verify": "combined lint + test + build command"
  },
  "preferences": {
    "notes": "any special preferences detected (e.g., prefers bun over npm, uses specific conventions)"
  }
}

IMPORTANT:
- Detect ACTUAL tools being used, not defaults
- If bun.lockb exists, use bun commands
- If pnpm-lock.yaml exists, use pnpm commands
- If uv.lock exists, use uv commands
- Look at scripts in package.json for exact command names
- Return commands that will actually work for this project`;

  try {
    // Use stdin to avoid shell escaping issues with large prompts
    const result = execSync('claude -p --model haiku', {
      input: prompt,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10,
      timeout: 120000, // 2 minute timeout
      cwd: projectPath,
    });

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('  ⚠ Could not parse Claude response - no JSON found in output');
      return null;
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn('  ⚠ Could not parse JSON from Claude response:', parseError.message);
      return null;
    }

    // Validate the analysis has the expected structure
    if (!analysis.stack || !analysis.commands) {
      console.warn('  ⚠ Claude response missing required fields (stack, commands)');
      return null;
    }

    // Convert to detectStack compatible format
    return {
      analysis,
      stack: convertToStackFormat(analysis.stack),
      commands: analysis.commands,
      preferences: analysis.preferences,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('  ⚠ Claude CLI not found - install from https://claude.com/code');
    } else {
      console.warn('  ⚠ Claude analysis failed:', error.message);
    }
    return null;
  }
}

/**
 * Convert LLM analysis to detectStack format
 */
function convertToStackFormat(llmStack) {
  const result = {
    stacks: [],
    packageManager: null,
    framework: null,
    monorepo: null,
    ci: null,
    testFramework: null,
    linter: null,
    formatter: null,
    typechecker: null,
  };

  // Map language to stack
  const languageMap = {
    'Node.js': 'node',
    'Python': 'python',
    'Go': 'go',
    'Rust': 'rust',
    'Java': 'java',
    'PHP': 'php',
    'Ruby': 'ruby',
    '.NET': 'dotnet',
    'Elixir': 'elixir',
    'Dart': 'dart',
    'Swift': 'swift',
  };

  const stackId = languageMap[llmStack.language];
  if (stackId && STACKS[stackId]) {
    result.stacks.push({ id: stackId, name: llmStack.language, ...STACKS[stackId] });
  }

  // Package manager
  if (llmStack.packageManager) {
    result.packageManager = {
      name: llmStack.packageManager,
      install: getInstallCommand(llmStack.packageManager),
      run: getRunCommand(llmStack.packageManager),
    };
  }

  // Framework
  if (llmStack.framework) {
    result.framework = { name: llmStack.framework };
  }

  // Monorepo
  if (llmStack.monorepo) {
    result.monorepo = { name: llmStack.monorepo };
  }

  // CI
  if (llmStack.ci) {
    result.ci = { name: llmStack.ci };
  }

  // Tools
  result.testFramework = llmStack.testFramework;
  result.linter = llmStack.linter;
  result.formatter = llmStack.formatter;

  return result;
}

/**
 * Get install command for package manager
 */
function getInstallCommand(pm) {
  const commands = {
    npm: 'npm install',
    pnpm: 'pnpm install',
    bun: 'bun install',
    yarn: 'yarn install',
    pip: 'pip install -r requirements.txt',
    poetry: 'poetry install',
    uv: 'uv sync',
    cargo: 'cargo build',
    go: 'go mod download',
    maven: 'mvn install -DskipTests',
    gradle: 'gradle build -x test',
    composer: 'composer install',
    bundler: 'bundle install',
    mix: 'mix deps.get',
  };
  return commands[pm] || `${pm} install`;
}

/**
 * Get run command prefix for package manager
 */
function getRunCommand(pm) {
  const commands = {
    npm: 'npm run',
    pnpm: 'pnpm',
    bun: 'bun run',
    yarn: 'yarn',
    poetry: 'poetry run',
    uv: 'uv run',
  };
  return commands[pm] || '';
}

/**
 * Detect project stack from current directory
 */
export function detectStack(projectPath = process.cwd()) {
  const result = {
    stacks: [],
    packageManager: null,
    framework: null,
    monorepo: null,
    ci: null,
    testFramework: null,
    linter: null,
    formatter: null,
    typechecker: null,
  };

  // Detect primary stacks
  for (const [stackId, stack] of Object.entries(STACKS)) {
    for (const detectFile of stack.detect) {
      if (detectFile.includes('*')) {
        // Glob pattern
        const pattern = detectFile.replace('*', '');
        const files = safeReadDir(projectPath);
        if (files.some(f => f.endsWith(pattern))) {
          result.stacks.push({ id: stackId, ...stack });
          break;
        }
      } else if (existsSync(join(projectPath, detectFile))) {
        result.stacks.push({ id: stackId, ...stack });
        break;
      }
    }
  }

  // Detect package manager for Node.js
  const nodeStack = result.stacks.find(s => s.id === 'node');
  if (nodeStack) {
    result.packageManager = detectNodePackageManager(projectPath);
    result.framework = detectNodeFramework(projectPath);
    const tools = detectNodeTools(projectPath);
    result.testFramework = tools.test;
    result.linter = tools.linter;
    result.formatter = tools.formatter;
    result.typechecker = tools.typechecker;
  }

  // Detect package manager for Python
  const pythonStack = result.stacks.find(s => s.id === 'python');
  if (pythonStack) {
    result.packageManager = detectPythonPackageManager(projectPath);
    result.framework = detectPythonFramework(projectPath);
  }

  // Detect package manager for Java
  const javaStack = result.stacks.find(s => s.id === 'java');
  if (javaStack) {
    result.packageManager = detectJavaPackageManager(projectPath);
  }

  // Detect framework for Ruby
  const rubyStack = result.stacks.find(s => s.id === 'ruby');
  if (rubyStack) {
    result.framework = detectRubyFramework(projectPath);
  }

  // Detect framework for PHP
  const phpStack = result.stacks.find(s => s.id === 'php');
  if (phpStack) {
    result.framework = detectPHPFramework(projectPath);
  }

  // Detect monorepo
  result.monorepo = detectMonorepo(projectPath);

  // Detect CI
  result.ci = detectCI(projectPath);

  return result;
}

function safeReadDir(path) {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
}

function safeReadFile(path) {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

function safeParseJSON(path) {
  const content = safeReadFile(path);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function detectNodePackageManager(projectPath) {
  const managers = STACKS.node.packageManagers;
  for (const [name, config] of Object.entries(managers)) {
    if (existsSync(join(projectPath, config.lockfile))) {
      return { name, ...config };
    }
  }
  // Default to npm if package.json exists but no lockfile
  if (existsSync(join(projectPath, 'package.json'))) {
    return { name: 'npm', ...managers.npm };
  }
  return null;
}

function detectNodeFramework(projectPath) {
  const pkg = safeParseJSON(join(projectPath, 'package.json'));
  if (!pkg) return null;

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  for (const [name, config] of Object.entries(STACKS.node.frameworks)) {
    if (deps[config.detect]) {
      return { name, ...config };
    }
  }
  return null;
}

function detectNodeTools(projectPath) {
  const pkg = safeParseJSON(join(projectPath, 'package.json'));
  if (!pkg) return {};

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const result = {};

  // Test framework
  if (deps.vitest) result.test = 'vitest';
  else if (deps.jest) result.test = 'jest';
  else if (deps.mocha) result.test = 'mocha';
  else if (deps.ava) result.test = 'ava';
  else if (deps.playwright) result.test = 'playwright';
  else if (deps.cypress) result.test = 'cypress';

  // Linter
  if (deps['@biomejs/biome'] || deps.biome) result.linter = 'biome';
  else if (deps.eslint) result.linter = 'eslint';
  else if (deps.oxlint) result.linter = 'oxlint';

  // Formatter
  if (deps['@biomejs/biome'] || deps.biome) result.formatter = 'biome';
  else if (deps.prettier) result.formatter = 'prettier';
  else if (deps.dprint) result.formatter = 'dprint';

  // Typechecker
  if (deps.typescript) result.typechecker = 'tsc';

  return result;
}

function detectPythonPackageManager(projectPath) {
  const managers = STACKS.python.packageManagers;
  for (const [name, config] of Object.entries(managers)) {
    if (existsSync(join(projectPath, config.lockfile))) {
      return { name, ...config };
    }
  }
  // Check pyproject.toml for poetry
  const pyproject = safeReadFile(join(projectPath, 'pyproject.toml'));
  if (pyproject?.includes('[tool.poetry]')) {
    return { name: 'poetry', ...managers.poetry };
  }
  if (existsSync(join(projectPath, 'requirements.txt'))) {
    return { name: 'pip', ...managers.pip };
  }
  return null;
}

function detectPythonFramework(projectPath) {
  const pyproject = safeReadFile(join(projectPath, 'pyproject.toml'));
  const requirements = safeReadFile(join(projectPath, 'requirements.txt'));
  const content = (pyproject || '') + (requirements || '');

  for (const [name, config] of Object.entries(STACKS.python.frameworks)) {
    if (content.includes(config.detect)) {
      return { name, ...config };
    }
  }
  return null;
}

function detectJavaPackageManager(projectPath) {
  if (existsSync(join(projectPath, 'pom.xml'))) {
    return { name: 'maven', ...STACKS.java.packageManagers.maven };
  }
  if (existsSync(join(projectPath, 'build.gradle.kts'))) {
    return { name: 'gradle-kts', ...STACKS.java.packageManagers.gradleKts };
  }
  if (existsSync(join(projectPath, 'build.gradle'))) {
    return { name: 'gradle', ...STACKS.java.packageManagers.gradle };
  }
  return null;
}

function detectRubyFramework(projectPath) {
  const gemfile = safeReadFile(join(projectPath, 'Gemfile'));
  if (!gemfile) return null;

  for (const [name, config] of Object.entries(STACKS.ruby.frameworks)) {
    if (gemfile.includes(config.detect)) {
      return { name, ...config };
    }
  }
  return null;
}

function detectPHPFramework(projectPath) {
  const composerJson = safeParseJSON(join(projectPath, 'composer.json'));
  if (!composerJson) return null;

  const deps = { ...composerJson.require, ...composerJson['require-dev'] };

  for (const [name, config] of Object.entries(STACKS.php.frameworks)) {
    if (deps[config.detect]) {
      return { name, ...config };
    }
  }
  return null;
}

function detectMonorepo(projectPath) {
  for (const [name, config] of Object.entries(MONOREPO_TOOLS)) {
    if (existsSync(join(projectPath, config.detect))) {
      // Special check for yarn workspaces
      if (name === 'yarnWorkspaces') {
        const pkg = safeParseJSON(join(projectPath, 'package.json'));
        if (!pkg?.workspaces) continue;
      }
      return { name, ...config };
    }
  }
  return null;
}

function detectCI(projectPath) {
  for (const [name, config] of Object.entries(CI_PLATFORMS)) {
    if (existsSync(join(projectPath, config.detect))) {
      return { name, ...config };
    }
  }
  return null;
}

/**
 * Generate commands based on detected stack
 */
export function generateCommands(detection) {
  const commands = {
    setup: null,
    dev: null,
    test: null,
    lint: null,
    format: null,
    typecheck: null,
    build: null,
    verify: null,
  };

  const stack = detection.stacks[0];
  if (!stack) return commands;

  const pm = detection.packageManager;

  switch (stack.id) {
    case 'node': {
      const run = pm?.run || 'npm run';
      commands.setup = pm?.install || 'npm install';
      commands.dev = `${run} dev`;
      commands.test = `${run} test`;
      commands.lint = `${run} lint`;
      commands.format = `${run} format`;
      commands.typecheck = `${run} typecheck`;
      commands.build = `${run} build`;
      break;
    }
    case 'python': {
      const run = pm?.run || '';
      const prefix = run ? `${run} ` : '';
      commands.setup = pm?.install || 'pip install -r requirements.txt';
      commands.dev = detection.framework?.dev || `${prefix}python -m app`;
      commands.test = `${prefix}pytest`;
      commands.lint = `${prefix}ruff check .`;
      commands.format = `${prefix}ruff format .`;
      commands.typecheck = `${prefix}mypy .`;
      break;
    }
    case 'go':
      commands.setup = 'go mod download';
      commands.dev = 'go run .';
      commands.test = 'go test ./...';
      commands.lint = 'golangci-lint run';
      commands.format = 'gofmt -w .';
      commands.build = 'go build ./...';
      break;
    case 'rust':
      commands.setup = 'cargo build';
      commands.dev = 'cargo run';
      commands.test = 'cargo test';
      commands.lint = 'cargo clippy';
      commands.format = 'cargo fmt';
      commands.build = 'cargo build --release';
      break;
    case 'java': {
      const isMaven = pm?.name === 'maven';
      commands.setup = isMaven ? 'mvn install -DskipTests' : 'gradle build -x test';
      commands.dev = isMaven ? 'mvn spring-boot:run' : 'gradle bootRun';
      commands.test = isMaven ? 'mvn test' : 'gradle test';
      commands.lint = isMaven ? 'mvn checkstyle:check' : 'gradle checkstyleMain';
      commands.build = isMaven ? 'mvn package' : 'gradle build';
      break;
    }
    case 'php':
      commands.setup = 'composer install';
      commands.test = 'vendor/bin/phpunit';
      commands.lint = 'vendor/bin/phpcs';
      commands.format = 'vendor/bin/php-cs-fixer fix';
      commands.dev = detection.framework?.dev || 'php -S localhost:8000';
      break;
    case 'ruby':
      commands.setup = 'bundle install';
      commands.test = 'bundle exec rspec';
      commands.lint = 'bundle exec rubocop';
      commands.format = 'bundle exec rubocop -a';
      commands.dev = detection.framework?.dev || 'bundle exec ruby app.rb';
      break;
    case 'dotnet':
      commands.setup = 'dotnet restore';
      commands.test = 'dotnet test';
      commands.build = 'dotnet build';
      commands.dev = 'dotnet run';
      commands.format = 'dotnet format';
      break;
    case 'elixir':
      commands.setup = 'mix deps.get';
      commands.test = 'mix test';
      commands.lint = 'mix credo';
      commands.format = 'mix format';
      commands.dev = 'mix phx.server';
      break;
    case 'dart':
      const isFlutter = detection.framework?.name === 'flutter';
      commands.setup = isFlutter ? 'flutter pub get' : 'dart pub get';
      commands.test = isFlutter ? 'flutter test' : 'dart test';
      commands.lint = 'dart analyze';
      commands.format = 'dart format .';
      commands.dev = isFlutter ? 'flutter run' : 'dart run';
      break;
    case 'swift':
      commands.build = 'swift build';
      commands.test = 'swift test';
      commands.dev = 'swift run';
      break;
  }

  // Generate verify command (lint + test + build)
  const verifyParts = [commands.lint, commands.test, commands.build].filter(Boolean);
  if (verifyParts.length > 0) {
    commands.verify = verifyParts.join(' && ');
  }

  return commands;
}

export default { detectStack, generateCommands, analyzeWithClaude };
