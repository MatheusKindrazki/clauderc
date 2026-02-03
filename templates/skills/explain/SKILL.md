# Explain Codebase

Learning mode - generates visual explanations of codebase architecture, data flows, and component relationships using ASCII diagrams or HTML presentations.

## When to Use

- Onboarding to a new codebase
- Understanding a complex module before modifying it
- Documenting architecture for the team
- Before a major refactoring to understand current state
- Explaining a subsystem to a colleague

## Workflow

### 1. Identify Scope

Ask: "What part of the codebase do you want to understand?"

Options:
- **Full architecture** - High-level system overview
- **Module deep-dive** - One module/package in detail
- **Data flow** - How data moves through the system
- **Dependency map** - What depends on what
- **API surface** - Public interfaces and endpoints

### 2. Gather Information

```bash
# Project structure
find . -type f -name "*.{js,ts,py,go,rs}" | head -50

# Entry points
ls src/index.* src/main.* src/app.* app/main.* cmd/main.* 2>/dev/null

# Dependencies between modules
grep -r "import.*from" src/ --include="*.{js,ts}" | head -30
# or for Python
grep -r "^from\|^import" src/ --include="*.py" | head -30
```

### 3. Generate Explanation

Choose output format based on complexity:

#### ASCII Diagram (default - works everywhere)

```
+------------------+     +------------------+
|   API Gateway    |---->|   Auth Service   |
+------------------+     +------------------+
        |                         |
        v                         v
+------------------+     +------------------+
|  Request Router  |     |   User Store     |
+------------------+     +------------------+
        |
   +----+----+
   |         |
   v         v
+------+  +------+
| Users |  | Posts |
+------+  +------+
```

#### Data Flow Diagram

```
Request -> Middleware -> Controller -> Service -> Repository -> Database
                                         |
                                         v
                                      Cache
                                         |
                                         v
                                     Response
```

#### Module Dependency Map

```
src/
  index.js ─────────> app.js
                        |
                  +-----+-----+
                  |           |
              routes/     middleware/
                |             |
            controllers/  auth.js
                |
            services/
                |
            models/
```

### 4. Add Context

For each component in the diagram, provide:

| Component | Purpose | Key Files | Dependencies |
|-----------|---------|-----------|--------------|
| API Gateway | HTTP entry point | `src/app.js` | express, cors |
| Auth Service | JWT validation | `src/auth/` | jsonwebtoken |
| User Store | User CRUD | `src/models/user.js` | mongoose |

### 5. Generate HTML (optional, for richer output)

If requested, generate a self-contained HTML file with:
- Interactive component diagram (SVG)
- Collapsible sections for each module
- Color-coded dependency visualization
- Search functionality

Save to: `docs/architecture-explanation.html`

## Output Formats

| Format | Best For | Command |
|--------|----------|---------|
| ASCII | Quick overview, terminal | Default |
| Markdown table | Documentation | "explain as markdown" |
| HTML | Presentations, sharing | "explain as HTML" |
| Mermaid | GitHub-rendered diagrams | "explain as mermaid" |

## Checklist

- [ ] Identified the scope (full/module/flow/deps/api)
- [ ] Gathered file structure and imports
- [ ] Generated appropriate diagram type
- [ ] Added context table for each component
- [ ] Verified diagram matches actual code structure
- [ ] Saved output in requested format
