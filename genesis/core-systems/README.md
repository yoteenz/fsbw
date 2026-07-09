# Genesis Core Systems Blueprint™

**Ontology:** [`../articles/CORE_SYSTEMS_BLUEPRINT.md`](../articles/CORE_SYSTEMS_BLUEPRINT.md)  
**Runtime:** `src/studio-os-core/genesis/core-systems/`  
**Admin:** `/admin/studio/genesis` → Core Systems tab

The Core Systems Blueprint is Studio World's platform architecture layer. Registries start **empty** — no product-specific system content is seeded at runtime.

## Structure

| Path | Purpose |
|------|---------|
| `systems/` | System Registry™ — blueprint envelopes and batch ingest schema |
| `orb/` | Orb™ content home |
| `atlas/` | Atlas™ content home |
| `headquarters/` | Executive Headquarters™, Mission Control™, Command Center™ |
| `knowledge/` | Knowledge Core™, World Graph™, Institute of Knowledge™ |
| `foundry/` | Studio Foundry™, Generation Engine™ |
| `exchange/` | Studio Exchange™, Marketplace Engine™ |
| `professions/` | Profession Brains™, Professional Memory™ |
| `career-worlds/` | Career Worlds™ |
| `automation/` | Automation Engine™ |
| `workflows/` | Workflow Engine™ |
| `identity/` | Identity Engine™, Permissions Engine™ |
| `experience/` | Experience Engine™, Simulation Engine™ |
| `analytics/` | Analytics Engine™ |
| `search/` | Search Engine™ |
| `notifications/` | Notification Engine™ |
| `research/` | Research Engine™ |

## Rule

Every implementation sprint must trace to a core system blueprint. Platform boundaries, dependencies, and contracts are registered here — not hardcoded in product features.
