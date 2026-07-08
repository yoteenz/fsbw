# Generation States — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.states`  
**Status:** State machine · founder visibility · history

---

## Principle

> **The founder should always know where every asset is in the pipeline.**

Every queue item and every job has an explicit, observable state.

---

## Asset States

| State | ID | Meaning | Founder UI |
|-------|-----|---------|------------|
| **Queued** | `queued` | Waiting for dependencies | ○ Queued |
| **Preparing** | `preparing` | Loading prompt · routing provider | ○ Preparing |
| **Prompt Compiled** | `prompt-compiled` | Payload ready · about to submit | ○ Ready |
| **Generating** | `generating` | Provider job in flight | ⟳ Generating… |
| **Validating** | `validating` | Quality gates running | ⟳ Validating… |
| **Approved** | `approved` | Passed validation · artifact stored | ✓ Complete |
| **Needs Revision** | `needs-revision` | Failed validation · retry pending | ⚠ Needs revision |
| **Retrying** | `retrying` | Retry engine active | ⟳ Retrying… |
| **Archived** | `archived` | Superseded by branch regen | — Archived |
| **Installed** | `installed` | Registered + Runtime notified | ✓ Installed |
| **Failed** | `failed` | Exhausted retries · human required | ✗ Failed |
| **Cancelled** | `cancelled` | Founder or job cancel | — Cancelled |

### Reuse Shortcut

Items with `resolution: reuse` transition:

```
queued → approved (immediate when deps met)
optional: approved → installed (after package complete)
```

---

## Job States

| State | Meaning |
|-------|---------|
| `queued` | Job created · not started |
| `running` | Actively dispatching |
| `paused` | Founder paused · no new dispatch |
| `complete` | All items terminal success |
| `failed` | Unrecoverable job failure |
| `cancelled` | Founder cancelled |
| `branch` | Experimental fork active alongside parent |

---

## State Machine (Asset)

```
                    ┌──────────┐
                    │  queued  │
                    └────┬─────┘
                         │ deps satisfied
                    ┌────▼─────┐
         reuse ────►│ approved │◄──── (reuse path)
                    └────┬─────┘
                         │ generate path
                    ┌────▼─────┐
                    │ preparing│
                    └────┬─────┘
                    ┌────▼──────────┐
                    │prompt-compiled│
                    └────┬──────────┘
                    ┌────▼─────┐
              ┌────►│generating│◄────┐
              │     └────┬─────┘     │
              │          │           │
              │     ┌────▼─────┐     │
              │     │validating│     │
              │     └────┬─────┘     │
              │    pass  │  fail     │
              │   ┌──────┴──────┐   │
              │   ▼             ▼   │
              │ approved   needs-revision
              │                   │
              │              ┌────▼────┐
              └──────────────│retrying │
                             └────┬────┘
                                  │ exhaust
                             ┌────▼────┐
                             │ failed  │
                             └─────────┘

approved → installed (on package cook complete)
needs-revision → retrying → generating
branch regen → archived (prior artifact)
cancelled (from any non-terminal)
```

---

## State Transition Record

```yaml
StateTransition:
  from: string
  to: string
  at: ISO8601
  reason: string
  actor: system | founder | provider | validation
  metadata: object
```

Full history per item — never overwritten. Enables audit and retry analysis.

---

## Founder Progress View

```
Creative Direction Studio™
Generating...
██████████░░░░░░░░  52%

Environment        ✓ Complete
Lighting           ⟳ Generating…
Furniture          ○ Queued
Orb                ○ Queued
Mood Wall          ○ Queued
Timeline           ○ Queued
Glass Panels       ○ Queued
Particles          ○ Queued

Estimated time remaining: 12 minutes

[Pause] [Resume] [Prioritize ▾] [Regenerate…] [Approve] [Reject]
```

### Expandable Detail

```
Mood Wall (wall-mood-cds)
  State: queued
  Waiting on: lighting-rig-cds (generating, ~3 min)
  Position: 009
  Provider: FAL (planned)
```

---

## Founder Actions by State

| State | Approve | Reject | Regenerate | Prioritize |
|-------|---------|--------|------------|------------|
| queued | — | — | — | ✓ |
| generating | — | — | — | — |
| validating | — | ✓ (pre-empt) | — | — |
| approved | ✓ (hero confirm) | — | ✓ | — |
| needs-revision | — | ✓ | ✓ (auto) | — |
| failed | — | ✓ | ✓ | — |

**Approve** on hero confirms founder acceptance after validation pass.  
**Reject** triggers `needs-revision` → retry engine.

---

## Generation History

```yaml
GenerationHistory:
  jobId: string
  packageId: string
  orgId: string
  completedAt: ISO8601
  summary:
    generated: number
    reused: number
    adapted: number
    failed: number
    retried: number
    totalMinutes: number
  items: ItemHistorySummary[]
```

Persisted permanently — feeds Memory Engine™ and production analytics.

---

## Notifications

| Transition | Notify Founder |
|------------|----------------|
| → failed | Yes · immediate |
| → needs-revision (3rd attempt) | Yes |
| → approved (hero) | Yes · approval request |
| job → complete | Yes · Build Report ready |
| → generating | No (noise) |
| progress 25/50/75% | Optional · configurable |

Respects Founder Cognitive Load™ — batch non-critical updates.

---

## Installed State

`installed` means:

1. Artifact stored with checksum
2. Registry item registered or updated
3. Package manifest updated with cooked ref
4. Runtime handoff eligible (Stage 06)

Package-level `installed` only when **all** required items reach `installed | reused`.

---

## Terminal States

| Terminal | Counts Toward Progress |
|----------|------------------------|
| approved | ✓ |
| installed | ✓ |
| reused (shortcut) | ✓ |
| archived | ✓ (superseded) |
| failed | ✓ (as failed) |
| cancelled | ✓ (as cancelled) |

Job cannot `complete` with required items in `failed` unless founder accepts partial package (explicit — not default).

---

_Generation States — always know where every asset stands._
