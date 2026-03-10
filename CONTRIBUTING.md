# Contributing to Raypx

Thank you for your interest in contributing to Raypx! This guide will help you get started.

## Development Environment Setup

### Prerequisites

- **Node.js** >= 22
- **pnpm** >= 10.26.0
- **PostgreSQL** (for local development)

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/raypx/raypx.git
   cd raypx
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Set up the database**

   ```bash
   cd packages/database
   pnpm run push
   pnpm run seed  # Optional: seed with test data
   ```

5. **Start the development server**

   ```bash
   pnpm run dev:web
   ```

## Project Structure

```
raypx/
├── apps/
│   └── web/          # Main fullstack app (dashboard, docs, API routes)
├── packages/
│   ├── config/       # Environment validation
│   ├── core/         # Base runtime contracts and logger entrypoint
│   ├── observability/# Structured logging, metrics, tracing helpers
│   ├── shared/       # Shared utilities
│   ├── database/     # Database schema (Drizzle)
│   ├── email/        # Email service
│   ├── storage/      # File storage
│   ├── seo/          # SEO utilities
│   ├── auth/         # Authentication (Better Auth)
│   ├── ai/           # AI domain services
│   ├── rpc/          # API layer (oRPC)
│   └── design-system/# UI components
└── tooling/
    ├── forge/        # Internal command tooling
    └── tsconfig/     # Shared TypeScript configs
```

## Project Direction

Raypx follows a dual-track strategy:

1. Product track: ship a usable SaaS template from `apps/web`.
2. Platform track: keep `auth/ai/rpc/design-system` stable and reusable.

References:

- `ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/RFC_PROCESS.md`

## Development Workflow

### Creating a New Feature

1. **Create a branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**

   Follow the [code standards](#code-standards) below.

3. **Run checks**

   ```bash
   pnpm run typecheck  # Type check
   pnpm run lint       # Lint
   pnpm run test       # Run tests (if applicable)
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

5. **Push and create PR**

   ```bash
   git push origin feature/my-feature
   ```

### Running Tests

```bash
pnpm run test           # Run all tests
pnpm run test:coverage  # Run with coverage
```

### Database Changes

1. **Modify schema** in `packages/database/src/schemas/pg/`
2. **Push changes** to database:

   ```bash
   cd packages/database
   pnpm run push
   ```

3. **Generate migrations** (for production):

   ```bash
   pnpm run generate
   ```

## Code Standards

We use **Biome** for linting and formatting. Configuration is in `biome.json`.

### Formatting

Format code before committing:

```bash
pnpm run format
```

### Linting

Check for issues:

```bash
pnpm run lint
```

### Type Checking

Ensure types are correct:

```bash
pnpm run typecheck
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.tsx` |
| React Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserById` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserProfile` |

### Import Order

```typescript
// 1. External packages
import { useState } from 'react'
import { z } from 'zod'

// 2. Internal packages
import { Button } from '@raypx/design-system'
import { db } from '@raypx/database'

// 3. Local imports
import { LocalComponent } from './local-component'
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |

### Examples

```bash
feat(auth): add OAuth2 login support
fix(database): resolve connection timeout issue
docs(readme): update installation instructions
refactor(rpc): simplify router middleware
```

## Pull Request Process

1. **Ensure all checks pass**

   - Type check: `pnpm run typecheck`
   - Lint: `pnpm run lint`
   - Tests: `pnpm run test`

2. **Update documentation** if needed

3. **Add changeset** for version changes:

   ```bash
   pnpm run changeset
   ```

4. **Request review** from maintainers

5. **Address review feedback**

6. **Use RFC for architecture-impacting changes**

For major cross-package design changes (interfaces, boundaries, migration strategy), open an RFC first and follow `docs/RFC_PROCESS.md`.

### PR Title Format

Use the same format as commit messages:

```
feat(scope): description
fix(scope): description
```

## Package Dependencies

Follow the dependency hierarchy:

```
Layer 0: @raypx/tsconfig
Layer 1: @raypx/config
Layer 2: @raypx/core, @raypx/shared
Layer 3: @raypx/database, @raypx/email, @raypx/storage, @raypx/seo
Layer 4: @raypx/auth, @raypx/ai
Layer 5: @raypx/rpc
Layer 6: @raypx/design-system
Layer 7: apps/*
```

**Rule**: Only depend on packages at the same layer or lower.

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/raypx/raypx/issues)
- **Discussions**: [GitHub Discussions](https://github.com/raypx/raypx/discussions)

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.
