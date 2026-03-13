# `@raypx/forge` CLI

Unified monorepo command entrypoint.

## Usage

```bash
forge db <operation> [--dry-run] [--verbose]
forge doctor [--json]
forge run <command> [...args]
```

## Database Operations

`operation`:

- `generate`
- `push`
- `migrate`
- `studio`
- `pull`
- `seed`

## Examples

```bash
forge db generate
forge db push
forge db migrate
forge db studio
forge db seed
forge doctor --json
forge run vite dev
```
