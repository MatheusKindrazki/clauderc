/**
 * Project stack detector
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { STACKS, MONOREPO_TOOLS, CI_PLATFORMS } from './stacks.js';

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

export default { detectStack, generateCommands };
