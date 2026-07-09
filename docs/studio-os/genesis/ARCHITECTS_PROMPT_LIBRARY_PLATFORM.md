# The Architect's Prompt Library™ — Platform Runtime

**Architecture:** `genesis/articles/ARCHITECTS_PROMPT_LIBRARY.md`  
**Runtime:** `src/studio-os-core/genesis/architects-prompt-library/`  
**UI:** `/admin/studio/prompt-library`  
**Hook:** `src/hooks/useArchitectsPromptLibraryState.ts`  
**Genesis key:** `architectsPromptLibrary` in `genesis_v1` localStorage

---

## Routes

| Path | Experience |
|------|------------|
| `/admin/studio/prompt-library` | Library Arrival · Orb Librarian Mode™ · featured canonical prompts |
| `/admin/studio/prompt-library/prompt-registry` | Prompt Registry™ · full prompt catalog |
| `/admin/studio/prompt-library/prompt-collections` | Prompt Collections™ · curated shelves |
| `/admin/studio/prompt-library/prompt-search` | Prompt Search™ · full-text institutional search |
| `/admin/studio/prompt-library/prompt-history` | Versioning & Lineage™ · version shelves · comparisons |
| `/admin/studio/prompt-library/prompt-relationships` | Relationships & Dependencies™ · knowledge graph |
| `/admin/studio/prompt-library/prompt-models` | Model Intelligence™ · performance dashboard |
| `/admin/studio/prompt-library/prompt-executions` | Execution History™ · execution timeline |
| `/admin/studio/prompt-library/prompt-quality` | Quality™ · 8-dimension scoring · lessons learned |
| `/admin/studio/prompt-library/prompt-validation` | Validation & Canonization™ · founder approval path |
| `/admin/studio/prompt-library/prompt-analytics` | Analytics™ · coverage · stale/conflict/gap detection |
| `/admin/studio/prompt-library/prompt-recommendations` | Recommendations™ · Orb Curator suggestions |
| `/admin/studio/prompt-library/prompt-archives` | Archives™ · retired prompts |

---

## Runtime engines

| Engine | Module | Purpose |
|--------|--------|---------|
| Prompt Registry™ | `bootstrap/seed.ts` | Canonical prompt templates · lifecycle |
| Prompt Collections™ | `bootstrap/seed-data.ts` | Curated shelves with health scores |
| Prompt Versioning™ | `bootstrap/seed-data.ts` · `engines/graph-engine.ts` | Semantic versions · lineage · comparisons |
| Relationships & Dependencies™ | `engines/graph-engine.ts` | Knowledge graph · Genesis/Launch Stack/Core System links |
| Prompt Search™ | `engines/graph-engine.ts` | Full-text search across prompts |
| Prompt Analytics™ | `engines/intelligence-engine.ts` | Coverage · stale · conflict · gap metrics |
| Prompt Quality™ | `engines/intelligence-engine.ts` | 8-dimension quality scoring |
| Execution History™ | `bootstrap/seed-data.ts` · `engines/graph-engine.ts` | Execution records · timeline |
| Recommendations™ | `engines/intelligence-engine.ts` | Orb Curator recommendations |
| Model Intelligence™ | `bootstrap/seed-data.ts` | Model performance by category |
| Validation & Canonization™ | `bootstrap/seed.ts` | Validation gates · promote to canon |
| Archives™ | `bootstrap/seed.ts` | Retirement with documented reason |

---

## Foundational requirements

Every prompt in the Library:

- Is versioned (semantic version records with supersedes chain)
- Is searchable (full-text across body, tags, deliverables, context)
- Has lineage (version history per prompt)
- Has execution history (model, operator, artifacts, quality score)
- Connects to Genesis (article references)
- Connects to Launch Stack (milestone references)
- Connects to Core Systems (system references)
- Connects to implementation results (generated outputs)
- Can be promoted to Canon (via validation gate — never automatic)

---

## Integration

- Parent institution: **Institute of Knowledge™**
- Depends on **Executive Reflection Suite™** bootstrap chain
- `ensureArchitectsPromptLibrarySubsystem()` in `ensureGenesisStore()` chain
- Genesis framework module: `'architects-prompt-library'`
- Coexists with legacy **Prompt Registry** workspace (`/admin/studio/prompt-registry`) — distinct Mission Control subsystem
- Marble/glass immersive UI — not dashboards
- Orb = Library Curator · never auto-modifies Genesis

---

## Seed data

Canonical seed prompts include:

- Evolution Room™ Architecture Prompt (canonized)
- Executive Reflection Suite™ Architecture Prompt (canonized)
- Genesis Governance Architecture Prompt (canonized)
- Launch Stack Implementation Prompt (founder-approved)
- FAT Validation Prompt (canonized)
- LVS Founder Diary Prompt (canonized)
- Architect's Prompt Library™ Architecture Prompt (in execution)

Each includes versions, relationships, dependencies, execution records, model performance, and Genesis/Launch Stack references.
