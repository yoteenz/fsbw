# Performance Philosophy™ — Reuse Over Regeneration

**Module:** `studio.asset-intelligence.v1.performance`  
**Status:** Token · compute · time · quality economics

---

## Principle

> Reuse should always be preferred over regeneration.

---

## Benefits of Remember-First

| Benefit | Mechanism |
|---------|-----------|
| **Lower token usage** | Skip prompt expansion + provider for exact reuse |
| **Lower compute** | No GPU/API call when Registry link suffices |
| **Faster delivery** | Link artifact in milliseconds vs minutes |
| **Better consistency** | Same approved asset · same visual result |
| **Higher visual quality** | Reuse golden-tier assets · avoid regen variance |
| **Shared visual language** | Company DNA™ compounds |
| **Reduced founder approvals** | Proven assets skip re-review when context matches |

---

## Cost Model (Conceptual)

Each Registry item stores **Performance Cost™** from original generation:

```yaml
PerformanceCost:
  tokens: number
  computeUnits: number
  providerCalls: number
  wallClockMinutes: number
  estimatedUsd: number | null
```

Reuse savings = sum of avoided costs:

```
Savings = PerformanceCost(original) - PerformanceCost(modify delta)
```

Modify path saves partial — never zero — but always less than full generate.

---

## Targets

| Metric | Mature Org Target |
|--------|-------------------|
| Reuse rate (% requests) | ≥ 40% |
| Exact reuse rate | ≥ 25% |
| Token savings per department compile | ≥ 30% |
| Founder gate time (median) | < 30s with good recommendations |
| DNA coherence score | ≥ 80 |

Aligns with Reuse Engine Build Health dimension ([reuse-engine.md](../engines/studio-asset-registry/reuse-engine.md)).

---

## Scene Stack™ Performance

Layered architecture multiplies savings:

| Without Intelligence | With Intelligence |
|---------------------|-------------------|
| Regen full scene for lighting dislike | Regen lighting layer only |
| Regen lighting from scratch | Reuse lighting from sibling station |
| 6 provider calls per station | 1–2 calls · 4 links |

Scene Stack™ + Asset Intelligence = **surgical economics**.

---

## Quality vs Cost

Reuse is not a quality compromise when:

- Asset is **approved** golden tier
- Compatibility ≥ Close Match™
- DNA alignment confirmed

Regeneration introduces **variance risk** — reuse preserves proven output.

---

## Reporting

Build reports and Mission Control surfaces:

| Field | Example |
|-------|---------|
| `reusePercentage` | 57% |
| `tokensSaved` | 124,000 |
| `providerCallsAvoided` | 14 |
| `estimatedMinutesSaved` | 42 |

---

## When Regeneration Is Correct

Performance philosophy does not **forbid** generation:

- Novel creative direction (founder choice)
- No candidate above floor
- Upgrade™ for resolution/quality
- Intentional DNA evolution

**Generate when necessary** — not by default.

---

## Platform Value Compounding

Every approved asset increases platform value:

```
Org A approves lighting rig
         ↓
Reused in Org A departments
         ↓
Optional Marketplace publish
         ↓
Org B licenses · reuses
         ↓
Platform creative capital grows
```

Studio OS becomes **more valuable** with every approval — unlike stateless AI tools.

---

## Final Performance Law

```
cost(request) = searchRegistry(request) + founderGate(request) + generateIfNecessary(request)

where generateIfNecessary → 0 when reuse succeeds
```

**Search is cheap. Generation is expensive. Memory is free.**

---

_Performance Philosophy™ — remember first, spend last._
