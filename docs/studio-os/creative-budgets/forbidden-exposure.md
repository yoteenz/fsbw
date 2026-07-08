# Forbidden Exposure™

**Module:** `studio.creative-budgets.v1.forbidden`  
**Status:** Mandatory privacy boundary

---

## Law

> Founders never think in API calls.

Creative Budgets™ exist **because** monthly capacity must feel like **creative studio economics** — not infrastructure metering.

---

## Never Founder-Facing

| Category | Examples |
|----------|----------|
| **GPU providers** | FAL · OpenAI · Runway · Luma · BFL · Replicate |
| **Model IDs** | `fal-ai/nano-banana-pro` · `gpt-image-2` |
| **API pricing** | $0.04/image · $0.002/1K tokens |
| **Token counts** | 12,400 tokens remaining |
| **API credits** | "847 credits left" |
| **Provider invoices** | Per-call cost breakdown |
| **Rate limits** | API quota · concurrent job caps |
| **Budget = provider pass-through** | Showing raw infra cost as "budget" |

---

## Always Founder-Facing

| Category | Examples |
|----------|----------|
| **Capacity language** | Monthly Budget™ · creative capacity |
| **Abstract production dollars** | Spent $41.72 · Pending $28.14 |
| **Savings** | Saved Through Reuse $137.55 |
| **Efficiency** | Efficiency Score™ 94% |
| **Reuse counts** | Assets Reused™ 482 |
| **Production counts** | 12 completed · 3 pending |
| **Orb coaching** | Blueprint savings · maturity · genome |

---

## Internal vs Founder Planes

```
┌─────────────────────────────────────┐
│  FOUNDER PLANE (Creative Budget™)   │
│  Capacity · spent · savings · score │
│  NO providers · NO tokens · NO API  │
└─────────────────┬───────────────────┘
                  │ one-way rollup only
┌─────────────────▼───────────────────┐
│  OPERATIONS PLANE (admin/internal)   │
│  Provider routing · rate cards       │
│  Never rendered in budget card       │
└─────────────────────────────────────┘
```

---

## Copy Audit Rules

Before shipping any budget UI:

| Check | Pass criteria |
|-------|---------------|
| Provider grep | Zero provider names in founder strings |
| Token grep | Zero token / credit language |
| Model grep | Zero model slugs |
| Dollar context | Always "production" / "creative" never "API" |

---

## Relationship to Production Estimates Forbidden Exposure

[Studio Production Estimates™ forbidden rules](../studio-production-estimates/forbidden-exposure.md) apply to per-job estimates.

Creative Budgets™ applies the **same veil** to monthly rollup surfaces.

---

## Relationship to GPU Generation Strategy™

[GPU Generation Strategy™](../marketplace/gpu-generation-strategy.md) governs **when** GPU runs.

Creative Budgets™ governs **how founders understand monthly capacity** when GPU may run — without naming GPU.

---

## Violation Response

If budget pipeline accidentally surfaces provider data:

1. Strip before founder render
2. Log internal incident
3. Re-issue budget snapshot without technical fields

---

_Forbidden Exposure™ — creative capacity veil over infrastructure._
