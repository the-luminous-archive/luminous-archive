# 03 — Migrations & Seeding

## Goal
Keep the DB schema and data in lockstep with the current source of truth, with zero destructive operations.

## Allowed Paths
- /prisma/**
- /lib/**
- /.github/workflows/**

## Forbidden Patterns
- Destructive migrations (DROP, ALTER that loses data)
- Enum contraction without a safe strategy
- Direct deletes from canonical tables

## Required Checks
- `pnpm typecheck`
- `pnpm prisma:validate`
- `pnpm -w test || echo "(no tests)"`

## Policies (Current)
- **Authority:** `/prisma/schema.prisma` is the schema SSOT until a Taxonomy SSOT is introduced.
- **Idempotent upserts** for seeds keyed by stable IDs.
- **Safe enum evolution:** prefer lookup tables or additive changes; never remove values without a map/alias strategy and data migration.
- **Append-only `DbRevision` (or `TaxonomyRevision` when SSOT arrives)** table stores digest and artifact checksums (SHA-256).
- **Dry-run first:** generate impact report, then apply.
- **Referential integrity:** no breaking changes when referenced.

## Prompts (Plan Mode)
- “Generate a Prisma migration for the proposed changes and a seed script with idempotent upserts. Provide an impact report (tables/columns added/changed, data affected) and a rollback plan. Do not include destructive operations.”

## Acceptance Tests
- Migration applies cleanly on a fresh DB and a seeded DB.
- Seeds are idempotent (running twice is a no-op).
- Unit/integration tests pass (including referential checks).
- Revision log updated with matching checksums.
