# 11 — Department Runtime

**SDK Module:** `studio.department.sdk.v1.runtime`  
**Status:** Dynamic assembly specification  
**Philosophy:** Everything is assembled at runtime — nothing is pre-baked

---

## Definition

The **Department Runtime** is the Studio Engine subsystem responsible for loading, assembling, and operating a living department environment. It transforms neutral asset packages and Company Genome™ into a unique, interactive world.

> Runtime assembles. It does not author. It does not brand. It does not create.

---

## Runtime Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDIO ENGINE                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              DEPARTMENT RUNTIME                        │    │
│  │                                                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │  Loader   │  │ Assembler │  │  Operator │          │    │
│  │  └─────┬────┘  └─────┬────┘  └─────┬────┘          │    │
│  │        │              │              │                 │    │
│  │  ┌─────▼──────────────▼──────────────▼─────┐          │    │
│  │  │           RUNTIME STATE MACHINE           │          │    │
│  │  └───────────────────────────────────────────┘          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Inputs: Asset Packages · Genome · Permissions · Data        │
│  Outputs: Living Department · Events · Learning Signals      │
└─────────────────────────────────────────────────────────────┘
```

---

## Load Sequence

When a user travels to a department, Runtime executes this sequence:

### Phase 0: Pre-Flight

| Step | Action | Source |
|------|--------|--------|
| 0.1 | Resolve department manifest | Department catalog / Marketplace install |
| 0.2 | Validate SDK version compatibility | Manifest `sdkVersion` |
| 0.3 | Check permissions | User role + department permissions |
| 0.4 | Resolve active Project context | Project Model |
| 0.5 | Fetch Company Genome™ snapshot | Genome service |
| 0.6 | Resolve Project Genome™ overlay | Project context (if active) |

### Phase 1: Asset Loading (per 06 Asset Standard order)

| Step | Asset Category | Strategy |
|------|---------------|----------|
| 1.1 | Materials | Preload — blocking |
| 1.2 | Metadata | Preload — blocking |
| 1.3 | Environment | Load — blocking |
| 1.4 | Furniture | Parallel load |
| 1.5 | Glass Objects | Parallel load |
| 1.6 | Lighting | Parallel load |
| 1.7 | Orb | Parallel load |
| 1.8 | Particles | Lazy load |
| 1.9 | Audio (ambient) | Preload — non-blocking |
| 1.10 | Animations | Lazy load |
| 1.11 | Camera | Preload — blocking |
| 1.12 | Interaction Maps | Load — blocking |

### Phase 2: Assembly

| Step | Action |
|------|--------|
| 2.1 | Place environment in spatial envelope |
| 2.2 | Position furniture per metadata placements |
| 2.3 | Attach glass objects to furniture nodes |
| 2.4 | Activate lighting rig |
| 2.5 | Position Orb on pedestal |
| 2.6 | Initialize particle systems (ambient only) |
| 2.7 | Set camera to `arrival` position |
| 2.8 | Bind interaction maps to objects and zones |

### Phase 3: Genome Injection

| Step | Action |
|------|--------|
| 3.1 | Resolve all genome hooks from anatomy |
| 3.2 | Inject material values into shader slots |
| 3.3 | Apply typography to panel definitions |
| 3.4 | Configure lighting parameters |
| 3.5 | Select and load Genome-adapted audio |
| 3.6 | Configure AI employee personalities |
| 3.7 | Override terminology labels |
| 3.8 | Set Mood Wall content from visual references |
| 3.9 | Log all injections (audit trail) |

### Phase 4: Intelligence Activation

| Step | Action |
|------|--------|
| 4.1 | Initialize AI employees with memory scope |
| 4.2 | Load AI employee knowledge domains |
| 4.3 | Activate Orb with department context |
| 4.4 | Register commands with Command Dock™ |
| 4.5 | Subscribe to input ports (project, assets, tasks) |
| 4.6 | Connect output ports to destination departments |

### Phase 5: Data Hydration

| Step | Action |
|------|--------|
| 5.1 | Load active project data into Project Board |
| 5.2 | Populate Asset Shelf from Asset Registry™ |
| 5.3 | Hydrate Timeline Table from project schedule |
| 5.4 | Load pending approvals into Approval Station |
| 5.5 | Pin project references to Interactive Wall |
| 5.6 | Set Mood Wall project mood overlay |

### Phase 6: Go Live

| Step | Action |
|------|--------|
| 6.1 | Begin loading ritual (Motion Standard 08) |
| 6.2 | Play arrival sequence |
| 6.3 | Transition to `primary` camera |
| 6.4 | Start ambient audio |
| 6.5 | Orb acknowledgment |
| 6.6 | Emit `department-ready` event |
| 6.7 | State → `ACTIVE` |

---

## Runtime State Machine

```
UNLOADED → LOADING → ASSEMBLING → INJECTING → HYDRATING → READY → ACTIVE
                                                                    ↓
                                                              BACKGROUND
                                                                    ↓
                                                              UNLOADING → UNLOADED
```

| State | User Experience |
|-------|-----------------|
| `LOADING` | Loading ritual (environment assembling) |
| `ASSEMBLING` | Furniture placing animation |
| `INJECTING` | Genome color crossfade |
| `HYDRATING` | Content appearing on surfaces |
| `READY` | Arrival camera sequence |
| `ACTIVE` | Full interaction available |
| `BACKGROUND` | Department paused (user in another department) — state preserved |
| `UNLOADING` | Departure sequence |

---

## Runtime Subsystems

### Loader

Responsible for fetching asset modules from storage.

| Capability | Specification |
|------------|---------------|
| Source | Local cache → CDN → Marketplace registry → fallback assets |
| Parallelism | Max 6 concurrent loads |
| Timeout | 5s per module; fallback on timeout |
| Validation | Schema + checksum per module |
| Cache | Session cache + persistent LRU (max 50 modules) |

### Assembler

Responsible for spatial composition.

| Capability | Specification |
|------------|---------------|
| Placement | Metadata-driven object positions in spatial envelope |
| Attachment | Furniture node binding for glass objects and panels |
| Validation | No overlapping objects (spacing ≥ 0.15) |
| Zone activation | Zone bounds computed from object clusters |

### Operator

Responsible for live department operation.

| Capability | Specification |
|------------|---------------|
| Interaction routing | Verb → object → handler per interaction map |
| AI orchestration | Verb triggers → AI employee responses |
| State persistence | User work state saved on verb completion |
| Output port monitoring | Exit criteria checked continuously |
| Event emission | All actions emit to Event Bus™ |

---

## Permissions

Runtime enforces permissions before activating verbs and AI capabilities.

```yaml
PermissionCheck:
  user: string
  department: string
  verb: string
  object: string
  result: enum         # allowed | denied | escalate
```

| Denial Behavior | Action |
|-----------------|--------|
| Verb denied | Object shows disabled state; Orb explains |
| AI action denied | Concierge explains; suggests escalation |
| Department denied | Redirect to Headquarters with explanation |

Permissions source: Organization membership + department role assignments.

---

## Data Contracts

Runtime hydrates objects from platform data services:

| Object | Data Source |
|--------|------------|
| Project Board | Project Model |
| Asset Shelf | Asset Registry™ |
| Timeline Table | Project schedule + Production Manager |
| Approval Station | Approval workflow state |
| Preview Screen | Asset + channel context |
| Mood Wall | Company Genome + Project Genome |
| Interactive Wall | Project references + user pins |
| Floating Panels | Live status from Event Bus™ |

---

## Background State

When user travels to another department:

| Behavior | Specification |
|----------|---------------|
| State preservation | All object states, pins, annotations preserved |
| AI memory | Session memory persists; department memory persists |
| Audio | Ambient muted |
| Particles | Paused |
| Timer-based events | Continue (deadlines, scheduled actions) |
| Return | Resume from exact state — no reload |

---

## Unload Sequence

```
Phase 1: Save all object states and user work
Phase 2: Emit pending output port signals
Phase 3: AI memory flush (session → department/org)
Phase 4: Departure animation
Phase 5: Release asset modules (respect cache policy)
Phase 6: Unsubscribe from data streams
Phase 7: State → UNLOADED
```

---

## Error Handling

| Failure | Behavior |
|---------|----------|
| Asset module load fail | Load fallback asset; log warning |
| Genome domain empty | Use SDK fallback; suggest enrichment |
| AI employee init fail | Orb operates solo; log error |
| Permission service unavailable | Deny all write verbs; allow read |
| Project data unavailable | Empty surfaces with "awaiting project" state |
| Total assembly failure | Redirect to Headquarters; Orb explains |

**Rule:** Department never shows error page. Always degrade gracefully.

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Time to interactive (Phase 6) | ≤ 5s on broadband |
| Asset load (per module) | ≤ 5s |
| Genome injection | ≤ 1s |
| Verb response | ≤ 100ms (local); ≤ 500ms (async) |
| Background resume | ≤ 1s |
| Memory budget (per department) | ≤ 150 MB |
| Frame rate | ≥ 30fps during interaction |
| Frame rate (ceremony) | ≥ 24fps |

---

## Event Bus Integration

Runtime emits events for platform consumption:

| Event | Payload |
|-------|---------|
| `department-ready` | departmentId, loadTime, genomeHooksApplied |
| `verb-executed` | verb, object, user, result |
| `approval-completed` | asset, approver, ceremony |
| `output-satisfied` | port, destination, payload |
| `genome-learning` | domain, signal, source |
| `ai-escalation` | from, to, reason |
| `department-error` | phase, error, fallbackUsed |

---

## Runtime Configuration

```yaml
DepartmentRuntimeConfig:
  departmentId: string
  organizationId: string
  userId: string
  projectId: string | null
  genomeSnapshot: GenomeSnapshot
  permissionSet: PermissionSet
  cachePolicy: enum         # aggressive | standard | minimal
  audioEnabled: boolean
  motionPreference: enum     # full | reduced | instant
  qualityLevel: enum         # high | medium | low (affects LOD)
```

---

_Next: [12 — World Routing](./12_WORLD_ROUTING.md)_
