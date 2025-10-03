# 05 — Security & Ethics

## Goal
Enforce consent, anonymity, licensing, and safe content handling across ingestion and publication.

## Allowed Paths
- /app/**
- /apps/**
- /src/**
- /packages/**
- /docs/**
- /.github/workflows/**
- /configs/**
- /scripts/**

## Forbidden Patterns
- Accepting non-first-person stories without explicit policy exception
- Storing PII beyond declared fields
- Publishing illegal-instruction content
- Shipping secrets in repo or build logs

## Required Checks
- `pnpm typecheck`
- `pnpm test -w`

## Policies
- **Submission contract** must include: `firstPersonAttestation`, `anonymityPref`, `license`, `consentVersion`, and revocation contact path.
- **RBAC**: roles = `contributor`, `curator`, `librarian`, `admin`; least-privilege defaults; server-side checks.
- **Content safety**: block illegal-instruction; provide **harm-reduction** links and disclaimers.
- **Anonymity**: no doxxing; scrub EXIF/PII from uploads; redact locations on request.
- **Audit trails**: all moderation actions logged with actor, timestamp, diff.

## Prompts (Plan Mode)
- “Add submission guardrails (Zod schema + UI copy). Enforce server-side RBAC and test cases: reject non-first-person; require license selection; verify `anonymityPref`. Add EXIF scrubbing in upload pipeline.”

## Acceptance Tests
- Protected routes; RBAC unit/integration tests pass.
- Negative/positive test cases for submission guardrails pass.
- Upload pipeline removes EXIF and blocks disallowed MIME types.
