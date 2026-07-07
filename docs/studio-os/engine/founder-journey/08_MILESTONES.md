# 08 — Milestones

**Engine Module:** `studio.founder-journey.v1.milestones`  
**Status:** Meaningful business moment recognition  
**Philosophy:** Celebrate meaningful business moments — not arbitrary usage metrics.

---

## Design Principle

> Replace traditional badges with **milestones** tied to real business transformation — First Launch · First Customer · First Million — surfaced spatially in Headquarters · Chronicle · celebrations.

---

## Milestone Registry (Examples)

| Milestone | ID | Category |
|-----------|-----|----------|
| First Launch | `first-launch` | product |
| First Customer | `first-customer` | market |
| First Team Member | `first-team-member` | people |
| First Product | `first-product` | product |
| First International Sale | `first-international` | market |
| First Million Revenue | `first-million-revenue` | financial |
| First Acquisition | `first-acquisition` | portfolio |
| First Brand Expansion | `first-brand-expansion` | portfolio |
| First Marketplace Publish | `first-marketplace-publish` | platform |
| Ten Launches | `ten-launches` | product · cumulative |

Registry extensible per industry via Headquarters Engine.

---

## Milestone Schema

```yaml
Milestone:
  milestoneId: string
  displayName: string
  category: enum
  significance: enum                # transformational · major · notable

  detection:
    signalType: enum                # event · threshold · manual-founder
    rule: string

  expression:
    hqArtifact: string              # plaque · garden · sculpture
    ceremony: string
    chronicleRequired: boolean
    celebrationModeTrigger: boolean

  achievedAt: ISO8601 | null
  companyId: string
  founderId: string
```

---

## Detection vs Manual

| Method | When |
|--------|------|
| **Automatic** | First customer record · revenue threshold · launch event |
| **Founder affirmed** | Orb asks confirmation on ambiguous signals |
| **Never** | "Logged in 30 days" · "Clicked 100 times" |

---

## Milestone Expression

| Expression | Detail |
|------------|--------|
| HQ artifact | Permanent world object — Founder Walk · department plaque |
| Walk the Business moment | Celebration Mode opening (Adaptive Walk) |
| Chronicle entry | Required for transformational milestones |
| Orb acknowledgment | Once · not repeated every walk |
| Genome optional update | Major milestones may inform Company Genome story |

---

## Anti-Gamification

| Forbidden | Allowed |
|-----------|---------|
| Points · streaks · leaderboards | Meaningful moment recognition |
| Shame for unachieved | Quiet absence |
| Competing founders | Private celebration |

Integrates Founder Walk™ physical memorial philosophy — not badge grid.

---

## Milestone → Stage Influence

First Launch achieved → reduces `launching` weight · increases `growing` weight in stage assessment (02) — **inference** not announcement.

---

_Next: [09 — Reflection](./09_REFLECTION.md)_
