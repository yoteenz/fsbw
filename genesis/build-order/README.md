# Genesis Studio OS Build Order Engine™

**Ontology:** [`../articles/STUDIO_OS_BUILD_ORDER.md`](../articles/STUDIO_OS_BUILD_ORDER.md)  
**Runtime:** `src/studio-os-core/genesis/build-order/`  
**Admin:** `/admin/studio/genesis` → Build Order tab

The Studio OS Build Order Engine is the authoritative planning engine that determines what Studio OS should build next based on architectural dependencies. It is **seeded** with 47 canonical systems from the approved build order article.

## Structure

| Path | Purpose |
|------|---------|
| `build-order/` | Build Order Registry™, sprint cycle view |
| `build-phases/` | Architectural phase groupings (0–9) |
| `dependency-engine/` | Dependency Resolver™, circular detection |
| `critical-path/` | Critical Path Analyzer™ |
| `parallel-work/` | Parallel Work Planner™ |
| `readiness/` | Architectural + Implementation Readiness engines |
| `blocked/` | Blocked systems view |
| `risks/` | Rewrite Risk + Technical Debt analyzers |

## Rule

Consult `getOptimalNextSystem()` before starting implementation sprints. The roadmap automatically adapts as systems are marked implemented via `updateBuildOrderSystemStatus()`.
