# 09 — Revision Engine

**Engine Module:** `studio.validation-loop.v1.revision-engine`  
**Status:** Actionable revision generation system  
**Philosophy:** Never regenerate everything unless explicitly requested.

---

## Design Principle

> Every failed validation generates **actionable revisions** — scoped, prioritized, and mapped to Generator/Compiler regeneration contracts.

---

## Revision Triggers

| Source | Trigger |
|--------|---------|
| Self Review fail | Technical fix → Generator/Compiler |
| Braintrust weakness | Prioritized improvement list |
| Genome Validation fail | Scoped Genome regen |
| Creative Review fail | Art direction scope |
| Experience Review fail | Arrival · motion · audio scope |
| Department Review fail | Per-asset scope |
| Scorecard below threshold | Dimension-mapped scopes |
| Founder revision request | Founder-specified scope |

---

## Revision Plan Schema

```yaml
RevisionPlan:
  validationId: string
  priority: enum                    # critical | high | medium | low
  items: RevisionItem[]
  estimatedScopes: number
  fullRebuildRequired: boolean      # default false
  founderConfirmRequired: boolean
  revalidationEntryStage: ValidationState
```

```yaml
RevisionItem:
  id: string
  source: string                    # which review stage flagged
  description: string               # plain language for founder
  technicalAction: string           # engine instruction
  regenerationScope: RegenerationScope
  targetEngine: enum                # generator | compiler | both
  dimensionAffected: string
  autoExecutable: boolean             # can run without founder confirm
```

---

## Supported Revision Scopes

| Scope | Regenerates | Engine |
|-------|-------------|--------|
| Single asset | One asset ID | Compiler |
| Single object | Object + dependencies | Generator → Compiler |
| Single interaction | interaction-map.json | Generator only |
| Lighting only | lighting-rig · ceiling accents | Generator → Compiler |
| Audio only | audio stems | Generator → Compiler |
| Motion only | animation-manifest · camera-paths | Generator only |
| Environment only | env-* tasks | Generator → Compiler |
| Mood Wall only | wall-mood-{dept} | Generator → Compiler |
| Orb only | orb + pedestal + audio-orb | Generator → Compiler |
| Genome materials | material-family assets | Generator → Compiler |
| AI team | ai/*.json | Generator only |
| Full department | All assets | Generator → Compiler — **founder confirm** |

Aligns with Generator Regeneration System (14).

---

## Revision Priority Logic

| Priority | Condition |
|----------|-----------|
| **Critical** | Self Review fail · Genome transferability critical · generic risk critical |
| **High** | Dimension score < 40 · Braintrust critical sentiment |
| **Medium** | Dimension score 40–59 · Braintrust concerned |
| **Low** | Dimension score 60–74 · polish improvements |

Critical items block founder review until resolved or founder override.

---

## Revalidation Scoping

After revision executes, re-enter pipeline at appropriate stage:

| Revision Scope | Revalidation From |
|----------------|-------------------|
| Technical fix | Self Review |
| Lighting/audio/motion | Department Review (affected) + Scorecard delta |
| Mood Wall | Creative + Experience + Genome (mood) |
| Interaction only | Department Review (interactions) + Experience |
| Full rebuild | Self Review (full pipeline) |

Learning Engine records revision → outcome correlation.

---

## Founder Revision Requests

| Founder Says | Resolved Scope |
|--------------|----------------|
| *"The lighting feels cold"* | `lighting` |
| *"Make the Mood Wall more editorial"* | `mood-wall` + Creative Direction merge |
| *"Orb voice doesn't sound like us"* | `orb` + `audio-orb` |
| *"Start over"* | `full` — confirmation ceremony |
| *"Fix the Timeline interactions only"* | `interaction` subset |

Natural language → `RegenerationScope` via Orb routing.

---

## Revision Limits

| Rule | Value |
|------|-------|
| Max auto-revisions per validation | 3 |
| Max total revisions before escalation | 7 |
| Escalation action | Chief Concierge brief · founder strategy session |
| Full rebuild cooldown | 1 per validation cycle without founder explicit request |

---

## Non-Destructive Guarantee

| Preserved During Revision |
|---------------------------|
| Unchanged asset versions |
| Project state · branches · approvals |
| Founder notes · annotations |
| Prior approved assets in package |
| Learning context |

---

_Next: [10 — Learning Engine](./10_LEARNING_ENGINE.md)_
