# Genesis Universal Interaction Model™ — Platform Guide

**Core:** `src/studio-os-core/genesis/interaction-model/`  
**Ontology:** `genesis/articles/UNIVERSAL_INTERACTION_MODEL.md`  
**Content home:** `genesis/interaction-model/`  
**Admin:** `/admin/studio/genesis` → Interactions tab

---

## Purpose

The Universal Interaction Model is a **first-class Genesis subsystem** providing reusable interaction infrastructure for Studio World. This sprint delivers **framework only** — no hardcoded Studio World interactions in runtime.

---

## Implemented systems

| System | Module |
|--------|--------|
| Interaction Registry™ | `interactions/registry.ts` |
| Interaction Engine™ | `interactions/engine.ts` |
| Event Registry™ | `events/registry.ts` |
| Event Bus™ | `events/bus.ts` |
| Workflow Registry™ | `workflows/registry.ts` |
| Workflow Composer™ | `workflows/composer.ts` |
| Command Registry™ | `commands/registry.ts` |
| Audit Engine™ | `audit/engine.ts` |
| Messages | `messages/messages.ts` |
| Notifications | `notifications/notifications.ts` |
| Automation | `automation/automation.ts` |
| Synchronization | `synchronization/sync.ts` |
| Content Loader | `content/loader.ts` |

---

## Interaction envelope

Every interaction stores:

- Unique ID, Interaction Type, Version
- Participants, Initiator, Recipient
- Inputs, Outputs, Status, Priority
- Relationships, Visibility, Audit History
- Retry Strategy, Metadata

---

## Event categories

Domain, system, user, AI, knowledge, marketplace, company, mission, and learning events.

---

## Key APIs

```typescript
import {
  submitStudioInteraction,
  emitStudioEvent,
  composeStudioWorkflow,
  issueStudioCommand,
  recordAuditEntry,
  ingestInteractionBatch,
  validateInteractionModelStore,
} from '@/studio-os-core/genesis';
```

---

## Persistence

Nested under `genesis_v1` localStorage as `GenesisStore.interactionModel`. Registries start empty until interactions are submitted or ingested via `genesis/interaction-model/interactions/interaction.schema.json`.

---

## Workflow composition

Workflows assemble from reusable interaction primitives. The Workflow Composer orchestrates steps without hardcoded subsystem dependencies — each step submits an interaction through the Interaction Engine.
