# Changelog

All notable changes to this project will be documented in this file.

## 2026-03-04

### docs(repo): add roadmap architecture and rfc process

- Added project roadmap with phased delivery milestones.
- Added architecture document with package boundaries and AI data flow.
- Added RFC process and RFC template for architecture-level changes.
- Updated contribution and agent docs to reflect dependency layering and workflow.

Related:

- `ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/RFC_PROCESS.md`
- `docs/rfcs/0000-template.md`

### feat(ai): unify chat state machine errors and coverage

- Unified AI error normalization and RPC error mapping.
- Standardized `chatStream` telemetry fields for request tracing and performance analysis.
- Added shared chat stream state hook and adopted it in both `apps/app` and `apps/web`.
- Added AI and RPC tests for:
  - error mapping
  - stream event contract
  - chatStream success/error persistence behavior
  - AI router lifecycle and authorization
- Added missing Vitest configs for workspace packages to stabilize `pnpm -w test`.

Related:

- `packages/ai/src/errors.ts`
- `packages/ai/src/telemetry/index.ts`
- `packages/rpc/src/routers/ai.ts`
- `packages/ai/src/client/use-chat-stream.ts`

### feat(database): add ai consistency check command

- Added AI consistency checker script for:
  - orphan messages
  - orphan conversations
  - error logs without error code
  - missing request IDs
  - empty conversations
  - assistant-only conversation anomalies
- Added CLI support for `forge db check-ai`.
- Added root and package script aliases:
  - `pnpm db:check-ai`
  - `pnpm --filter @raypx/forge run db -- check-ai main`
- Added CLI test coverage for `check-ai` dry-run.

Related:

- `packages/database/scripts/check-ai-consistency.ts`
- `packages/forge/src/cli/commands/db.ts`
- `packages/forge/src/cli/index.ts`
