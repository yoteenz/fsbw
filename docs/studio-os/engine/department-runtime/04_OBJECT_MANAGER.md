# 04 — Object Manager

**Engine Module:** `studio.department-runtime.v1.object-manager`  
**Status:** Runtime object actor specification  
**Philosophy:** Every placed asset becomes a runtime actor with identity, state, and behavior

---

## Definition

The **Object Manager** instantiates, tracks, and lifecycle-manages **runtime objects** — the live actors representing SDK Object Library classes (03) in the assembled world.

> Mood Wall, Glass Table, Orb Pedestal, Timeline — each is a runtime actor, not a React component.

---

## Runtime Object Schema

```yaml
RuntimeObject:
  # Identity
  instanceId: string                  # unique within department
  classId: string                   # SDK object class (03)
  assetId: string                   # source asset module
  zone: string                      # interaction zone

  # State
  state: ObjectState
  visibility: enum                  # visible | hidden | transitioning
  focusLevel: number                # 0.0–1.0 depth of field
  selected: boolean
  disabled: boolean

  # Behavior
  events: ObjectEventSubscription[]
  permissions: ObjectPermissionSet
  allowedVerbs: string[]            # from interaction map
  activeVerb: string | null

  # Dependencies
  dependsOn: string[]               # other instanceIds
  attachmentNode: string | null     # parent furniture node
  contentPayload: any               # data on surface (items, pins, etc.)

  # Presentation
  animations: AnimationBinding[]
  genomeAdaptation: GenomeAdaptationState
  audioBindings: string[]

  # Audit
  createdAt: datetime
  lastInteractionAt: datetime | null
```

---

## Object State Machine

```
DORMANT → IDLE → HOVER → FOCUSED → ACTIVE → RESULT → IDLE
                                      ↓
                                   DISABLED
```

Aligned with platform Interaction Engine™ M130 states.

---

## Canonical Runtime Objects

### Mood Wall

| Property | Runtime Behavior |
|----------|------------------|
| classId | `mood-wall` |
| zone | `hero` |
| content | Genome visual references + Project mood overlay |
| animations | Parallax drift, color breathe (ambient loop) |
| events | `genome-updated`, `project-mood-changed` |
| genome | Full surface — imagery, color fields, motion |

### Glass Table

| Property | Runtime Behavior |
|----------|------------------|
| classId | `glass-table` |
| zone | `primary` or `secondary` |
| content | Work items array (draggable entities) |
| verbs | drag, click, compare, pin |
| animations | Item settle, reflection shimmer |
| collision | Table surface plane for drag raycast |

### Floating Panel

| Property | Runtime Behavior |
|----------|------------------|
| classId | `floating-panel` |
| attachTo | parent object instanceId |
| content | Status stream, metadata, quick actions |
| verbs | hover expand, click focus, drag reposition, pin |
| genome | Typography, glass tint from injection |
| max concurrent | 3 per zone (SDK rule) |

### Orb Pedestal

| Property | Runtime Behavior |
|----------|------------------|
| classId | `orb-pedestal` |
| zone | `orb` |
| hosts | Orb Runtime actor (06) |
| animations | Glow sync with Orb state |
| required | true — every department |

### Timeline

| Property | Runtime Behavior |
|----------|------------------|
| classId | `timeline-table` |
| zone | `primary` |
| content | Timeline events from Project Runtime |
| verbs | scrub, drag, click, pin |
| events | `schedule-changed`, `milestone-reached` |

### Command Console

| Property | Runtime Behavior |
|----------|------------------|
| classId | `command-console` |
| zone | `primary` or `secondary` |
| content | Command registry + system state |
| verbs | command, speak (via Orb relay) |
| permissions | Power-user commands gated |

### Asset Shelf

| Property | Runtime Behavior |
|----------|------------------|
| classId | `asset-shelf` |
| zone | `secondary` |
| content | Asset Registry query results |
| verbs | browse, filter, drag, preview, pin |
| hydration | Project Runtime + Asset Registry |

### Interactive Wall

| Property | Runtime Behavior |
|----------|------------------|
| classId | `interactive-wall` |
| zone | `secondary` |
| content | Pinned items, annotations |
| verbs | pin, annotate, reference-drop, compare, branch |

### Project Board

| Property | Runtime Behavior |
|----------|------------------|
| classId | `project-board` |
| zone | `primary` |
| content | Project tasks, blockers, collaborators |
| verbs | drag, click, assign, escalate |
| hydration | Project Runtime (15) |

### Approval Station

| Property | Runtime Behavior |
|----------|------------------|
| classId | `approval-station` |
| zone | `ceremony` |
| content | Pending approval payload |
| verbs | approve, reject, branch, compare |
| ceremonies | Triggers Animation + Audio engines |

---

## Object Events

```yaml
ObjectEvent:
  type: string                      # state-changed | content-updated | verb-completed
  instanceId: string
  payload: any
  timestamp: datetime
```

Events propagate to:
- State Manager (14)
- Concierge Runtime (07) — if AI trigger mapped
- Event Bus™
- Project Runtime (15) — if project-scoped

---

## Object Permissions

```yaml
ObjectPermission:
  verb: string
  required: string                  # permission key
  fallback: enum                    # disabled | escalate | orb-explain
```

Checked by Interaction Engine before verb execution.

---

## Genome Adaptation (Per Object)

```yaml
GenomeAdaptationState:
  domainsApplied: string[]
  materialSlotValues: MaterialSlotMap | null
  typographyStyle: TypographyStyle | null
  labelOverrides: Map<string, string>
  lastInjectedAt: datetime
  genomeSnapshotId: string
```

Updated on Genome Injection (13) and live Genome refresh events.

---

## Object Lifecycle

```
ASSEMBLY: instantiate from placement + asset handle
    ↓
GENOME_INJECT: apply adaptation state
    ↓
HYDRATE: load content from Project Runtime
    ↓
ACTIVE: accept interactions
    ↓
BACKGROUND: preserve state, pause animations
    ↓
HOT_SWAP: replace asset handle, preserve state
    ↓
UNLOAD: persist state to State Manager, destroy actor
```

---

## Object Registry API (Conceptual)

```yaml
ObjectManager.get(instanceId) → RuntimeObject
ObjectManager.listByZone(zone) → RuntimeObject[]
ObjectManager.listByClass(classId) → RuntimeObject[]
ObjectManager.setState(instanceId, state) → void
ObjectManager.getContent(instanceId) → any
ObjectManager.setContent(instanceId, payload) → void
ObjectManager.hotSwap(instanceId, newAssetHandle) → void
```

---

_Next: [05 — Interaction Engine](./05_INTERACTION_ENGINE.md)_
