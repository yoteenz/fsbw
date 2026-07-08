# Quality Inspector Stage™

**Engine Module:** `studio.generation-pipeline.v1.quality-inspector`  
**Status:** Per-layer validation — Stage 9

---

## Purpose

Quality Inspector™ validates **every generated layer** before Founder Approval™.

No layer reaches assembly without passing inspection (or explicit founder override).

---

## Inspection Flow

```
Generation Queue™ layer complete
         ↓
Quality Inspector™ (per layer)
         ↓
QualityReport
         ↓
├── pass → Founder Approval™
├── fail → Regenerate · Reject
└── regen-scope → partial Regenerate recommendation
```

---

## QualityReport Schema

```yaml
QualityReport:
  reportId: uuid
  pipelineRunId: uuid
  layerId: string
  artifactRef: string

  result: pass | fail | regen-scope
  scores:
    blueprintCompliance: number    # 0–1
    resolutionCompliance: boolean
    layerIsolation: boolean
    genomeMatch: number
    perspectiveCompliance: boolean

  failures: QualityFailure[]
  regenRecommendation: string | null
  inspectedAt: ISO8601
```

---

## Checks (Per Layer)

| Check | Source |
|-------|--------|
| Blueprint compliance | Creative Blueprint Engine™ |
| Resolution · aspect | Scene Blueprint rendering requirements |
| Layer isolation | No bleed into sibling layers |
| Genome match | Company DNA™ |
| Perspective | Product/environment rules |
| Anti-SaaS negative | No dashboard · browser chrome |

Thresholds from `ProductionPrompt™.quality` and Golden Build™ tier.

---

## Founder Controls

| result | Available actions |
|--------|-------------------|
| `pass` | Approve · Reject (founder disagrees) |
| `fail` | Regenerate · Reject · Create Variation |
| `regen-scope` | Regenerate (targeted) · Approve with warning |

---

## Sub-Engine Integration

| Engine | Role |
|--------|------|
| Validation Loop™ | Rule authority |
| [validation-handoff](../generation-manager/validation-handoff.md) | Manager → Inspector handoff |
| Quality Inspector (CIE) | Pipeline stage wrapper |

Validation Loop may invoke automatic regen once — then escalate to founder.

---

## Batch vs Per-Layer

Default: **per-layer** inspection and approval.

Batch approval allowed when:

- All layers `pass`
- Founder selects *"Approve all layers"*
- Still recorded per-layer in `LayerPipelineState`

---

## Failed Layer — Pipeline Behavior

```
Layer fails Quality Inspector™
         ↓
Queue paused
         ↓
Orb: "Lighting layer needs adjustment — regenerate?"
         ↓
Founder: Regenerate | Reject | Variation
         ↓
Re-enter pipeline at target layer (partial)
```

Upstream approved layers **preserved**.

---

_Quality Inspector Stage™ — nothing unreviewed reaches the founder's world._
