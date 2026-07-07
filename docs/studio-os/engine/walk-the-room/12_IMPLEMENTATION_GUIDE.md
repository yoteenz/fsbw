# 12 — Implementation Guide

**Engine Module:** `studio.walk-the-room.v1.implementation`  
**Status:** Abstract engineering roadmap  
**Philosophy:** Architecture only. No production code in this sprint.

---

## Implementation Scope

Walk the Room™ is an **experience orchestration layer** atop Department Runtime and Critique Sessions — not a standalone app or review dashboard.

---

## Recommended Subsystems

| Subsystem | Responsibility | Doc |
|-----------|----------------|-----|
| `WalkOrchestrator` | Lifecycle · path · stop advancement | 01, 07 |
| `PresentationModeController` | Runtime + Experience Engine transition | 02 |
| `SpatialCritiqueRenderer` | Anchor critiques in world space | 03 |
| `ConciergePresenceDirector` | Movement · gesture · staging | 04 |
| `FounderCommandParser` | Voice · Orb · verb → intent | 05 |
| `PreviewLayerController` | Live morph · revert · compare | 06 |
| `WalkthroughPathResolver` | Profile selection · stop filtering | 07 |
| `RoomMemoryStore` | Per-environment spatial history | 08 |
| `ActionModePresenter` | Spatial disposition UI | 09 |
| `EmotionalPacingGuard` | Overwhelm prevention | 10 |
| `CritiqueSessionBridge` | Bind to Critique Sessions API | 01 |
| `MediumAdapter` (future) | AR · VR · remote presence | 11 |

---

## Suggested Build Phases

### Phase 1 — Presentation Foundation

| Deliverable | Milestone |
|-------------|-----------|
| Presentation Mode transition | Department enters review atmosphere |
| Orb welcome + scope selection | Complete vs critical |
| Basic walkthrough path (5 stops) | Arrival → intent → environment → interactions → summary |
| Transcript persistence | WalkTranscript store |

**Milestone:** Founder completes abbreviated walk in Creative Direction Studio Runtime preview.

### Phase 2 — Spatial Critique

| Deliverable | Milestone |
|-------------|-----------|
| SpatialCritique anchoring to SDK objects | Highlights on Mood Wall · Timeline Table |
| Concierge walk-to-anchor | One concierge + Orb |
| Founder voice interrupt | Parse question · redirect |
| Room Memory (basic) | Open concerns persist per anchor |

**Milestone:** Critique visibly attached to object — not sidebar.

### Phase 3 — Live Visualization

| Deliverable | Milestone |
|-------------|-----------|
| PreviewLayer ephemeral morphs | Lighting · mood swap |
| Revert on dismiss | Non-destructive preview |
| Version compare from Room Memory | Toggle A/B at anchor |
| Action Mode dispositions | Apply · schedule · dismiss |

**Milestone:** Founder previews lighting change and commits in-room.

### Phase 4 — Full Braintrust Presence

| Deliverable | Milestone |
|-------------|-----------|
| Multi-concierge staging (max 3) | Debate at anchor |
| Full department path profile | 11 stops CDS |
| Critique Sessions bridge | Shared ActionItemBundle |
| Production Engine handoff | Send to department |

**Milestone:** Department Review walk feeds Validation Loop handoff.

### Phase 5 — Platform & Future-Ready

| Deliverable | Milestone |
|-------------|-----------|
| Multi-subject paths (project · campaign · marketplace) | Path resolver profiles |
| Post-session learning badges in Room Memory | Outcome at anchor |
| MediumAdapter interface | AR/VR stub |
| Remote participant protocol | Architecture only |

**Milestone:** Walk the Room signature experience across Studio OS products.

---

## Service Boundaries

```
┌─────────────────────────────────────────────────────────┐
│  WALK THE ROOM ORCHESTRATOR (this experience)            │
│  Path · Presence · Spatial · Preview · Memory · Action   │
└────────────┬───────────────────────┬────────────────────┘
             ↓                       ↓
┌────────────────────────┐  ┌────────────────────────────┐
│  CRITIQUE SESSIONS API   │  │  DEPARTMENT RUNTIME API     │
│  Dialogue · Decisions    │  │  World · Actors · Modes     │
└────────────────────────┘  └────────────────────────────┘
             ↓                       ↓
┌────────────────────────┐  ┌────────────────────────────┐
│  VALIDATION LOOP       │  │  EXPERIENCE ENGINE          │
│  Handoff · Scorecard   │  │  Presentation Mode          │
└────────────────────────┘  └────────────────────────────┘
```

---

## API Surface (Abstract)

```yaml
WalkTheRoomAPI:
  walks:
    - POST /walks                      # initiate walk
    - GET  /walks/{id}                 # state · stop · transcript
    - POST /walks/{id}/command         # founder command
    - POST /walks/{id}/advance         # next stop
    - POST /walks/{id}/pause
    - POST /walks/{id}/complete

  critiques:
    - GET  /walks/{id}/critiques       # spatial critiques
    - POST /walks/{id}/critiques/{cid}/action

  previews:
    - POST /walks/{id}/preview         # stage live preview
    - POST /walks/{id}/preview/commit
    - POST /walks/{id}/preview/revert

  memory:
    - GET  /rooms/{envId}/memory
    - GET  /rooms/{envId}/anchors/{anchorId}/history
```

---

## Runtime Contract: PresentationModeCapable

Departments hosting Walk the Room implement:

```yaml
PresentationModeCapable:
  departmentId: string
  supportsWalkTheRoom: boolean
  walkthroughPathProfile: string    # e.g., creative-direction-v1
  presentationModeHooks:
    onEnter: PresentationModeConfig
    onExit: RestorePriorMode
  anchorRegistry: AnchorRef[]       # SDK objects · zones mappable
  conciergeSpawnPoints: Vector3[]
  previewMorphTargets: MorphTarget[]
```

Golden Department Creative Direction Studio = first `PresentationModeCapable` reference.

---

## Data Stores

| Store | Contents |
|-------|----------|
| `walk_sessions` | Walk metadata · status · path |
| `walk_transcripts` | Movement + dialogue entries |
| `spatial_critiques` | Anchored critiques |
| `preview_layers` | Active/ephemeral previews |
| `room_memory` | Per-environment anchor history |
| `walk_actions` | Disposition records |

---

## Integration Checklist

- [ ] Critique Session created or bound on walk start
- [ ] Presentation Mode enters without world unload
- [ ] Spatial critiques use SDK anchor IDs
- [ ] Action dispositions call Critique Sessions Revision Workflows
- [ ] Room Memory writes on decision + resolution
- [ ] Validation handoff on walk complete (when department review)
- [ ] Experience Engine Presentation Mode synchronized
- [ ] No React review dashboard in critical path

---

## Success Criteria

1. Founder reviews department **inside** department — not adjacent UI
2. Every critique attachable to world object
3. Live preview works for lighting + mood swap minimum
4. Action items produced without leaving walk
5. Room Memory shows prior decision at anchor on second walk
6. Emotional gate: "executive team walk" not "design review"
7. Creative Direction Studio = flagship reference walk

---

## Schema Namespace

```
studio.walk-the-room.v1
├── walk-session
├── walkthrough-path
├── walkthrough-stop
├── spatial-critique
├── concierge-presence
├── founder-walk-command
├── preview-layer
├── room-memory-record
├── walk-transcript-entry
└── action-disposition
```

---

## Canonical Statement

> Walk the Room™ becomes the canonical immersive review experience across every Headquarters, Department, Project, Expansion, Marketplace package, and Studio OS product.

Engineering builds orchestration and spatial contracts first. AR, VR, and voice deepen — they do not replace.

---

_End of Walk the Room™ Experience Specification._
