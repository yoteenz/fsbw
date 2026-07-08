# Headquarters Engine™

**Studio World™ runtime architecture — The Living Headquarters Engine**

---

## Purpose

Define how **Studio World™** orchestrates subsystems into one coherent living headquarters — without introducing a new platform engine beyond experiential architecture.

This document is the **engine map**. Implementation lives in existing runtime layers extended with world orchestration.

---

## Engine Identity

| Property | Value |
|----------|-------|
| **Name** | Headquarters Engine™ |
| **Parent** | Studio World™ |
| **Tagline** | The Living Headquarters Engine |
| **Role** | Orchestrate place · persistence · streaming · state · memory · evolution |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STUDIO WORLD™                                   │
│                    (umbrella philosophy)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                   HEADQUARTERS ENGINE™                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Topology    │ │ World State │ │ World       │ │ World       │       │
│  │ Manager™    │ │ Resolver™   │ │ Memory™     │ │ Streaming™  │       │
│  │             │ │             │ │ Store™      │ │ Orchestrator│       │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘       │
│         │               │               │               │               │
│  ┌──────┴───────────────┴───────────────┴───────────────┴──────┐       │
│  │              PRESENCE & NAVIGATION LAYER                     │       │
│  │   Transitions™ · Walk the Business™ · Camera · Orb           │       │
│  └──────────────────────────┬──────────────────────────────────┘       │
│                             │                                           │
│  ┌──────────────────────────┴──────────────────────────────────┐       │
│  │              SET™ EXECUTION LAYER                            │       │
│  │   Department Runtime™ · Objects · Idle Life™ · Arrival       │       │
│  └──────────────────────────┬──────────────────────────────────┘       │
│                             │                                           │
│  ┌──────────────────────────┴──────────────────────────────────┐       │
│  │              DATA & GENOME LAYER                               │       │
│  │   Company Genome™ · Project Genome™ · Set DNA™ · Registry    │       │
│  └───────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Subsystems

### 1 — Topology Manager™

**Owns:** HQ graph — nodes (Sets™ · wings · floors) · edges (Transitions™)

| Responsibility | Source canon |
|----------------|--------------|
| Lot layout | [headquarters-layout.md](./headquarters-layout.md) |
| Set registry | [set-registry.md](./set-registry.md) |
| Edge → Transition DNA™ | [transitions/transition-dna.md](./transitions/transition-dna.md) |
| Evolution versioning | [world-evolution.md](./world-evolution.md) |

```typescript
interface HeadquartersTopology {
  version: number;
  nodes: TopologyNode[];  // sets · plazas · wings
  edges: TopologyEdge[];  // transitions
  floors: FloorDefinition[];
  metadata: { orgId: string; genomeVersion: string };
}
```

### 2 — World State Resolver™

**Owns:** Active [World States™](./world-states.md) stack

Inputs: calendar · metrics · lifecycle · founder · events  
Outputs: lighting · audio · Orb · AI · transition modifiers

### 3 — World Memory Store™

**Owns:** [World Memory™](./world-memory.md) tiers (hot · warm · cold · archive)

Sync: session · workspace API · legacy append-only

### 4 — World Streaming Orchestrator™

**Owns:** [World Streaming™](./world-streaming.md) proximity activation

Coordinates: transition buffer · Runtime load order · device tiers

### 5 — World Event Dispatcher™

**Owns:** [World Events™](./world-events.md) detect → present → resolve

Feeds: State Resolver · Orb · Legacy queue

### 6 — Evolution Controller™

**Owns:** [World Evolution™](./world-evolution.md) topology migrations · reveal ceremonies

---

## Navigation & Presence Layer

| System | Role |
|--------|------|
| **Transitions™** | Edge traversal · camera choreography |
| **Walk the Business™** | Journey-aware routing · briefing paths |
| **Walk the Room™** | Intra-Set™ guided path |
| **Studio Orb™** | Guide · context · event presentation |
| **Arrival Sequence™** | Set™ entry · HQ entry |
| **Camera system** | [camera-language.md](./transitions/camera-language.md) |

**Headquarters Engine™** selects *which path* — Transitions™ executes *how it feels*.

---

## Set™ Execution Layer

| System | Role |
|--------|------|
| **Department Runtime™** | Load package · assemble world · interactions |
| **Idle Life™** | Background motion when founder idle |
| **Ambient Storytelling™** | Environmental narrative |
| **World Persistence™** | Per-object state |
| **AI Employees™** | Concierge runtime · department agents |

Runtime runs **inside** Studio World™ — never as isolated SPA pages.

---

## Data & Genome Layer

| Asset | Shapes |
|-------|--------|
| **Company Genome™** | Materials · voice · signage across HQ |
| **Project Genome™** | Active project context in Sets™ |
| **Set DNA™** | Per-destination personality |
| **Room DNA™** | Predecessor vocabulary — same role |
| **Studio Asset Registry™** | Reusable props · shells · audio |
| **Marketplace Packs™** | Installable topology · Set™ · transition SKUs |

---

## Engine Lifecycle (Session)

```
1. BOUNDARY LOAD
   OrganizationContext → topology + genome + memory cold tier

2. ARRIVAL
   HQ Arrival™ or resume last Set™ (World Memory™)

3. STATE TICK
   Resolver applies World States™ + time of day

4. PRESENCE LOOP
   Founder input → navigation intent → streaming orchestrator
   → transition OR intra-Set™ interaction

5. BACKGROUND TICK
   Idle Life™ · events · generation · AI queue (Rule 2)

6. CHECKPOINT
   Memory hot → warm persist on Set™ exit / interval

7. DEPARTURE
   Session end — world continues (not reset)
```

---

## Integration Points (Existing Code)

| Future hook | Current anchor |
|-------------|----------------|
| Topology | `headquarters-module-resolver.ts` · HQ layout docs |
| Memory warm | `studio_os_workspace_state` API |
| Memory hot | `studioOsBrowserStorage.ts` |
| Set execution | `src/studio-os-core/department-room/` · Golden Build |
| Orb | `src/studio-os-core/studio-orb-runtime/` |
| Walk routing | `docs/studio-os/engine/walk-the-business/` |
| Org boundary | `OrganizationContextProvider` |

**No new engine folder this sprint** — map only.

---

## Marketplace Install Pipeline

```
Marketplace SKU
    → validate compatibility (topology · genome · tier)
    → Evolution Controller™ stages change
    → Topology Manager™ updates graph
    → Transition/Set Runtime loads new DNA
    → World Event™: Pack Arrived™
    → World Memory™ records install manifest
```

---

## Failure Domains

| Domain | Degrade strategy |
|--------|------------------|
| Streaming | Shell + Orb · retry |
| Memory sync | Local hot · reconcile on reconnect |
| State resolver | Default Morning™ baseline |
| Event dispatcher | Queue · no spam on recovery |
| Topology mismatch | Safe plaza arrival · Orb explains |

Never collapse to non-immersive admin chrome.

---

## Cross-References

- [studio-world.md](./studio-world.md) — umbrella index
- [world-rules.md](./world-rules.md) — operational laws
- [Department Runtime™](../engine/department-runtime/)
- [future-roadmap.md](./future-roadmap.md)
