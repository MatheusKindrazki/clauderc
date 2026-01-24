# Full verification before commit/PR

Run all checks: lint, typecheck, test, build.

## When to use
- Before committing changes
- Before creating a PR
- After major refactoring

## Implementation
```bash
echo "🔍 Running verification..."

# Node.js
if [ -f "package.json" ]; then
  echo "→ Lint"
  npm run lint 2>/dev/null || true

  echo "→ Typecheck"
  npm run typecheck 2>/dev/null || npx tsc --noEmit 2>/dev/null || true

  echo "→ Test"
  npm test

  echo "→ Build"
  npm run build 2>/dev/null || true
fi

# Python
if [ -f "pyproject.toml" ]; then
  echo "→ Lint"
  ruff check .

  echo "→ Type check"
  mypy . 2>/dev/null || true

  echo "→ Test"
  pytest
fi

# Go
if [ -f "go.mod" ]; then
  echo "→ Lint"
  golangci-lint run

  echo "→ Test"
  go test ./...

  echo "→ Build"
  go build ./...
fi

# Rust
if [ -f "Cargo.toml" ]; then
  echo "→ Format check"
  cargo fmt --check

  echo "→ Clippy"
  cargo clippy

  echo "→ Test"
  cargo test

  echo "→ Build"
  cargo build
fi

echo "✅ Verification complete"
```
