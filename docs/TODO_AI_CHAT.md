# AI Chat Execution TODO

Status owner: platform track  
Updated: 2026-03-04

## Phase M1 (Foundation, Weeks 1-4)

### 1. Contract and Error Consistency

- [x] Keep stream protocol at `eventVersion = 1`
- [x] Normalize AI errors via `toAIServiceError`
- [x] Normalize RPC error mapping from AI error codes
- [x] Add client-facing error dictionary (`AI_* -> i18n message key`)
- [x] Add contract snapshot tests for stream events

Acceptance:

- same provider failure yields same `AIErrorCode` across `chat` and `chatStream`
- RPC status mapping is stable and documented

### 2. Observability Baseline

- [x] Standardize telemetry payload fields
- [ ] Add request-level correlation in app UI logs (requestId exposure)
- [ ] Add lightweight query for daily TTFT/latency summary

Acceptance:

- for any AI request we can query requestId/provider/model/status/latency

### 3. Test Foundation

- [x] Add `packages/ai` unit tests:
  - [x] status -> `AIErrorCode` inference
  - [x] message keyword fallback mapping
- [x] Add `packages/rpc` AI router tests:
  - [x] unauthorized request rejection
  - [x] bad conversation id handling
  - [x] stream event shape validation
- [x] Fix test bootstrap env so local CI does not fail on missing `AUTH_URL`

Acceptance:

- `pnpm --filter @raypx/ai test` passes
- `pnpm --filter @raypx/rpc test` passes with default local env

## Phase M2 (MVP, Weeks 5-8)

### 1. Persistence and Recovery

- [x] Verify assistant message append on success only
- [x] Ensure `ai_call_logs` writes for both success and error
- [ ] Add retry/regenerate trace link in message metadata
  - [x] Covered error cases: `rate-limit`, `timeout`, `provider-down`
- [x] Add consistency checker command (`forge db check-ai`)

### 2. Chat UX State Machine

- [x] Shared hook contract for `idle/sending/streaming/done/error`
- [ ] Abort + retry flow consistency in `apps/app` and `apps/web`
- [x] Loading before first chunk with visible TTFT

### 3. Provider Strategy

- [ ] Confirm default `qwen3.5-plus`
- [ ] Add optional zhipu fallback switch
- [ ] Add per-provider timeout defaults

## Phase M3 (Operate, Weeks 9-12)

### 1. Cost and Reliability

- [ ] token/cost daily aggregation
- [ ] high-cost threshold warning
- [ ] provider error-rate alarm threshold

### 2. Extension Readiness

- [ ] reserve `tool_call/tool_result` pipeline tests
- [ ] context-provider interface smoke test
- [ ] RFC draft for RAG/tool plugin boundary

## Non-Goals (this cycle)

- agent orchestration runtime
- brand-new DB schema expansion for advanced analytics
- second RPC framework introduction
