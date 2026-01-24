# Run linter and formatter

Detect and run the appropriate lint/format command for this project.

## Implementation
```bash
# Node.js
if [ -f "package.json" ]; then
  if grep -q '"lint"' package.json; then
    npm run lint
  elif [ -f ".eslintrc" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
    npx eslint . --fix
  fi
fi

# Python
if [ -f "pyproject.toml" ] || [ -f "ruff.toml" ]; then
  ruff check --fix .
  ruff format .
fi

# Go
if [ -f "go.mod" ]; then
  gofmt -w .
  golangci-lint run
fi

# Rust
if [ -f "Cargo.toml" ]; then
  cargo fmt
  cargo clippy
fi
```
