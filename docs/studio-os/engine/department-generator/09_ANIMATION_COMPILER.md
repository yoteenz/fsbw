# 09 — Animation Compiler

**Engine Module:** `studio.department-generator.v1.animation-compiler`  
**Status:** Motion personality compilation system  
**Philosophy:** Motion communicates personality. Nothing should feel static.

---

## Design Principle

> The Generator compiles **Orb Movement · Arrival · Departure · Lighting Animation · Interactive Objects · Transitions · Idle Motion · Celebrations · Approval Rituals · Publishing Rituals** — paced by Experience DNA, weighted by department character.

---

## Compiler Output

```yaml
AnimationCompileResult:
  departmentId: DepartmentTypeId
  animationManifest: AnimationManifest
  cameraPaths: CameraPathManifest
  continuousMotion: ContinuousMotionProfile[]
  eventCatalog: AnimationEvent[]
  ceremonyProfiles: CeremonyAnimationProfile[]
```

---

## Animation Manifest Schema

```yaml
AnimationManifest:
  version: semver
  departmentId: string
  pacingMultiplier: number        # from Experience DNA (0.8–1.2)
  easingDefault: cubic-bezier(0.4, 0.0, 0.2, 1.0)
  continuous:
    - id: mood-wall-parallax
      target: mood-wall
      rate: 0.5px/s
      respectReducedMotion: true
    - id: orb-breathe
      target: orb
      cycleMs: 4000
    - id: particle-drift
      target: particles-ambient
      profile: genome-driven
  events:
    - id: pin-land
      trigger: pin
      durationMs: 400
      easing: ease-out
      phases: [approach, stick-bounce, settle]
    - id: branch-spawn
      trigger: branch
      durationMs: 600
    - id: approve-ceremony
      trigger: creative-approval
      durationMs: 3500
      cameraPreset: ceremony
```

---

## Camera Path Compilation

Required presets (SDK + Golden Department):

| Preset | Path Character | Use |
|--------|----------------|-----|
| `arrival` | Slow dolly forward · slight rise | Entry |
| `hero` | Hold — hero zone dominant | Immersion |
| `primary` | Gentle descend — work surface | Default work |
| `orb` | Shift toward Orb | Conversation |
| `ceremony` | Elevated wide | Approval |
| `departure` | Reverse dolly to portal | Exit |

```yaml
CameraPathManifest:
  paths:
    - id: arrival
      durationMs: 5000
      easing: editorial
      keyframes: [...]
  firstVisitExtensionMs: 2000       # optional per DNA
```

---

## Arrival Sequence (Compiled)

| Phase | Time | Animation |
|-------|------|-----------|
| Materialize | 0.0s | Floor reflection fade in |
| Reveal | 0.5–2.0s | Camera arrival → hero |
| Identity | 2.0–3.0s | Genome mood crossfade |
| Orb greeting | 3.0–4.0s | Pedestal rotate 15° · pulse |
| Settle | 4.0–5.0s | Camera → primary |

DNA `entryBehavior` selects variant. Experience DNA adjusts pacing.

---

## Department Motion Personalities

| Department | Continuous Motion | Ceremony Weight |
|------------|-------------------|-----------------|
| creative-direction | Parallax · breathe · pin sway | High — editorial stamp |
| discovery | Shelf drift · soft particle | Low |
| production | Timeline shimmer · console pulse | Medium |
| review | Comparison sweep · dim transition | Medium |
| publishing | Launch bloom · ribbon rise | High — launch ritual |
| executive-hq | Observatory orbit · measured pulse | High |
| law-firm | Minimal drift · suppressed particles | High — seal weight |
| restaurant | Warm particle · window shift | Medium |

---

## Interactive Object Animations

| Object | Idle | On Verb |
|--------|------|---------|
| Mood Wall | Parallax + color breathe | stick-bounce on pin |
| Timeline Table | Reflection shimmer | ribbon-rise on branch |
| Sandbox | Frosted glass idle | clear on entry |
| Observatory | Ring orbit | pulse on Genome update |
| Orb | Glow breathe 4s | listen swirl 1.2s |

Compiled per object in Object Compiler zone bindings.

---

## Ceremony Profiles

```yaml
CeremonyAnimationProfile:
  id: creative-approval
  camera: ceremony
  phases:
    - camera-rise: 800ms
    - stamp-press: 200ms
    - radial-bloom: 1500ms
    - ribbon-brighten: 1000ms
  totalMs: 3500
  audioSync: audio-ceremony-{dept}
```

| Department | Ceremonies |
|------------|------------|
| creative-direction | creative-approval |
| story | story-approval |
| review | quality-approval |
| publishing | launch-ceremony |
| production | milestone-seal |

---

## Reduced Motion Contract

Every continuous and event animation emits fallback:

```yaml
ReducedMotionFallback:
  continuous: off
  pin-land: instant
  ceremony: static-seal
  camera: cut-to-primary
  parallax: static-depth-layers
```

All verbs remain functional — static elegance, not disabled.

---

## Orb Movement

| State | Animation |
|-------|-----------|
| idle | Breathe glow 4s |
| listening | Ring brighten · particles gather |
| thinking | Inner swirl 1.2s |
| speaking | Pulse sync to voice |
| routing | Flash toward target zone |
| ceremony | Elevated glow · ring expand |

---

_Next: [10 — Genome Injection](./10_GENOME_INJECTION.md)_
