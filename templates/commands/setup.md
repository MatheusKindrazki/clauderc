# Project setup

Install dependencies and prepare development environment.

## Implementation
```bash
echo "🚀 Setting up project..."

# Node.js
if [ -f "package.json" ]; then
  # Detect package manager
  if [ -f "bun.lockb" ]; then
    echo "→ Installing with bun"
    bun install
  elif [ -f "pnpm-lock.yaml" ]; then
    echo "→ Installing with pnpm"
    pnpm install
  elif [ -f "yarn.lock" ]; then
    echo "→ Installing with yarn"
    yarn install
  else
    echo "→ Installing with npm"
    npm install
  fi
fi

# Python
if [ -f "pyproject.toml" ]; then
  if grep -q "poetry" pyproject.toml; then
    echo "→ Installing with poetry"
    poetry install
  else
    echo "→ Installing with pip"
    pip install -e ".[dev]" 2>/dev/null || pip install -r requirements.txt
  fi
fi

# Go
if [ -f "go.mod" ]; then
  echo "→ Downloading Go modules"
  go mod download
fi

# Rust
if [ -f "Cargo.toml" ]; then
  echo "→ Building Rust project"
  cargo build
fi

echo "✅ Setup complete"
```
