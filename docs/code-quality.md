# FreeFlow Code Quality Guide

## Overview

FreeFlow uses a comprehensive code quality setup to ensure consistent, maintainable, and high-quality code across the monorepo.

## Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | Code linting and static analysis | `.eslintrc.js` |
| **Prettier** | Code formatting | `.prettierrc` |
| **TypeScript** | Type checking | `tsconfig.json` |
| **lint-staged** | Run checks on staged files | `.lintstagedrc.js` |
| **Husky** | Git hooks management | `.husky/` |
| **commitlint** | Commit message validation | `.commitlintrc.js` |

---

## Quick Start

### Installation

Dependencies are already included in the monorepo. After cloning:

```bash
# Install all dependencies
pnpm install

# Initialize Husky (auto-runs via prepare script)
pnpm run prepare
```

### Basic Commands

```bash
# Format all files
pnpm run format

# Check formatting (without fixing)
pnpm run format:check

# Lint all packages
pnpm run lint

# Lint and auto-fix issues
pnpm run lint:fix

# Type check all packages
pnpm run typecheck

# Run all quality checks
pnpm run quality:check

# Run all quality checks and fix issues
pnpm run quality
```

---

## ESLint Configuration

### Monorepo Structure

```
.eslintrc.js                      # Root config (base rules)
├── apps/
│   ├── web/
│   │   └── .eslintrc.js         # Extends @freeflow/config/eslint/next
│   └── api/
│       └── .eslintrc.js         # Extends @freeflow/config/eslint/nest
└── packages/
    └── config/
        └── eslint/
            ├── next.js          # Next.js specific rules
            └── nest.js          # NestJS specific rules
```

### Root Configuration

The root `.eslintrc.js` provides base rules for all TypeScript/JavaScript files:

- ✅ TypeScript support via `@typescript-eslint`
- ✅ Import organization via `eslint-plugin-import`
- ✅ Prettier integration
- ✅ Consistent type imports
- ✅ Unused variable warnings

### App-Specific Rules

#### Next.js Apps (`apps/web`)

Extends `@freeflow/config/eslint/next` which includes:
- React and React Hooks rules
- Next.js specific optimizations
- JSX/TSX support
- React 19 best practices

#### NestJS Apps (`apps/api`)

Extends `@freeflow/config/eslint/nest` which includes:
- NestJS decorators support
- Dependency injection patterns
- Jest testing rules
- Node.js environment

### Custom Rules

To add project-specific rules, edit the app's `.eslintrc.js`:

```javascript
// apps/web/.eslintrc.js
module.exports = {
  extends: ['@freeflow/config/eslint/next'],
  rules: {
    // Your custom rules
    'react/no-unescaped-entities': 'off',
  },
};
```

---

## Prettier Configuration

### Settings (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Key Decisions

- **Single quotes** for strings
- **Semicolons** required
- **80 character** line width
- **2 spaces** for indentation
- **Trailing commas** for multi-line (ES5)

### Plugins

- `prettier-plugin-organize-imports` - Auto-organize imports on format

---

## Git Hooks (Husky)

### Pre-commit Hook

Runs automatically before every commit:

```bash
# .husky/pre-commit
pnpm run precommit  # Executes lint-staged
```

**What it does:**
1. Finds all staged files
2. Runs formatters and linters on those files only
3. Runs type checking if TypeScript files are staged
4. Auto-fixes issues when possible
5. Blocks commit if critical errors remain

### Commit Message Hook

Validates commit message format:

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

**Format:** `<type>(<scope>): <subject>`

**Example:**
```
feat(api): add user authentication endpoint
fix(web): resolve dashboard widget layout issue
docs: update configuration guide
```

---

## lint-staged Configuration

Runs different checks based on file type:

### TypeScript/JavaScript Files (`.ts`, `.tsx`, `.js`, `.jsx`)

1. **Prettier** - Format code
2. **ESLint** - Lint and auto-fix
3. **TypeScript** - Type check (if TS files)

### JSON/YAML/Markdown Files

1. **Prettier** - Format code

### Configuration File (`.lintstagedrc.js`)

```javascript
module.exports = {
  '**/*.{ts,tsx,js,jsx}': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
    `eslint --fix ${filenames.join(' ')}`,
    'pnpm run typecheck',
  ],
  '**/*.{json,yml,yaml,md}': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
  ],
};
```

---

## Commit Message Convention

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| **feat** | New feature | `feat(api): add user authentication` |
| **fix** | Bug fix | `fix(web): resolve memory leak in dashboard` |
| **docs** | Documentation | `docs: update API guide` |
| **style** | Code style (formatting) | `style: fix indentation in config` |
| **refactor** | Code refactoring | `refactor(api): simplify auth logic` |
| **perf** | Performance improvement | `perf(web): optimize bundle size` |
| **test** | Add/update tests | `test(api): add user service tests` |
| **build** | Build system changes | `build: update webpack config` |
| **ci** | CI/CD changes | `ci: add GitHub Actions workflow` |
| **chore** | Maintenance tasks | `chore: update dependencies` |

### Scope (Optional)

- `api` - Backend API changes
- `web` - Frontend web app changes
- `config` - Configuration changes
- `docs` - Documentation
- `infra` - Infrastructure

### Examples

```bash
# Good commits
git commit -m "feat(api): add JWT authentication middleware"
git commit -m "fix(web): resolve dashboard loading issue"
git commit -m "docs: add configuration examples"
git commit -m "chore: upgrade dependencies to latest"

# Bad commits (will be rejected)
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "Updated files"
```

---

## TypeScript Configuration

### Strict Mode Enabled

All projects use TypeScript strict mode for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Shared Configs

- `@freeflow/config/typescript/base.json` - Base TS config
- `@freeflow/config/typescript/nextjs.json` - Next.js specific
- `@freeflow/config/typescript/nest.json` - NestJS specific

---

## Troubleshooting

### Pre-commit Hook Not Running

```bash
# Reinstall Husky hooks
rm -rf .husky/_
pnpm run prepare
```

### ESLint Errors Won't Auto-fix

Some errors require manual fixing. Common ones:

```typescript
// ❌ Error: @typescript-eslint/no-explicit-any
const data: any = fetchData();

// ✅ Fix: Use proper typing
const data: UserData = fetchData();
```

### Type Check Failing

```bash
# Run type check to see all errors
pnpm run typecheck

# Run type check for specific app
pnpm --filter @freeflow/web typecheck
```

### Commit Message Rejected

```bash
# ❌ Bad
git commit -m "fix"

# ✅ Good
git commit -m "fix(web): resolve dashboard layout issue"
```

### Import Order Issues

Prettier with `organize-imports` plugin will auto-fix:

```bash
pnpm run format
```

---

## Best Practices

### DO ✅

- Run `pnpm run quality` before pushing
- Write meaningful commit messages
- Fix ESLint warnings (not just errors)
- Use TypeScript strict mode
- Add types instead of using `any`
- Organize imports (let Prettier handle it)
- Keep functions small and focused
- Write self-documenting code

### DON'T ❌

- Skip pre-commit hooks with `--no-verify`
- Ignore TypeScript errors
- Use `@ts-ignore` without explanation
- Commit commented-out code
- Mix formatting styles
- Use `var` (use `const`/`let`)
- Leave console.log in production code
- Write vague commit messages

---

## IDE Integration

### VS Code

Install recommended extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "editorconfig.editorconfig"
  ]
}
```

#### Settings (`.vscode/settings.json`)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### WebStorm / IntelliJ

1. Enable ESLint: `Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint`
2. Enable Prettier: `Preferences → Languages & Frameworks → JavaScript → Prettier`
3. Check "On save" for both

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm run format:check
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm run build
```

---

## Scripts Reference

### Root Scripts

| Script | Description |
|--------|-------------|
| `pnpm run format` | Format all files with Prettier |
| `pnpm run format:check` | Check formatting without fixing |
| `pnpm run lint` | Lint all packages |
| `pnpm run lint:fix` | Lint and auto-fix all packages |
| `pnpm run typecheck` | Type check all packages |
| `pnpm run quality` | Run format, lint:fix, and typecheck |
| `pnpm run quality:check` | Run all checks without fixing |
| `pnpm run precommit` | Run lint-staged (auto via hook) |

### App-Specific Scripts

```bash
# Format specific app
pnpm --filter @freeflow/web run format

# Lint specific app
pnpm --filter @freeflow/api run lint:fix

# Type check specific app
pnpm --filter @freeflow/web run typecheck
```

---

## Customization

### Adding New Rules

1. **For all projects:** Edit `.eslintrc.js` at root
2. **For Next.js only:** Edit `packages/config/eslint/next.js`
3. **For NestJS only:** Edit `packages/config/eslint/nest.js`
4. **For specific app:** Edit app's `.eslintrc.js`

### Disabling Rules

```javascript
// In specific file
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const data: any = unknownData;

// For entire file
/* eslint-disable @typescript-eslint/no-explicit-any */
```

⚠️ **Use sparingly!** Always prefer fixing the issue over disabling rules.

---

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
