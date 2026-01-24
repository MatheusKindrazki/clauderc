/**
 * Stack detection and commands for multiple languages/frameworks
 */

export const STACKS = {
  // ==================== Node.js / TypeScript ====================
  node: {
    name: 'Node.js',
    detect: ['package.json'],
    packageManagers: {
      bun: { lockfile: 'bun.lockb', install: 'bun install', run: 'bun run' },
      pnpm: { lockfile: 'pnpm-lock.yaml', install: 'pnpm install', run: 'pnpm run' },
      yarn: { lockfile: 'yarn.lock', install: 'yarn install', run: 'yarn' },
      npm: { lockfile: 'package-lock.json', install: 'npm install', run: 'npm run' },
    },
    commands: {
      test: ['test', 'test:unit', 'vitest', 'jest'],
      lint: ['lint', 'lint:fix', 'eslint'],
      format: ['format', 'prettier'],
      typecheck: ['typecheck', 'tsc', 'type-check'],
      build: ['build', 'compile'],
      dev: ['dev', 'start', 'serve'],
    },
    frameworks: {
      next: { detect: 'next', dev: 'next dev', build: 'next build' },
      nuxt: { detect: 'nuxt', dev: 'nuxt dev', build: 'nuxt build' },
      remix: { detect: '@remix-run', dev: 'remix dev', build: 'remix build' },
      astro: { detect: 'astro', dev: 'astro dev', build: 'astro build' },
      vite: { detect: 'vite', dev: 'vite', build: 'vite build' },
      express: { detect: 'express', dev: 'node src/index.js' },
      fastify: { detect: 'fastify', dev: 'node src/index.js' },
      nestjs: { detect: '@nestjs/core', dev: 'nest start --watch', build: 'nest build' },
    },
  },

  // ==================== Python ====================
  python: {
    name: 'Python',
    detect: ['pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile'],
    packageManagers: {
      poetry: { lockfile: 'poetry.lock', install: 'poetry install', run: 'poetry run' },
      pipenv: { lockfile: 'Pipfile.lock', install: 'pipenv install', run: 'pipenv run' },
      uv: { lockfile: 'uv.lock', install: 'uv sync', run: 'uv run' },
      pip: { lockfile: 'requirements.txt', install: 'pip install -r requirements.txt', run: '' },
    },
    commands: {
      test: 'pytest',
      lint: 'ruff check .',
      format: 'ruff format .',
      typecheck: 'mypy .',
    },
    frameworks: {
      django: { detect: 'django', dev: 'python manage.py runserver', test: 'python manage.py test' },
      fastapi: { detect: 'fastapi', dev: 'uvicorn app.main:app --reload' },
      flask: { detect: 'flask', dev: 'flask run --reload' },
      pytorch: { detect: 'torch' },
      tensorflow: { detect: 'tensorflow' },
    },
  },

  // ==================== Go ====================
  go: {
    name: 'Go',
    detect: ['go.mod'],
    commands: {
      test: 'go test ./...',
      lint: 'golangci-lint run',
      format: 'gofmt -w .',
      build: 'go build ./...',
      dev: 'go run .',
      tidy: 'go mod tidy',
    },
    frameworks: {
      gin: { detect: 'github.com/gin-gonic/gin' },
      echo: { detect: 'github.com/labstack/echo' },
      fiber: { detect: 'github.com/gofiber/fiber' },
      chi: { detect: 'github.com/go-chi/chi' },
    },
  },

  // ==================== Rust ====================
  rust: {
    name: 'Rust',
    detect: ['Cargo.toml'],
    commands: {
      test: 'cargo test',
      lint: 'cargo clippy',
      format: 'cargo fmt',
      formatCheck: 'cargo fmt --check',
      build: 'cargo build',
      buildRelease: 'cargo build --release',
      dev: 'cargo run',
      check: 'cargo check',
    },
    frameworks: {
      actix: { detect: 'actix-web' },
      axum: { detect: 'axum' },
      rocket: { detect: 'rocket' },
      tauri: { detect: 'tauri', dev: 'cargo tauri dev', build: 'cargo tauri build' },
    },
  },

  // ==================== Java / Kotlin ====================
  java: {
    name: 'Java/Kotlin',
    detect: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    packageManagers: {
      maven: { detect: 'pom.xml', install: 'mvn install', run: 'mvn' },
      gradle: { detect: 'build.gradle', install: 'gradle build', run: 'gradle' },
      gradleKts: { detect: 'build.gradle.kts', install: 'gradle build', run: 'gradle' },
    },
    commands: {
      test: { maven: 'mvn test', gradle: 'gradle test' },
      lint: { maven: 'mvn checkstyle:check', gradle: 'gradle checkstyleMain' },
      build: { maven: 'mvn package', gradle: 'gradle build' },
      dev: { maven: 'mvn spring-boot:run', gradle: 'gradle bootRun' },
    },
    frameworks: {
      spring: { detect: 'spring-boot' },
      quarkus: { detect: 'quarkus', dev: 'quarkus dev' },
      micronaut: { detect: 'micronaut' },
    },
  },

  // ==================== PHP ====================
  php: {
    name: 'PHP',
    detect: ['composer.json'],
    commands: {
      install: 'composer install',
      test: 'vendor/bin/phpunit',
      lint: 'vendor/bin/phpcs',
      format: 'vendor/bin/php-cs-fixer fix',
    },
    frameworks: {
      laravel: { detect: 'laravel/framework', dev: 'php artisan serve', test: 'php artisan test' },
      symfony: { detect: 'symfony/framework-bundle', dev: 'symfony server:start' },
      wordpress: { detect: 'wordpress' },
    },
  },

  // ==================== Ruby ====================
  ruby: {
    name: 'Ruby',
    detect: ['Gemfile'],
    commands: {
      install: 'bundle install',
      test: 'bundle exec rspec',
      lint: 'bundle exec rubocop',
      format: 'bundle exec rubocop -a',
    },
    frameworks: {
      rails: { detect: 'rails', dev: 'rails server', test: 'rails test' },
      sinatra: { detect: 'sinatra' },
    },
  },

  // ==================== C# / .NET ====================
  dotnet: {
    name: '.NET/C#',
    detect: ['*.csproj', '*.sln', '*.fsproj'],
    commands: {
      restore: 'dotnet restore',
      test: 'dotnet test',
      build: 'dotnet build',
      dev: 'dotnet run',
      format: 'dotnet format',
    },
    frameworks: {
      aspnet: { detect: 'Microsoft.AspNetCore' },
      maui: { detect: 'Microsoft.Maui' },
      blazor: { detect: 'Microsoft.AspNetCore.Components' },
    },
  },

  // ==================== Elixir ====================
  elixir: {
    name: 'Elixir',
    detect: ['mix.exs'],
    commands: {
      deps: 'mix deps.get',
      test: 'mix test',
      lint: 'mix credo',
      format: 'mix format',
      dev: 'mix phx.server',
    },
    frameworks: {
      phoenix: { detect: 'phoenix' },
    },
  },

  // ==================== Swift ====================
  swift: {
    name: 'Swift',
    detect: ['Package.swift', '*.xcodeproj', '*.xcworkspace'],
    commands: {
      build: 'swift build',
      test: 'swift test',
      dev: 'swift run',
    },
  },

  // ==================== Dart / Flutter ====================
  dart: {
    name: 'Dart/Flutter',
    detect: ['pubspec.yaml'],
    commands: {
      deps: 'dart pub get',
      test: 'dart test',
      lint: 'dart analyze',
      format: 'dart format .',
    },
    frameworks: {
      flutter: { detect: 'flutter', deps: 'flutter pub get', test: 'flutter test', dev: 'flutter run' },
    },
  },
};

/**
 * Monorepo detection
 */
export const MONOREPO_TOOLS = {
  turborepo: { detect: 'turbo.json', run: 'turbo run' },
  nx: { detect: 'nx.json', run: 'nx run' },
  lerna: { detect: 'lerna.json', run: 'lerna run' },
  rush: { detect: 'rush.json', run: 'rush' },
  pnpmWorkspace: { detect: 'pnpm-workspace.yaml' },
  yarnWorkspaces: { detect: 'package.json' }, // check workspaces field
};

/**
 * CI/CD detection
 */
export const CI_PLATFORMS = {
  github: { detect: '.github/workflows' },
  gitlab: { detect: '.gitlab-ci.yml' },
  circleci: { detect: '.circleci' },
  jenkins: { detect: 'Jenkinsfile' },
  travis: { detect: '.travis.yml' },
  azure: { detect: 'azure-pipelines.yml' },
  bitbucket: { detect: 'bitbucket-pipelines.yml' },
};

/**
 * Testing frameworks by language
 */
export const TEST_FRAMEWORKS = {
  node: ['jest', 'vitest', 'mocha', 'ava', 'tap', 'playwright', 'cypress'],
  python: ['pytest', 'unittest', 'nose2', 'hypothesis'],
  go: ['testing', 'testify', 'ginkgo'],
  rust: ['cargo test'],
  java: ['junit', 'testng', 'mockito'],
  php: ['phpunit', 'pest', 'codeception'],
  ruby: ['rspec', 'minitest'],
  dotnet: ['xunit', 'nunit', 'mstest'],
  elixir: ['exunit'],
};

/**
 * Linting/Formatting tools by language
 */
export const LINT_TOOLS = {
  node: {
    linters: ['eslint', 'biome', 'oxlint'],
    formatters: ['prettier', 'biome', 'dprint'],
    typecheckers: ['typescript', 'tsc'],
  },
  python: {
    linters: ['ruff', 'flake8', 'pylint', 'pyflakes'],
    formatters: ['ruff', 'black', 'autopep8', 'yapf'],
    typecheckers: ['mypy', 'pyright', 'pyre'],
  },
  go: {
    linters: ['golangci-lint', 'staticcheck', 'revive'],
    formatters: ['gofmt', 'goimports'],
  },
  rust: {
    linters: ['clippy'],
    formatters: ['rustfmt'],
  },
  java: {
    linters: ['checkstyle', 'pmd', 'spotbugs'],
    formatters: ['google-java-format', 'spotless'],
  },
  php: {
    linters: ['phpcs', 'phpstan', 'psalm'],
    formatters: ['php-cs-fixer', 'phpcbf'],
  },
  ruby: {
    linters: ['rubocop', 'reek'],
    formatters: ['rubocop'],
  },
  dotnet: {
    linters: ['dotnet format'],
    formatters: ['dotnet format'],
  },
};

export default STACKS;
