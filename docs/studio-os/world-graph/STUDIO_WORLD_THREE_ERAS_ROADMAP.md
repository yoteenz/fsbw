# Studio World Three Eras Roadmap™

**Status:** Approved architectural direction · Guiding principle  
**Version:** 1.0.0  
**Current era:** ERA 1 — Knowledge™  
**Ratified:** 2026-07-08

---

## One sentence

**Studio World evolves in three sequenced eras — Knowledge creates memory, memory creates relationships, relationships create understanding, understanding enables intelligence.** Build the foundation first. Then the civilization. Then the intelligence that operates it.

---

## The evolution

```
Knowledge™  →  World™  →  Intelligence™

Knowledge creates memory.
Memory creates relationships.
Relationships create understanding.
Understanding enables intelligence.
```

**Do not build all three eras at once.** Every major implementation from this point forward is evaluated against this roadmap before code ships.

---

## ERA 1 — Knowledge™ (current)

**Objective:** Not more features. **Memory.**

Studio World must first understand itself. Before Studio World can think, it must remember.

| System | Role in Era 1 |
|--------|----------------|
| World Graph™ | Canonical memory substrate — single source of truth |
| Knowledge Core™ | Studio World's internal memory — domains, statuses, prompt memory, Architect's Memory™, lifecycle, query over graph nodes |
| Studio World Bible™ | Publication projection — never canonical |
| Knowledge Library™ | Immersive Archives projection for exploring relationships |
| Blueprint Registry™ | Registered blueprint nodes in the graph |
| Architecture Decisions™ | Decision nodes with provenance and supersession chains |
| Constitutional Laws™ | Governance nodes — World Graph Is Truth™, Three Eras™, etc. |
| Dependency Graph™ | `depends-on` / `required-by` edge traversals |
| Scene Graph™ | Production memory — layers, shells, golden builds |
| Asset Registry™ | Asset nodes linked to reuse and provenance |
| Company Genome™ | Company identity substrate |
| Founder Genome™ | Founder identity substrate |
| Industry Genome™ | Industry context substrate |

**Era 1 exit criteria (not yet met):** Graph comprehensively ingests routes, engines, assets, scene graphs, decisions, and constitutional law; Bible and Library are reliable projections; Orb Archivist™ can answer relationship queries without reading scattered markdown.

---

## ERA 2 — World™ (future)

**Objective:** Once Studio World understands itself, it becomes a **living civilization**. The graph starts driving the world.

| System | Role in Era 2 |
|--------|----------------|
| Studio World Atlas™ | Spatial projection of graph — locations, pathways, fog |
| Headquarters | HQ topology driven by graph places |
| Departments | Department nodes with evolution history |
| Wings · Rooms | Physical-place law enforced from graph |
| Museum | Exhibits as graph projections |
| Warehouse | Production objects registered and linked |
| Marketplace | Economy nodes — products, transactions, reputation |
| Archives | Knowledge Library as living destination |
| Innovation Districts | Expedition and lineage subgraphs |
| Organizations | Org nodes and collaboration edges |
| Collaboration Network | Joint IP and attribution in graph |
| Company Relationships | Inter-company edges |
| Asset Reuse Network | `reused-by` traversals at civilization scale |
| Living Scene Graphs | Scene graphs that evolve with production |
| Historical Timeline | `historical-event` chains |
| Future Simulations | `future-simulation` nodes (spec only until Era 3) |

**Era 2 principle:** Nothing exists independently. Everything belongs somewhere. Everything has relationships. Everything has history.

---

## ERA 3 — Intelligence™ (future)

**Objective:** Once the World Graph exists and the civilization is connected, Studio World **reasons over the graph**. The platform evolves from storing knowledge to actively helping founders make better decisions.

| System | Role in Era 3 |
|--------|----------------|
| Orb Intelligence™ | Proactive graph-aware assistance |
| Creative Planning™ | Taste- and genome-informed planning |
| Architecture Auditor™ | Code ↔ canon alignment (partially live — full gate in Era 3) |
| Experience Intelligence Engine™ | Immersion quality reasoning |
| Build Sequencer™ | Optimal build order from dependency graph |
| Cost Optimizer™ | Resource reasoning over production subgraph |
| Asset Reuse Advisor™ | Reuse recommendations from graph |
| Collaboration Matcher™ | Partner matching from org subgraph |
| Marketplace Intelligence™ | Economy reasoning |
| Future Merge™ · Parallel Futures™ | Simulation merge reasoning |
| Risk Analysis™ | Dependency and expedition risk |
| Organization Health™ | Org subgraph health signals |
| Opportunity Discovery™ | Cross-domain graph surfacing |
| Recommendation Engine™ | Proactive suggestions — system stops waiting for prompts |

**Era 3 principle:** The system stops waiting for prompts. It begins proactively assisting.

---

## Implementation evaluation checklist

Before every major implementation, answer all four questions:

| # | Question | Pass criteria |
|---|----------|---------------|
| 1 | **Which era does this belong to?** | Primary era declared; cross-era dependencies documented |
| 2 | **Does it establish a strong foundation for the next era?** | Adds nodes/edges/projections that Era 2 or 3 can traverse without rework |
| 3 | **Is this introducing unnecessary complexity too early?** | No Era 3 proactive intelligence before graph memory is sufficient; no Era 2 spatial civilization before relationship substrate exists |
| 4 | **Can this be designed to evolve into the next stage without a rewrite?** | Uses graph node types, ingestion adapters, and projections — not parallel truth stores |

Use `evaluateImplementationEra()` in `src/studio-os-core/world-graph/era-evaluation.ts` for structured reviews. Defer or redesign when Era 3 work is proposed during Era 1, or when a feature stores truth outside the World Graph™.

---

## Current system mapping (Phase 1 snapshot)

| System | Primary era | Status | Notes |
|--------|-------------|--------|-------|
| World Graph™ | Knowledge | Implemented | Civilization nervous system |
| Scene Stack™ | Knowledge | Live | Scene Graph™ memory; production handoff to Era 2 |
| Knowledge Registry™ | Knowledge | Live | Projection over Master Spec |
| Studio World Bible™ | Knowledge | Architecture | Publication — not truth |
| Knowledge Library™ | Knowledge | Implemented | Archives projection |
| Company / Founder / Industry Genome™ | Knowledge | Live / Architecture | Identity substrate |
| Studio World Atlas™ | World | Live (partial) | Spatial layer exists; full graph-driven world in Era 2 |
| Architecture Auditor™ | Intelligence | Live (partial) | Enforcement today; full reasoning in Era 3 |
| Experience Intelligence Engine™ | Intelligence | Live (partial) | Quality bar — defer proactive mode to Era 3 |
| Orb Archivist™ | Knowledge → Intelligence | Architecture | Relationship queries now; proactive Orb in Era 3 |
| Constitution™ · Responsibility Framework™ | Knowledge | Live | Governance and place law registered in graph |

---

## Sequencing rules (binding)

1. **No new flagships** until Knowledge era foundation is solid (founder gate from World Graph Phase 1).
2. **Graph-first:** register nodes and edges before shipping features that claim canon status.
3. **Projections only:** Bible, Atlas, Library, Museum, search — never competing truth.
4. **Era 2 spatial work** may proceed only when the underlying nodes and edges exist in the graph.
5. **Era 3 intelligence** may not run proactive recommendation loops until Era 2 relationship density is sufficient.

---

## See also

- [STUDIO_WORLD_GRAPH_ARCHITECTURE.md](./STUDIO_WORLD_GRAPH_ARCHITECTURE.md)
- [three-eras-roadmap.md](../../knowledge/canon/constitution/three-eras-roadmap.md)
- [world-graph-law.md](../../knowledge/canon/constitution/world-graph-law.md)
