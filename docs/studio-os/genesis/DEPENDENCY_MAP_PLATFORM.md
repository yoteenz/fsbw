# Genesis Studio OS Dependency Map™ — Platform Guide

**Core:** `src/studio-os-core/genesis/dependency-map/`  
**Ontology:** `genesis/articles/STUDIO_OS_DEPENDENCY_MAP.md`  
**Content home:** `genesis/dependency-map/`  
**Admin:** `/admin/studio/genesis` → Dependency Map tab

---

## Purpose

The Studio OS Dependency Map is a **first-class Genesis subsystem** that tracks every core Studio OS system, its dependencies, owned data, events, readiness, build priority, and implementation phase. It is seeded with canonical systems from the approved dependency map article.

---

## Implemented modules

| Module | Path |
|--------|------|
| System Registry | `system-registry/registry.ts` |
| Dependency Graph | `system-dependencies/graph.ts` |
| System Events | `system-events/events.ts` |
| Build Order View | `build-order/order.ts` |
| Readiness | `readiness/scoring.ts` |
| Architecture Risks | `architecture-risks/risks.ts` |
| Seed Bootstrap | `bootstrap/seed.ts`, `seeds/studio-os-systems.ts` |

---

## System record fields

Every system stores: `systemId`, `name`, `purpose`, `status`, `buildPhase`, `buildOrder`, `priority`, `upstreamDependencies`, `downstreamDependents`, `ownedData`, `eventsEmitted`, `eventsConsumed`, `blockedBy`, `implementationRisk`, `readinessScore`, `notes`.

---

## Key APIs

```typescript
import {
  ensureDependencyMapSubsystem,
  listDependencySystemRegistry,
  getDependencyGraphView,
  getBuildOrderView,
  getReadyToBuildView,
  getBlockedSystemsView,
  getRiskView,
  detectCircularDependencies,
  detectMissingDependencies,
  getNextSystemsToBuild,
  updateDependencySystemStatus,
} from '@/studio-os-core/genesis';
```

---

## Persistence

Nested under `genesis_v1` localStorage as `GenesisStore.dependencyMap`. Seeded once on first bootstrap with 36 canonical Studio OS systems; recomputed on every load for readiness and blocked state.

---

## Principles

- Build foundational truth before experience systems
- Identity and permissions before command, production, marketplace
- Analytics observes; it does not mutate operational systems
- Orb and Headquarters consume platform state; they do not own source-of-truth data
- Consult `getReadyToBuildView()` before starting implementation sprints
