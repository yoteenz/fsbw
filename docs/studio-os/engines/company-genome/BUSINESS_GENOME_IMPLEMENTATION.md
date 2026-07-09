# Company Genome™ Business Infrastructure

Living business dependency graph for Frontal Slayer and reusable Studio OS company modeling.

## Runtime module

```
src/studio-os-core/company-genome/
├── business-types.ts
├── business-constants.ts
├── business-store.ts
├── engine.ts
├── bootstrap-business.ts
├── company-registry/
├── business-systems/
│   ├── registry.ts
│   └── seeds/frontal-slayer.ts
├── business-dependencies/
│   └── graph.ts
├── business-flows/
│   └── engine.ts
├── business-events/
│   └── registry.ts
├── business-risks/
│   └── registry.ts
└── business-opportunities/
    ├── automation-registry.ts
    └── ai-opportunity-registry.ts
```

## Registries

| Registry | Purpose |
|---|---|
| Company Registry™ | Organization identity, thesis, engines, growth loop |
| Business System Registry™ | Systems with owners, data, events, rules, scores |
| Dependency Graph™ | Upstream/downstream edges between systems |
| Operational Flow Engine™ | Revenue, customer, founder, operational flows |
| Business Event Registry™ | Produced/consumed business events |
| Risk Registry™ | SPOFs, bottlenecks, duplicates, missing systems |
| Automation Registry™ | Ranked automation opportunities |
| AI Opportunity Registry™ | Near/mid/long-term AI readiness map |

## Admin UI

Route: `/admin/studio/company-genome`

First tab: **BUSINESS GENOME · LIVING** with eight visualization modes:

- Interactive Company Genome™
- Dependency Graph
- Revenue Flow Map
- Customer Journey Graph
- Founder Workflow Map
- Automation Opportunity Map
- Operational Risk Map
- AI Opportunity Map

## Storage

Scoped per workspace: `studioOsBusinessCompanyGenome_v1` via `readScopedStore` / `writeScopedStore`.

Frontal Slayer seed loads automatically when workspace is `frontal-slayer`.

## Reusability

`buildBusinessGenomeSeed(orgId)` returns empty scaffold for unknown orgs and full Frontal Slayer genome for `frontal-slayer`. Future workspaces add their own seed under `business-systems/seeds/`.

## Blueprint source

Business architecture canon: `docs/frontal-slayer/COMPANY_GENOME.md`
