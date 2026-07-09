# Genesis Constitution™ — Platform Guide

**Core:** `src/studio-os-core/genesis/constitution/`  
**Content home:** `genesis/constitution/`  
**Admin:** `/admin/studio/genesis` → Constitution tab

---

## Purpose

The Constitution is a **first-class Genesis subsystem** supporting Studio World's Constitutional Core. This sprint delivers **infrastructure only** — no hardcoded constitutional content in runtime.

---

## Implemented systems

| System | Module |
|--------|--------|
| Constitution Registry™ | `registry.ts` |
| Constitution Relationship Graph™ | `relationships/graph.ts` |
| Article Versioning™ | `versioning/article-versioning.ts` |
| Amendment Workflow™ | `amendments/workflow.ts` |
| Historical Archive™ | `history/archive.ts` |
| Cross References™ | `cross-references/resolve.ts` |
| Review Pipeline | `review/pipeline.ts` |
| Voting | `voting/workflow.ts` |
| Content Loader | `content/loader.ts` |

---

## Article model

Every constitutional article stores:

- Article ID, Official Name™, Status, Version, Category
- Summary, Purpose, Constitutional Text, Interpretation
- Examples, Anti-patterns
- Dependencies, Related Articles
- Revision History, Approval History, Canonical Status

---

## Amendment workflow

```text
Proposal → Discussion → Architecture Review → Founder Approval → Genesis Update → Codex Update → Historical Archive
```

---

## Key APIs

```typescript
import {
  registerConstitutionArticle,
  ingestConstitutionArticleBatch,
  submitConstitutionAmendment,
  advanceConstitutionAmendmentStage,
  approveConstitutionAmendment,
  applyConstitutionAmendmentToGenesis,
  promoteConstitutionArticleToCanonical,
  listConstitutionCrossReferences,
  syncConstitutionRelationshipsFromArticleFields,
} from '@/studio-os-core/genesis';
```

---

## Zero-engineering article adds

1. Author payload matching `genesis/constitution/articles/article.schema.json`
2. Call `ingestConstitutionArticlePayload()` or batch ingest
3. Optionally sync relationships and promote to canonical via review pipeline

No code changes required for new articles.
