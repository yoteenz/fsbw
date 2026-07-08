# The Institute of Knowledge™ — Platform

**Version:** 1.0.0  
**Constitutional basis:** ARTICLE-C03  
**Route:** `/admin/studio/institute`  
**Core:** `src/studio-os-core/institute-of-knowledge/`

---

## Purpose

The Institute of Knowledge™ is a **first-class institutional platform** within Studio World — not a documentation website. It governs every canonical publication, profession research artifact, constitutional article, engineering specification, educational standard, and historical record.

The Codex stores civilization knowledge. The Knowledge Core makes it searchable. Profession Brains reason within professions. **The Institute decides what becomes official.**

---

## Module structure

| Path | Responsibility |
|------|----------------|
| `/institute` | Institution registry, constitutional authority |
| `/codex` | Codex governance integration (C03) |
| `/publications` | Publication engine — create, revise, relate |
| `/research` | Research Bureau queue |
| `/constitution` | Constitution Office registry |
| `/history` | Historical Archives — editions, deprecation |
| `/standards` | Standards Bureau publications |
| `/review` | Knowledge review pipeline (AI submissions) |
| `/validation` | Canon promotion pipeline |
| `/chronicle` | World Chronicle timeline |
| `/professions` | Profession Brain knowledge bridge |
| `/world-graph` | Publication → graph relationship sync |
| `/orb` | Orb canonical answers with citations |
| `/expansion` | Future expansion hooks |

---

## Divisions

Each division is **modular and independently expandable**:

1. **Publishing Bureau™** — official editions, metadata, canon-ready releases  
2. **Research Bureau™** — profession research, industry standards  
3. **Knowledge Validation Bureau™** — AI knowledge review, canon protection  
4. **Historical Archives™** — previous editions, superseded canon  
5. **Constitution Office™** — constitutional articles, amendments  
6. **Standards Bureau™** — design, engineering, education standards  
7. **World Chronicle™** — civilization timeline, major events  
8. **Publication Office™** — whitepapers, SDK docs, release notes, letters  

---

## Publication engine

Supported publication types: books, collections, volumes, articles, whitepapers, research papers, SDK docs, developer docs, guides, letters, release notes, manuals, specifications, roadmaps, and official editions.

Every publication stores:

- **Edition** and **Revision**
- **Status:** Draft · Working · Review · Approved · Canonical · Deprecated · Historical
- **Contributors** and **Approval history**
- **Relationships** (graph edges, not folders)
- **Codex article links** and **constitutional sources**

---

## Knowledge review pipeline

Submitters:

- Profession Brains™ → `submitFromProfessionBrain()`
- Research Engine™ → `submitFromResearchEngine()`
- Mentor AI™ → `submitFromMentorAi()`
- Future AI systems → `submitProposedKnowledge()` + expansion hooks

Flow: **submit → review → approve/reject/return → create publication → promote to canon**

---

## Codex integration

- Institute **governs** Studio World Codex™ (ARTICLE-C03)
- Bootstrap seeds publications from canonical Codex archive
- `getInstituteCodexSyncSummary()` tracks Codex ↔ Institute alignment
- Codex articles map to Institute publications via `PUB-{articleId}`

---

## World Graph

Every publication automatically creates graph relationships. The Codex functions as a **navigable knowledge graph**, not disconnected files.

- `getInstituteWorldGraphSyncPayload()` — runtime sync metadata  
- `ingestInstituteNodes()` — compile-time World Graph ingestion  

---

## Orb integration

The Orb retrieves canonical answers from The Institute:

- `buildInstituteAdvisorLines()` — proactive context  
- `getInstituteOrbRecommendations()` — citations with edition/revision  
- `resolveInstituteAdvice()` — query resolution  
- `resolveCodexAndInstituteAdvice()` — combined Codex + Institute Orb response  

---

## Persistence

- **Storage key:** `instituteOfKnowledge_v1` (localStorage)
- **Event:** `institute-of-knowledge-updated`
- Future: Supabase adapter via `InstitutePersistenceAdapter`

---

## Admin workspace

**InstituteWorkspace** at `/admin/studio/institute` — tabs for Publications, Review Pipeline, Divisions, World Chronicle, Knowledge Graph.

Hook: `useInstituteState()` in `src/hooks/useInstituteState.ts`.

---

## Future expansion

Register hooks via `registerInstituteExpansionHook()`:

- Future AI knowledge submitters  
- Supabase persistence adapter  
- External research feeds  

---

## Related docs

- [ARTICLE-C03](../codex/ARTICLE_C03_INSTITUTE_OF_KNOWLEDGE.md)  
- [CODEX_PLATFORM.md](../codex/CODEX_PLATFORM.md)  
- [ARTICLE-C01 Codex First Principle](../codex/ARTICLE_C01_CODEX_FIRST_PRINCIPLE.md)
