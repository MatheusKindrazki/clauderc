# Slash Commands Templates

## /test.md

```markdown
Run project test suite.

## Steps
1. Execute test command for this project
2. Report results with coverage if available
3. Highlight failures with context

## Implementation
\`\`\`bash
{{TEST_COMMAND}}
\`\`\`
```

---

## /lint.md

```markdown
Check and fix code quality issues.

## Steps
1. Run linter with auto-fix
2. Run formatter
3. Report remaining issues

## Implementation
\`\`\`bash
{{LINT_COMMAND}}
\`\`\`
```

---

## /verify.md

```markdown
Full project validation before commit/PR.

## Steps
1. Run linter
2. Run tests
3. Run build
4. Report any failures

## Implementation
\`\`\`bash
{{LINT_COMMAND}} && {{TEST_COMMAND}} && {{BUILD_COMMAND}}
\`\`\`
```

---

## /pr.md

```markdown
Create a pull request with auto-generated description.

## Steps
1. Check git status
2. Analyze commits since branch point
3. Generate PR description
4. Create PR using gh CLI

## Prerequisites
- GitHub CLI installed and authenticated
- Clean working directory (all changes committed)
```

---

## /setup.md

```markdown
Setup development environment.

## Steps
1. Install dependencies
2. Setup environment variables (from .env.example if exists)
3. Run database migrations if applicable
4. Verify setup with quick test

## Implementation
\`\`\`bash
{{INSTALL_COMMAND}}
{{SETUP_COMMANDS}}
\`\`\`
```
