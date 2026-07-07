# 04 — Dynamic Headquarters

**Engine Module:** `studio.adaptive-walk.v1.dynamic-headquarters`  
**Status:** Mode-driven environment reaction  
**Philosophy:** The Headquarters should visibly react to the business.

---

## Design Principle

> HQ atmosphere is not decoration — it is **communication**. Launch Day feels different from Quiet Day feels different from Crisis Day.

---

## Dynamic HQ Profile

```yaml
DynamicHQProfile:
  modeId: WalkModeId
  globalModifiers: EnvironmentModifiers
  departmentModifiers: DepartmentModifier[]
  pathwayHighlights: PathwayHighlight[]
  audioProfile: AudioProfile
  particleProfile: ParticleProfile
  activityTargets: ActivityLevelMap
```

Experience Engine applies modifiers. Walk the Business Department Behavior executes activity targets.

---

## Mode Atmosphere Matrix

### Launch Day™

| Element | Expression |
|---------|------------|
| Activity | Departments more active · publishing screens animate |
| Marketing | Walls update · campaign assets visible |
| Publishing | Countdown displays activate |
| Orb | More energetic movement · faster approach |
| Audio | Subtle urgency · not stressful |
| Pathways | Route to launch departments lit |

### Quiet Day

| Element | Expression |
|---------|------------|
| Lighting | Ambient softens · warmer |
| Orb | Speaks less · offers explore |
| Departments | Calm idle · steady work |
| Audio | Quieter soundscape |
| Founder | Encouraged to explore freely |
| Stops | Fewer · longer dwell OK |

### Crisis Day

| Element | Expression |
|---------|------------|
| Lighting | Focused · concern zones prominent |
| Pathways | Priority routes illuminate |
| Non-urgent zones | Dimmed — not hidden |
| Orb | Immediate redirect tone |
| Departments needing attention | Brighter · concierges at threshold |
| Celebrations | Suppressed until crisis cleared |

### Celebration Day

| Element | Expression |
|---------|------------|
| Departments | Celebrate · achievement displays update |
| Audio | Ambient shift · Genome-weighted joy |
| Particles | Subtle acknowledgment effects |
| Observatory | Milestone sculptures active |
| Orb | Opens with congratulations |

---

## Department-Level Modifiers

```yaml
DepartmentModifier:
  departmentId: string
  activityLevel: enum               # from Walk the Business 04
  lightingDelta: LightingDelta
  emphasis: enum                    # featured · normal · deemphasized · suppressed
  conciergePresence: enum           # greeting · waiting · ambient-only
  visibleSignals: string[]          # what founder should notice
```

Crisis mode: `production.emphasis = featured` · `marketplace.emphasis = deemphasized`.

Launch mode: `publishing.emphasis = featured` · `marketing.emphasis = featured`.

---

## Pathway Highlights

Non-urgent departments are never **invisible** — pathways show **suggested route**:

```
Crisis Mode:
  Illuminated: Plaza → Production → Publishing (blocker affects launch)
  Dim: Marketplace wing · Innovation lab
  Founder may still command "Take me to Marketplace"
```

---

## Transition Between Modes

Intraday mode shift (e.g., crisis during quiet day):

```
1. Adaptive Walk emits new DynamicHQProfile
2. Experience Engine crossfades atmosphere (4s)
3. Orb narrates shift — not silent jump
4. Department activity levels update
5. Path recalculates
```

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Identical lighting every day | Breaks adaptive promise |
| Crisis = red flashing alerts | SaaS alarm · not spatial |
| Celebration = confetti spam | Genome may require restraint |
| Mode change without Orb narration | Disorienting |

---

## Integration

| Consumer | Role |
|----------|------|
| **Experience Engine™** | Global lighting · audio · particles |
| **Walk the Business 04** | Per-department activity |
| **Walk the Business 07** | Health storytelling alignment |
| **Headquarters Health** | Baseline before mode overlay |

---

_Next: [05 — Orb Adaptation](./05_ORB_ADAPTATION.md)_
