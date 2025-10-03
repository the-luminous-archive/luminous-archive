# 01 — Foundations

## Goal
Establish global constraints for Cline’s behavior in The Luminous Archive (TLA): safe-by-default, reversible, human-in-the-loop.

## Allowed Paths (Current Repo)
- /.clinerules/**
- /.github/workflows/**
- /app/**
- /components/**
- /content/**
- /lib/**
- /prisma/**

> Cline must not propose changes outside Allowed Paths without explicit human approval added to this file.

## Forbidden Patterns (plan must be rejected if present)
- `DROP TABLE`
- `DELETE FROM Story`
- `UPDATE\s+\*\s+SET\s+.*\s+WHERE\s+1=1`
- `rm -rf /`
- `git push --force`
- destructive Prisma commands (e.g., `prisma migrate reset`) without explicit approval
- plaintext secrets in repo (e.g., `OPENAI_API_KEY=`, `AWS_SECRET_ACCESS_KEY=`)

## Required Checks (must pass before Act Mode)
- `pnpm typecheck`
- `pnpm prisma:validate`
- `pnpm -w test || echo "(no tests)"`
> When/if a taxonomy SSOT is introduced, add `pnpm taxonomy:build` here and in 06.

## Policies
- **Phenomenology ≠ ontology.** Descriptive tone; refrain from asserting metaphysical truth.
- **Small, definite, reversible.** Prefer minimal diffs; show exact file patch.
- **No destructive edits.** Prefer alias/deprecate over delete.
- **Plan → Validate → Act → Post-Act summary.** Every task follows this lifecycle.
- **Consent & dignity.** Enforce anonymity/consent rules (see 05-security-ethics.md).
- **DB authority (current):** `/prisma/schema.prisma` is authoritative until a Taxonomy SSOT is introduced.

## Prompts (Plan Mode)
- “Propose a minimal-diff plan: list files to touch, purpose, risks, rollback. Confirm all changes are within Allowed Paths and contain no Forbidden Patterns. Include the exact commands for Required Checks.”

## Acceptance Tests
- Plan lists exact files + diffs preview + risks + rollback steps.
- All Required Checks pass locally and in CI.
- No Forbidden Patterns appear in patches or scripts.
- Git commit(s) reference this rule and include reasoning in body.
