# Directory Structure — Authoritative (Current Repo)

## Goal
Teach Cline the layout it can act within now, and define an optional future block for a Taxonomy SSOT.

## Top-Level (present today)
- /.clinerules/**
- /.github/workflows/**              # optional (if CI added)
- /app/**                            # Next.js App Router
- /components/**                     # UI + shadcn/ui
- /config/**                         # site/app config
- /content/**                        # contentlayer MDX (blog/docs/guides/pages)
- /hooks/**
- /lib/**                            # auth, db, utils, zod validations
- /pages/api/**                      # legacy API routes (auth callback)
- /prisma/**                         # schema + migrations + seeds
- /public/**                         # static assets
- /styles/**
- /types/**
- contentlayer.config.js
- env.mjs
- middleware.ts
- next.config.mjs
- package.json
- pnpm-lock.yaml
- postcss.config.js
- prettier.config.js
- tailwind.config.js
- tsconfig.json

## Notes for Cline (Current)
- **Allowed Paths:** `/prisma/**`, `/app/**`, `/lib/**`, `/components/**`, `/content/**`, `/.github/workflows/**`, `/.clinerules/**`.
- **Forbidden:** destructive SQL (`DROP TABLE`, `DELETE FROM Story`), `rm -rf /`, force-push, secrets in repo.
- **Required Checks:** `pnpm typecheck`, `pnpm prisma:validate`, `pnpm -w test || echo "(no tests)"`.
- **Authority:** Treat `/prisma/schema.prisma` as DB authority until a Taxonomy SSOT is introduced.

---

## (Optional) Future Additions for Taxonomy SSOT
If/when you introduce a generated taxonomy pipeline, add these and update rules 01/02/03/04/06:

- /packages/taxonomy/**              # SSOT YAML + schema + codegen
- /packages/taxonomy/data/**         # YAML terms/groups/relations
- /src/core/taxonomy/**              # generated TS consts/types (or place under /lib/**)
- /docs/taxonomy/**                  # generated human docs (or keep under /content/docs)
- /export/**                         # snapshots vYYYYMMDD (JSONL + BagIt)
- /scripts/**                        # snapshot, fixity, codegen helpers

### Notes for Cline (Future)
- Treat `/packages/taxonomy/data/**` as **SSOT**; codegen may write to `/prisma/**` and `/src/**` (or `/lib/**`).
- Exports are **append-only**; never overwrite an existing `/export/vYYYYMMDD/`.
