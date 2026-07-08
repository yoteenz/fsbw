# Retry Engine — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.retry`  
**Status:** Intelligent failure recovery — no babysitting

---

## Principle

> **Failures happen. Retry intelligently. Never require manual babysitting.**

Generation Manager automatically classifies failures, selects retry strategy, and escalates only when exhausted.

---

## Failure Classes

| Class | ID | Detection | Default Strategy |
|-------|-----|-----------|------------------|
| **Timeout** | `timeout` | Provider SLA exceeded | Retry same provider · +50% timeout |
| **Low quality** | `low-quality` | Validation luxury score < threshold | Prompt-layer revision · regen |
| **Perspective error** | `perspective` | Camera angle mismatch | Camera fragment swap · regen |
| **Material inconsistency** | `material` | Genome slot · PBR failure | Material-layer revision |
| **Prompt conflict** | `prompt-conflict` | Contradictory layers in stack | Compiler re-expand request |
| **Provider failure** | `provider-down` | 5xx · rate limit | Failover provider |
| **Corrupt output** | `corrupt` | Checksum · format invalid | Immediate retry |
| **Dependency missing** | `dependency-missing` | Upstream artifact gone | Hold · wait for dep recook |
| **Validation reject** | `founder-reject` | Founder rejected | Apply founder notes · surgical scope |
| **Budget exceeded** | `budget` | Org generation cap | Pause job · notify founder |

---

## Retry Policy Schema

```yaml
RetryPolicy:
  assetId: string
  failureClass: string
  attempt: number                     # 1-based
  maxAttempts: number                 # default 3
  strategy: RetryStrategy
  revisionScope: string               # from production asset-review-system
  providerSwitch: string | null
  promptDelta: string | null
  backoffSeconds: number
  escalateAfter: number               # default maxAttempts
```

---

## Retry Strategies

| Strategy | Action |
|----------|--------|
| `same-provider-immediate` | Resubmit identical payload |
| `same-provider-backoff` | Wait backoff · resubmit |
| `provider-failover` | Switch to fallback adapter |
| `prompt-layer-revision` | Request Compiler delta on one layer |
| `camera-fragment-swap` | Swap camera fragment ref |
| `material-overlay-retry` | Regen material pass only |
| `surgical-mesh-regen` | Full mesh · narrowed prompt |
| `compiler-reexpand` | Send back to Prompt Compiler |
| `hold-for-dependency` | Block until upstream approved |
| `founder-escalation` | Pause · notify · await directive |

---

## Attempt Progression (Default)

```
Attempt 1: same-provider-immediate
Attempt 2: same-provider-backoff (30s) OR provider-failover
Attempt 3: prompt-layer-revision (surgical scope from validation)
Attempt 4: founder-escalation (if maxAttempts=3, escalate at 3)
```

### Class-Specific Overrides

| Class | Attempt 1 | Attempt 2 | Attempt 3 |
|-------|-----------|-----------|-----------|
| timeout | backoff +50% time | failover | escalate |
| low-quality | material-overlay | prompt-layer | surgical-mesh |
| perspective | camera-fragment-swap | prompt-layer | escalate |
| provider-down | failover immediately | failover #2 | pause job |
| corrupt | immediate retry | immediate retry | escalate |
| founder-reject | apply founder notes | surgical per notes | escalate |

---

## Revision Scope Integration

Maps to [asset-review-system.md](../../production/asset-review-system.md):

| Scope | Retry Cost | When |
|-------|------------|------|
| `material-only` | Low | Material class failure |
| `prompt-layer` | Low | Semantic issue |
| `camera-fragment` | Low | Perspective class |
| `lighting-response` | Medium | Lighting class |
| `genome-overlay` | Low | Tint wrong |
| `mesh-topology` | High | Scale · proportion |
| `full-asset` | Highest | Escalation only |

**Never default to `full-asset`** — requires validation failure count ≥ 3 or founder directive.

---

## Provider Failover Chain

```yaml
failoverChain:
  mesh:
    - fal
    - openai-images
  texture:
    - fal
    - openai-images
  environment-plate:
    - fal-gpt-image
    - openai-images
  audio:
    - elevenlabs
    - suno
```

See [provider-abstraction.md](./provider-abstraction.md).

---

## Retry State Flow

```
validating → fail
         ↓
needs-revision
         ↓
retrying (attempt N)
         ↓
├── success → generating → validating → approved
└── fail → attempt N+1 OR failed
```

`retrying` visible in founder UI: *"Retrying… (attempt 2 of 3)"*

---

## Branch Regeneration

Founder **Regenerate one asset**:

```
1. Clone queue item to branch job
2. Mark original artifact archived
3. New item: state queued · attempt 0
4. Parent job continues other items (non-blocking)
5. On branch success: swap artifact ref in package
```

**Create Branch** forks entire remaining queue for experimental cook.

---

## Anti-Babysitting Rules

| Rule | Implementation |
|------|----------------|
| Auto-retry without prompt | ✓ Default 3 attempts |
| Auto-failover on provider down | ✓ No founder action |
| Auto-surgical scope | ✓ From failure class |
| Batch failure digest | ✓ One notification per 5 failures |
| Night recovery | ✓ Resume paused jobs (future) |
| Never silent fail | ✓ Always terminal state + history |

Founder notified only on: exhaustion · hero failure · job pause · complete.

---

## Retry Exhaustion

```
state: failed
history: all attempts logged
build-report: failure section
suggestions: specific remediation
founder options:
  - Regenerate (new branch)
  - Accept placeholder (soft dep only — not golden path)
  - Pause job
  - Cancel job
```

Golden CDS path: **no placeholder acceptance** for hero or shell assets.

---

## Metrics

```yaml
RetryMetrics:
  jobId: string
  totalRetries: number
  byClass: Record<string, number>
  byProvider: Record<string, number>
  successfulRecoveries: number
  founderEscalations: number
```

Feeds Build Report and future ML retry optimization.

---

## Compiler Re-Expand Request

On `prompt-conflict`:

```json
{
  "requestType": "compiler-reexpand",
  "assetId": "glass-panels-cds",
  "conflictLayers": ["material", "negative"],
  "suggestedFix": "remove conflicting negative pattern"
}
```

Compiler returns updated `13_prompts/{assetId}.json` — Manager resumes without full recompile.

---

_Retry Engine — failures recover, founders create._
