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
- Scene Stack assembly law → law node
- Bootstrap engines, genomes, publications
- Master Spec milestones (CI compile)

### Future ingestion (Phase 2+)

- Marketplace transactions
- Scene graphs per station
- Asset registry assets
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

## See also

- [STUDIO_WORLD_KNOWLEDGE_SYSTEM_ARCHITECTURE.md](../knowledge-system/STUDIO_WORLD_KNOWLEDGE_SYSTEM_ARCHITECTURE.md) — original proposal (subsumed)
- [world-graph-law.md](../../knowledge/canon/constitution/world-graph-law.md)
