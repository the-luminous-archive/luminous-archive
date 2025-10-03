# 04 — Preservation & Exports

## Goal
Archive-grade durability with verifiable fixity and reproducible snapshots.

## Allowed Paths
- /export/**
- /scripts/**
- /.github/workflows/**
- /docs/**

## Forbidden Patterns
- Publishing artifacts without checksums
- Overwriting prior snapshots
- Secrets hard-coded in workflows

## Required Checks
- `pnpm typecheck`
- `pnpm test -w`

## Policies
- **Fixity**: compute SHA-256 at ingest; scheduled fixity verification job.
- **Snapshot cadence**: weekly and on tag → `/export/vYYYYMMDD/`.
- **Format**: JSONL bundles + BagIt manifests; include manifest and checksums.
- **Destinations**: Zenodo (versioned DOI), Internet Archive, GitHub Release.
- **Provenance**: record taxonomy revision, commit SHA, build metadata.

## Prompts (Plan Mode)
- “Scaffold snapshot script to emit `/export/vYYYYMMDD/` with JSONL and BagIt manifests; include `manifest-sha256.txt`. Add GitHub Action to run weekly and on git tag. Prepare upload steps for Zenodo + IA and create a Release with checksums.”

## Acceptance Tests
- Local dry-run produces artifacts with valid BagIt manifests.
- CI workflow green and attaches artifacts to Release (on tag).
- Fixity job logs pass; discrepancies reported to CI annotations.
