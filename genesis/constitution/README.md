# Genesis Constitution™

**Runtime:** `src/studio-os-core/genesis/constitution/`  
**Content home:** `genesis/constitution/`

The Constitution is a first-class subsystem within Genesis — not a collection of markdown files alone. Constitutional articles are registered, versioned, amended, reviewed, and archived through reusable infrastructure.

## Structure

| Path | Purpose |
|------|---------|
| `articles/` | Constitutional article payloads (data-driven, no code changes) |
| `amendments/` | Amendment records |
| `review/` | Constitutional review sessions |
| `history/` | Historical archive entries |
| `voting/` | Amendment votes |
| `relationships/` | Relationship graph edges |

## Register articles without engineering

```typescript
import { registerConstitutionArticle } from '@/studio-os-core/genesis';

registerConstitutionArticle({
  articleId: 'GEN-C026',
  officialName: 'Example Principle™',
  category: 'Constitutional Law',
  summary: '...',
  purpose: '...',
  constitutionalText: '...',
  interpretation: '...',
  author: 'Founder',
});
```

Or batch ingest via `ingestConstitutionArticleBatch()`.
