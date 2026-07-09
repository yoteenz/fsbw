# Genesis Universal Interaction Model™

**Ontology:** [`../articles/UNIVERSAL_INTERACTION_MODEL.md`](../articles/UNIVERSAL_INTERACTION_MODEL.md)  
**Runtime:** `src/studio-os-core/genesis/interaction-model/`  
**Admin:** `/admin/studio/genesis` → Interactions tab

The Universal Interaction Model is Studio World's interaction engine — the nervous system connecting every canonical object. Registries start **empty** — no Studio World feature content is seeded at runtime.

## Structure

| Path | Purpose |
|------|---------|
| `interactions/` | Interaction Registry™ and Interaction Engine™ |
| `events/` | Event Registry™ and Event Bus™ |
| `workflows/` | Workflow Registry™ and Workflow Composer™ |
| `commands/` | Command Registry™ |
| `messages/` | Message channel primitives |
| `notifications/` | Notification delivery primitives |
| `audit/` | Audit Engine™ |
| `automation/` | Automation trigger registry |
| `synchronization/` | Cross-object sync primitives |

## Rule

Every subsystem communicates through shared interaction primitives rather than custom integrations.
