---
name: turborepo
description: |
  Turborepo monorepo build system guidance. Use for: turbo.json configuration,
  task pipelines, caching, --filter, --affected, CI optimization, environment
  variables, internal packages, monorepo structure/best practices.
---

# Turborepo Skill

Build system for JavaScript/TypeScript monorepos. Turborepo caches task outputs and runs tasks in parallel based on dependency graph.

## Critical Rules

### 1. Package Tasks, Not Root Tasks

**DO NOT create Root Tasks. ALWAYS create package tasks.**

```json
// DO THIS: Scripts in each package
// apps/web/package.json
{ "scripts": { "build": "vite build", "lint": "biome check .", "test": "vitest" } }

// turbo.json - register tasks
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {},
    "test": { "dependsOn": ["build"] }
  }
}

// Root package.json - ONLY delegates
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

### 2. Always Use `turbo run` in Code

```json
// package.json - ALWAYS "turbo run"
{ "scripts": { "build": "turbo run build" } }
```

The shorthand `turbo <task>` is ONLY for interactive terminal use.

### 3. `^build` vs `build` Confusion

```json
{
  "tasks": {
    // ^build = run build in DEPENDENCIES first
    "build": { "dependsOn": ["^build"] },
    // build (no ^) = run build in SAME PACKAGE first
    "test": { "dependsOn": ["build"] }
  }
}
```

## Common Task Configurations

### Standard Build Pipeline

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

### With Environment Variables

```json
{
  "globalEnv": ["NODE_ENV"],
  "tasks": {
    "build": {
      "env": ["DATABASE_URL", "API_KEY"],
      "outputs": ["dist/**"]
    }
  }
}
```

## Anti-Patterns to Avoid

### Root Scripts Bypassing Turbo

```json
// WRONG
{ "scripts": { "build": "vite build" } }

// CORRECT
{ "scripts": { "build": "turbo run build" } }
```

### Chaining Turbo Tasks with `&&`

```json
// WRONG
{ "scripts": { "deploy": "turbo run build && vercel deploy" } }

// CORRECT - let turbo orchestrate
{ "scripts": { "deploy": "vercel deploy" } }
// And add "dependsOn": ["build"] in turbo.json for deploy task
```

### Missing `outputs` for File-Producing Tasks

```json
// WRONG
{ "tasks": { "build": { "dependsOn": ["^build"] } } }

// CORRECT
{ "tasks": { "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] } } }
```

## Running Changed Packages Only

Use `--affected` to run only changed packages:

```bash
turbo run build --affected
turbo run build --affected --affected-base=origin/develop
```

## Package Filtering

```bash
turbo run build --filter=web          # Only web package
turbo run build --filter=./apps/*     # All apps
turbo run build --filter=web...       # web + dependencies
turbo run build --filter=...web       # web + dependents
```
