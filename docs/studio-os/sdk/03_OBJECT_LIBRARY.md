# 03 — Object Library

**SDK Module:** `studio.department.sdk.v1.objects`  
**Status:** Canonical object class registry  
**Philosophy:** Objects are actors — they have purpose, inputs, outputs, and behavior

---

## Definition

An **Object** is a modular, placeable, interactive entity inside a department environment. Objects are the atomic units of department composition — equivalent to Actors in Unreal Engine or Props in The Movies.

Every object class in this library is **reusable across all departments and all industries**. Department authors place instances; they do not invent new object classes without SDK amendment.

---

## Object Class Schema

```yaml
ObjectClass:
  id: string                    # kebab-case, globally unique
  version: semver
  category: enum                # surface | furniture | display | control | storage | portal | ambient
  purpose: string
  inputs: ObjectInput[]
  outputs: ObjectOutput[]
  animation: AnimationProfile
  interaction: InteractionProfile
  genomeAdaptation: GenomeAdaptationProfile
  spatialFootprint: SpatialBounds
  replaceable: boolean
  requiredInDepartment: boolean   # only true for orb-pedestal, entry-marker, exit-portal
```

---

## Canonical Object Classes

### Floating Panel

| Field | Value |
|-------|-------|
| **ID** | `floating-panel` |
| **Category** | `display` |
| **Purpose** | Contextual information surface that hovers near work areas — status, metadata, quick actions |
| **Inputs** | `data-stream` (live status), `genome-style` (typography, color), `content-payload` (text, metrics, thumbnails) |
| **Outputs** | `user-selection` (panel action taken), `pin-signal` (content pinned to wall) |
| **Animation** | Float bob (±2px, 4s cycle), fade-in on attach (300ms), slide-dismiss (200ms) |
| **Interaction** | Hover to expand, click to focus, drag to reposition within zone, pin to Interactive Wall |
| **Genome Adaptation** | Typography from `editorialDirection`, glass tint from `colorPrinciples`, shadow depth from `spatialDesign` |
| **Footprint** | 0.3 × 0.2 × 0.05 units |

---

### Mood Wall

| Field | Value |
|-------|-------|
| **ID** | `mood-wall` |
| **Category** | `ambient` |
| **Purpose** | Hero space atmospheric surface — brand emotion, visual identity, environmental storytelling |
| **Inputs** | `genome-emotions`, `genome-visual-references`, `project-mood` (optional project-specific override) |
| **Outputs** | `atmosphere-state` (current emotional register for other objects to sync) |
| **Animation** | Slow parallax drift (0.5px/s), color breathe (8s cycle), crossfade on genome update (2s) |
| **Interaction** | Passive — user can tap to cycle reference sets; long-press to pin current mood to project |
| **Genome Adaptation** | Full surface — imagery from `visualReferences`, color fields from `colorPrinciples`, motion from `motionPhilosophy` |
| **Footprint** | Full hero wall — 2.0 × 1.2 × 0.02 units |

---

### Glass Table

| Field | Value |
|-------|-------|
| **ID** | `glass-table` |
| **Category** | `furniture` |
| **Purpose** | Primary or secondary work surface with translucent depth — items appear to rest on glass |
| **Inputs** | `work-items` (assets, cards, documents), `genome-material` (glass tint, reflection) |
| **Outputs** | `arrangement-state` (item positions), `selection` (active item), `comparison-set` (side-by-side items) |
| **Animation** | Reflection shimmer on item place (150ms), item settle (spring, 400ms), glass crack-effect on reject (ceremonial) |
| **Interaction** | Drag items on surface, click to select, pinch/compare two items, swipe to dismiss |
| **Genome Adaptation** | Glass tint, reflection intensity, edge glow from `materialLanguage`; luxury brands: high reflection; operational: matte glass |
| **Footprint** | 0.8 × 0.4 × 0.35 units |

---

### Timeline Table

| Field | Value |
|-------|-------|
| **ID** | `timeline-table` |
| **Category** | `furniture` |
| **Purpose** | Temporal work surface — schedules, production timelines, launch sequences, version history |
| **Inputs** | `timeline-data` (events, milestones, deadlines), `genome-pacing` (temporal rhythm) |
| **Outputs** | `selected-event`, `schedule-change`, `scrub-position` |
| **Animation** | Horizontal scroll with momentum, event pulse on deadline proximity, milestone celebration burst |
| **Interaction** | Scrub timeline, drag events to reschedule, click event for detail panel, pin milestone |
| **Genome Adaptation** | Event marker style from `editorialDirection`, urgency color from `colorPrinciples`, pacing speed from `pacing` |
| **Footprint** | 1.0 × 0.3 × 0.35 units |

---

### Orb Pedestal

| Field | Value |
|-------|-------|
| **ID** | `orb-pedestal` |
| **Category** | `ambient` |
| **Purpose** | Elevated platform for Studio Orb™ — ambient intelligence anchor |
| **Inputs** | `orb-state` (idle, listening, speaking, thinking), `genome-voice` (AI personality surface) |
| **Outputs** | `orb-command` (user intent captured), `orb-response` (AI reply channeled) |
| **Animation** | Pedestal glow syncs with Orb state, rise on activation (200ms), pulse on notification |
| **Interaction** | Tap to activate Orb conversation, hold for voice mode, radial menu on long-press |
| **Genome Adaptation** | Pedestal material from `materialLanguage`, glow color from `colorPrinciples`, Orb skin from `personality` |
| **Footprint** | 0.15 × 0.5 × 0.15 units |
| **Required** | Yes — every department |

---

### Asset Shelf

| Field | Value |
|-------|-------|
| **ID** | `asset-shelf` |
| **Category** | `storage` |
| **Purpose** | Reference storage — approved assets, templates, brand materials, historical versions |
| **Inputs** | `asset-list` (from Asset Registry™), `filter-criteria`, `genome-brand-kit` |
| **Outputs** | `asset-selected`, `asset-dropped` (to Glass Table or Interactive Wall), `asset-requested` |
| **Animation** | Shelf extend on hover (150ms), asset glow on select, slide-out on drag |
| **Interaction** | Browse, filter, drag to work surface, preview on hover, pin to wall |
| **Genome Adaptation** | Shelf material, label typography, asset frame style from Genome domains |
| **Footprint** | 0.4 × 0.6 × 0.2 units |

---

### Media Display

| Field | Value |
|-------|-------|
| **ID** | `media-display` |
| **Category** | `display` |
| **Purpose** | Large-format playback — video, animation, campaign preview, client presentation |
| **Inputs** | `media-asset` (video, image sequence, live feed), `playback-state` |
| **Outputs** | `playback-position`, `playback-complete`, `frame-captured` |
| **Animation** | Frame transition (dissolve 300ms), playhead scrub glow, fullscreen expand (500ms cinematic) |
| **Interaction** | Play/pause, scrub, fullscreen, frame-pin, compare with second display |
| **Genome Adaptation** | Bezel/frame from `materialLanguage`, playback UI from `interactionStyle` |
| **Footprint** | 0.6 × 0.5 × 0.08 units |

---

### Project Board

| Field | Value |
|-------|-------|
| **ID** | `project-board` |
| **Category** | `surface` |
| **Purpose** | Active project command center — status, tasks, collaborators, blockers |
| **Inputs** | `project-model` (full project context), `task-stream`, `collaborator-presence` |
| **Outputs** | `task-selected`, `status-updated`, `blocker-flagged`, `handoff-initiated` |
| **Animation** | Card slide on task update, collaborator avatar fade-in, blocker pulse (amber) |
| **Interaction** | Drag tasks between columns, click for detail, assign to AI employee, escalate blocker |
| **Genome Adaptation** | Column headers from `terminology`, card style from `editorialDirection`, status colors from `colorPrinciples` |
| **Footprint** | 0.9 × 0.5 × 0.05 units |

---

### Interactive Wall

| Field | Value |
|-------|-------|
| **ID** | `interactive-wall` |
| **Category** | `surface` |
| **Purpose** | Pin board — references, annotations, mood boards, comparison sets, live feeds |
| **Inputs** | `pinned-items`, `annotations`, `reference-drops`, `live-feed` (optional) |
| **Outputs** | `pin-added`, `annotation-saved`, `comparison-initiated`, `wall-export` |
| **Animation** | Pin stick (bounce 200ms), annotation ink-draw, wall pan on overflow |
| **Interaction** | Pin, Annotate, Reference Drop, Compare (select two pins), Branch (create variant wall) |
| **Genome Adaptation** | Wall texture from `materialLanguage`, pin style from `interactionStyle`, ink color from `colorPrinciples` |
| **Footprint** | 0.05 × 1.0 × 0.8 units (vertical wall plane) |

---

### Command Console

| Field | Value |
|-------|-------|
| **ID** | `command-console` |
| **Category** | `control` |
| **Purpose** | Power-user control surface — batch actions, filters, system commands, department overrides |
| **Inputs** | `command-registry` (department commands), `permission-set`, `system-state` |
| **Outputs** | `command-executed`, `batch-result`, `override-applied` |
| **Animation** | Key-glow on hover, execute ripple, result toast slide |
| **Interaction** | Type command, select from palette, voice via Orb relay, keyboard shortcuts |
| **Genome Adaptation** | Console chrome from `materialLanguage`, command labels from `terminology`, feedback sounds from `soundDesign` |
| **Footprint** | 0.7 × 0.25 × 0.4 units |

---

### Preview Screen

| Field | Value |
|-------|-------|
| **ID** | `preview-screen` |
| **Category** | `display` |
| **Purpose** | Output preview — how work will appear in final context (channel, device, print, environment) |
| **Inputs** | `preview-asset`, `preview-context` (channel, device frame, environment), `genome-brand-surface` |
| **Outputs** | `preview-approved`, `preview-rejected`, `variant-requested` |
| **Animation** | Context frame transition (400ms), device rotate (3D, 600ms), approve glow |
| **Interaction** | Switch context, compare variants side-by-side, approve, reject, request revision |
| **Genome Adaptation** | Preview frame styling from brand context; device chrome neutral |
| **Footprint** | 0.5 × 0.45 × 0.06 units |

---

### Approval Station

| Field | Value |
|-------|-------|
| **ID** | `approval-station` |
| **Category** | `control` |
| **Purpose** | Ceremonial decision surface — approve, reject, branch, escalate |
| **Inputs** | `pending-approval` (asset, campaign, publication), `approver-identity`, `genome-veto-rules` |
| **Outputs** | `approved`, `rejected`, `branched`, `escalated`, `ceremony-triggered` |
| **Animation** | Station illuminate on pending (pulse), stamp animation on approve (500ms ceremony), reject fade (300ms) |
| **Interaction** | Approve, Reject, Branch (create variant path), Compare (against reference), Escalate to Brand Concierge |
| **Genome Adaptation** | Station material from `materialLanguage`, ceremony motion from `signatureMoments`, stamp sound from `soundDesign` |
| **Footprint** | 0.4 × 0.35 × 0.3 units |

---

## Object Composition Rules

| Rule | Specification |
|------|---------------|
| Independence | Every object loads, animates, and unloads independently |
| No nesting scenes | Objects do not contain sub-scenes — they contain data payloads |
| Genome-first | No object ships with hardcoded brand values |
| Replaceable | All objects except `orb-pedestal`, `entry-marker`, `exit-portal` are swappable |
| Asset binding | Objects reference assets by ID — never embed asset data |
| Interaction inheritance | Objects declare allowed verbs; Interaction Engine enforces platform-wide |

---

## Extending the Object Library

New object classes require:
1. SDK amendment proposal
2. Full schema completion (all fields above)
3. Genome adaptation profile
4. QA validation across 3+ industry Genome transforms
5. Marketplace compatibility declaration

**Forbidden extensions:**
- Objects that render full-page layouts
- Objects with embedded forms as primary interaction
- Objects with hardcoded colors or typography
- Flattened composite objects (must decompose into library classes)

---

_Next: [04 — Interaction Engine](./04_INTERACTION_ENGINE.md)_
