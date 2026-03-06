# Raypx RFC Process

Use RFCs for changes that affect architecture, cross-package boundaries, public contracts, or migration paths.

## When RFC Is Required

Open an RFC when a change includes at least one:

1. New package or package boundary move.
2. Public API/protocol/type contract changes.
3. Data model or migration strategy changes.
4. Runtime strategy changes (provider routing, auth flow, deployment topology).

## RFC Lifecycle

1. Draft
- Copy `docs/rfcs/0000-template.md` into `docs/rfcs/`.
- Use filename format: `NNNN-short-title.md` (e.g. `0007-ai-stream-v2.md`).

2. Discussion
- Open PR with label `rfc`.
- Collect comments from maintainers of impacted packages.

3. Decision
- Mark status as `Accepted`, `Rejected`, or `Superseded`.
- If accepted, include a phased rollout plan.

4. Implementation
- Link implementation PR(s) in the RFC.
- Track progress against acceptance criteria.

5. Completion
- Update status to `Implemented`.
- Add migration note if needed.

## Required RFC Sections

1. Summary
2. Motivation
3. Scope (in/out)
4. Detailed design
5. Public API/type changes
6. Data flow and failure modes
7. Testing and acceptance criteria
8. Rollout and migration
9. Open questions

## Quality Bar

An RFC is decision-complete when implementers can execute it without making new architectural decisions.
