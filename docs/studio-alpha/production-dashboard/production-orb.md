# Production Orb™

**Module:** `studio-alpha.production-dashboard.v1.production-orb`  
**Status:** Internal production intelligence narrator

---

## Principle

> Even Studio Alpha™ has an Orb.

The **Production Orb™** reports manufacturing state — bottlenecks · budget · reuse opportunities — for operators, not founders.

Distinct from founder-facing Orb in Studio OS.

---

## Production Orb Briefing Schema

```yaml
ProductionOrbBriefing:
  generatedAt: ISO8601
  headline: string
  sections:
    currentQueue: QueueSummary
    bottlenecks: BottleneckReport[]
    budgetRisks: BudgetRisk[]
    blueprintOpportunities: BlueprintOpportunity[]
    assetReuseOpportunities: ReuseOpportunity[]
    goldenBuildReady: DepartmentReady[]
    pendingFounderApprovals: ApprovalPending[]
  recommendations: string[]
```

---

## Reporting Domains

### Current Queue

> *"4 jobs generating · 12 waiting · 2 blocked on Lighting System™ dependency."*

### Production Bottlenecks

| Bottleneck type | Example |
|-----------------|---------|
| Dependency chain | Capital Vault™ waiting on Environment Shell™ |
| Approval backlog | 6 outputs waiting founder approval > 48h |
| Provider latency | FAL queue avg 45s — above baseline |
| Retry cluster | 3 failures on landmark layer — review prompts |

### Budget Risks

> *"CDS burn rate 18% above plan this week. Projected $400 overrun at current pace."*

### Blueprint Opportunities

> *"Editorial Luxury Blueprint™ compatible with 3 incomplete departments — est. savings $2.40."*

### Asset Reuse Opportunities

> *"436-reuse Editorial Luxury Lighting™ available for Finance Capital Vault™ — skip $0.62 generation."*

### Departments Ready For Golden Build™

> *"Creative Direction Studio™ — all required layers approved. Ready for Golden Build™ certification gate."*

### Pending Founder Approvals™

> *"Hiring Talent Observatory™ landmark layer — waiting founder approval 36h."*

---

## Canonical Briefing Example

```
Production Orb™ — Studio Alpha™ Morning Brief

"Good morning. Studio World™ is 34% complete.

Three departments are ready for Golden Build™ review.
I've identified $4.20 in reuse savings across Finance and Hiring
if we apply Editorial Luxury Blueprint™.

Budget is at risk for Creative Direction — recommend pausing
optional Mood Wall refinements until Story Table™ certifies.

Current queue: Lighting System™ generating, Capital Vault™ queued."
```

---

## Tone

| Founder Orb | Production Orb™ |
|-------------|-----------------|
| Creative Director coaching | Technical Director reporting |
| Abstract production $ | Can cite GPU · queue · dependencies |
| Never provider names | May cite provider for operators |
| Encouraging | Direct · actionable |

---

## Trigger Points

| Event | Orb speaks |
|-------|------------|
| Dashboard open | Morning brief |
| Job failure cluster | Bottleneck alert |
| Budget at risk | Budget warning |
| High-ROI reuse found | Optimization nudge |
| Golden Build ready | Certification prompt |

---

## Integration

| System | Feeds Orb |
|--------|-----------|
| [Production Queue](./production-queue.md) | Queue summary |
| [Internal Budget](./internal-budget.md) | Budget risks |
| [Optimization Center](./optimization-center.md) | Opportunities |
| [Department Analytics](./department-analytics.md) | Golden Build readiness |
| [Creative Approval Pipeline™](../../studio-os/creative-direction-pipeline/) | Pending approvals |

---

_Production Orb™ — the Technical Director in the room._
