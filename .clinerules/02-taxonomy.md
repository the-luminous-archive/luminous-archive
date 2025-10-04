# 02 — Taxonomy as SSOT

## Goal

Make YAML under `/packages/taxonomy/data/` the single source of truth (SSOT) for taxonomy, codegen, seed data, and docs.

## Allowed Paths

- /packages/taxonomy/\*\*
- /src/core/taxonomy/\*\*
- /docs/taxonomy/\*\*
- /prisma/\*\* (generated enums only; migrations handled via 03)
- /.github/workflows/\*\*

## Forbidden Patterns

- Changing `id:` values of existing terms
- Removing terms with `referencesCount > 0`
- Renames without `aliases:` entry
- Non-kebab-case slugs
- Non-UPPER_SNAKE_CASE ids

## Required Checks

- `pnpm taxonomy:build`
- `pnpm prisma:validate`
- `pnpm typecheck`
- `pnpm test -w`

## Policies

- **IDs are immutable**: `UPPER_SNAKE_CASE`.
- **Slugs**: `kebab-case`; on rename, add to `aliases:`.
- **Status**: one of `{ active, deprecated, experimental }`.
- **Deprecation**: set `status: deprecated` and `replacedBy: <ID>`.
- **No deletion** if `referencesCount > 0`; otherwise move to deprecated or archive folder with alias retained.
- **Schema-first**: validate against `taxonomy.schema.json`.
- **Codegen**: TS consts, Prisma enums, seed JSON, docs pages derived from YAML.

## Prompts (Plan Mode)

- “Validate all taxonomy YAML against `taxonomy.schema.json`; report duplicates, id/slug collisions, orphaned `seeAlso`, and nonconforming status. Propose codegen targets (TS consts, Prisma enums, seeds, docs). Ask before Act.”
- “Propose alias additions for any slug rename; show diff for affected references.”

## Acceptance Tests

- `packages/taxonomy/data/**` validates against schema (no warnings).
- Generated artifacts committed (TS consts, Prisma enums, seed files, docs).
- Post-build repo has **no uncommitted diffs**.
- Tests for codegen/imports pass in CI.
