# Maintainability Rebuild Plan

Last Updated: 2026-03-10

## Why

The repository passes type and boundary checks, but maintainability pressure remains in three areas:

- oversized modules (especially AI/chat flow),
- missing single-source architecture documentation,
- uneven operational standards across apps/packages.

## Strategy

Use an incremental "strangler" rebuild, not a big-bang rewrite:

1. lock architecture and ownership;
2. split high-complexity modules;
3. normalize quality gates and observability;
4. enforce guardrails in CI.

## Execution Plan

### Step 0 - Baseline (week 1)

- [x] Create architecture source of truth.
- [x] Create focused AI chat backlog.
- [ ] Track baseline metrics:
  - [ ] top 10 largest files by LOC
  - [ ] package test coverage (core packages)
  - [ ] PR lead time and rollback count

### Step 1 - AI/Core decomposition (week 1-3)

- [ ] Split `@raypx/ai` chat service by responsibility.
- [ ] Keep `@raypx/rpc` transport-only and remove any residual domain leakage.
- [ ] Add anti-regression tests for chat stream protocol and error mapping.

### Step 2 - Frontend maintainability (week 2-4)

- [ ] Move feature-level state machines out of route components/hooks.
- [ ] Keep app pages thin: orchestrate only, no domain-heavy logic.
- [ ] Standardize feature module structure in `apps/web/src/features/*`.

### Step 3 - Monorepo operational consistency (week 3-5)

- [ ] Ensure each workspace has predictable quality scripts:
  - [ ] `typecheck`
  - [ ] `test` (or explicit skip policy)
  - [ ] `clean`
- [ ] Keep root scripts as orchestration-first.
- [ ] Add CI matrix for affected packages and critical end-to-end smoke checks.

### Step 4 - Governance and onboarding (week 4-6)

- [ ] Add "new contributor path" doc (30-minute system walkthrough).
- [ ] Add ADR/RFC template with mandatory architecture impact section.
- [ ] Add release checklist with migration and rollback notes.

## Acceptance Criteria

- Critical domain services are split into focused files/modules.
- Architecture and ownership docs stay up to date with code.
- New feature PRs follow package boundaries without exceptions.
- Core scenarios pass CI with stable runtime behavior.

## What Not To Do

- Do not rewrite all packages at once.
- Do not move package boundaries and API contracts in the same PR.
- Do not change stream protocol and persistence semantics together.

