# Project Analysis Skill

Systematic analysis of any software project to understand stack, structure, and development workflow.

## When to Use

- Before setting up Claude Code for a project
- When joining a new codebase
- When auditing project structure
- Before major refactoring

## Quick Analysis Checklist

### 1. Identify Language & Package Manager

```bash
# Check for config files
ls -la package.json pyproject.toml requirements.txt go.mod Cargo.toml composer.json pom.xml build.gradle 2>/dev/null
```

| File Found | Language | Package Manager |
|------------|----------|-----------------|
| `package.json` | JavaScript/TypeScript | npm/pnpm/bun/yarn |
| `pnpm-lock.yaml` | - | pnpm |
| `bun.lockb` | - | bun |
| `yarn.lock` | - | yarn |
| `pyproject.toml` | Python | poetry/pip |
| `requirements.txt` | Python | pip |
| `go.mod` | Go | go mod |
| `Cargo.toml` | Rust | cargo |
| `composer.json` | PHP | composer |
| `pom.xml` | Java | maven |
| `build.gradle` | Java/Kotlin | gradle |

### 2. Detect Framework

**Node.js** - Check `package.json` dependencies:
- `next` → Next.js
- `react` → React (check for vite/CRA)
- `vue` → Vue.js
- `express`/`fastify`/`hono` → Backend
- `electron` → Desktop

**Python** - Check imports or dependencies:
- `django` → Django
- `fastapi` → FastAPI
- `flask` → Flask
- `pytorch`/`tensorflow` → ML

### 3. Identify Testing & Linting

```bash
# Node.js
cat package.json | grep -E "(jest|vitest|mocha|eslint|prettier|biome)"

# Python
cat pyproject.toml | grep -E "(pytest|ruff|black|mypy)"

# Check for config files
ls -la jest.config* vitest.config* pytest.ini .eslintrc* .prettierrc* ruff.toml
```

### 4. Check Project Structure

```bash
# Is it a monorepo?
ls -la turbo.json nx.json pnpm-workspace.yaml lerna.json 2>/dev/null

# Check directory structure
ls -la src/ app/ lib/ packages/ apps/ 2>/dev/null
```

| Indicator | Type |
|-----------|------|
| `packages/` + `turbo.json` | Turborepo monorepo |
| `apps/` + `packages/` | Nx or similar |
| `pnpm-workspace.yaml` | pnpm workspace |
| Single `src/` | Standard single repo |

### 5. Check CI/CD

```bash
ls -la .github/workflows/ .gitlab-ci.yml .circleci/ Jenkinsfile 2>/dev/null
```

### 6. Read Existing Docs

```bash
# Check for existing docs
cat README.md 2>/dev/null | head -100
cat CONTRIBUTING.md 2>/dev/null | head -50
cat CLAUDE.md 2>/dev/null
ls -la .claude/ 2>/dev/null
```

## Output Template

After analysis, produce this summary:

```markdown
## Project Analysis

### Stack
- **Language**: [X]
- **Framework**: [Y]
- **Package Manager**: [Z]
- **Runtime**: [Node vX / Python X.X / etc]

### Testing & Quality
- **Test Framework**: [jest/vitest/pytest/etc]
- **Linter**: [eslint/ruff/golangci-lint/etc]
- **Formatter**: [prettier/black/gofmt/etc]
- **Type Checking**: [TypeScript/mypy/etc]

### Structure
- **Type**: [monorepo/single]
- **Architecture**: [frontend/backend/fullstack]
- **Key Directories**: [list main dirs]

### Scripts Available
```bash
# From package.json/Makefile/etc
dev: [command]
test: [command]
build: [command]
lint: [command]
```

### CI/CD
- **Platform**: [GitHub Actions/GitLab CI/etc]
- **Key Workflows**: [list]

### Documentation Status
- [ ] README.md - [exists/missing] - [quality]
- [ ] CONTRIBUTING.md - [exists/missing]
- [ ] CLAUDE.md - [exists/missing]

### Recommendations
1. [First recommendation]
2. [Second recommendation]
```

## Common Patterns by Stack

### Next.js App Router
```
app/
├── layout.tsx
├── page.tsx
├── api/
└── components/
```

### Turborepo
```
apps/
├── web/
└── docs/
packages/
├── ui/
└── config/
turbo.json
```

### FastAPI
```
app/
├── main.py
├── routers/
├── models/
└── services/
tests/
```

### Go Standard
```
cmd/
├── server/
internal/
├── handlers/
├── services/
pkg/
go.mod
```
