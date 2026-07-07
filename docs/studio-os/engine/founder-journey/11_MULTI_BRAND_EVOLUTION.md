# 11 — Multi-Brand Evolution

**Engine Module:** `studio.founder-journey.v1.multi-brand`  
**Status:** Portfolio founder intelligence  
**Philosophy:** Headquarters evolves into an ecosystem — not isolated businesses.

---

## Design Principle

> Support founders who create **multiple businesses** — recognizing shared leadership patterns · transferable knowledge · cross-brand opportunities · operational synergies · founder capacity.

---

## Portfolio Model

```yaml
FounderPortfolio:
  portfolioId: string
  founderId: string
  companies:
    - companyId: string
      role: enum                    # primary · secondary · incubating · legacy
      headquartersId: string
      stageAssessment: FounderStageAssessment[]
      bandwidthAllocation: number   # 0–1

  sharedPatterns:
    leadershipPatterns: string[]
    transferablePlaybooks: string[]
    operationalSynergies: SynergyOpportunity[]

  capacity:
    estimatedLoad: enum             # comfortable · stretched · overextended
    orbRecommendation: string
```

---

## Cross-Brand Intelligence

| Intelligence | Example |
|--------------|---------|
| Shared leadership | Delegates marketing at Brand A · hands-on at Brand B |
| Transferable knowledge | Launch playbook from Brand A → Brand B |
| Synergy | Shared Customer Experience · unified Marketplace |
| Opportunity | "Brand A's podcast audience fits Brand B product" |
| Capacity | Orb warns overextension before crisis |

---

## HQ Ecosystem Expression

| Portfolio Maturity | HQ Expression |
|--------------------|---------------|
| Single brand | One headquarters campus |
| Multi-brand early | Portfolio campus · shared executive plaza |
| Holding company | Central HQ · brand wings · Acquisition Center |
| Serial entrepreneur | Incubator lab · multiple construction sites |

Headquarters Engine **portfolio campus** mode — Founder Journey gates complexity by capacity.

---

## Per-Brand Journey

Each company has:
- Own Company Genome
- Own Business Evolution snapshot
- Shared Founder Profile (founder-level)
- Own Chronicle entries tagged `companyId`
- Own Adaptive Walk · Walk the Business sessions

Founder Stage may differ per brand: **Leading** on mature · **Building** on new venture.

---

## Walk the Business Portfolio

```
Arrival at portfolio executive plaza
    ↓
Orb: "Brand A has a launch today. Brand B needs creative review. 
      Where shall we begin?"
    ↓
Founder selects · or priority resolver suggests
    ↓
Walk continues within selected HQ · cross-brand moments surfaced
```

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Completely siloed brands | Misses synergy value |
| Forced merger UI | Ecosystem is spatial |
| Ignore capacity limits | Founder burnout |

---

_Next: [12 — Future Evolution](./12_FUTURE_EVOLUTION.md)_
