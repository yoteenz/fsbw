# Production Dashboard™ — Master Specification

**Engine ID:** `studio-alpha.production-dashboard.v1`  
**Status:** Internal manufacturing command center

---

## The Problem

Building Studio World™ involves:

- Hundreds of departments · scenes · stations · layers · assets
- Multiple generation providers · models · retries
- Blueprint reuse vs redundant generation
- Real GPU and token costs invisible to founders but critical to production
- No single pane answering "what does Studio World™ cost?" and "what should we build next?"

Studio Alpha™ needs **ILM-grade production visibility** — not a SaaS admin panel.

---

## The Solution

**Production Dashboard™** — centralized internal command center tracking:

- Overall Studio World™ progress and cost
- Every pending and active generation job
- Per-department · per-scene · per-layer production state
- Asset ROI™ and Blueprint Analytics™
- Internal budget burn and forecast
- Full generation analytics (providers · GPU · tokens)
- Optimization recommendations
- Hierarchical roadmap from World → Asset
- Production Orb™ for bottlenecks and opportunities

---

## Core Laws

### Law 1 — Internal Only

> This dashboard is **not** part of Studio OS. Customers never see it.

Studio OS shows founders abstract production economics. Studio Alpha™ shows operators **truth**.

### Law 2 — Civilization Scale

> Studio Alpha™ is manufacturing a digital civilization — not shipping features.

Metrics track departments · scenes · Blueprints · packages — not sprint tickets.

### Law 3 — Investment Mindset

> Every asset is an investment. Every Blueprint is intellectual property.

Asset ROI™ and Blueprint Analytics™ are first-class — not afterthoughts.

### Law 4 — Purposeful Generation

> Nothing should be generated without purpose.

Optimization Center and Production Orb™ challenge redundant generation.

### Law 5 — Nothing Forgotten

> Nothing valuable should ever be forgotten.

Registry · reuse counts · generation history · golden versions are permanent.

### Law 6 — Strengthen the Platform

> Every generation should strengthen the platform.

Reuse recommendations prioritized over net-new when compatible.

---

## Audience & Access

```yaml
ProductionDashboardAccess:
  audience: studio-alpha-operators
  roles:
    - production-director
    - technical-director
    - department-lead
    - platform-engineer
  forbidden:
    - founder-facing-routes
    - customer-routes
    - studio-os-headquarters
  routePrefix: /internal/studio-alpha/production-dashboard  # future
```

---

## Master Dashboard Output

```yaml
StudioAlphaProductionSnapshot:
  snapshotId: string
  generatedAt: ISO8601
  studioWorld:
    overallProgress: StudioWorldProgress
    productionQueue: QueueItem[]
    departmentAnalytics: DepartmentAnalytics[]
    sceneAnalytics: SceneAnalytics[]
    assetRoi: AssetRoiRecord[]
    blueprintAnalytics: BlueprintAnalyticsRecord[]
    internalBudget: InternalBudgetSnapshot
    generationAnalytics: GenerationAnalyticsSnapshot
    optimizationRecommendations: OptimizationRecommendation[]
    roadmapTree: RoadmapNode
  productionOrb:
    briefing: ProductionOrbBriefing
```

---

## Relationship to Studio OS

| Studio OS (Founder) | Studio Alpha™ (Internal) |
|---------------------|--------------------------|
| Creative Budgets™ | Internal Creative Budget |
| Production Estimates™ | Actual cost + GPU truth |
| Efficiency Score™ | Asset ROI™ · Blueprint ROI™ |
| Orb coaching | Production Orb™ |
| Abstract production $ | FAL · tokens · GPU $ |

Founder plane receives **sanitized rollups only** — never raw Generation Analytics.

See [boundary-rules.md](./boundary-rules.md).

---

## Relationship to Generation Manager™

[Studio Generation Manager™](../../studio-os/engines/generation-manager/README.md) executes jobs.

Production Dashboard™ **observes and directs** — queue state · costs · retries · recommendations.

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Expose dashboard to founders | Violates internal-only law |
| Register as Studio OS module | Wrong product boundary |
| Hide GPU cost from operators | Operators need truth |
| Generate without queue entry | No production visibility |
| Skip ROI tracking on approval | Investment blindness |
| Duplicate founder Creative Budget UI | Different audience · different fields |

---

## Final Philosophy

Studio Alpha™ should feel like the production headquarters responsible for manufacturing Studio World™ itself.

Complete visibility into cost, production, efficiency, asset reuse, Blueprint growth, and long-term ROI.

Studio World™ is imagined, produced, optimized, and continuously evolved from this Mission Control.

---

_See also: [main-dashboard.md](./main-dashboard.md) · [boundary-rules.md](./boundary-rules.md) · [production-orb.md](./production-orb.md)_
