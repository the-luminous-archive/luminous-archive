# 06 — Reusable Prompts & Canonical Checks

## Goal
Provide reusable Plan-Mode prompts and canonical command sets to keep tasks consistent and safe.

## Canonical Workflow
1) **Plan** → list files, diffs, risks, rollback  
2) **Validate** → run checks and linters/tests  
3) **Act** → apply minimal diffs only  
4) **Post-Act** → summarize results + next steps

## Canonical Commands (must run before Act)
- `pnpm taxonomy:build`
- `pnpm prisma:validate`
- `pnpm typecheck`
- `pnpm test -w`

---

## Reusable Prompts

### A) Generate Taxonomy Outputs
“Validate `packages/taxonomy/data/**` against `taxonomy.schema.json`. Report collisions and orphans. Generate TS consts, Prisma enums, seeds, and docs. Show exact file diffs. Ask before applying.”

### B) Safe Rename with Alias
“Propose a safe rename for taxonomy term `<ID>`: keep `id` unchanged, add `aliases: [<old-slug>]`, update slug to `<new-slug>`, and patch all references. Provide migration/seed updates and a rollback plan.”

### C) Deprecate with Replacement
“Set `<ID>` to `status: deprecated` and `replacedBy: <NEW_ID>`. Patch references, update seeds, and generate curator guidance. Provide an impact table of affected stories.”

### D) Export Snapshot
“Create `/export/vYYYYMMDD/` snapshot with JSONL + BagIt. Emit `manifest-sha256.txt`. Prepare Release assets and a CI workflow that runs weekly and on tag.”

### E) Fixity Sweep & Report
“Run fixity verification across `/export/**` and storage buckets. Emit a report (added/changed/missing, mismatched checksums) and CI annotations. Propose remediation steps.”

## Acceptance Tests
- Each prompt yields minimal diffs, passes Canonical Commands, and includes rollback steps.
