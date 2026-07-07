# 03 — Spatial Critiques

**Engine Module:** `studio.walk-the-room.v1.spatial-critiques`  
**Status:** Environment-anchored feedback system  
**Philosophy:** Nothing detached from the experience.

---

## Design Principle

> Feedback exists **inside the environment** — attached to objects, zones, interactions, and spatial relationships. Never floating in a sidebar. Never a comment thread.

---

## Spatial Critique Model

```yaml
SpatialCritique:
  critiqueId: string
  walkId: string
  stopId: string

  anchor:
    type: enum                     # object | zone | interaction | navigation-edge | workflow | genome-field
    anchorId: string               # SDK object id · zone id · verb id
    worldPosition: Vector3
    highlightBounds: Bounds | null

  author:
    roleId: AIRoleId
    displayName: string

  content: string                  # natural speech — Conversation Engine format
  severity: enum                   # observation | opportunity | concern | critical
  evidence: SpatialEvidence[]

  livePreviewAvailable: boolean
  actionModeOptions: ActionDisposition[]

  status: enum                     # active | resolved | dismissed | deferred
  linkedDecisionId: string | null
```

---

## Anchor Types

| Anchor Type | Example |
|-------------|---------|
| **Object** | Mood Wall · Timeline Table · Orb Pedestal |
| **Zone** | Brief Wall area · Sandbox · arrival threshold |
| **Interaction** | `pin` verb on Mood Wall · `approve` ceremony |
| **Navigation edge** | Flow between Observatory and Sandbox |
| **Workflow** | Production handoff from Creative Direction |
| **Genome field** | `interactionPacing` · `luxuryRegister` |

---

## Canonical Spatial Examples

### Creative Director at Mood Wall

Concierge walks to `wall-mood-cds`. Highlight pulses on wall surface.

> "This wall doesn't yet communicate the emotional direction established in the Project Genome. The palette reads competent — not inevitable."

Spatial annotation appears **on the wall** — subtle editorial callout, not a tooltip box.

### Marketing Concierge at CTA Zone

Concierge moves to first-visit interaction point.

> "I believe visitors may hesitate here because the value proposition isn't immediately clear."

Arrow glyph traces suggested eye path — spatial, not a diagram overlay.

### Brand Concierge on Interaction

Highlights interaction hotspot on object.

> "This interaction feels inconsistent with the Company's Genome. Our pacing spec is editorial — this resolves too quickly."

Timeline scrub shows Genome-spec pacing vs current — attached to interaction anchor.

### Experience Architect on Navigation

Points between two zones. Path line briefly illuminates.

> "The flow between these two spaces creates unnecessary cognitive friction. Users shouldn't think about where to go — they should want to go."

---

## Visual Treatment

| Element | Treatment |
|---------|-----------|
| Critique callout | Subtle glass editorial card · anchored to object — fades when stop advances |
| Concierge gesture | Point · open palm · trace path — Motion Director choreographed |
| Highlight | Soft rim light on anchored object — not garish outline |
| Severity | Observation = whisper · Critical = sustained highlight until addressed |
| Resolved | Checkmark ghost · remains in Room Memory — not erased |

**Anti-patterns:** Sticky notes UI · numbered comment pins · red error badges · SaaS annotation toolbar.

---

## Spatial Critique Lifecycle

```
RAISED (concierge speaks at stop)
    ↓
ANCHORED (critique binds to world object)
    ↓
┌─ FOUNDER_RESPONDS (question · challenge · approve action)
├─ LIVE_PREVIEW (06 — room shows alternative)
├─ DEBATE (06 — another concierge disagrees at same anchor)
└─ DEFERRED (Action Mode: schedule later)
    ↓
RESOLVED | DISMISSED | OPEN (in Room Memory)
```

---

## Detachment Test

Before any critique ships in Walk the Room:

> *Could this critique exist without the founder standing at this object?*

If yes and the critique doesn't reference spatial context — **reject**. Rephrase with anchor or move to non-spatial session type.

---

## Relationship to Critique Sessions

| Critique Sessions | Spatial Layer |
|-------------------|---------------|
| ConversationTurn | SpatialCritique + concierge movement |
| DebateRecord | Multi-concierge at same anchor |
| Action Items | Action Mode at anchor |

Transcript merges spatial and dialogue:

```yaml
WalkTranscriptEntry:
  type: enum                       # movement | dialogue | critique | preview | decision
  conciergePosition: Vector3 | null
  cameraPosition: Vector3 | null
  content: string
  anchorId: string | null
```

---

## Density Control

| Walk Scope | Critique Density |
|------------|------------------|
| Complete walkthrough | All identified opportunities — paced across stops |
| Critical only | Scorecard failures · blocking concerns only |
| Founder agenda | Critiques filtered to agenda topics |

**Rule:** Never dump all critiques at arrival. **Pace** across path — founder never overwhelmed (10).

---

_Next: [04 — AI Team Presence](./04_AI_TEAM_PRESENCE.md)_
