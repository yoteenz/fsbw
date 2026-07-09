# Genesis Studio OS Dependency Map™

**Ontology:** [`../articles/STUDIO_OS_DEPENDENCY_MAP.md`](../articles/STUDIO_OS_DEPENDENCY_MAP.md)  
**Runtime:** `src/studio-os-core/genesis/dependency-map/`  
**Admin:** `/admin/studio/genesis` → Dependency Map tab

The Studio OS Dependency Map is the planning engine for build order, readiness, risks, and dependency truth. It is **seeded** with canonical Studio OS core systems from the approved dependency map article.

## Structure

| Path | Purpose |
|------|---------|
| `system-registry/` | System Registry — canonical dependency system records |
| `system-dependencies/` | Dependency Graph, circular/missing dependency detectors |
| `system-events/` | Event contract aggregation across systems |
| `build-order/` | Build Order View and next-system recommendations |
| `readiness/` | Readiness scores, Ready To Build, Blocked Systems views |
| `architecture-risks/` | Risk View and critical/high risk summaries |

## Rule

Consult the dependency map before implementing any core system. Do not build experience or economy surfaces until upstream foundations are implemented or explicitly mocked behind stable interfaces.
