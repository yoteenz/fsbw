# 08 — Motion Standard

**SDK Module:** `studio.department.sdk.v1.motion`  
**Status:** Cinematic movement law  
**Philosophy:** Everything should feel cinematic — never utilitarian

---

## Definition

The Motion Standard governs **how departments move** — camera travel, object transitions, Orb behavior, department arrivals and departures, loading rituals, and ceremonial moments. Motion is a first-class design element, not an afterthought.

All motion inherits Genome `motionPhilosophy` and `pacing` domains while following SDK timing law.

---

## Motion Principles

| Principle | Rule |
|-----------|------|
| **Cinematic** | Every transition is directed — camera, light, and sound coordinate |
| **Purposeful** | Motion communicates meaning — never decorative-only |
| **Consistent** | Same verbs produce same motion across all departments |
| **Genome-adaptive** | Speed, easing, and drama level from Genome — structure from SDK |
| **Accessible** | `prefers-reduced-motion` → instant state change, no travel |
| **Interruptible** | User can skip any non-ceremony transition |

---

## Timing Tokens

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| `motion-instant` | 0ms | — | Reduced motion fallback |
| `motion-micro` | 100–200ms | ease-out | Hover, focus, button press |
| `motion-fast` | 200–300ms | ease-out | Panel dismiss, object select |
| `motion-standard` | 300–500ms | ease-in-out | Panel open, content transition |
| `motion-cinematic` | 500–1200ms | cubic-bezier(0.4, 0, 0.2, 1) | Camera travel, zone change |
| `motion-ceremony` | 1200–3000ms | custom per ceremony | Approval, launch, arrival |
| `motion-ambient` | 4000–8000ms | linear loop | Mood Wall breathe, particle drift |

Genome `pacing` domain scales all durations by a factor (0.7 = brisk, 1.0 = standard, 1.3 = deliberate).

---

## Camera Movement

### Camera Travel Rules

| Transition | Camera Path | Duration Token | Description |
|------------|-------------|----------------|-------------|
| Arrival → Hero | `arrival` → `hero` | `motion-cinematic` | Slow reveal of department identity |
| Hero → Primary | `hero` → `primary` | `motion-cinematic` | Descend into work area |
| Primary → Secondary | `primary` → nearest secondary | `motion-standard` | Lateral orbit |
| Any → Orb | current → `orb` | `motion-standard` | Gentle turn toward Orb |
| Any → Ceremony | current → `ceremony` | `motion-cinematic` | Elevate and widen for ceremony |
| Any → Exit | current → `departure` | `motion-cinematic` | Turn toward exit portal |
| Zone → Zone | orbital path | `motion-standard` | Smooth orbit — never teleport |

### Camera Constraints

| Constraint | Value |
|------------|-------|
| Max travel speed | 2.0 units/second |
| Min FOV change | 5° per transition |
| Max FOV change | 15° per transition |
| Orbit freedom | ±30° horizontal, ±15° vertical from preset |
| User override | Drag to orbit — returns to preset on 5s idle |

---

## Transitions

### Object Transitions

| Event | Motion Profile | Duration |
|-------|----------------|----------|
| Object appear | Scale from 0.8 → 1.0 + fade in | `motion-standard` |
| Object dismiss | Scale to 0.9 + fade out | `motion-fast` |
| Item placed on surface | Spring settle (damped oscillation) | `motion-standard` |
| Item dragged | Follow pointer with 50ms lag | `motion-micro` |
| Panel attach | Slide from object edge + fade | `motion-standard` |
| Panel dismiss | Slide toward attach point + frost | `motion-fast` |
| Content update | Crossfade (old out, new in) | `motion-standard` |

### Zone Transitions

| Event | Motion Profile |
|-------|----------------|
| Enter zone | Camera travel + lighting shift to zone anchor |
| Leave zone | Camera travel + lighting return to previous |
| Zone focus | Active zone brightens; inactive zones dim 20% |

---

## Orb Movement

| State | Motion |
|-------|--------|
| Idle | Gentle float (±3px vertical, 3s sine cycle) |
| Listening | Pulse scale 1.0 → 1.05 → 1.0 (1s cycle) |
| Speaking | Synchronized glow pulse with speech rhythm |
| Thinking | Slow rotation (360° over 4s) + dim glow |
| Notification | Quick bounce (scale 1.0 → 1.15 → 1.0, 300ms) + pedestal glow |
| Activated | Rise 10px + glow intensify (200ms) |

Orb motion is **platform-consistent** — identical across all departments. Only glow color is Genome-adapted.

---

## Hover States

| Object Type | Hover Motion |
|-------------|-------------|
| Furniture | Subtle lift (2px) + edge glow intensify |
| Glass surface | Reflection shimmer increase |
| Panel | Expand 5% + shadow deepen |
| Asset on shelf | Forward slide (5px) + glow |
| Timeline event | Scale 1.05 + date highlight |
| Approval Station | Pedestal glow pulse |
| Exit portal | Portal shimmer activate |
| Interactive Wall pin | Pin bounce (scale 1.1 → 1.0) |

All hover states: `motion-micro` duration. Disabled when `prefers-reduced-motion`.

---

## Department Transitions

### Arrival (Entering Department)

```
Phase 1: Portal materialize (user appears at entry)         — 0ms
Phase 2: Camera travel entry → hero (department reveal)    — motion-ceremony
Phase 3: Lighting sequence (ambient → hero key → work)     — motion-cinematic
Phase 4: Orb acknowledgment (pulse + optional greeting)    — motion-standard
Phase 5: Camera settle hero → primary (ready to work)      — motion-cinematic
```

Total arrival sequence: 3–5 seconds (Genome `pacing` scaled). Skippable after Phase 2.

### Departure (Leaving Department)

```
Phase 1: Active work saves state                          — 0ms
Phase 2: Camera travel to departure position              — motion-cinematic
Phase 3: Exit portal activate (shimmer + destination preview) — motion-standard
Phase 4: Portal traverse (user exits toward destination)  — motion-ceremony
```

### Inter-Department Travel

When traveling between departments (see [12 — World Routing](./12_WORLD_ROUTING.md)):

```
Phase 1: Departure sequence (above)
Phase 2: Transit (brief — world map or corridor, 1–2s)     — motion-cinematic
Phase 3: Arrival sequence (above)
```

---

## Loading Rituals

Department load is not a spinner — it is a **ritual**.

| Load Stage | Visual | Duration |
|------------|--------|----------|
| Materials resolving | Subtle color breathe on entry portal | `motion-ambient` start |
| Environment assembling | Walls materialize from floor up | `motion-cinematic` |
| Furniture placing | Objects appear in sequence (hero first) | `motion-standard` each |
| Lighting activating | Light anchors illuminate one by one | `motion-standard` each |
| Genome injecting | Room color shift (materials crossfade) | `motion-cinematic` |
| AI staff arriving | Orb activates last | `motion-standard` |
| Ready | Camera arrival sequence begins | — |

**Forbidden:** Progress bars, percentage text, skeleton screens. Loading is environmental assembly.

---

## Approval Ceremonies

When user executes `approve` verb at Approval Station:

```
Phase 1: Station illuminates (accent light activates)       — 200ms
Phase 2: Asset elevates slightly on station surface         — motion-standard
Phase 3: Genome compliance glow (green/brand-accent rim)    — 500ms
Phase 4: Stamp animation (approve seal descends)            — motion-ceremony
Phase 5: Particle burst (ceremony particles)                — 2s
Phase 6: Audio seal (see Audio Standard)                    — simultaneous
Phase 7: AI acknowledgment (Brand Concierge ambient note)   — 1s after
Phase 8: Output port activates (exit portal glow)           — motion-standard
```

Total ceremony: 3–4 seconds. Not skippable (this is the moment of decision).

---

## Launch Celebrations

When department output port is satisfied (e.g., campaign launched):

```
Phase 1: Hero Mood Wall shifts to celebration imagery        — motion-cinematic
Phase 2: Particle celebration burst (room-wide)             — 3s
Phase 3: Camera ceremony position                            — motion-cinematic
Phase 4: Audio celebration (see Audio Standard)              — 3s
Phase 5: AI team acknowledgment (all concierges ambient)     — 2s
Phase 6: Return to primary camera                            — motion-cinematic
```

Launch celebrations are **rare and meaningful** — not every save or update.

---

## Motion Profiles (Reference)

Reusable profiles referenced by Interaction Maps and Transitions:

```yaml
MotionProfile:
  id: string
  phases: MotionPhase[]
  skipPolicy: enum          # always | after-phase-N | never
  genomeScaling: boolean    # true = apply pacing factor
  reducedMotionFallback: enum   # instant | simplified | none
```

| Profile ID | Use |
|------------|-----|
| `approval-ceremony` | Approve verb |
| `launch-celebration` | Output port satisfied |
| `arrival-sequence` | Department entry |
| `departure-sequence` | Department exit |
| `timeline-scrub` | Scrub verb on Timeline Table |
| `comparison-split` | Compare verb |
| `panel-attach` | Panel appears |
| `object-settle` | Item placed on surface |
| `genome-refresh` | Company Genome update received |
| `zone-focus` | Camera enters new zone |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| `prefers-reduced-motion` | All profiles use `motion-instant` fallback |
| Skip control | Non-ceremony transitions skippable via click/tap |
| No vestibular triggers | Camera travel stays below 2.0 units/s |
| Ceremony alternative | Approve ceremony → instant stamp + audio only |
| Focus preservation | Camera never moves without user context change |

---

_Next: [09 — Audio Standard](./09_AUDIO_STANDARD.md)_
