# Forbidden Exposure™

**Module:** `studio.production-estimates.v1.forbidden`  
**Status:** Mandatory privacy boundary

---

## Law

> Do NOT expose GPU providers or raw API pricing.

Studio Production Estimates™ exist **because** founders must never feel they are buying API calls.

---

## Never Founder-Facing

| Category | Examples |
|----------|----------|
| **GPU providers** | FAL · OpenAI · Runway · Luma · BFL · Replicate |
| **Model IDs** | `fal-ai/nano-banana-pro` · `gpt-image-2` |
| **API pricing** | $0.04/image · $0.002/1K tokens |
| **Token counts** | 12,400 tokens · input/output split |
| **Provider invoices** | Per-call cost breakdown |
| **Routing logic** | "Routed to FAL because…" |
| **Rate limits** | API quota · concurrent job caps |

---

## Always Founder-Facing

| Category | Examples |
|----------|----------|
| **Production language** | Production Estimate™ · assemble · produce |
| **Abstract cost** | Estimated Production Cost™ $2.48 |
| **Time** | 2m 12s |
| **Reuse counts** | Assets Reused™ 8 |
| **Savings** | Estimated Savings™ $4.86 |
| **Complexity** | Medium |
| **Orb WHY** | Blueprint compatibility · reuse wins |

---

## Internal vs Founder Planes

```
┌─────────────────────────────────────┐
│  FOUNDER PLANE (Production Estimate) │
│  Cost · time · reuse · savings       │
│  NO providers · NO tokens · NO API   │
└─────────────────┬───────────────────┘
                  │ one-way summary only
┌─────────────────▼───────────────────┐
│  OPERATIONS PLANE (admin/internal)   │
│  Provider routing · build reports    │
│  Never rendered in estimate card     │
└─────────────────────────────────────┘
```

---

## Copy Audit Rules

Before shipping any estimate UI:

| Check | Pass criteria |
|-------|---------------|
| Provider grep | Zero provider names in founder strings |
| Token grep | Zero token language |
| Model grep | Zero model slugs |
| Dollar context | Always "production cost" never "API cost" |

---

## Relationship to GPU Generation Strategy™

[GPU Generation Strategy™](../marketplace/gpu-generation-strategy.md) governs **when** GPU runs.

Production Estimates™ govern **how founders understand scope** when GPU may run — without naming GPU.

---

## Violation Response

If estimate pipeline accidentally surfaces provider data:

1. Strip before founder render
2. Log internal incident
3. Re-issue estimate without technical fields

---

_Forbidden Exposure™ — production studio veil over infrastructure._
