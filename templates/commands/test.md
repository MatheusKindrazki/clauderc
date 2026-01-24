# Run project tests

Detect and run the appropriate test command for this project.

## Detection Order
1. Check package.json for test script
2. Check for pytest/go test/cargo test
3. Fall back to common patterns

## Implementation
```bash
# Node.js
if [ -f "package.json" ]; then
  if grep -q '"test"' package.json; then
    npm test
  fi
fi

# Python
if [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
  pytest
fi

# Go
if [ -f "go.mod" ]; then
  go test ./...
fi

# Rust
if [ -f "Cargo.toml" ]; then
  cargo test
fi
```
