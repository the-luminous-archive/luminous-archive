# Project Memory (Living)

## Active Goals

- Taxonomy as SSOT with codegen → enums/seeds/docs
- Non-destructive migrations; append-only revision log
- Weekly + on-tag export snapshots with fixity

## Known Issues / TODO

- <YYYY-MM-DD> schema gaps for taxonomy relations
- <YYYY-MM-DD> deprecations backlog needs curator review
- <YYYY-MM-DD> EXIF scrubbing missing for PDF uploads

## Past Decisions

- <YYYY-MM-DD> Adopt alias-then-redirect for slug renames
- <YYYY-MM-DD> Use BagIt + SHA-256 for snapshot integrity
- <YYYY-MM-DD> Store taxonomy digest in `TaxonomyRevision`

## References

- Taxonomy schema: `/packages/taxonomy/taxonomy.schema.json`
- Export script: `/scripts/export-snapshot.ts`
- Fixity job: `.github/workflows/fixity.yml`
