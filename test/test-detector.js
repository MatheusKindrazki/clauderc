#!/usr/bin/env node
/**
 * Test script for stack detector
 */

import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { detectStack, generateCommands } from '../src/detector.js';

const TEST_DIR = '/tmp/claude-code-setup-test';

// Test scenarios
const testCases = [
  {
    name: 'Node.js with pnpm + Vitest + ESLint',
    files: {
      'package.json': JSON.stringify({
        name: 'test-node',
        scripts: { test: 'vitest', lint: 'eslint .', dev: 'vite' },
        devDependencies: { vitest: '^1.0.0', eslint: '^8.0.0', vite: '^5.0.0' },
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9',
    },
    expected: {
      stack: 'node',
      packageManager: 'pnpm',
      framework: 'vite',
      testFramework: 'vitest',
      linter: 'eslint',
    },
  },
  {
    name: 'Node.js with bun + Biome',
    files: {
      'package.json': JSON.stringify({
        name: 'test-bun',
        devDependencies: { '@biomejs/biome': '^1.0.0' },
      }),
      'bun.lockb': 'binary',
    },
    expected: {
      stack: 'node',
      packageManager: 'bun',
      linter: 'biome',
      formatter: 'biome',
    },
  },
  {
    name: 'Python with Poetry + FastAPI',
    files: {
      'pyproject.toml': `
[tool.poetry]
name = "test-python"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.100.0"
`,
      'poetry.lock': 'hash',
    },
    expected: {
      stack: 'python',
      packageManager: 'poetry',
      framework: 'fastapi',
    },
  },
  {
    name: 'Python with pip + Django',
    files: {
      'requirements.txt': 'django>=4.0\npytest\nruff',
    },
    expected: {
      stack: 'python',
      packageManager: 'pip',
      framework: 'django',
    },
  },
  {
    name: 'Go project',
    files: {
      'go.mod': `module example.com/test
go 1.21
require github.com/gin-gonic/gin v1.9.0`,
    },
    expected: {
      stack: 'go',
    },
  },
  {
    name: 'Rust project',
    files: {
      'Cargo.toml': `
[package]
name = "test-rust"
version = "0.1.0"

[dependencies]
axum = "0.7"
`,
    },
    expected: {
      stack: 'rust',
    },
  },
  {
    name: 'Java with Maven',
    files: {
      'pom.xml': '<project><artifactId>test</artifactId></project>',
    },
    expected: {
      stack: 'java',
      packageManager: 'maven',
    },
  },
  {
    name: 'Java with Gradle Kotlin DSL',
    files: {
      'build.gradle.kts': 'plugins { kotlin("jvm") }',
    },
    expected: {
      stack: 'java',
      packageManager: 'gradle-kts',
    },
  },
  {
    name: 'Ruby with Rails',
    files: {
      'Gemfile': "source 'https://rubygems.org'\ngem 'rails'",
    },
    expected: {
      stack: 'ruby',
      framework: 'rails',
    },
  },
  {
    name: 'PHP with Laravel',
    files: {
      'composer.json': JSON.stringify({
        require: { 'laravel/framework': '^10.0' },
      }),
    },
    expected: {
      stack: 'php',
      framework: 'laravel',
    },
  },
  {
    name: 'Elixir with Phoenix',
    files: {
      'mix.exs': 'defmodule Test do use Mix.Project; defp deps do [{:phoenix, "~> 1.7"}] end end',
    },
    expected: {
      stack: 'elixir',
    },
  },
  {
    name: 'Monorepo with Turborepo',
    files: {
      'package.json': JSON.stringify({
        name: 'test-monorepo',
        workspaces: ['packages/*'],
      }),
      'turbo.json': JSON.stringify({ pipeline: { build: {} } }),
      'pnpm-lock.yaml': 'lockfileVersion: 9',
    },
    expected: {
      stack: 'node',
      packageManager: 'pnpm',
      monorepo: 'turborepo',
    },
  },
  {
    name: 'GitHub Actions CI',
    files: {
      'package.json': JSON.stringify({ name: 'test-ci' }),
      '.github/workflows/ci.yml': 'name: CI',
    },
    expected: {
      stack: 'node',
      ci: 'github',
    },
  },
];

function setupTestDir(files) {
  // Clean up
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true });
  }
  mkdirSync(TEST_DIR, { recursive: true });

  // Create files
  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(TEST_DIR, path);
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    if (dir !== TEST_DIR) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(fullPath, content);
  }
}

function runTests() {
  console.log('\n  Stack Detector Tests\n');
  console.log('  ' + '='.repeat(50) + '\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    setupTestDir(testCase.files);

    const detection = detectStack(TEST_DIR);
    const commands = generateCommands(detection);

    let testPassed = true;
    const errors = [];

    // Check stack
    if (testCase.expected.stack) {
      const detectedStack = detection.stacks[0]?.id;
      if (detectedStack !== testCase.expected.stack) {
        testPassed = false;
        errors.push(`Stack: expected "${testCase.expected.stack}", got "${detectedStack}"`);
      }
    }

    // Check package manager
    if (testCase.expected.packageManager) {
      if (detection.packageManager?.name !== testCase.expected.packageManager) {
        testPassed = false;
        errors.push(`PM: expected "${testCase.expected.packageManager}", got "${detection.packageManager?.name}"`);
      }
    }

    // Check framework
    if (testCase.expected.framework) {
      if (detection.framework?.name !== testCase.expected.framework) {
        testPassed = false;
        errors.push(`Framework: expected "${testCase.expected.framework}", got "${detection.framework?.name}"`);
      }
    }

    // Check test framework
    if (testCase.expected.testFramework) {
      if (detection.testFramework !== testCase.expected.testFramework) {
        testPassed = false;
        errors.push(`Test: expected "${testCase.expected.testFramework}", got "${detection.testFramework}"`);
      }
    }

    // Check linter
    if (testCase.expected.linter) {
      if (detection.linter !== testCase.expected.linter) {
        testPassed = false;
        errors.push(`Linter: expected "${testCase.expected.linter}", got "${detection.linter}"`);
      }
    }

    // Check formatter
    if (testCase.expected.formatter) {
      if (detection.formatter !== testCase.expected.formatter) {
        testPassed = false;
        errors.push(`Formatter: expected "${testCase.expected.formatter}", got "${detection.formatter}"`);
      }
    }

    // Check monorepo
    if (testCase.expected.monorepo) {
      if (detection.monorepo?.name !== testCase.expected.monorepo) {
        testPassed = false;
        errors.push(`Monorepo: expected "${testCase.expected.monorepo}", got "${detection.monorepo?.name}"`);
      }
    }

    // Check CI
    if (testCase.expected.ci) {
      if (detection.ci?.name !== testCase.expected.ci) {
        testPassed = false;
        errors.push(`CI: expected "${testCase.expected.ci}", got "${detection.ci?.name}"`);
      }
    }

    if (testPassed) {
      console.log(`  [PASS] ${testCase.name}`);
      passed++;
    } else {
      console.log(`  [FAIL] ${testCase.name}`);
      for (const error of errors) {
        console.log(`         - ${error}`);
      }
      failed++;
    }
  }

  // Cleanup
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true });
  }

  console.log('\n  ' + '='.repeat(50));
  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);

  return failed === 0;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
