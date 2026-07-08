# Routine Engine™

**Orchestration Logic**

---

## Purpose

Define how Studio OS **orchestrates** Routines™ — step progression · dependencies · shortcuts · blocking · and completion detection.

**Philosophy and structure only — no implementation this sprint.**

---

## Core Law

The Routine Engine™ does not navigate.

It **orchestrates** — the Scene Architecture™ and Transitions™ layers execute movement.

---

## Engine Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Routine selection** | Match founder intent to available routines |
| **Prerequisite validation** | Entry conditions · dependencies |
| **Step activation** | Current step · scene · workspace |
| **Progress tracking** | Completed · remaining · percent |
| **Shortcut evaluation** | Intelligent Shortcuts™ per step |
| **Block detection** | Unmet dependencies · pending reviews |
| **Transition dispatch** | Request physical movement between steps |
| **Completion detection** | All required tasks done |
| **Memory write** | Routine Memory™ on complete |
| **Resume restore** | Interruption™ state on return |

---

## Orchestration Flow

```
Founder expresses intent ("Launch product" · Orb · routine picker)
        ↓
Routine Engine™ selects Routine™
        ↓
Validate entry conditions + dependencies
        ↓
Routine Start™ ceremony
        ↓
LOOP:
  Evaluate Intelligent Shortcuts™ for current step
        ↓
  If skippable → mark complete · advance
  If blocked → Orb explains · wait or reroute
  If active → dispatch to Department™ · Scene™ · Workspace™
        ↓
  Monitor Task™ completion signals
        ↓
  On step complete → Transition™ to next step
        ↓
UNTIL all required steps complete
        ↓
Routine Complete™ ceremony
        ↓
Write Routine Memory™ · update Taste Engine™
```

---

## Dependency Model

| Dependency type | Example | Engine behavior |
|-----------------|---------|-----------------|
| **Asset exists** | Golden Build™ approved | Skip creative step |
| **Approval pending** | Braintrust review | Block · route to review |
| **Prior routine** | Brand must exist before launch | Gate launch routine |
| **Company stage** | Enterprise mode required | Suggest mode evolution |
| **Time-based** | Weekly review due | Surface proactively |
| **External** | Stripe connected | Block with setup routine offer |

---

## Task Completion Signals

The engine listens for diegetic completion — not button clicks alone:

| Signal source | Example |
|---------------|---------|
| **Pipeline store** | Stage approved |
| **Project Genome™** | Direction locked |
| **Founder action** | Explicit routine step confirm |
| **Validation Loop™** | Certification token issued |
| **Distribution engine** | Campaign scheduled |
| **Analytics hook** | Tracking live |

---

## Intelligent Shortcuts™ Engine

Before activating each step:

```
1. Is step already complete? (verify signals)
2. Do reusable assets exist?
3. Do prior decisions still apply?
4. Does Founder Taste™ suggest skip?
5. Is step optional with no delta?
        ↓
If yes → shortcut with Orb explanation
If no → full step activation
```

**Source:** [routine-adaptation.md](./routine-adaptation.md)

---

## Multi-Routine Awareness

| Scenario | Engine behavior |
|----------|-----------------|
| **One active routine** | Default — full orchestration |
| **Routine paused** | Resume stack preserved |
| **Routine + Explorer** | Explorer overlay · routine paused not abandoned |
| **Nested objectives** | Child routine spawns · parent paused |
| **Conflicting routines** | Orb presents choice |

---

## Orb Integration

Engine publishes to Orb context:

```typescript
interface RoutineEngineContext {
  activeRoutineId: string | null;
  routineState: RoutineState;
  currentStep: RoutineStep | null;
  remainingSteps: RoutineStep[];
  progressPercent: number;
  blockers: RoutineBlocker[];
  shortcutsApplied: string[];
  estimatedTimeRemaining: string;
}
```

**Source:** [orb-guidance.md](./orb-guidance.md)

---

## Relationship to Walk the Business™

| System | Scope |
|--------|-------|
| **Walk the Business™** | Daily headquarters ritual — macro routine |
| **Routine Engine™** | Objective-specific journeys — micro-to-macro |
| **Adaptive Walk™** | Selects and personalizes daily walk |

Walk the Business™ may **compose** multiple routines into a morning journey.

---

## Error Recovery

| Failure | Recovery |
|---------|----------|
| Step blocked unexpectedly | Orb offers alternate path · skip if valid |
| Transition fails | Retry · fallback station nav |
| Task signal lost | Re-verify state · never duplicate work |
| Founder abandons mid-step | Interruption™ save · no data loss |
| Routine definition outdated | Graceful migration · preserve progress |

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Engine renders UI | Orchestration only |
| Hard-coded routes | Scene Architecture™ dispatches |
| No shortcut evaluation | Wastes founder time |
| Silent step skip | Orb must explain |
| Routine without completion detection | Never finishes |

---

## Cross-References

- [routine-framework.md](./routine-framework.md)
- [resume-system.md](./resume-system.md)
- [Adaptive Walk™](../engine/adaptive-walk/02_WALK_MODES.md)
