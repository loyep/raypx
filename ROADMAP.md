# Raypx Roadmap

This roadmap is execution-oriented and aligned with the SaaS template direction.

## North Star

Build Raypx into an open-source SaaS template that is:

- fast to launch,
- easy to customize,
- AI-capable but provider-agnostic.

## 0-3 Months

### Month 1: Foundation Stability

- Finalize package boundaries: `core/auth/ai/rpc/shared`.
- Eliminate duplicated implementations across apps/packages.
- Standardize error model and observability fields.
- Lock quality gates: lint, typecheck, tests, turbo pipelines.
- Publish "getting-started template" and "second-dev guide."

### Month 2: AI Chat MVP

- Keep `ai.chat` and `ai.chatStream` backward compatible.
- Complete persistence loop:
  - `ai_conversations`
  - `ai_messages`
  - `ai_call_logs`
- Stabilize chat UX states:
  - `idle -> sending -> streaming -> done/error`
- Default provider policy:
  - `qwen` first
  - `zhipu` optional fallback

### Month 3: Open-Source Operations

- Add baseline observability views:
  - TTFT / latency / error rate / token and cost estimate
- Add configurable timeout/retry/rate limiting strategy.
- Release `v1.0.0-rc` with migration notes.

## 3-6 Months

- Improve multi-tenant governance:
  - org-level quotas
  - stronger audit trails
- Standardize AI plugin contracts:
  - tool and RAG extension points without breaking chat API
- Provide template presets:
  - SaaS starter
  - content site
  - AI copilot starter

## Release Gates

Each milestone should satisfy:

1. `pnpm -w typecheck` passes.
2. Core package tests pass.
3. Critical E2E smoke tests pass (`web`, auth, chat).
4. Migration and rollback notes are documented.

## Deployment Topology

- `raypx.com` -> `apps/web`
- `docs.raypx.com` -> `apps/web` (`/docs` routes)

Both are served from the web app surface with shared auth/session strategy.
