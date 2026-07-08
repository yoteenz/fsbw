# Studio World Knowledge System™ — Architectural Proposal

**Status:** Proposal — awaiting founder approval before implementation  
**Version:** 0.1.0-proposal  
**Date:** 2026-07-08  
**Author:** Principal architecture sprint (documentation-first pivot)

---

## Executive Summary

Studio World has outgrown prompts and scattered markdown as sources of truth. The repo already contains **six overlapping knowledge layers** (~977 `docs/studio-os/` files, Master Spec YAML, Knowledge Registry, Memory Bible, Profession Brain, motherboard, Interactive Manual) with **no unified graph, lifecycle, or canonical ID system**.

**The Knowledge System™ is not documentation.** It is the **operating system for institutional memory** — a structured, relational, versioned knowledge architecture that every future flagship, room, engine, and sprint must register with before implementation.

**The Studio World Bible™** is the first *publication* inside this system — not the system itself.

**Recommendation:** Build Knowledge Core first (schema + registry + graph + lifecycle + query). Then publish Bible Volume I from canon. Then wire immersive Knowledge Library™ in Studio Archives™. Then deploy Orb Archivist™.

---

## 1. Challenge to the Expansion Blueprint

The attached *Studio World Expansion Blueprint* (Layers 4–13) is valuable **vision seed material** but must not be implemented as a flat layer stack without a knowledge substrate.

### What the blueprint gets right

- **Civilization framing** — Studio World as living entity, not feature collection
- **Universal principles** — everything belongs somewhere; design before generation; reuse before creation
- **Integration mandate** — Atlas, Orb, Genome, Archives, HQ, Marketplace as peers
- **Long-horizon pillars** — economy, reputation, legacy, industry intelligence are real endgames

### What the blueprint assumes (and should be improved)

| Assumption | Challenge | Better architecture |
|------------|-----------|---------------------|
| Layers 4–13 are sequential “evolution layers” | Many already partially exist (Profession Brain ≈ Intelligence; Memory Engine ≈ company memory; Atlas ≈ spatial memory; Legacy Vault ≈ Legacy) | **Unify under Knowledge System first**, then name expansion layers as *publication volumes*, not greenfield code |
| “Studio Intelligence™” as new Layer 4 | Collides with Studio Intelligence narrative, Command Dock advisors, Profession Brain, Wisdom Capture, World Knowledge Engine | **One Intelligence Plane** with typed sub-engines; Knowledge System owns the *index*, engines own domain data |
| Simulation / Time layers before knowledge graph | Simulation requires causal models; replay requires event-sourced history | **Knowledge Lifecycle™ + Event Chronicle™** are prerequisites |
| Living Economy before trust/reputation schema | Marketplace without reputation ontology invites chaos | **Reputation Layer™** becomes *knowledge objects* (trust scores, contribution records) referenced by Marketplace |
| Social Civilization as Layer 8 | No guild/mentorship knowledge schema exists | Defer runtime; **define canon objects now** (Guild Charter™, Mentorship Compact™) in Knowledge System |
| Industry Genome as Layer 13 | Overlaps Profession Brain packs, Industry Architecture (M88), Expansion Center | **Industry Genome™** = federated Profession Brains + Industry Pack knowledge — not a separate silo |

### Missing from the blueprint (must add)

1. **Knowledge Constitution™** — laws governing knowledge itself (immutability, deprecation, ownership)
2. **Canonical ID Registry™** — every system, room, law, sprint gets a permanent `K-ID`
3. **Implementation Status Plane™** — `spec | prototype | live | deprecated | historical` on every object
4. **Build Order DAG™** — explicit dependencies (“Scene Stack law before any immersive room”)
5. **Ingress/Egress contract** — how code, docs, genomes, and agent memory sync *into* canon
6. **Archivist Orb™** — institutional memory interface (specified below)
7. **Anti-fragmentation merge plan** — absorb Knowledge Registry, Documentation Sync, Memory Bible, motherboard boundaries

---

## 2. Core Philosophy

```
Most software accumulates code.
Studio World accumulates knowledge.

Most software loses context.
Studio World preserves context forever.
```

### The Knowledge System is

- The **memory** (what happened, why, who decided)
- The **constitution** (what must never break)
- The **encyclopedia** (what exists and how it relates)
- The **architecture** (where things belong physically and logically)
- The **engineering handbook** (how to build)
- The **design language** (how things should feel)
- The **implementation roadmap** (what order, what status)
- The **innovation journal** (sparks → live → history)
- The **collective intelligence substrate** (for Orb, engines, Atlas, Genome)

### The Knowledge System is not

- A wiki folder
- A pile of markdown
- Chat history (motherboard)
- Operator tooltips alone (Knowledge Hub)
- A single Bible PDF

---

## 3. Overall Information Architecture

### Three planes of truth

```
┌─────────────────────────────────────────────────────────────────┐
│  CANON PLANE™          Approved, immutable-with-amendment truth │
│  (constitution, live systems, shipped laws, published Bible)    │
├─────────────────────────────────────────────────────────────────┤
│  WORKING PLANE™        Concepts in lifecycle (Spark → Review)   │
├─────────────────────────────────────────────────────────────────┤
│  HISTORICAL PLANE™     Superseded decisions, deprecated names │
└─────────────────────────────────────────────────────────────────┘
```

**Rule:** Implementation sprints may only target **Canon** or promote **Working → Canon** through Review™. Never implement directly from Historical without explicit revival sprint.

### Hierarchy (founder-facing)

```
Studio World Knowledge System™
└── Knowledge Core™                    ← engine (graph, schema, lifecycle, query)
    └── Knowledge Library™             ← immersive destination (Archives wing)
        └── Publications™
            └── Studio World Bible™    ← first publication
                └── Volumes™
                    └── Chapters™
                        └── Sections™
                            └── Implementation Sprints™
```

### Hierarchy (technical)

```
Knowledge Object (atomic unit)
├── identity (K-ID, slug, ™ name, aliases)
├── classification (type, domain, flagship, physical place)
├── lifecycle (stage, status, version chain)
├── relationships (typed edges to other objects)
├── body (canon content blocks — not raw markdown only)
├── metadata (owners, contributors, dates, tags)
├── implementation (code paths, routes, migration status)
└── governance (constitutional articles, approval record)
```

---

## 4. Knowledge Object Model (KOM) — Relationship Model

Every entity in Studio World becomes a **Knowledge Object** with a stable **`K-ID`**:

| Prefix | Domain | Example |
|--------|--------|---------|
| `K-LAW-` | Constitutional law | `K-LAW-001-scene-assembly-immutability` |
| `K-FLG-` | Flagship destination | `K-FLG-archives` |
| `K-RM-` | Room / station | `K-RM-cds-story-table` |
| `K-ENG-` | AI / production engine | `K-ENG-scene-stack` |
| `K-PIP-` | Pipeline stage | `K-PIP-golden-build` |
| `K-GNM-` | Genome (company/founder/industry) | `K-GNM-company-frontal-slayer` |
| `K-BP-` | Blueprint (scene/master/feature) | `K-BP-master-scene-story-table` |
| `K-DEC-` | Decision record | `K-DEC-2026-07-08-doc-first-pivot` |
| `K-SPR-` | Implementation sprint | `K-SPR-scene-stack-quality-hardening` |
| `K-CON-` | Concept / spark | `K-CON-living-economy-v2` |
| `K-PUB-` | Publication | `K-PUB-studio-world-bible-vol-i` |

### Relationship types (typed edges)

| Edge | Meaning |
|------|---------|
| `owns` | Parent contains child (Volume owns Chapter) |
| `implements` | Code/sprint realizes architecture |
| `governed-by` | Subject bound by constitutional law |
| `depends-on` | Build order / runtime dependency |
| `references` | Soft cross-link |
| `supersedes` | Version replacement |
| `deprecated-by` | Naming/feature migration |
| `located-in` | Physical place in Studio World |
| `integrates-with` | Engine/world system coupling |
| `spawned-from` | Lifecycle origin (Spark → Concept) |
| `evidence-for` | Decision supported by artifact |
| `publishes` | Publication extracts from canon objects |

**Nothing exists in isolation.** Orphan objects fail Governance audits.

---

## 5. Knowledge Lifecycle™

Permanent stages (state machine):

```
Spark™ → Concept™ → Research™ → Architecture™ → Prototype™ → Review™
  → Approved™ → Implementation Sprint™ → Live™ → Evolution™ → Historical Reference™
```

| Stage | Plane | Who acts | Output |
|-------|-------|----------|--------|
| Spark™ | Working | Founder, Orb, engine | `K-CON-*` stub |
| Concept™ | Working | Architect | Problem statement, alternatives |
| Research™ | Working | Archivist-assisted | Linked evidence, competitor patterns |
| Architecture™ | Working | Principal architect | Proposal doc (this deliverable type) |
| Prototype™ | Working | Engineering | Demo route / partial implementation |
| Review™ | Working | Founder + Auditor engines | Approval or revision |
| Approved™ | → Canon promotion gate | Founder | Canon object version 1 |
| Implementation Sprint™ | Canon target | Agent/engineering | Code + canon sync |
| Live™ | Canon | Operations | `implementationStatus: live` |
| Evolution™ | Canon | Any | New version chain |
| Historical Reference™ | Historical | Automatic on supersede | Never deleted |

**Ideas never disappear.** Historical objects retain edges to replacements.

---

## 6. Documentation Architecture

### Problem today

- `docs/studio-os/` — rich but ungraphable at scale
- `motherboard/MEMORY.md` — 42k+ lines, agent-only, append-only chaos
- Master Spec YAML — module truth, weak narrative
- Memory Bible — curated but disconnected from 977 files
- Knowledge Registry — metadata without full body
- Feature code — `route-registry.ts`, manifests — truth without prose

### Target: **Dual authoring, single graph**

1. **Structured canon files** — YAML/MDX frontmatter + body (human editable)
2. **Generated projections** — manifests, route registries, milestone bundles sync *from* or *to* graph
3. **Publications** — Bible volumes = *curated views* over graph queries (not duplicate content)

### Content block types (not plain markdown only)

- `prose` — narrative
- `law` — constitutional article
- `diagram` — Mermaid / SVG reference
- `table` — spec matrices
- `decision` — structured ADR
- `glossary` — term definition
- `checklist` — implementation gate
- `code-ref` — pointer to repo paths
- `route-ref` — Studio World place
- `genome-ref` — genome snapshot link

---

## 7. Repository & Folder Structure (Proposal)

### New root: `knowledge/` — canonical knowledge repository

```
knowledge/
├── README.md                          # Entry — how to read/write knowledge
├── schema/
│   ├── knowledge-object.schema.json   # KOM JSON Schema
│   ├── relationship-types.yaml
│   ├── lifecycle-states.yaml
│   └── id-registry-convention.md
├── registry/                          # Master indexes (human + generated)
│   ├── master-index.yaml              # All K-IDs
│   ├── constitutional-laws.yaml
│   ├── flagship-destinations.yaml
│   ├── engines.yaml
│   ├── pipelines.yaml
│   └── build-order-dag.yaml
├── canon/                             # APPROVED TRUTH ONLY
│   ├── constitution/
│   │   ├── core-philosophy.md
│   │   ├── scene-assembly-law.md
│   │   ├── studio-world-law.md
│   │   └── knowledge-constitution.md  # NEW — meta law
│   ├── studio-world/
│   │   ├── flagships/
│   │   ├── districts/
│   │   ├── rooms/
│   │   └── engines/
│   ├── pipelines/
│   │   ├── golden-build.md
│   │   ├── scene-stack.md
│   │   └── creative-intelligence.md
│   ├── genomes/
│   └── marketplace/
├── working/                           # Lifecycle < Approved
│   ├── sparks/
│   ├── concepts/
│   └── architecture-proposals/
├── historical/                        # Superseded canon
│   ├── deprecated-names/
│   └── decisions/
├── publications/
│   └── studio-world-bible/
│       ├── bible.manifest.yaml        # Volume/chapter map
│       ├── volume-i-world-foundation/
│       └── volume-ii-...
├── diagrams/
│   ├── system-maps/
│   ├── dependency-walls/
│   └── pipeline-flows/
└── .generated/                        # CI output — never hand-edit
    ├── graph.json                     # Full knowledge graph export
    ├── search-index.json
    └── implementation-status.json
```

### Transitional coexistence

| Current location | Migration role |
|------------------|----------------|
| `docs/studio-os/master-spec/` | **Source feed** → sync into `knowledge/canon/` + registry |
| `docs/studio-os/world/` | Migrate to `knowledge/canon/studio-world/` |
| `docs/studio-os/*.md` (modules) | One-by-one promotion with K-ID assignment |
| `motherboard/CORE.md` | **Agent cache** — summaries sync from canon, not parallel truth |
| `motherboard/MEMORY.md` | **Event chronicle ingress** — decisions become `K-DEC-*` |
| `src/studio-os-core/studio-world/route-registry.ts` | **Generated projection** from `flagship-destinations.yaml` |
| Memory Bible UI | **Publication editor** over canon subset |

### Code layout (future implementation — not this sprint)

```
src/studio-os-core/knowledge-system/
├── schema/           # Types, validators
├── graph/            # Node store, edges, queries
├── lifecycle/        # State machine
├── ingestion/        # Sync adapters (docs, code, genomes, motherboard)
├── query/            # Search, traverse, Archivist API
├── publications/     # Bible compiler
└── governance/       # Orphan detection, law compliance
```

---

## 8. Cross-Reference Strategy

### Automatic cross-refs

- Every `K-ID` mention in any canon file → validated edge in graph
- Every `route-ref` → validated against Studio World route registry projection
- Every `code-ref` → validated against repo path existence (CI)
- Every `law` block → linked to `K-LAW-*` in constitution registry

### Manual cross-refs

- `[[K-RM-cds-story-table]]` wiki-style in prose (resolved at build)
- Publication compiler resolves to chapter links in Bible

### Bidirectional requirement

If A `depends-on` B, graph exposes B.`required-by` A. Dependency walls in Knowledge Library™ visualize this.

---

## 9. Versioning Strategy

| Layer | Version scheme | Rule |
|-------|----------------|------|
| Knowledge Object | Semver `major.minor.patch` | Major = breaking canon change |
| Constitutional law | Article + amendment number | Amendments never delete articles |
| Publications (Bible) | Volume.edition.chapter | Edition = curated snapshot of canon |
| Generated projections | Git SHA + timestamp | Reproducible builds |
| Lifecycle stage | Monotonic promotion | No skip Review™ for Canon |

**Version gallery** in Knowledge Library™ shows object evolution timelines.

---

## 10. Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Knowledge ID | `K-{TYPE}-{slug}` | `K-ENG-scene-stack` |
| Display name | Title Case + ™ | Scene Stack™ |
| File slug | kebab-case | `scene-assembly-law.md` |
| Constitutional article | `ARTICLE-{n}` | `ARTICLE-07-non-destructive-layers` |
| Sprint | `{date}-{short-title}` | `2026-07-08-scene-stack-hardening` |
| Deprecated alias | `formerly` field, never deleted | Knowledge Hub → Knowledge Library™ |

**Naming Bible** becomes a **graph query** over glossary objects — Memory Bible UI edits canon.

---

## 11. Visual Documentation Strategy

| Visual type | Tool | Lives in |
|-------------|------|----------|
| System context maps | Mermaid C4 | `knowledge/diagrams/system-maps/` |
| Pipeline flows | Mermaid sequence | `knowledge/canon/pipelines/` |
| Dependency walls | D3 / SVG generated | Knowledge Library™ immersive |
| Atlas overlays | Studio World Atlas™ layer | `integrates-with` edges |
| Room floor plans | Zone maps linked to K-RM | Master Scene Blueprint™ |
| Timeline | Event chronicle | Historical plane |

**Rule:** Diagrams are first-class knowledge objects (`K-DIA-*`), not decorations.

---

## 12. Automatic Documentation Opportunities

| Source | Auto-generates |
|--------|----------------|
| `route-registry.ts` | Flagship + room objects, migration status |
| `studio-world/feature-lexicon.ts` | Deprecated name edges |
| Master Spec milestones | Module K-IDs, dependency edges |
| Scene Stack manifests | Station K-RM objects |
| `package.json` / CI | Implementation status |
| Architecture Auditor results | Violations → knowledge issues |
| Git commits (sprint tags) | Implementation Sprint™ records |
| motherboard MEMORY entries | Decision chronicle ingress (summarized) |
| Company/Founder Genome stores | K-GNM snapshots |

**Documentation Sync™ (M125)** evolves into **Knowledge Ingestion Engine™** — not a parallel system.

---

## 13. Scalability Strategy (10× growth)

1. **Graph partition by domain** — studio-world, engines, marketplace, genomes (federated queries)
2. **Canon sharding by volume** — Bible volumes = shards for human navigation
3. **Generated index** — never parse 10k markdown files at runtime; build `graph.json` in CI
4. **Lazy immersive loading** — Knowledge Library™ loads wing shelves by domain
5. **Archivist cache** — hot subgraphs for common questions
6. **Historical archive tier** — cold storage, still linked, not in default search
7. **Publication editions** — Bible annual editions freeze canon snapshots for training

---

## 14. Search Strategy

### Unified Query Layer (replaces 4+ search indices today)

```
Knowledge Query™
├── full-text (canon + publications)
├── graph traverse (dependencies, laws, locations)
├── facet filters (type, flagship, status, lifecycle)
├── semantic (embeddings over canon blocks)
└── Archivist natural language (Orb specialization)
```

**Search surfaces:** Knowledge Library™ terminals, Command Dock, Atlas mode "Canon", Archivist Orb.

---

## 15. Dependency Management

### Build Order DAG™ (canonical file: `knowledge/registry/build-order-dag.yaml`)

Example edges:

```
K-LAW-knowledge-constitution
  → K-CORE-knowledge-graph
  → K-PUB-bible-vol-i
  → K-FLG-archives (Knowledge Library wing)
  → K-ORB-archivist

K-LAW-scene-assembly-immutability
  → K-ENG-scene-stack
  → all K-RM-* immersive rooms

K-GNM-company-genome
  → K-ENG-creative-intelligence
  → K-PIP-golden-build
```

**No Implementation Sprint™ starts without declared `depends-on` edges satisfied.**

---

## 16. World Integration Map

| System | Integration |
|--------|-------------|
| **Studio World Atlas™** | Spatial view of `located-in` edges; fog reveals undiscovered canon |
| **Company Genome™** | `K-GNM` objects; traits link to design language blocks |
| **Founder Genome™** | Personal canon subset; Archivist tone |
| **Industry Genome™** | Federated profession pack objects |
| **Studio Archives™** | Hosts **Knowledge Library™** immersive wing |
| **Creative Direction Studio™** | Concepts enter lifecycle at Spark™; Parallel Futures = Working plane |
| **Studio Command Center™** | Executive brief pulls from Implementation Status Plane |
| **Architecture Auditor™** | Validates code ↔ canon alignment; violations → knowledge issues |
| **Experience Intelligence Engine™** | Evaluates immersive rooms against experience canon blocks |
| **Scene Stack™** | Pipeline canon; Master Scene Blueprint = `K-BP` objects |
| **Blueprint Archive™** | `K-BP` manufacturing blueprints linked to rooms |
| **Marketplace™** | Lists publishable knowledge objects (expert profiles, blueprints) |
| **Innovation Lineage / Constellations / Expeditions** | Lifecycle + graph patterns (constellation = object cluster) |
| **Orb™** | **Archivist™** specialization (see §18) |

---

## 17. The Knowledge Library™ (Immersive Destination)

**Physical place:** Studio Archives™ → **Knowledge Library Wing™** (new campus zone)

**Not a webpage.** A `DepartmentGoldenBuildShell` room with Scene Stack™ stations:

| Station | Experience |
|---------|------------|
| Grand Reading Atrium™ | Floating holographic canon index |
| Constitutional Hall™ | Law tablets, amendment timeline |
| Dependency Wall™ | Live graph visualization |
| Version Gallery™ | Object evolution reels |
| Innovation Shelves™ | Working plane sparks/concepts |
| Engineering Reading Room™ | Pipeline + engine specs |
| Design Gallery™ | Design language, Room DNA |
| AI Research Alcove™ | Engine canon + Archivist terminal |
| Publication Bindery™ | Bible volumes, edition printing |
| Chronicle Vault™ | Decision history, never deleted |

**Documentation becomes architecture** — walking the library *is* understanding Studio World.

---

## 18. Orb Archivist™

New Orb specialization — **institutional memory**.

### Answers automatically

- Why was this built?
- What problem does it solve?
- Where does it belong? (flagship, district, room)
- What constitutional law governs it?
- What dependencies exist?
- How has it evolved? (version chain)
- What should be built next? (DAG leaves)
- What systems relate? (graph neighbors)

### Data sources (read-only)

- Knowledge graph queries
- Implementation Status Plane
- Build Order DAG
- Decision chronicle
- Never invents policy — cites `K-ID` sources (same law as Profession Brain concierges)

### Surfaces

- Radial menu: **Ask Archivist**
- Knowledge Library™ terminals
- Command Dock advisor slot
- Pre-sprint gate: "Archivist brief" before Implementation Sprint™ approval

---

## 19. The Studio World Bible™ (First Publication)

### Role

Curated **narrative projection** of canon for humans — not the source of truth.

### Proposed Volume I — *World Foundation* (draft chapter list)

1. What Studio World Is (and is not)
2. The Seven Flagships
3. Constitutional Laws (core 12)
4. Physical Place Law (no webpages)
5. Scene Stack & Golden Build
6. Genome Family (Company, Founder, Project, Industry)
7. The Orb Family
8. Knowledge System & Knowledge Library
9. Implementation Status Map (2026 snapshot)
10. Build Order for next 24 months

### Missing chapters identified (for later volumes)

- Volume II: *Intelligence Civilization* (Profession Brain, Wisdom, Simulation)
- Volume III: *Economy & Marketplace*
- Volume IV: *Social & Reputation*
- Volume V: *Legacy & Time*

---

## 20. Missing Constitutional Laws (Recommend adding)

| Article | Law |
|---------|-----|
| ARTICLE-K01 | **Documentation-First Law** — no Implementation Sprint without `K-ID` architectural home |
| ARTICLE-K02 | **Canon Promotion Law** — Working → Canon requires Review™ |
| ARTICLE-K03 | **Non-Orphan Law** — every object ≥1 relationship edge |
| ARTICLE-K04 | **Immutability of History** — Historical plane objects never deleted |
| ARTICLE-K05 | **Scene Assembly Immutability** (exists — import to canon) |
| ARTICLE-K06 | **Physical Place Law** — no feature as webpage |
| ARTICLE-K07 | **Genome Precedence** — generation obeys genome canon |
| ARTICLE-K08 | **Reuse Before Create** — CIE + Knowledge graph check before new engine |
| ARTICLE-K09 | **Publication Subordination** — Bible never overrides Canon |
| ARTICLE-K10 | **Agent Memory Subordination** — motherboard syncs from canon, not vice versa |

---

## 21. Missing Flagship Destinations (Recommend canonizing)

| Proposed flagship | Role |
|-------------------|------|
| **Knowledge Library™** | Canon immersive experience (Archives wing) — *elevate from module* |
| **Chronicle Vault™** | Decision & event history (may be Archives sub-wing) |
| **Simulation Observatory™** | Future Layer 5 — spec only until Knowledge graph supports causal models |
| **Reputation Hall™** | Future Layer 10 — spec only |
| **Guild Campus™** | Future Layer 8 — spec only |

---

## 22. Missing World Systems (from blueprint + gap analysis)

| System | Status | Recommendation |
|--------|--------|----------------|
| Knowledge System™ | **This proposal** | Build first |
| Event Chronicle™ | Missing | Event-sourced timeline for Time Layer prerequisite |
| Causal Model Registry™ | Missing | Prerequisite for Simulation Layer |
| Trust & Reputation Graph™ | Missing | Prerequisite for Living Economy |
| Guild & Mentorship Canon™ | Missing | Spec objects only in Working plane |
| Federation Protocol™ | Missing | Cross-org Industry Genome sharing rules |

---

## 23. Missing AI Engines (consolidation recommendation)

**Problem:** Too many overlapping “intelligence” engines.

**Proposed Intelligence Plane under Knowledge System index:**

| Engine | K-ID home | Domain |
|--------|-----------|--------|
| Creative Intelligence Engine | existing | Generation decisions |
| Profession Brain™ | existing | Domain expertise |
| Architecture Auditor™ | existing | Structural law |
| Experience Intelligence Engine™ | existing | Experience quality |
| Knowledge Ingestion Engine™ | **new** | Doc/code sync |
| Archivist Query Engine™ | **new** | Institutional Q&A |
| Simulation Engine™ | future | Business what-if |
| Discovery Engine™ | partial (Atlas) | Opportunity finding |

---

## 24. Risks

| Risk | Mitigation |
|------|------------|
| **Migration paralysis** | Incremental promotion; don’t move 977 files at once |
| **Dual truth (canon vs code)** | Generated projections + CI validators |
| **motherboard vs canon conflict** | Agent layer reads canon snapshot; MEMORY becomes ingress only |
| **Over-modeling** | KOM schema v1 minimal; evolve |
| **Founder bottleneck on Review™** | Delegate Review to Architecture + Experience auditors for tier-2 objects |
| **Immersive Library scope creep** | Phase 1: terminal UI in Archives; Phase 2: full Scene Stack wing |
| **Bible becomes stale** | Editions regenerated from canon queries |

---

## 25. Implementation Strategy (Post-Approval)

### Phase 0 — Governance (1 sprint)
- Approve this architecture
- Ratify Knowledge Constitution™ articles K01–K10
- Assign K-IDs to top 50 existing systems

### Phase 1 — Knowledge Core (2–3 sprints)
- KOM schema + `knowledge/` folder
- Master index YAML + graph export CI
- Lifecycle state machine (API only)
- Ingestion from route-registry + master-spec

### Phase 2 — Query + Archivist (2 sprints)
- Unified search index
- Orb Archivist™ read-only specialization
- Command Dock integration

### Phase 3 — Bible Volume I (2 sprints)
- Publication compiler
- Volume I drafted from canon queries
- Memory Bible / Knowledge Registry UI points to canon

### Phase 4 — Knowledge Library™ Immersive (3+ sprints)
- Archives wing zone + Scene Stack stations
- Dependency Wall + Version Gallery
- Atlas `located-in` overlay for canon objects

### Phase 5 — Migration (ongoing)
- Promote `docs/studio-os/` module docs → canon with K-IDs
- motherboard ingress pipeline for decisions
- Deprecate parallel truths

**Gate:** No new flagship features until Phase 1 complete.

---

## 26. Success Criteria

When 10× larger, any collaborator can ask:

| Question | Answered by |
|----------|-------------|
| Where does this belong? | `located-in` + flagship registry |
| What owns this? | `owns` edges + ownership metadata |
| Why was this decided? | `K-DEC` chronicle |
| How does this connect? | Graph traverse |
| What must ship first? | Build Order DAG |
| Is this live or spec? | Implementation Status Plane |
| What law governs this? | `governed-by` → `K-LAW` |

**Archivist answers in seconds with citations.**

---

## 27. Immediate Next Step

**Founder approval of this architecture** → then Phase 0 + Phase 1 implementation sprint.

No flagship code until Knowledge Core exists.

---

## Appendix A — Relationship to Existing M125–M127 Stack

| Existing | Future role |
|----------|-------------|
| Documentation Sync™ | → Knowledge Ingestion adapter |
| Knowledge Registry™ | → `knowledge/registry/` editor UI |
| Documentation Governance™ | → Knowledge Governance™ (orphan/law CI) |
| System Registry™ | → Engine index projection |
| Interactive Manual | → Publication: *Operator's Manual* derived from canon |
| Knowledge Hub / Library UI | → Knowledge Library™ immersive + terminals |

**Merge, don't duplicate.**

---

## Appendix B — motherboard Boundary (Critical)

| | motherboard | Knowledge System |
|--|---------------|------------------|
| Audience | AI agents | Founders, engineers, Orb, engines |
| Format | Append-only log | Graph + canon |
| Authority | Cache | Source of truth |
| Sync | Pulls from canon | Pushes decisions in |

**Rule:** At task end, agents write `K-DEC` summaries — not unbounded MEMORY growth as truth.

---

*End of proposal — Studio World Knowledge System™ Architecture v0.1.0*
