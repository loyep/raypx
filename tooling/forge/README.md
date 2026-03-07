# `@raypx/forge` CLI

Unified monorepo command entrypoint.

## Usage

```bash
forge db <operation> [--parallel] [--dry-run] [--verbose]
forge ui generate
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
- `check-ai`

## Examples

```bash
forge db generate
forge db push
forge db migrate
forge db studio
forge db check-ai
forge doctor --json
forge run vite dev
```

## Logs

Each command appends to:

```bash
.cache/raypx-forge/commands.log
```

The log file is written under the current working directory of the command.
