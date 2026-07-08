# Refinement Pipeline™

**Step 08 — Tap what you want to improve**

---

## Purpose

After vision lock and Asset Graph™ construction, the founder refines the room **naturally** — tapping objects and directing changes — not generating assets one by one.

---

## Core Law

**Surgical refinement. Everything else untouched.**

---

## The Old Way (Forbidden)

```
Generate Room
Generate Furniture
Generate Lighting
Generate Desk
Generate Wall
```

Founder manages a **production queue** of disconnected assets.

---

## The New Way (Required)

```
Tap Orb™ → Refine Orb™
Tap Mood Wall™ → Refine Mood Wall™
Tap Lighting → Refine Lighting™
Tap Story Table™ → Refine Story Table™
Tap Windows → Refine Windows™
```

**Everything else remains untouched.**

---

## Refinement Flow

```
Founder taps object in room
        ↓
Asset Graph™ node selected
        ↓
Orb: "What would you like to change?"
        ↓
Founder gives Director Feedback™
        ↓
Studio OS compiles generation instructions
        ↓
Background Intelligence™ prepares dependencies
        ↓
Targeted generation (node only)
        ↓
Creative Review™ (Braintrust → Founder)
        ↓
Approve™ · Regenerate™ · Branch™
        ↓
Scene Blueprint™ + Asset Graph™ updated
        ↓
World Persistence™
```

---

## Refinement Scope

| Scope | When |
|-------|------|
| **Single node** | Default — one object refined |
| **Node + dependents** | When dependency requires (e.g., lighting → reflections) |
| **Zone** | Founder explicitly requests zone refinement |
| **Full concept** | **Forbidden** unless founder explicitly abandons vision |

---

## Node Refinement States

| State | Founder sees |
|-------|--------------|
| `approved-vision` | Object from locked concept — no action needed |
| `refining` | Generation in progress for this node |
| `braintrust-review` | Braintrust reviewing refinement |
| `founder-review` | Awaiting founder decision |
| `approved` | Refinement accepted |
| `locked` | Golden Build™ — no further refinement without unlock |

---

## Approve™ · Regenerate™ · Branch™

Preserved from Creative Approval Pipeline™ — applied per refinement:

| Action | Behavior |
|--------|----------|
| **Approve™** | Accept refinement · update graph · persist |
| **Regenerate™** | Retry same Director Feedback™ intent |
| **Branch™** | Keep current · also save alternative version |
| **Trust My Instinct™** | Accept with Braintrust report saved quietly |

---

## Founder Experience Examples

### Refine Orb™

```
Founder taps Orb™
Orb: "What would you like to change about me?"
Founder: "Move closer to the Story Table. Warmer glow."
        ↓
Only Orb node regenerates
Story Table™ · walls · lighting (unless coupled) unchanged
```

### Refine Mood Wall™

```
Founder taps Mood Wall™
Founder: "Make this the hero. More Frontal Slayer branding."
        ↓
Mood Wall™ node refines
focalPoints in Scene Blueprint™ update
dependent lighting may adjust (with warning)
```

### Refine Lighting™

```
Founder taps lighting area
Founder: "More cinematic. Less corporate."
        ↓
Lighting rig refines
Dependency Awareness™ warns: reflections · particles may need update
Founder confirms cascade scope
```

---

## Background During Refinement

While founder reviews one object, Studio OS quietly prepares:

- Dependency update previews
- Scene Blueprint™ revision drafts
- Asset Graph™ edge updates
- Prompt recompilation for dependent nodes
- Validation pre-checks

**Nothing feels blocked.**

**Detail:** [production-intelligence.md](./production-intelligence.md)

---

## Creative Review™ on Every Refinement

Every refinement passes:

```
Creative Review™
        ↓
Orb™ (facilitator)
        ↓
Braintrust™ (specialists)
        ↓
Founder™ (authority)
```

The AI advises. The founder decides.

---

## Relationship to Golden Build™

| Milestone | Requirement |
|-----------|-------------|
| Refinement complete | All critical nodes `approved` or `locked` |
| Golden Build™ ready | Hero object · Orb · core zones approved |
| Certification | Validation Loop™ + Walk the Room™ |

Refinement Pipeline™ feeds directly into [Golden Build™](../production-lifecycle/golden-build.md).

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Full room regen for one tweak | Wastes vision lock |
| Refine without Braintrust | Quality regression |
| Queue of 35 separate approvals | Old pipeline · forbidden |
| Block UI during generation | Background Intelligence™ required |

---

## Cross-References

- [director-feedback.md](./director-feedback.md)
- [production-intelligence.md](./production-intelligence.md)
- [asset-graph.md](./asset-graph.md)
- [Creative Review™](../engine/validation-loop/03_CREATIVE_REVIEW.md)
