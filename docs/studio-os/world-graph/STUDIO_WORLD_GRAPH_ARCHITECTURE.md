# Studio World Graph™ — Canonical Architecture

**Status:** Approved direction · Phase 1 implemented  
**Version:** 1.0.0  
**Supersedes:** Knowledge System-only model (Knowledge Graph is first subsystem)

---

## One sentence

**The World Graph™ is the single canonical source of truth for Studio World civilization.**  
Everything else — Bible, Atlas, Archives, Orb, Knowledge Library, engineering docs — is a **projection**.

---

## Civilization model

Studio World models an entire **living business civilization**, not documentation.

| Domain | Example node types |
|--------|-------------------|
| Knowledge | knowledge-object, architectural-decision, publication |
| Places | flagship, wing, room, headquarters |
| Production | blueprint, scene-graph, environment-shell, golden-build |
| Assets | asset, hero-object, material, animation |
| Economy | marketplace-product, asset-pack, reputation |
| Identity | company-genome, founder-genome, industry-genome |
| Innovation | innovation-lineage, expedition, constellation |
| Intelligence | engine, ai-agent, orb-personality |

---

## The graph is truth

```
World Graph™ (canonical)
    ├── projections → Studio World Bible™
    ├── projections → Knowledge Library™
    ├── projections → Studio World Atlas™
    ├── projections → Orb Archivist™
    ├── projections → Dependency Maps™
    ├── projections → Timelines™
    ├── projections → Museum Exhibits™
    ├── projections → Architecture Decision Records™
    └── projections → Search™
```

**Never multiple competing sources of truth.**

---

## Knowledge Graph → World Graph

The approved Knowledge Object Model (K-IDs) maps to World Graph nodes:

- `knowledge-object` node type
- `K-*` prefixes alias to `W-KNO-*` world IDs
- Knowledge Registry, Documentation Sync → ingestion adapters
- Master Scene Blueprint → `master-scene-blueprint` node type

---

## Universal lifecycle

```
Spark™ → Concept™ → Research™ → Architecture™ → Prototype™ → Review™
  → Approved™ → Implemented™ → Live™ → Versioned™ → Deprecated™
  → Historical™ → Legacy™
```

Nothing disappears. History is permanent.

---

## World memory (relationships, not folders)

The graph remembers:

- Why something exists (`spawned-from`, `inspired-by`)
- Who created it (`created-by`)
- When it evolved (`supersedes`, `versioned`)
- What depends on it (`depends-on`, `required-by`)
- What replaced it (`supersedes`, `deprecated-by`)
- What it became (`evolved-into`)

---

## Orb Archivist™

Archivist queries **relationships**, not documents:

- "Show every scene using this lighting preset" → `reused-by` traverse
- "Which headquarters inherited this blueprint?" → `located-in` + `evolved-into`
- "What innovations came from Frontal Slayer?" → company subgraph
- "Show department evolution" → `supersedes` chain

---

## Phase 1 implementation (this sprint)

| Component | Path |
|-----------|------|
| Core module | `src/studio-os-core/world-graph/` |
| CI compile | `scripts/compile-world-graph.mjs` |
| Public graph | `public/studio-os/world-graph/graph.json` |
| Schema | `knowledge/schema/` |
| Constitution | `knowledge/canon/constitution/world-graph-law.md` |
| Compile report | `docs/studio-os/world-graph/WORLD_GRAPH_COMPILE_REPORT.md` |

### Ingestion adapters (Phase 1)

- Route registry → room + flagship nodes
- Studio World Constitution → law nodes
- Studio World Knowledge Core™ → knowledge-object domain, entry, and prompt-standard nodes
- Studio World Memory System™ → conversation-archive, knowledge-extraction, and founder-approval nodes
- Architecture Decision Records™ → architectural-decision nodes
- Studio Foundry™ → generation-recipe knowledge-object nodes for manufactured asset classes
- Scene Stack assembly law → law node
- Bootstrap engines, genomes, publications
- Master Spec milestones (CI compile)

### Future ingestion (Phase 2+)

- Marketplace transactions
- Scene graphs per station
- Asset registry assets beyond Hero Objects™
- Innovation expeditions
- Historical events / simulations

---

## Build gate

`npm run compile-world-graph` runs in `prebuild` after Master Spec compile.  
Build fails on dangling edges or validation errors.

---

## Extension contract

Future systems connect by:

1. Registering a `nodeType` in `knowledge/schema/node-types.yaml`
2. Adding an ingestion adapter in `world-graph/ingestion/`
3. Declaring `integrates-with` edges to `W-ENG-world-graph`
4. Never storing parallel truth outside the graph

---

## Three Eras Roadmap™ (guiding principle)

Studio World evolves in sequenced eras — **not** as a single sprint:

| Era | Objective | Current |
|-----|-----------|---------|
| **Knowledge™** | Memory — graph understands civilization | **Active** |
| **World™** | Living civilization driven by graph | Future |
| **Intelligence™** | Reasoning and proactive assistance | Future |

Every major implementation is evaluated with `evaluateImplementationEra()` before shipping. Full roadmap: [STUDIO_WORLD_THREE_ERAS_ROADMAP.md](./STUDIO_WORLD_THREE_ERAS_ROADMAP.md). Constitutional law: [three-eras-roadmap.md](../../knowledge/canon/constitution/three-eras-roadmap.md).

World Graph Phase 1 is **Era 1 infrastructure** — not Era 2 spatial civilization or Era 3 proactive intelligence.

---

## Canon hierarchy (four governance layers)

| Layer | Role | Graph node type |
|-------|------|-----------------|
| **Design Principles™** | Philosophy — experience north star | `design-principle` (`W-DPR-*`) |
| **World Physics™** | Natural laws — what is possible | `foundational-physics-law` (`W-PHY-*`) |
| **Constitutional Law™** | Governance — what is allowed | `constitutional-law` (`W-LAW-*`) |
| **Implementation Standards™** | Engineering — how we build | `implementation-standard` (`W-STD-*`) |

Design Principles guide Physics. Physics constrains Constitution. Constitution guides Standards.

**Design Review Filter™:** `runDesignReviewFilter()` — six-step flagship review.

Full docs: [STUDIO_WORLD_GOVERNANCE_HIERARCHY.md](../governance/STUDIO_WORLD_GOVERNANCE_HIERARCHY.md)

---

## See also

- [STUDIO_WORLD_THREE_ERAS_ROADMAP.md](./STUDIO_WORLD_THREE_ERAS_ROADMAP.md) — **guiding principle:** Knowledge™ → World™ → Intelligence™
- [ARTICLE_K22_STUDIO_WORLD_KNOWLEDGE_CORE.md](../knowledge-core/ARTICLE_K22_STUDIO_WORLD_KNOWLEDGE_CORE.md) — Studio World internal memory
- [ARTICLE_K23_MEMORY_SYSTEM.md](../knowledge-core/ARTICLE_K23_MEMORY_SYSTEM.md) — conversation-to-canon memory lineage
- [ARTICLE_K21_ARCHITECTURE_DECISION_RECORDS.md](../architecture-decision-records/ARTICLE_K21_ARCHITECTURE_DECISION_RECORDS.md) — ADRs as constitutional history
- [STUDIO_WORLD_KNOWLEDGE_SYSTEM_ARCHITECTURE.md](../knowledge-system/STUDIO_WORLD_KNOWLEDGE_SYSTEM_ARCHITECTURE.md) — original proposal (subsumed)
- [world-graph-law.md](../../knowledge/canon/constitution/world-graph-law.md)
- [three-eras-roadmap.md](../../knowledge/canon/constitution/three-eras-roadmap.md)
