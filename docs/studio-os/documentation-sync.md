# Documentation Synchronization™ V1.0 (Milestone 125)

**Route:** Help surfaces across Studio OS — primary hub at `/admin/studio/knowledge-hub`

## Purpose

**Documentation Synchronization™** keeps Studio OS documentation a living system that teaches the current version of itself. Not a redesign — a migration and synchronization pass aligning all help surfaces with current architecture.

> Studio OS should always teach the current version of itself.

## Core philosophy

- One source of truth — registry feeds search, manual, walkthrough, help, FAQ, and knowledge graph
- Rewrite outdated explanations — do not simply append
- Semantic search — aliases, acronyms, and related concepts (not keywords alone)
- Self-updating — future milestones integrate automatically via sync chain

## Canonical registry

**`src/studio-os-core/documentation-sync/system-registry.ts`** — 30+ systems with:

Purpose · Overview · Capabilities · How it works · When used · Related systems · Example workflows · Aliases · Search keywords · Doc paths · Milestones

Systems include: Business Discovery Blueprint™, Profession Brain™, Organization Genome™, Professional Trust Framework™, Memory Engine™, Knowledge Fabric™, Executive Council™, Succession Mode™, Legacy Vault™, Studio Institute™, Command Dock™, Model Orchestrator™, Studio Foundation Models™, and full intelligence stack.

## Surfaces synchronized

| Surface | Mechanism |
|---------|-----------|
| Studio Manual / Interactive Manual | Registry → page guides, enrichments, search entries |
| Getting Started Guide | `getting-started-progression.ts` + inauguration walkthrough |
| Help Center / Knowledge Hub | Semantic wiki search + FAQ + workflows |
| Search Index | `search-entries.ts` + semantic clusters in `semantic-search.ts` |
| Knowledge Graph | `graph-seed.ts` edges + workflows merged in `buildGraph.ts` |
| Command Dock Help | `dock-advisor.ts` — documentation Q&A |
| Contextual Help | `contextual-help.ts` — page-aware suggestions |
| FAQ | `faq-registry.ts` — 12 synchronized entries |

## Semantic search

**Clusters** in `semantic-search.ts`:

- **"memory"** → Memory Engine, Legacy Vault, Knowledge Fabric, Profession Brain, Organization Genome
- **"AI"** → Studio Intelligence, Model Orchestrator, Trust Framework, Command Dock, Foundation Models
- **"getting started"** → Blueprint, Profession Brain, Mission Control, Command Dock
- **"legacy"** → Legacy Vault, Succession Mode, Legacy Network, Profession Brain

API: `expandSemanticQuery()` · consumed by `searchManualIndex()`, `searchKnowledgeGraph()`, `searchKnowledgeHub()`

## Getting Started progression

1. Organization → 2. Business Discovery Blueprint™ → 3. Profession Brain™ → 4. Headquarters → 5. Command Dock™ → 6. Departments → 7. Digital Concierges → 8. Executive Council™ → 9. Studio Institute™ → 10. Knowledge Commerce™ → 11. Advanced Intelligence → 12. Organizational Consciousness™

Advanced systems unlock later — avoid overwhelming new users.

## Self-updating architecture

Sync chain: Studio Foundation Models → **Documentation Sync**

**`studio-foundation-models/store`** resync triggers **`syncDocumentationFromSources`** · **boundary-sync**

On sync: invalidates Knowledge Graph cache · rebuilds search entries · updates profile

## Command Dock

`resolveDocumentationSyncAdvice()` · `buildProactiveDocumentationSyncSuggestion()` · `buildDocumentationSyncOpeningLine()`

## Storage

Demo localStorage: `studioOsDocumentationSync_v1`

## Brand voice

*"Documentation is a living system — Studio OS teaches the current version of itself."*

Accent: `#2563EB`

## Developer integration

When adding a new milestone module:

1. Add entry to `DOCUMENTATION_SYSTEM_REGISTRY`
2. Add `DOCUMENTATION_PAGE_GUIDE_OVERRIDES` entry (via `fromSystem()`)
3. Optional: graph edges in `graph-seed.ts`, FAQ in `faq-registry.ts`, enrichment in `moduleEnrichments.ts`
4. Chain `syncDocumentationFromSources` from upstream store

No manual duplication across help surfaces required.
