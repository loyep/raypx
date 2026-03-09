# AI Chat Refactor Backlog

Last Updated: 2026-03-10

## Goal

Reduce complexity of AI chat stack while keeping external RPC behavior stable.

## Phase 1 - Service Decomposition (P1)

- [ ] Split `packages/ai/src/chat-service.ts` into focused modules:
  - [ ] `conversation-service.ts` (create/list/get/rename/delete)
  - [ ] `provider-service.ts` (provider CRUD, secret management, defaults)
  - [ ] `stream-service.ts` (stream lifecycle and event emission)
  - [ ] `title-service.ts` (title generation and fallbacks)
- [ ] Keep a stable facade export from `@raypx/ai/server`.
- [ ] Add unit tests for each split module before moving call sites.

## Phase 2 - Contract and Error Model (P1)

- [ ] Document canonical error mapping:
  - [ ] provider errors -> `AIServiceError`
  - [ ] `AIServiceError` -> RPC error payload
- [ ] Freeze stream event order in tests:
  - [ ] `meta -> status -> delta* -> usage -> done`
  - [ ] failure branch ordering
- [ ] Add a compatibility test to ensure `eventVersion=1` behavior remains unchanged.

## Phase 3 - Frontend State Reduction (P2)

- [ ] Extract chat controller state machine from `use-chat-controller.ts` to dedicated machine utilities.
- [ ] Keep page-level components declarative and side-effect light.
- [ ] Add regression tests for `idle/sending/streaming/done/error` transitions.

## Phase 4 - Operational Guardrails (P2)

- [ ] Add consistency check script for:
  - [ ] `ai_conversations`
  - [ ] `ai_messages`
  - [ ] `ai_call_logs`
- [ ] Add timeout/retry/cancel behavior tests.
- [ ] Add minimal observability report fields (TTFT, latency, error rate).

## Exit Criteria

- No single AI service file exceeds 350 LOC.
- All chat RPC handlers delegate to small services/facades.
- New contributors can trace "request -> service -> persistence -> stream" in <= 15 minutes.
- CI verifies typecheck + lint + tests on affected packages.

