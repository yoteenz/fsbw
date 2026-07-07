# 06 — Live Visualization

**Engine Module:** `studio.walk-the-room.v1.live-visualization`  
**Status:** In-environment revision preview system  
**Philosophy:** The founder should never imagine revisions. They should experience them.

---

## Design Principle

> The room **reacts**. Recommendations appear on objects. Lighting previews instantly. Alternatives fade in. Genome updates ripple through the space.

---

## Preview Capabilities

| Preview Type | Behavior |
|--------------|----------|
| **Object annotation** | Critique callout on anchored object |
| **Lighting shift** | Real-time light rig adjustment |
| **Layout alternative** | Furniture · zone layout fade-in swap |
| **Mood board swap** | Panel content crossfade |
| **Typography change** | Animated type transition on object |
| **Motion preview** | Ceremony · idle · transition play once |
| **Interaction pacing** | Scrub timeline at interaction anchor |
| **Genome ripple** | Company Genome change propagates materials · voice · pacing |
| **Branch compare** | Version A ↔ B toggle at anchor |
| **Regen preview** | Compiler output staged before commit |

---

## Preview Layer Architecture

```yaml
PreviewLayerState:
  walkId: string
  active: boolean
  previews:
    - previewId: string
      anchorId: string
      previewType: enum
      status: enum                 # staging | active | dismissed | committed
      sourceEngine: enum           # runtime-morph | compiler-staged · genome-inject
      revertOnStopAdvance: boolean # default true — previews ephemeral unless committed
      founderApproved: boolean | null
```

**Rule:** Previews are **ephemeral by default**. Founder commits via Action Mode.

---

## Preview Protocol

```
1. Concierge or founder requests preview
2. PreviewLayer stages change (non-destructive)
3. Room morphs at anchor (2–4s editorial transition)
4. Concierge narrates what changed
5. Founder reacts (approve · reject · iterate · compare)
6. ┌─ COMMIT → Action Mode apply-immediately
   └─ DISMISS → revert morph (1–2s)
7. Preview logged in WalkTheRoomOutput.livePreviewsApplied
```

---

## Canonical Preview Examples

### Lighting Preview

Brand Concierge: "Genome pacing suggests warmer key at arrival."

→ Key light warms 400K · fill softens · concierge narrates.

Founder: "Keep it."

→ Action Mode: apply-immediately · lighting scope regen queued.

### Mood Wall Swap

Founder: "Generate another Mood Wall."

→ Compiler stages alternative panel set · crossfade on wall.

Creative Director: "This direction reads more editorial — closer to Project Genome emotional peak."

### Genome Ripple

Founder: "What if we increased luxury register company-wide?"

→ Genome preview slot applies · materials deepen · motion slows · audio warms across **visible** room.

Brand Concierge: "This is preview only — not committed to Company Genome."

### Motion Preview

Motion Director: "Ceremony should feel earned."

→ Approval interaction plays at Genome-weighted 2.4s pause · founder experiences timing.

---

## Performance Constraints

| Constraint | Rule |
|------------|------|
| Preview latency | < 2s for Runtime morphs · < 30s for Compiler staged |
| Mobile | Reduce particle preview · retain lighting/motion |
| Revert | Always available — one verb: "revert preview" |
| Sandbox | Destructive previews isolated per Golden Department sandbox rules |
| Memory | Uncommitted previews never persist to Room Memory |

Engineering Concierge may flag previews that exceed performance budget.

---

## Comparison Mode

```yaml
ComparisonPreview:
  anchorId: string
  versionA: VersionSnapshot
  versionB: VersionSnapshot
  mode: enum                       # side-by-side | toggle | blend-scrub
```

Founder scrubs between versions at object — "Version B" queries load from Room Memory (08).

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| "Imagine if we changed…" without showing | Violates core philosophy |
| Preview that requires leaving the room | Breaks spatial critique |
| Auto-commit preview | Founder must explicitly apply |
| Full department regen during walk | Surgical scopes only — unless founder explicit |

---

## Integration

| Engine | Role |
|--------|------|
| **Department Runtime** | Morph targets · animation playback |
| **Asset Compiler** | Stage regen outputs |
| **Genome Injection (Runtime 13)** | Ripple previews |
| **Critique Sessions Revision Workflows** | Commit path |
| **Validation Loop Revision Engine** | Scope alignment |

---

_Next: [07 — Walkthrough Path](./07_WALKTHROUGH_PATH.md)_
