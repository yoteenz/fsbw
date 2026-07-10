# The Living Knowledge Graph Bible™

## Everything Connects

**P0 Intelligence Constitution**  
**Version:** 1.0.0  
**Status:** Canonical blueprint for Studio World relational intelligence — July 2026  
**Authority:** Defines how every place, person, project, lesson, AI, and idea connects inside one coherent universe  
**Sprint:** STUDIO WORLD™ — The Living Knowledge Graph™ (docs only)

---

> *The Atlas is not merely geography. The Atlas is a living knowledge graph.*

> *The Atlas shows people where they are. The Knowledge Graph shows them where they could go next. That is the difference between navigation and intelligence.*

> *Read this before designing discovery engines, context panels, subgraph views, recommendation systems, or any relational intelligence in Studio World.*

**Canon stack:**

| Document | Defines |
|----------|---------|
| [World Graph Architecture](../studio-os/world-graph/STUDIO_WORLD_GRAPH_ARCHITECTURE.md) | **Technical truth** — single canonical graph, ingestion, schema |
| **Living Knowledge Graph Bible** (this document) | **Intelligence canon** — entity taxonomy, relationship model, subgraphs, discovery, context |
| [Studio Atlas Bible](./STUDIO_ATLAS_BIBLE.md) | **Geographic projection** — where things live on the map |
| [Master Plan](./STUDIO_WORLD_MASTER_PLAN.md) | **City architecture** — districts, districts, expansion |

**Hierarchy:** World Graph = truth substrate · Living Knowledge Graph Bible = intelligence behavior · Atlas = spatial projection of `located-in` edges · Context Engine = runtime surfacing of relationships.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Mission](#mission)
3. [Section I — Atlas vs Knowledge Graph](#section-i--atlas-vs-knowledge-graph)
4. [Section II — The World Graph™](#section-ii--the-world-graph)
5. [Section III — Entity Taxonomy™](#section-iii--entity-taxonomy)
6. [Section IV — Relationship Model™](#section-iv--relationship-model)
7. [Section V — Knowledge Constellations™](#section-v--knowledge-constellations)
8. [Section VI — The Context Engine™](#section-vi--the-context-engine)
9. [Section VII — The Discovery Engine™](#section-vii--the-discovery-engine)
10. [Section VIII — Recommendation Philosophy™](#section-viii--recommendation-philosophy)
11. [Section IX — The Project Graph™](#section-ix--the-project-graph)
12. [Section X — The Decision Graph™](#section-x--the-decision-graph)
13. [Section XI — The Learning Graph™](#section-xi--the-learning-graph)
14. [Section XII — The Human Collaboration Graph™](#section-xii--the-human-collaboration-graph)
15. [Section XIII — The AI Relationship Graph™](#section-xiii--the-ai-relationship-graph)
16. [Section XIV — The Studio Universe™](#section-xiv--the-studio-universe)
17. [Section XV — Things the Knowledge Graph Must Never Do](#section-xv--things-the-knowledge-graph-must-never-do)
18. [Section XVI — The Living Knowledge Graph Manifesto™](#section-xvi--the-living-knowledge-graph-manifesto)
19. [Long-Term Evolution Roadmap](#long-term-evolution-roadmap)
20. [Core Principles (Immutable)](#core-principles-immutable)

---

## Executive Summary

**The Living Knowledge Graph™** is the invisible intelligence that connects every object inside Studio World.

Every building, project, lesson, person, AI specialist, meeting, concept, department, product, company, and research artifact **knows how it relates** to every other object. Nothing exists in isolation.

| Surface | Shows |
|---------|-------|
| **Atlas** | **Where** something lives |
| **Knowledge Graph** | **Why** it matters · **how** it connects · **what** depends on it · **what** evolved from it · **what** it teaches |

One click on Experience Lab reveals the entire ecosystem: World Compiler → Runtime → Registry → State Ownership → Institute lessons → Professor Atlas → Architecture Center → past meetings → current project → future recommendations.

**North star:** Everything inside Studio OS feels like **one living civilization** — not separate software.

---

## Mission

Every object inside Studio World should know how it relates to every other object.

```
Buildings · Projects · Lessons · People · AI Specialists
Meetings · Concepts · Departments · Products · Companies · Research
```

**Everything is connected. Nothing exists in isolation.**

The Living Knowledge Graph becomes the **intelligence layer** that makes Studio World feel alive — proactive context, natural discovery, explorable institutional memory, cumulative learning.

---

## Section I — Atlas vs Knowledge Graph

### Two Projections, One Truth

```
                    ┌─────────────────────────┐
                    │   WORLD GRAPH™ (truth)   │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │    ATLAS     │  │  KNOWLEDGE   │  │   CONTEXT    │
      │  (geography) │  │   GRAPH UI   │  │   ENGINE     │
      │  where       │  │  why/how     │  │  proactive   │
      └──────────────┘  └──────────────┘  └──────────────┘
```

### Comparison

| Dimension | Atlas | Living Knowledge Graph |
|-----------|-------|------------------------|
| Primary question | "Where is it?" | "Why does it matter?" |
| Projection | `located-in` · coordinates · terrain | All edge types · subgraphs · constellations |
| User feel | Travel · zoom · place memory | Context · discovery · ecosystem reveal |
| Navigation | Yes — place-driven | No — intelligence-driven |
| Example | Registry Hall on Institute campus | Registry → DI → React → Runtime chain + related lessons + past debug sessions |

### Unified Experience

The Atlas **is** a living knowledge graph when:

- Building pins show **relationship count** and **context preview**
- Zoom to Concept View renders **graph edges** as walkable paths
- Project pins expand to **Project Graph** subgraph
- One click traverses **ecosystem** without leaving the map

**Rule:** Geography and intelligence are **one interface** — never separate apps.

---

## Section II — The World Graph™

The **World Graph™** is the single canonical source of truth. The Living Knowledge Graph Bible defines **how intelligence behaves on top of it**.

See [STUDIO_WORLD_GRAPH_ARCHITECTURE.md](../studio-os/world-graph/STUDIO_WORLD_GRAPH_ARCHITECTURE.md) for technical schema, ingestion, and build gates.

### Canonical Chain Example

```
Founder
   ↓
Company
   ↓
Brand
   ↓
Project
   ↓
Campaign
   ↓
Meeting
   ↓
Asset
   ↓
Lesson
   ↓
Professor
   ↓
AI Specialist
   ↓
Research Paper
   ↓
Simulation
   ↓
Knowledge Concept
   ↓
Decision
   ↓
Certification
```

Every arrow is a **typed edge** in the World Graph — not a UI hint.

### Experience Lab Ecosystem Example

```
Experience Lab
   ├── connects-to → World Compiler
   ├── depends-on → Runtime
   ├── teaches → Registry
   ├── teaches → State Ownership
   ├── has-lesson → Studio Institute · Registry Hall
   ├── taught-by → Professor Atlas
   ├── reviewed-in → Architecture Center
   ├── discussed-in → [Past Meeting nodes]
   ├── active-in → [Current Project]
   └── suggests → [Future Recommendation nodes]
```

**One click** expands this subgraph — user sees the entire ecosystem without searching.

### Graph Properties

| Property | Rule |
|----------|------|
| **Single truth** | No parallel registries |
| **Permanent history** | Nodes version; edges accumulate |
| **Typed relationships** | Every edge has semantic type |
| **Bidirectional query** | Traverse from any node |
| **Subgraph views** | Project · Decision · Learning · Human · AI graphs are filtered projections |
| **Privacy layers** | Personal DNA private; institutional edges shared per policy |

### Universal Lifecycle (on every node)

```
Spark™ → Concept™ → Research™ → Architecture™ → Prototype™ → Review™
  → Approved™ → Implemented™ → Live™ → Versioned™ → Deprecated™
  → Historical™ → Legacy™
```

Nothing disappears. The graph remembers evolution.

---

## Section III — Entity Taxonomy™

Every entity in Studio World maps to a **node type** in the World Graph.

### Entity Domains

| Domain | Node types | Examples |
|--------|------------|----------|
| **People** | founder, executive, learner, collaborator, customer | Founder · team member · apprentice |
| **Organization** | company, brand, department, district | Frontal Slayer · Studio Works wing |
| **Place** | headquarters, district, campus, building, floor, room | Registry Hall · Council Floor 42 |
| **Project** | project, campaign, product, prototype | Q3 Launch · Noir Unit |
| **Production** | asset, blueprint, scene-graph, golden-build, iteration | Hero object · v3 scene |
| **Knowledge** | knowledge-concept, lesson, simulation, publication, research-paper | Registry concept · EXP-REGISTRY-SIM-011 |
| **Intelligence** | ai-specialist, professor, engine, orb-personality | Professor Atlas · Brand Strategist |
| **Governance** | meeting, decision, approval, chronicle | Creative Review · ADR-042 |
| **Learning** | certification, learning-dna-profile, aha-event, misconception-cluster | MC-REACT-STORAGE-001 |
| **Research** | insight, trend-signal, consumer-study | Q2 Trend Brief |
| **Identity** | company-genome, founder-genome, industry-genome | Brand DNA constraints |

### Entity Schema (required fields)

Every node carries:

| Field | Purpose |
|-------|---------|
| `worldId` | Stable canonical ID |
| `nodeType` | Taxonomy class |
| `title` | Human name |
| `status` | Lifecycle state |
| `located-in` | Atlas coordinate (if physical) |
| `created-at` | Origin timestamp |
| `created-by` | Actor node |
| `canon-ref` | Institute of Knowledge link (if canonical truth) |

### Nothing Orphan

**Law:** A node without ≥1 relationship edge (except deliberate `spark` seeds) is **invalid** — ingestion rejects or flags for linking.

---

## Section IV — Relationship Model™

Relationships are **typed edges** — not generic "related to."

### Core Edge Types

| Edge type | Meaning | Example |
|-----------|---------|---------|
| `located-in` | Physical geography | Registry lesson → Registry Hall |
| `depends-on` | Dependency | Runtime → Registry |
| `spawned-from` | Origin | Project → Founder vision session |
| `inspired-by` | Influence | Campaign → Research insight |
| `teaches` | Pedagogical | Simulation → Concept |
| `taught-by` | Faculty | Lesson → Professor Atlas |
| `discussed-in` | Meeting | Decision → Council session |
| `decided-by` | Authority | Approval → Founder |
| `evolved-from` | Version lineage | Asset v3 → Asset v2 |
| `supersedes` | Replacement | New direction → old direction |
| `required-by` | Reverse dependency | Concept A ← Module B |
| `collaborates-with` | Human/AI peer | Professor Signal ↔ Professor Palette |
| `debates-with` | Productive tension | Strategist ↔ Creative Director |
| `recommends` | Discovery | Engine → adjacent lesson |
| `similar-to` | Cross-org pattern | Company A problem ↔ Company B solution |
| `certifies` | Mastery proof | Arena → Certification |
| `contributes-to` | Research/learning | Learner → Global Learning Graph (anonymous) |
| `references` | Citation | Decision → Research paper |
| `outcome-of` | Consequence | Product launch → Decision node |

### Edge Schema

```
edgeId, sourceNodeId, targetNodeId, edgeType, weight?, evidence?, createdAt, visibility
```

### Traversal Patterns

| Query | Traverse |
|-------|----------|
| "What depends on Registry?" | `required-by` inbound |
| "How did this project start?" | `spawned-from` chain backward |
| "What meetings shaped this?" | `discussed-in` inbound to decision |
| "What should I learn next?" | `teaches` + `recommends` from current concept |
| "Who disagrees on this?" | `debates-with` among AI specialists |

### Relationship Integrity

- **No dangling edges** — build gate fails compile
- **Canon edges immutable** — deprecation adds `supersedes`, never deletes
- **Evidence on decisions** — `decided-by` edges link to meeting + alternatives nodes

---

## Section V — Knowledge Constellations™

Knowledge appears as **constellations** — disciplines as star regions with visible overlap.

### Constellation Map

```
        Leadership · Writing
              \   /
    Psychology — Business — Marketing
          |    /    \
    UX — Design — Motion — Film
          |    \    /
    Programming — AI — Architecture
              \   /
         Finance · Photography
```

### Constellation Properties

| Property | Description |
|----------|-------------|
| **Region** | Discipline cluster (Programming, Design, …) |
| **Stars** | Individual concepts |
| **Bridges** | Cross-discipline edges (visible overlap) |
| **Brightness** | Mastery illumination per learner |
| **Fog** | Unexplored concepts |
| **Nebula** | Misconception clusters (confusion zones) |

### Atlas Integration

Constellations project onto:

- **Atlas Concept View** — walkable knowledge geography
- **Institute Knowledge Galaxy** — discipline universe
- **Graph overlay mode** — edges visible between stars

**Rule:** No concept is isolated — every star has ≥1 bridge or prerequisite edge.

---

## Section VI — The Context Engine™

**Everything has context.** Opening any entity surfaces its ecosystem automatically.

### Context Panel Schema

When user opens **any** node (project, building, lesson, meeting):

```
CONTEXT: {entity}
├── Related lessons          (teaches · recommends)
├── Related professors       (taught-by · collaborates-with)
├── Past discussions         (discussed-in)
├── Research papers          (references · inspired-by)
├── Relevant AI specialists  (owns · collaborates-with)
├── Previous design decisions(outcome-of · evolved-from)
├── Associated meetings      (discussed-in)
├── Prototype history        (evolved-from chain)
├── Similar companies        (similar-to · anonymous)
└── Active dependencies      (depends-on · required-by)
```

### Context Engine Rules

| Rule | Description |
|------|-------------|
| **Proactive** | Context loads without user search |
| **Ranked by relevance** | Weighted by recency · project · mastery gap |
| **Geographic + relational** | Shows Atlas address AND graph neighbors |
| **One-click traverse** | Any context item opens its subgraph |
| **Never overwhelm** | Top 7 visible · expand for full ecosystem |
| **Respects privacy** | Personal Learning DNA never exposed in shared context |

### Project Open Example

Open **Q3 Campaign Project**:

| Context slice | Surfaced |
|---------------|----------|
| Lessons | Brand positioning · Narrative architecture |
| Professors | Palette (visual) · Signal (strategy) |
| Meetings | Creative Review Mar 12 · Council approval Mar 18 |
| Research | Gen Z trend brief |
| AI specialists | Brand Strategist · Art Director |
| Decisions | Direction lock ADR · color palette approval |
| Prototypes | v1–v4 mood boards in Archive |
| Similar | 3 anonymous companies solved adjacent branding problem |

---

## Section VII — The Discovery Engine™

Studio World **proactively reveals connections** — discovery feels natural, not algorithmic spam.

### Discovery Triggers

| Signal | Discovery offer |
|--------|-----------------|
| 3 hours in Motion Studio | "You may benefit from Physics Lab" |
| Repeated registry debug | "Registry Hall simulation — 5 min" |
| Brand strategy struggle | "Professor Signal and Professor Palette disagree — watch debate" |
| Similar company pattern | "Three companies solved a similar branding problem" |
| Concept mastery | "Bridge open to Dependency Injection region" |
| Decision pending | "Past meeting on same topic — Floor 42, Mar 2025" |
| Project stall | "Research wing published insight last week" |

### Discovery Presentation

| Channel | Format |
|---------|--------|
| **Quiet offer** | Consent-first — "Would you like…" |
| **Atlas glow** | Adjacent region pulses on map |
| **Orb whisper** | Studio Orb single recommendation |
| **Professor office hours** | Faculty initiates based on graph |
| **Council packet** | Prepared connections for meeting |

### Discovery Rules

| Rule | Description |
|------|-------------|
| **Graph-grounded** | Every suggestion cites edge path |
| **Consent** | Never hijack flow without approval |
| **Explain why** | "Because you spent time in X which connects to Y" |
| **No engagement hacking** | Discovery serves comprehension/work — not clicks |
| **Cooldown** | Respect frustration threshold from Learning DNA |

---

## Section VIII — Recommendation Philosophy™

Recommendations are **intelligence** — not notifications.

### Recommendation Types

| Type | Purpose | Source subgraph |
|------|---------|-----------------|
| **Learning** | Next concept · review timing | Learning Graph |
| **Creative** | Adjacent discipline · metaphor | Knowledge Constellations |
| **Strategic** | Decision precedent · risk | Decision Graph |
| **Collaborative** | Human mentor · peer | Human Graph |
| **Faculty** | Professor debate · co-teach | AI Graph |
| **Project** | Missing asset · approval | Project Graph |
| **Research** | Relevant insight | Research edges |
| **Geographic** | Nearby building · room | Atlas + `located-in` |

### Recommendation Quality Bar

A recommendation must answer:

1. **What** — specific node/place
2. **Why** — edge path in plain language
3. **When** — duration tier (30s / 5m / deep)
4. **Who** — optional professor/specialist
5. **Decline** — silent respect; no penalty

### Forbidden Recommendations

- Generic "try this feature"
- Unrelated engagement bait
- Cross-user DNA exposure
- Truth-altering suggestions
- Recommendations without graph citation

---

## Section IX — The Project Graph™

Projects are **living ecosystems** — not folders.

### Project Graph Nodes

Every project subgraph includes:

| Node class | Examples |
|------------|----------|
| **Meetings** | Creative reviews · council approvals |
| **Assets** | Iterations · golden builds |
| **Design iterations** | v1–vN lineage |
| **Research** | Insight briefs referenced |
| **Learning** | Institute lessons consumed |
| **Approvals** | Decision nodes |
| **Products** | Shipped artifacts |
| **Campaigns** | Marketing executions |
| **AI discussions** | Specialist debate chronicle |
| **Customer insights** | Research · feedback |

### Project Graph Visualization

Founder **explores project evolution** as:

- **Timeline spine** — chronological edge accumulation
- **Ecosystem map** — radial subgraph from project node
- **Atlas pin expand** — project address → full graph
- **Living Timeline** — scrub project history

### Project Graph Rules

| Rule | Description |
|------|-------------|
| **Auto-link** | New meeting/asset/lesson auto-edges to active project |
| **No manual graph maintenance** | Ingestion adapters write edges |
| **Archive migration** | Completed projects retain full subgraph in Archive district |
| **Cross-project edges** | `similar-to` · `reused-from` across projects |

---

## Section X — The Decision Graph™

Every major decision creates a **node** — institutional memory becomes explorable.

### Decision Node Schema

```
DECISION: {id}
├── decided-by        → Founder / Council
├── discussed-in      → Meeting node(s)
├── alternatives      → [Option A, Option B, …]
├── evidence          → [Research, metrics, debate transcript]
├── rationale         → Chronicle text
├── outcome-of        → [Project, product, direction nodes]
├── spawned           → [Authorized work, blocked work]
└── future-consequences → [Tracked outcomes over time]
```

### Decision Graph Traversal

| Founder asks | Graph returns |
|--------------|---------------|
| "Why did we choose X?" | Decision → evidence → meeting |
| "What did we reject?" | Alternatives nodes + rationale |
| "What happened because of this?" | `outcome-of` forward chain |
| "Have we decided this before?" | Similar decision subgraph match |

### Integration

- **Council** — decisions mint nodes at approval
- **Archive** — decision vault stores chronicle
- **Observatory** — metrics become evidence edges
- **Atlas** — Decision View at Council coordinates

---

## Section XI — The Learning Graph™

Every lesson updates the **Learning Graph** — learning is cumulative, not linear.

### Learning Graph Writes (per lesson)

| Update | Target |
|--------|--------|
| **Learning DNA** | Private learner profile |
| **Knowledge Map** | Concept illumination |
| **Concept relationships** | Prerequisite · bridge edges strengthened |
| **Professor recommendations** | Affinity edges weighted |
| **Review schedule** | Decay half-life nodes |
| **Future curriculum** | Global Learning Graph (anonymous) |

### Learning Graph Structure

```
Learner (private)
   ├── mastered → [Concept nodes]
   ├── struggling → [Misconception cluster]
   ├── taught-by → [Professor nodes]
   ├── aha-at → [Aha event nodes]
   ├── recommends → [Next concept nodes]
   └── reviews-at → [Scheduled review nodes]
```

### Cumulative Learning Law

> A lesson never exists alone — it **rewires** the graph for all future lessons.

**Canon:** [Learning DNA Bible](../studio-institute/STUDIO_INSTITUTE_LEARNING_DNA_BIBLE.md) · [Cognitive Engine V3](../studio-institute/STUDIO_INSTITUTE_VISION_BIBLE_V3.md)

---

## Section XII — The Human Collaboration Graph™

People connect through **shared graph paths** — the world becomes a living network of creators.

### Human Edge Types

| Connection | Edge |
|------------|------|
| **Shared interests** | `interested-in` → concept regions |
| **Shared projects** | `contributes-to` → project |
| **Shared professors** | `taught-by` → same faculty |
| **Shared certifications** | `certifies` → same Arena event |
| **Shared discoveries** | `discovered` → concept |
| **Mentorship** | `mentors` / `mentored-by` |
| **Collaboration** | `collaborates-with` on project |

### Human Graph Visibility

| Scope | Rule |
|-------|------|
| **Opt-in social** | Collaboration edges visible to consenting peers |
| **Mentorship** | Apprentice pipeline from Institute |
| **No ranking** | Graph connects — never leaderboard humans |
| **Privacy** | Learning DNA never exposed |

### Use Cases

- Find collaborator who mastered same concept
- Mentor match via shared professor + project domain
- Community events at Arena from shared interest clusters

---

## Section XIII — The AI Relationship Graph™

AI specialists form **believable relationships** — the organization feels real.

### AI Edge Types

| Relationship | Behavior |
|--------------|----------|
| `collaborates-with` | Co-teach · co-produce |
| `debates-with` | Productive disagreement surfaced to founder |
| `recommends` | "Consult Professor Vector for this" |
| `escalates-to` | Chief of Staff · Council clerk |
| `references` | Prior work citation in dialogue |
| `defers-to` | Canon authority — Institute of Knowledge |
| `owns` | Domain · building · workflow |

### AI Graph Examples

```
Professor Signal ←debates-with→ Professor Palette
        │                              │
        └──────── collaborates-with ───┘
                      │
              recommends → Brand Strategist
                      │
              discussed-in → [Meeting nodes]
```

### Believability Rules

| Rule | Description |
|------|-------------|
| **Offices required** | Every AI has `located-in` address |
| **Relationships evolve** | Mentor Evolution ledger updates edges |
| **Debates have evidence** | Both sides link to graph nodes |
| **Never omniscient** | AI cites graph — does not invent policy |
| **Founder decides** | AI edges inform — never replace authority |

---

## Section XIV — The Studio Universe™

Eventually, everything inside Studio OS becomes **one connected universe**.

### Unified Domains

| Domain | Graph role |
|--------|------------|
| **Learning** | Learning Graph · Institute subgraph |
| **Building** | Project Graph · Works subgraph |
| **Leading** | Decision Graph · Council subgraph |
| **Researching** | Research insight nodes |
| **Designing** | Creative iteration chains |
| **Launching** | Campaign → product → Arena |
| **Teaching** | Professor · lesson · simulation |
| **Discovering** | Discovery Engine · constellations |

### Universe Feel

| Separate software | Studio Universe |
|-------------------|-----------------|
| LMS + PM + analytics + docs | One graph · many projections |
| Switch apps | Traverse edges |
| Search everywhere | Context everywhere |
| Forgotten decisions | Decision Graph forever |
| Isolated courses | Learning Graph cumulative |

### Single Query Experience

Orb Archivist™ queries **one graph**:

- "Show everything connected to Experience Lab"
- "What did we learn before shipping Noir?"
- "Who disagreed on brand direction and what happened?"
- "Where should I go next after Registry mastery?"

---

## Section XV — Things the Knowledge Graph Must Never Do

| Anti-pattern | Why |
|--------------|-----|
| Parallel truth registry | Violates World Graph law |
| Orphan nodes | Nothing exists in isolation |
| Generic "related items" without edge type | Violates relationship model |
| Discovery without graph citation | Violates intelligence philosophy |
| Expose private Learning DNA | Privacy violation |
| Replace founder decisions | AI informs — founder decides |
| Delete history | Permanent chronicle law |
| Separate graph per app | Violates Studio Universe |
| Engagement-optimized spam | Violates recommendation philosophy |
| Atlas without relational layer | Geography without intelligence |

---

## Section XVI — The Living Knowledge Graph Manifesto™

The Atlas shows you **where you are**.

The Knowledge Graph shows you **where you could go next**.

That is the difference between navigation and intelligence.

Every building knows its lessons.
Every project knows its meetings.
Every decision knows its evidence.
Every lesson knows its concepts.
Every professor knows their colleagues.
Every founder knows their civilization.

Nothing exists in isolation.
Everything connects.
Everything teaches.
Everything remembers.

Learning. Building. Leading. Researching. Designing. Launching. Teaching. Discovering.

**One living universe.**

---

## Long-Term Evolution Roadmap

**No phase ships without founder approval.** Aligns with [Three Eras Roadmap](../studio-os/world-graph/STUDIO_WORLD_THREE_ERAS_ROADMAP.md): Knowledge™ → World™ → Intelligence™.

### Phase 0 — Constitutional Layer (Complete)

- Living Knowledge Graph Bible ratified
- World Graph Architecture as technical substrate
- Entity taxonomy + relationship model documented

### Phase 1 — World Graph Core (Era 1 — Active)

- Node types · ingestion adapters · compile gate
- `located-in` edges for Atlas projection
- Basic Context Panel — top 3 related nodes

### Phase 2 — Entity Taxonomy Complete

- All domain node types registered
- Orphan detection · relationship integrity gate
- Project Graph auto-linking from Works pipeline

### Phase 3 — Context Engine

- Full context panel schema on project · meeting · lesson open
- Evidence edges on decisions
- Chronicle integration with Archive

### Phase 4 — Knowledge Constellations

- Discipline regions · concept bridges
- Atlas Concept View + constellation overlay
- Institute Concept Web / Galaxy sync

### Phase 5 — Decision Graph + Learning Graph

- Decision nodes at Council approval
- Learning Graph writes from Institute sessions
- Aha · misconception · review edges

### Phase 6 — Project Graph Mature

- Full project ecosystem visualization
- Living Timeline subgraph scrub
- Cross-project `similar-to` patterns

### Phase 7 — Discovery Engine

- Proactive quiet offers with graph citations
- Professor debate discovery
- Cross-company anonymous patterns

### Phase 8 — Human + AI Graphs

- Collaboration · mentorship edges (opt-in)
- AI debate · recommend · escalate relationships
- Faculty evolution updates graph

### Phase 9 — Intelligence Era (Era 3)

- Orb Archivist full subgraph queries
- Predictive "where to go next" from graph traversal
- Recommendation philosophy fully operational

### Phase 10 — The Studio Universe

- Every Studio OS surface reads one graph
- Atlas + Context + Discovery unified
- Users describe one civilization — never separate tools
- Verified: one click reveals any ecosystem

### North Star

> *The Atlas shows people where they are. The Knowledge Graph shows them where they could go next.*

---

## Core Principles (Immutable)

1. **Everything connects — nothing exists in isolation**
2. **World Graph is single truth — all surfaces are projections**
3. **Atlas shows where · Knowledge Graph shows why and how**
4. **Typed relationships — not generic "related"**
5. **Context is proactive — ecosystems surface automatically**
6. **Discovery is natural — graph-grounded with consent**
7. **Projects are ecosystems — Project Graph**
8. **Decisions are nodes — Decision Graph with evidence**
9. **Learning is cumulative — Learning Graph rewires future**
10. **Humans and AI form believable networks**
11. **Knowledge Constellations — no isolated concepts**
12. **One Studio Universe — not separate software**
13. **Privacy boundaries on personal DNA**
14. **History permanent — version, never delete**
15. **Master Plan + Atlas Bible + Living Knowledge Graph Bible — layered intelligence canon**

---

*End of The Living Knowledge Graph Bible™ v1.0.0 — Everything Connects*

*Nothing should be built that stores parallel truth outside the World Graph.*

*Implement as intelligence layer on [World Graph Architecture](../studio-os/world-graph/STUDIO_WORLD_GRAPH_ARCHITECTURE.md), projected through [Atlas Bible](./STUDIO_ATLAS_BIBLE.md), grounded in [Master Plan](./STUDIO_WORLD_MASTER_PLAN.md).*
