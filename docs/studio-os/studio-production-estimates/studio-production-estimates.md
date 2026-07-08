# Studio Production Estimates™ — Master Specification

**Engine ID:** `studio.production-estimates.v1`  
**Status:** Production planning before execution

---

## The Problem

Founders using AI tools see:

- Opaque token counts
- Provider names and model IDs
- Per-call pricing that feels like a meter running
- No sense of **creative scope** or **reuse value**

Studio OS must feel like commissioning a **production studio** — not buying API credits.

---

## The Solution

Before any production executes, Studio OS delivers a **Production Estimate™**:

- What will be reused
- What will be modified
- What must be generated new
- How long it will take
- What it costs in **production value**
- How much reuse saved
- How complex the production is
- **Why** — narrated by the Orb

Founder approves the estimate. Then production begins.

---

## Core Laws

### Law 1 — Estimate Before Execute

> Every generation request calculates a Production Estimate™ first.

No silent production. No surprise scope.

### Law 2 — Productions Not Images

> Studio OS estimates **productions** — not images.

A Story Table™ production includes blueprints, systems, layers, assets, and assembly — not "one PNG."

### Law 3 — Never Expose Providers

> Founders never see GPU providers, model routes, or raw API pricing.

Internal systems may route to providers. Founder sees **production studio language only**.

See [forbidden-exposure.md](./forbidden-exposure.md).

### Law 4 — Reuse Is Line Items

> Assets Reused™ · Blueprints Reused™ · Systems Reused™ are first-class estimate rows.

Savings are visible. Intelligence is demonstrated.

### Law 5 — Orb Explains WHY

> The Orb should explain WHY the estimate looks the way it does.

Not just numbers — creative reasoning.

### Law 6 — Creative Work Has Value

> Production costs reflect creative value — scope, craftsmanship, complexity — not commodity image pricing.

---

## Estimate Trigger Points

| Trigger | Estimate Scope |
|---------|----------------|
| New department bootstrap | Full blueprint + asset manifest |
| Scene Stack™ layer regen | Single layer production unit |
| Station visit (lazy gen) | Per-station stack estimate |
| Golden Build™ stage | Pipeline stage scope |
| Blueprint Apply Existing™ | Inheritance + gap fill |
| Expedition visual evolution | Evolution offer scope |

---

## Production Estimate™ Output

```yaml
ProductionEstimate:
  estimateId: string
  orgId: string
  requestContext:
    departmentId: string
    stationId: string | null
    layerId: string | null
    blueprintId: string | null
    productionLabel: string          # "Story Table™"
  summary:
    estimatedProductionCostUsd: number
    estimatedProductionTimeSeconds: number
    estimatedSavingsUsd: number
    productionComplexity: low | medium | high | signature
  breakdown:
    assetsReused: number
    blueprintsReused: number
    systemsReused: number
    assetsModified: number
    newAssetsGenerated: number
  lineItems: ProductionLineItem[]
  orbNarration:
    summary: string
    whyBullets: string[]
    recommendation: string
  approval:
    required: true
    founderChoices: [Approve Production™, Revise Scope™, Cancel]
  internalOnly:
    providerRouting: never-founder-facing
    tokenEstimate: never-founder-facing
```

---

## CDS Story Table™ Example (Canonical)

| Metric | Value |
|--------|-------|
| Estimated Production Cost™ | **$2.48** |
| Estimated Production Time™ | **2m 12s** |
| Assets Reused™ | **8** |
| Blueprints Reused™ | **1** (Editorial Luxury Blueprint™) |
| Systems Reused™ | **5** (Lighting · Materials · Glass · Atmosphere · Orb) |
| Assets Modified™ | **3** |
| New Assets Generated™ | **2** |
| Estimated Savings™ | **$4.86** |
| Production Complexity™ | **Medium** |

Full walkthrough: [cds-story-table-example.md](./cds-story-table-example.md).

---

## Relationship to Billing

| System | Role |
|--------|------|
| **Production Estimate™** | Pre-production scope · founder-facing |
| **Platform billing** (if any) | Separate · never itemizes FAL/OpenAI per call |
| **Build report** (internal) | Post-production audit · admin-only |

Founder Estimate ≠ API invoice.

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| "FAL call × $0.04" | Commodity generator UX |
| Model picker on estimate | Provider exposure |
| Token count in estimate card | Meter anxiety |
| Estimate after generation | No informed consent |
| Zero reuse line items when reuse occurred | Hides intelligence value |

---

## Final Philosophy

Creative work has value.

Studio OS should estimate **productions** — not images.

The founder should feel like a client reviewing a production bid from a world-class studio — informed, respected, and in control.

---

_See also: [estimate-model.md](./estimate-model.md) · [orb-narration.md](./orb-narration.md) · [forbidden-exposure.md](./forbidden-exposure.md)_
