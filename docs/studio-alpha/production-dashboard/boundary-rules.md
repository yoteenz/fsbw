# Boundary Rules™

**Module:** `studio-alpha.production-dashboard.v1.boundary`  
**Status:** Mandatory separation — internal vs Studio OS

---

## Law

> This dashboard is **NOT** part of Studio OS. It is **NOT** customer-facing.

---

## Two Planes

```
┌─────────────────────────────────────────────────────────┐
│  STUDIO OS — FOUNDER / CUSTOMER PLANE                    │
│  Headquarters · departments · Creative Budgets™          │
│  Abstract production $ · Efficiency Score™ · Orb coaching │
│  NEVER: FAL · tokens · GPU invoices · internal queue     │
└───────────────────────────┬─────────────────────────────┘
                            │ one-way sanitized rollup only
┌───────────────────────────▼─────────────────────────────┐
│  STUDIO ALPHA™ — INTERNAL PRODUCTION PLANE               │
│  Production Dashboard™ · Generation Analytics™           │
│  FAL · models · tokens · GPU $ · Asset ROI™ truth        │
│  NEVER: customer routes · founder HQ · public API          │
└─────────────────────────────────────────────────────────┘
```

---

## What Studio Alpha™ MAY Show (Internal)

| Category | Examples |
|----------|----------|
| GPU providers | FAL · OpenAI · Runway |
| Model IDs | `fal-ai/nano-banana-pro/edit` |
| Token usage | 2.4M tokens/month |
| GPU cost | $4,218.44 actual |
| Per-job invoices | $0.04 provider + $0.38 production markup |
| Internal queue | Full Production Queue™ |
| Asset ROI™ raw | Effective cost per use |
| Failure diagnostics | Provider errors · retry logs |

---

## What Studio OS Shows (Founder)

| Category | Examples |
|----------|----------|
| Production Estimate™ | Scope before job |
| Creative Budget™ | Monthly capacity |
| Efficiency Score™ | Reuse performance |
| Saved Through Reuse | Abstract savings $ |
| Orb coaching | Creative Director tone |

See [Creative Budgets forbidden exposure](../../studio-os/creative-budgets/forbidden-exposure.md) · [Production Estimates forbidden exposure](../../studio-os/studio-production-estimates/forbidden-exposure.md).

---

## Rollup Mapping (Internal → Founder)

| Internal truth | Founder abstraction |
|----------------|---------------------|
| GPU $0.04 | Production cost line item |
| 12,400 tokens | Estimated time 2m 12s |
| FAL nano-banana-pro | "Production pipeline" |
| Queue position 4 | "Producing…" |
| Asset ROI $0.0004/use | (not shown — efficiency aggregate only) |
| Internal budget burn | Monthly Budget™ spent |

**One-way.** Founders never drill into internal dashboard.

---

## Route & Auth Separation

```yaml
StudioAlphaRoutes:
  prefix: /internal/studio-alpha/
  auth: platform-operator | studio-alpha-role
  forbiddenHosts: customer-domains · public-docs

StudioOsRoutes:
  prefix: /admin/studio/ · /admin/headquarters/
  auth: founder · org-member
  mustNotRender: generation-analytics · asset-roi-internal · production-queue-raw
```

---

## Registration Rules

| Rule | Requirement |
|------|-------------|
| System Registry™ | Register as `studio-alpha.*` not `studio-os.*` |
| Documentation Registry™ | Internal docs namespace |
| Component Registry™ | No reuse of founder dashboard components for internal GPU panels |
| Mission Control | Founder Mission Control ≠ Studio Alpha Production Dashboard™ |

---

## Violation Response

If internal data surfaces in founder UI:

1. Strip before render
2. Log security incident
3. Audit copy · routes · API responses
4. Re-issue founder view without internal fields

---

_Boundary Rules™ — two planes, one civilization._
