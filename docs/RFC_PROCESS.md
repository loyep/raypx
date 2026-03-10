# RFC Process

Use an RFC for changes that alter package boundaries, public contracts, migration behavior, or rollout strategy across multiple workspaces.

## When To Write One

- Cross-package interface changes.
- New shared platform abstractions.
- Dependency boundary or ownership changes.
- Breaking changes that need migration or rollback notes.

## Required Sections

1. Problem statement
2. Proposed change
3. Alternatives considered
4. Migration and compatibility impact
5. Testing and rollout plan

## Review Expectations

- Link the RFC in the implementation PR.
- Get sign-off from the owners of each affected workspace.
- Keep the final accepted decision aligned with `README.md`, `ROADMAP.md`, and relevant package docs.
