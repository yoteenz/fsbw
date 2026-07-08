# Production Intelligence™

**Background Intelligence™ · Dependency Awareness™ · Creative Review™**

---

## Purpose

Define the intelligent systems that keep vision-first production **fast · aware · and quality-gated** — without blocking the founder.

---

## Three Systems

| System | Role |
|--------|------|
| **Background Intelligence™** | Quiet preparation while founder reviews |
| **Dependency Awareness™** | Relationship warnings before cascading changes |
| **Creative Review™** | Braintrust gate on every refinement |

---

## Background Intelligence™

While the founder reviews one object, Studio OS quietly prepares:

| Preparation | When |
|-------------|------|
| Dependency update previews | During any refinement review |
| Scene Blueprint™ revision drafts | After Director Feedback™ parsed |
| Asset Graph™ edge updates | Before regeneration executes |
| Prompt recompilation | For target + optional dependents |
| Validation pre-checks | Before generation fires |
| Next-node suggestions | After approval ("Lighting may need a small update") |

### Rules

| Rule | Meaning |
|------|---------|
| **Non-blocking** | Founder never waits on background prep |
| **Invisible until ready** | Suggestions appear when useful |
| **No auto-execute** | Background prep awaits approval |
| **Parallel** | Multiple prep streams allowed |

### Example

```
Founder reviews refined Mood Wall™ (30 seconds)
        ↓
Background: pre-compiled lighting adjustment
        ↓
Orb (after approval): "Lighting shift is ready if you'd like to review it."
```

Evolved from Creative Approval Pipeline™ **Background Preparation™**.

---

## Dependency Awareness™

Studio OS understands object relationships via Asset Graph™.

### Example: Ceiling Height Change

Changing ceiling height affects:

| Dependent | Impact |
|-----------|--------|
| Lighting | Rig height · falloff |
| Camera | Arrival angle · framing |
| Reflections | Floor reflection scale |
| Ambient audio | Room volume reverb |
| Particles | Light shaft geometry |
| Navigation | Clearance paths |
| Orb placement | Pedestal scale relationship |

### Warning Flow

```
Founder: "Raise the ceiling."
        ↓
Dependency Awareness™ detects 7 dependents
        ↓
Orb: "Raising the ceiling will affect lighting, reflections, and camera framing. 
      I can update those automatically, or we can adjust only the architecture."
        ↓
Founder chooses scope
        ↓
Refinement executes with confirmed cascade
```

### Cascade Scopes

| Scope | Behavior |
|-------|----------|
| **Node only** | Change architecture · warn dependents stale |
| **Node + critical dependents** | Auto-update lighting · camera |
| **Full cascade** | Update all dependent nodes (queued) |

Founder always informed before major cascades.

Evolved from Creative Approval Pipeline™ **Dependency Awareness™**.

---

## Creative Review™

Every refinement passes through the Braintrust gate:

```
Refinement generated
        ↓
Creative Review™
        ↓
Orb™ (Executive Producer — single voice)
        ↓
Braintrust™ (stage specialists)
        ↓
Founder Review™
        ↓
Approve™ · Regenerate™ · Branch™
```

### Braintrust Assembly

Specialists auto-assembled per node category:

| Node category | Example specialists |
|---------------|---------------------|
| Architecture | Experience Architect · Technical Director |
| Mood Wall™ (hero) | Brand Concierge · Interior Designer |
| Lighting | Lighting Director · Cinematographer |
| Orb™ | Brand Concierge · Experience Architect |
| Furniture | Interior Designer · Set Dresser |

### Founder Review Paths

| Path | Duration | Content |
|------|----------|---------|
| **Summary Review™** | 30–60s | Orb briefing · recommendation |
| **Deep Dive™** | Full | Specialist scores · concerns |
| **Self Review™** | Walk | Founder inspects in room |
| **Trust My Instinct™** | Instant | Accept · report saved quietly |

### Follow-Up Questions™

Founder asks Orb naturally:

- "What concerns you most?"
- "Compare this to the previous version."
- "Will this affect the Mood Wall™?"

Orb answers — specialists speak only when asked in Deep Dive.

### Consensus™

After discussion, Orb delivers unified recommendation:

> **"Braintrust recommends approval. The warmer lighting strengthens the Mood Wall™ hero position without breaking brand guidelines."**

Preserved from implemented Creative Review™ — applied to **refinements** not initial vision selection.

---

## Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                 REFINEMENT PIPELINE™                         │
├─────────────────────────────────────────────────────────────┤
│  Director Feedback™                                          │
│       ↓                                                      │
│  Dependency Awareness™ ──warn──► Founder scope choice       │
│       ↓                                                      │
│  Background Intelligence™ (parallel prep)                    │
│       ↓                                                      │
│  Generation (targeted node)                                  │
│       ↓                                                      │
│  Creative Review™ → Braintrust → Founder                    │
│       ↓                                                      │
│  Scene Blueprint™ + Asset Graph™ + World Persistence™       │
└─────────────────────────────────────────────────────────────┘
```

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Auto-cascade without warning | Founder loses control |
| Skip Braintrust on refinement | Quality regression |
| Block UI during background prep | Violates non-blocking rule |
| Braintrust blocks vision selection | Founder is Creative Director |

---

## Cross-References

- [refinement-pipeline.md](./refinement-pipeline.md)
- [director-feedback.md](./director-feedback.md)
- [asset-graph.md](./asset-graph.md)
- [Creative Review™](../engine/validation-loop/03_CREATIVE_REVIEW.md)
