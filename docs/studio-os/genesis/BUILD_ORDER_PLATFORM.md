# Genesis Studio OS Build Order Engine™ — Platform Guide

**Core:** `src/studio-os-core/genesis/build-order/`  
**Ontology:** `genesis/articles/STUDIO_OS_BUILD_ORDER.md`  
**Content home:** `genesis/build-order/`  
**Admin:** `/admin/studio/genesis` → Build Order tab

---

## Purpose

The Studio OS Build Order Engine is a **first-class Genesis subsystem** that determines the optimal next system to build based on architectural dependencies, readiness scores, critical path progress, and rewrite/debt risk — not manual prioritization.

---

## Implemented modules

| Module | Path |
|--------|------|
| Build Order Registry | `build-order/registry.ts` |
| Sprint Cycle View | `build-order/sprint.ts` |
| Build Phases | `build-phases/phases.ts` |
| Dependency Resolver | `dependency-engine/resolver.ts` |
| Critical Path Analyzer | `critical-path/analyzer.ts` |
| Parallel Work Planner | `parallel-work/planner.ts` |
| Architectural Readiness | `readiness/architectural.ts` |
| Implementation Readiness | `readiness/implementation.ts` |
| Blocked Systems | `blocked/blocked.ts` |
| Rewrite Risk Analyzer | `risks/rewrite-risk.ts` |
| Technical Debt Analyzer | `risks/technical-debt.ts` |
| Seed Bootstrap | `bootstrap/seed.ts`, `seeds/studio-os-systems.ts` |

---

## System record fields

Every system stores: `systemId`, `officialName`, `architecturalPhase`, `priority`, `dependencies`, `dependents`, `blockedBy`, `blocks`, `complexity`, `businessValue`, `platformValue`, `estimatedBuildTime`, `architecturalReadiness`, `implementationReadiness`, `rewriteRisk`, `technicalDebtRisk`, `currentStatus`.

---

## Key APIs

```typescript
import {
  ensureBuildOrderSubsystem,
  getOptimalNextSystem,
  getOverallRoadmapView,
  getCurrentSprintView,
  getReadyToBuildView,
  getBuildOrderBlockedView,
  getCriticalPathView,
  getParallelWorkView,
  getRewriteRiskAnalysis,
  getTechnicalDebtForecast,
  updateBuildOrderSystemStatus,
} from '@/studio-os-core/genesis';
```

---

## Persistence

Nested under `genesis_v1` localStorage as `GenesisStore.buildOrder`. Seeded once on first bootstrap with 47 canonical Studio OS systems; recomputed on every load for dependents, blocked-by, and status transitions.

---

## Principles

- Build order follows architectural dependency truth, not feature excitement
- Mark systems `implemented` after shipping to unlock dependents automatically
- Consult `getOptimalNextSystem()` before every implementation sprint
- Deferred systems (Orb, Marketplace, Career Worlds) remain blocked until upstream contracts stabilize
