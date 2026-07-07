# 05 — Interaction Engine

**Engine Module:** `studio.department-runtime.v1.interaction`  
**Status:** Runtime interaction routing specification  
**Parent:** SDK [04 — Interaction Engine](../../sdk/04_INTERACTION_ENGINE.md) · Platform M130  
**Philosophy:** Interactions feel physical — never form-first

---

## Definition

The Runtime **Interaction Engine** routes user input to **verbs on objects** — producing environmental feedback through Animation, Audio, Particle, and Concierge subsystems.

Forms exist only as accessibility escape hatches surfaced as Floating Panels.

---

## Supported Verbs

| Verb | ID | Physical Metaphor |
|------|----|-------------------|
| Click | `click` | Touch surface |
| Drag | `drag` | Move across glass/table |
| Drop | `drop` | Release on valid surface |
| Pin | `pin` | Stick to wall |
| Annotate | `annotate` | Draw on surface |
| Compare | `compare` | Side-by-side evaluation |
| Approve | `approve` | Ceremonial stamp |
| Reject | `reject` | Ceremonial return |
| Expand | `expand` | Panel/surface grows |
| Collapse | `collapse` | Panel/surface recedes |
| Speak | `speak` | Voice to Orb |
| Voice | `voice` | Hold-to-talk |
| Hover | `hover` | Approach object |
| Inspect | `inspect` | Focus + detail panel |
| Navigate | `navigate` | Travel to zone/department |

Plus SDK verbs: `scrub`, `preview`, `branch`, `reference-drop`, `version-history`, `orb-conversation`, `command`.

---

## Interaction Pipeline

```
User Input (pointer / keyboard / voice / gesture)
    ↓
Input Normalizer (platform M130 states)
    ↓
Raycast / Focus Target → RuntimeObject
    ↓
Permission Check (object + user)
    ↓
Verb Resolver (interactions.json binding)
    ↓
Verb Executor (object-specific handler)
    ↓
Feedback Orchestrator
    ├── Animation Engine (10)
    ├── Audio Engine (12)
    ├── Particle Engine (11)
    └── Concierge Runtime (07)
    ↓
State Manager update (14)
    ↓
Event Bus emission
```

---

## Physical Interaction Rules

| Rule | Implementation |
|------|----------------|
| Verbs target objects | Raycast hits RuntimeObject collision |
| One active verb per user per zone | Mutex in Interaction Engine |
| Feedback is environmental | Never toast-only |
| Ceremonies are non-skippable | approve, launch |
| Forms as Floating Panels | Max 1 form panel; dismissible |
| Keyboard equivalents | Tab focus + Enter = click |
| Voice via Orb | speak → Orb Runtime → verb dispatch |

---

## Verb Execution Contract

```yaml
VerbRequest:
  verb: string
  instanceId: string
  userId: string
  payload: any                      # verb-specific data
  inputMethod: enum                 # pointer | keyboard | voice | gesture

VerbResult:
  status: enum                      # success | denied | pending | error
  feedbackProfile: string
  stateChanges: StateChange[]
  aiTriggers: AITrigger[]
  outputPortSignals: OutputSignal[]
```

---

## Gesture Mapping

| Gesture | Verb |
|---------|------|
| Tap | click |
| Long press | inspect / context |
| Drag | drag |
| Drop | drop |
| Pinch | compare |
| Swipe H | scrub (timeline) |
| Swipe V | navigate (zone) |
| Voice hold | speak |

---

## Zone Verb Enforcement

Interaction map declares zone `allowedVerbs`. Object inherits zone verbs + object profile verbs.

Denied verb → object shows `disabled` state + Orb explains.

---

## Cursor Integration

Cursor wires **verb handlers** to platform services:

| Verb | Cursor Handler Connects To |
|------|---------------------------|
| approve | Approval workflow API |
| reference-drop | Asset Registry |
| command | Command Dock |
| navigate | Navigation Engine |
| scrub | Project schedule API |

Runtime provides routing + feedback; Cursor provides business logic handlers.

---

## Accessibility

| Requirement | Runtime Provides |
|-------------|------------------|
| Reduced motion | Instant feedback path |
| Screen reader | Object + verb announcement |
| Keyboard | Full verb access |
| Form fallback | Floating Panel per verb |
| High contrast | State not color-only |

---

_Next: [06 — Orb Runtime](./06_ORB_RUNTIME.md)_
