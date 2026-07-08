# Studio World Codex™ — Platform Guide

The Codex is **not documentation**. It is the living constitutional memory of Studio World — a reusable platform that stores, organizes, versions, and relates every canonical concept before implementation begins.

As of **ARTICLE-C03**, the Codex is the official library operated by **The Institute of Knowledge™** — Studio World's permanent institution for publishing, research, canon review, historical archives, standards, validation, and world history.

---

## Core location

```
src/studio-os-core/studio-world-codex/
├── articles/          # Article schema, registry, create, update
├── bootstrap/         # One-time seed (ARTICLE-C01 only — not runtime registry)
├── collections.ts     # ARTICLE-C02 collection registry
├── institute-of-knowledge.ts # ARTICLE-C03 institution registry
├── manifesto/         # Volume I module
├── constitution/      # Volume II module
├── world-bible/       # Volume III module
├── architecture/      # Volume IV module
├── design-language/   # Volume V module
├── production/        # Volume VI module
├── knowledge-core/    # Volume IX module
├── future-vision/     # Volume X module
├── relationships/     # Knowledge graph edges
├── search/            # Semantic search + filters
├── versioning/        # Append-only revision snapshots
├── world-graph/       # Graph sync hooks
├── orb/               # Orb Curator™ recommendations
├── persistence/       # localStorage store (future: Supabase)
├── engine.ts          # Public orchestration API
├── types.ts           # Article, relationship, store schemas
└── volumes.ts         # Foundational Collection™ Volumes I-X
```

Admin workspace: **`/admin/studio/codex`**

---

## Article model

Every Codex Article (`CodexArticleRecord`) stores:

| Field | Purpose |
|-------|---------|
| `articleId` | Stable ID (e.g. `ARTICLE-C01`) |
| `title` | Display name |
| `category` | Section within a volume |
| `volume` | One of ten `CodexVolumeId` values |
| `status` | `Draft` · `Approved` · `Canonical` |
| `createdAt` / `updatedAt` | ISO timestamps |
| `author` / `contributors` | Provenance |
| `summary` | Executive summary |
| `philosophy` | Core belief protected by this article |
| `guidingPrinciples` | Bullet principles |
| `architecturalDecisions` | System ownership and constraints |
| `implementationReferences` | Doc paths, plans, ADRs |
| `relatedSystems` | World Graph system references |
| `relatedArticles` | Cross-article links |
| `revisionHistory` | Inline revision metadata |
| `tags` | Search and filter tags |
| `worldGraphNodeId` | Optional explicit graph node ID |

Use **`docs/studio-os/codex/CODEX_ARTICLE_TEMPLATE.md`** for human-authored articles.

---

## Creating a new Codex Article

### 1. Author the markdown (human)

Create `docs/studio-os/codex/ARTICLE_XXX_<SLUG>.md` using the template.

### 2. Register via API (runtime)

```typescript
import { createCodexArticle } from '@/studio-os-core/studio-world-codex';

createCodexArticle({
  articleId: 'ARTICLE-E03',
  title: 'My New System™',
  volume: 'volume-iv-architecture-standards',
  category: 'Platform Architecture',
  status: 'Draft',
  summary: 'Why this should exist.',
  philosophy: 'The permanent belief this protects.',
  guidingPrinciples: ['Principle one'],
  architecturalDecisions: ['Decision one'],
  relatedSystems: ['World Graph™'],
  relatedArticles: ['ARTICLE-C01'],
  tags: ['platform', 'architecture'],
  docPaths: ['docs/studio-os/codex/ARTICLE_E03_MY_NEW_SYSTEM.md'],
});
```

### 3. Revise (append-only)

```typescript
import { reviseCodexArticle } from '@/studio-os-core/studio-world-codex';

reviseCodexArticle(
  'ARTICLE-E03',
  { status: 'Approved', summary: 'Updated summary after Constitution Review.' },
  'Passed Constitution Review™',
  'Founder'
);
```

Every revision creates a **`CodexArticleRevisionSnapshot`** — canonical history is never overwritten.

---

## Relationship engine

Supported relationship types:

- `supports`
- `depends-on`
- `supersedes`
- `extends`
- `contradicts`
- `related-to`
- `referenced-by`

Relationships sync from `relatedArticles` / `relatedSystems` fields and can be extended programmatically via `relationships/engine.ts`.

---

## Search

```typescript
import { queryCodex } from '@/studio-os-core/studio-world-codex';

queryCodex('codex first', {
  volume: 'volume-ii-constitution',
  status: 'Canonical',
  tag: 'codex-first',
  system: 'Knowledge Core',
});
```

Semantic clusters expand queries (constitution, architecture, career worlds, knowledge core, future vision).

---

## World Graph integration

- **`bootstrap/seeds.ts`** — compile-time bootstrap articles for graph ingestion
- **`world-graph/ingestion/codex-ingest.ts`** — builds engine, volume, and article nodes
- **`world-graph/sync.ts`** — runtime sync payload for the Codex workspace UI

Every article becomes a graph node; systems reference articles via `integrates-with` edges.

---

## Orb integration

**`orb/curator.ts`** exposes:

- Related articles
- Architectural conflicts (`contradicts` edges)
- Historical decisions (revision history)
- Future evolution opportunities
- Relevant philosophy

The Orb acts as **Codex Curator™** — not a folder browser.

---

## Volumes

The first ten volumes map to module paths under `codex/` and form the **Foundational Collection™**:

| Volume | Module path |
|--------|-------------|
| I — Manifesto | `codex/manifesto` |
| II — Constitution | `codex/constitution` |
| III — World Bible | `codex/world-bible` |
| IV — Architecture Standards | `codex/architecture` |
| V — Design Language | `codex/design-language` |
| VI — Production Standards | `codex/production` |
| VII — Profession Brains | `codex/profession-brains` |
| VIII — Career Worlds | `codex/career-worlds` |
| IX — Knowledge Core | `codex/knowledge-core` |
| X — Future Vision | `codex/future-vision` |

---

## Complete Codex Collections™

**ARTICLE-C02 — The Complete Studio World Codex™** defines the long-term structure.

Volumes I-X remain unchanged. Future knowledge should not keep expanding the original books by default. New civilization domains become specialized **Codex Collections™** that can each grow independently while remaining searchable, versioned, related, and visible in World Graph™.

Permanent collection registry:

| Collection | Purpose |
|------------|---------|
| Foundational Collection™ | First ten universal volumes |
| Company & Headquarters Collection™ | Companies, HQ, departments, organizational inheritance |
| Product & Commerce Collection™ | Studio Exchange, licenses, products, commerce governance |
| Experience & Interface Collection™ | Progressive Presence, Hero Objects, Orb, Atlas, materials, interaction |
| Intelligence & Agents Collection™ | Orb intelligence, AI councils, model orchestration, mentor AI |
| Production & Operations Collection™ | QA, releases, render queues, production workflows |
| Professions & Career Worlds Collection™ | Profession-specific worlds, brains, licenses, simulations |
| Memory, History & Archive Collection™ | Archives, historical canon, professional memory, wisdom lineage |
| Economy & Governance Collection™ | Citizen rights, reputation, economies, future civic systems |
| Future Eras Collection™ | Unbuilt technologies, cross-career worlds, future professions |

Use `listCodexCollections()` and `getCodexCollection()` for collection metadata.

---

## Institute of Knowledge™

**ARTICLE-C03 — The Institute of Knowledge™** supersedes the prior Studio World Press™ concept.

The Institute governs the Codex. The Codex stores civilization knowledge.

Divisions:

| Division | Responsibility |
|----------|----------------|
| Publishing Bureau™ | Books, manuals, specs, official editions |
| Research Bureau™ | Profession research and real-world updates |
| Constitution Office™ | Constitutional articles, amendments, revisions |
| Historical Archives™ | Previous editions, superseded canon, lineage |
| Knowledge Validation Bureau™ | AI knowledge review, source verification, canon promotion |
| Standards Bureau™ | Design, engineering, education, simulation, brand standards |
| Publication Office™ | Whitepapers, SDK docs, release notes, guides, reports, letters, roadmaps |
| World Chronicle™ | Living history, Founder Journal™, major events |

Use `THE_INSTITUTE_OF_KNOWLEDGE`, `listInstituteKnowledgeDivisions()`, and `getInstituteKnowledgeDivision()` for institutional metadata.

---

## Bootstrap vs platform

- **Canonical Archive (Phase II):** **`bootstrap/canonical-archive/`** seeds foundational articles across all ten volumes with typed relationships — loaded on first run or when `canonicalArchiveVersion` migrates (`studioWorldCodex_v2`).
- **Complete Codex (ARTICLE-C02):** `collections.ts` defines the permanent collection expansion model. Add a new collection only when a domain needs independent growth.
- **Institute of Knowledge (ARTICLE-C03):** `institute-of-knowledge.ts` defines the permanent institution operating the Codex and validating official knowledge.
- **Do not** add articles to hardcoded arrays in engine core outside the canonical archive.
- **Do** use `createCodexArticle()` for new articles after bootstrap, or `proposeFutureCodexArticle()` for draft proposals.
- **ARTICLE-C01** and all volume seeds live in the canonical archive — not runtime hardcoding.

## Future article proposals

```typescript
import { proposeFutureCodexArticle } from '@/studio-os-core/studio-world-codex';

const proposal = proposeFutureCodexArticle({
  featureName: 'Cross-District Travel',
  summary: 'Why citizens should feel spatial continuity between districts.',
  relatedSystems: ['World Atlas™', 'Orb™'],
});
// Returns: draft article, suggested volume, related articles, relationships, World Graph hints
```

---

## Related docs

- [ARTICLE-C01 — Codex First Principle](./ARTICLE_C01_CODEX_FIRST_PRINCIPLE.md)
- [ARTICLE-C02 — Complete Studio World Codex](./ARTICLE_C02_COMPLETE_STUDIO_WORLD_CODEX.md)
- [ARTICLE-C03 — Institute of Knowledge](./ARTICLE_C03_INSTITUTE_OF_KNOWLEDGE.md)
- [Codex Article Template](./CODEX_ARTICLE_TEMPLATE.md)
- [Codex README](./README.md)
