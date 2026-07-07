# 07 — Headquarters Health

**Engine Module:** `studio.walk-the-business.v1.headquarters-health`  
**Status:** Environmental business health expression  
**Philosophy:** The environment itself tells the story — not charts alone.

---

## Design Principle

> Instead of charts alone, the **Headquarters visually reflects business health**. A thriving business feels vibrant. When issues arise, departments become quieter, objects wait, pending work accumulates — and Orb communicates urgency.

---

## Health Model

```yaml
HeadquartersHealth:
  companyId: string
  overall: enum                   # thriving · healthy · mixed · attention · strain
  computedAt: ISO8601

  dimensions:
    - id: string                  # revenue-momentum · project-flow · customer-health · team-activity
      score: number             # 0–100 internal — never shown as number to founder during walk
      expression: HealthExpression

  departmentContributions: DepartmentHealth[]
  environmentModifiers: EnvironmentModifiers
```

Founder **feels** health — does not read a health score during walk.

---

## Thriving Business

| Expression | Detail |
|------------|--------|
| Lighting | Warmer · golden accents |
| Activity | Elevated ambient motion across departments |
| Audio | Richer soundscape · subtle energy |
| Projects | Visible progress · objects in motion |
| Celebrations | Recent win ghosts · trophy objects |
| Concierges | Confident posture · celebratory tone available |
| Orb | "Strong morning — momentum is with us." |

---

## Healthy Business

| Expression | Detail |
|------------|--------|
| Lighting | Balanced · Genome-normal |
| Activity | Industry-appropriate steady state |
| Projects | Normal pipeline flow |
| Orb | Calm · informative |

---

## Attention Needed

| Expression | Detail |
|------------|--------|
| Lighting | Slightly cooler · focused spots on concern departments |
| Activity | Quiet departments contrast active ones |
| Objects | Pending work **visible** — queue at Production · waiting approvals glow softly |
| Concierges | Present at thresholds · concerned but calm |
| Orb | "A few items need us today — I'll prioritize the walk." |

---

## Strain / Critical

| Expression | Detail |
|------------|--------|
| Lighting | Cooler overall · concern departments lit |
| Activity | Stilled in problem zones · energy elsewhere restrained |
| Audio | Quieter · intentional silence in concern areas |
| Orb | Direct · not alarmist: "Production needs us first." |
| No guilt | Environment informs · never shames founder |

---

## Environment Modifiers

```yaml
EnvironmentModifiers:
  globalLighting: LightingPreset
  ambientGain: number
  particleIntensity: number
  celebrationResidual: boolean    # recent win still visible
  concernZones: string[]          # department ids
  pendingWorkVisibility: enum     # subtle · visible · emphasized
```

Experience Engine applies modifiers. Genome calibrates intensity.

---

## Analytics Observatory Exception

Analytics Observatory is the **one department** where data becomes spatially legible — but still not a spreadsheet:

| Data | Spatial Expression |
|------|-------------------|
| Revenue +12% | Rising light sculpture · Orb narration |
| Engagement dip | Cooling zone · Strategy Concierge explains |
| Funnel | Physical path metaphor — not chart |

Charts exist behind optional deep-dive — **not** default walk experience.

---

## Health → Walk Path

```
HeadquartersHealth computed
    ↓
PriorityScorer weights departments with concern
    ↓
Priority walk includes concern stops first
    ↓
Orb opening reflects overall: thriving vs attention
```

---

## Health Without Surveillance

Health dimensions use business signals — not employee monitoring. Project flow · customer satisfaction · revenue momentum · launch readiness. Never "founder worked 6 hours yesterday."

---

_Next: [08 — Executive Moments](./08_EXECUTIVE_MOMENTS.md)_
