# Raypx Architecture

## Positioning

Raypx is an open-source SaaS template monorepo with dual tracks:

1. Product track: usable applications (`app`, `web`, `docs`)
2. Platform track: reusable core packages (`core/auth/ai/rpc/design-system`)

## Design Rules

1. Keep `oRPC` as the only RPC contract layer.
2. Frontend apps consume backend only through RPC.
3. Domain logic belongs in domain packages, not transport packages.
4. Cross-end contracts stay runtime-light and dependency-safe.

## Package Responsibilities

### `@raypx/core`

- Cross-package base contracts and context protocol.
- Owns `AppContext`, `RequestMeta`, and service result shapes.
- Must not depend on DB, auth runtime, or RPC runtime.

### `@raypx/config`

- Server/public env definitions and config parsing.
- Single source for runtime feature flags and defaults.

### `@raypx/shared`

- Pure cross-end types/constants only.
- No provider SDK, DB, or RPC runtime imports.

### `@raypx/database`

- Drizzle schemas, adapters, relations, and DB access helpers.
- Provides stable DB contracts for upper layers.

### `@raypx/auth`

- Better Auth integration.
- Exposes auth server utilities and reusable RPC auth helpers.

### `@raypx/ai`

- AI domain layer.
- Provider adapters, chat orchestration, stream event production, telemetry, persistence.
- Server entrypoint: `@raypx/ai/server`.

### `@raypx/rpc`

- Transport layer only.
- Input validation, auth middleware, service invocation, response/event shaping.
- No provider bootstrapping and no direct business persistence logic.

### `@raypx/design-system`

- Shared UI tokens/components.
- No business logic, no data fetching policies.

### `apps/*`

- Product composition and page-level concerns.
- `apps/app`: main SaaS app.
- `apps/web`: marketing/main web experience.
- `apps/docs`: standalone docs deployment.

## AI Data Flow

1. Request enters `@raypx/rpc` protected procedure.
2. RPC validates input and injects user/session context.
3. RPC calls `@raypx/ai` service.
4. AI service chooses provider/model and executes.
5. AI service emits stream events (`status/meta/delta/usage/done|error`).
6. AI service persists conversation/message/call-log records.
7. RPC forwards normalized events to client.

## Stream Contract Defaults

- Version: `eventVersion = 1`
- Baseline event set:
  - `status`
  - `meta`
  - `delta`
  - `usage`
  - `done`
  - `error`
- Future extension:
  - `tool_call`
  - `tool_result`

## Observability Baseline

Required fields per call:

- `requestId`
- `userId`
- `route`
- `provider`
- `model`
- `status`
- `ttftMs`
- `latencyMs`
- `inputTokens`
- `outputTokens`
- `errorCode`

## Compatibility Policy

1. Existing RPC contracts (`ai.chat`, `ai.chatStream`) remain backward compatible.
2. New capabilities should be additive first.
3. Breaking changes require RFC + migration plan + release notes.
