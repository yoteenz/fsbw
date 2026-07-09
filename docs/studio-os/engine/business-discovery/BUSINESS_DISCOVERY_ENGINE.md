# Business Discovery™ — Implementation Guide

**Status:** Implementation foundation  
**Article:** BD01  
**Core package:** `src/studio-os-core/business-discovery/`

---

## Module layout

| Module | Path | Responsibility |
| --- | --- | --- |
| **Discovery Sessions** | `discovery-sessions/` | Session schemas, localStorage persistence, CRUD |
| **Discovery Questions** | `discovery-questions/` | Question Engine™ — phase questions, next-question resolution |
| **Discovery Progress** | `discovery-progress/` | Interactive Progress™, timeline, founder journey |
| **Relationship Engine** | `relationship-engine/` | Systems, relationships, dependencies inference |
| **Discovery Insights** | `discovery-insights/` | Insight Generator™ — phase insights, founder moments |
| **Discovery Engine** | `discovery-engine/` | Orchestration, Business Risk Analyzer™, Automation Opportunity Engine™ |
| **Genome Builder** | `genome-builder/` | Company Genome Generator™ — operational/revenue/decision graphs |
| **Company Genome** | `company-genome/` | Genome facade exports |
| **Headquarters Generator** | `headquarters-generator/` | Headquarters Generator™ — departments, rooms, missions, Orb config |
| **Visual Experience** | `visual-experience/` | Discovery Timeline™, Dependency Graph™, HQ preview |
| **Orb Integration** | `orb-integration/` | Strategist recommendations during onboarding |

Architecture canon (`phases.ts`, `outputs.ts`, `architecture.ts`) remains the source of truth for phase definitions.

---

## Discovery session model

Every discovery session stores:

- Session ID, organization ID, status
- Founder profile (vision, mission, values, goals, decision/leadership style)
- Company profile (model, offers, customers, revenue, operations)
- Phase progress and responses
- Discovered systems, relationships, dependencies
- Insights, recommendations, risks
- Generated objects, Headquarters, departments, rooms, missions
- Orb configuration
- Company Genome™ (when enough evidence exists)

---

## Engines

| Engine | Entry point | Role |
| --- | --- | --- |
| **Discovery Engine™** | `syncBusinessDiscovery()` | Full orchestration pipeline |
| **Question Engine™** | `resolveNextQuestions()` | Unanswered questions for current phase |
| **Relationship Engine™** | `analyzeRelationships()` | Systems + dependency graph inputs |
| **Company Genome Generator™** | `generateCompanyGenome()` | Business Genome™ output |
| **Insight Generator™** | `generatePhaseInsights()` | Founder moments and discoveries |
| **Business Risk Analyzer™** | `analyzeBusinessRisks()` | Operational risks from evidence |
| **Automation Opportunity Engine™** | `detectAutomationOpportunities()` | Shadow Mode candidates (awaiting approval) |
| **Headquarters Generator™** | `generateHeadquartersPackage()` | HQ, wings, rooms, missions, Orb config |

---

## Visual experience

`buildDiscoveryVisualExperience()` supports:

- **Discovery Timeline™** — session start, phase completion, insights, genome, HQ
- **Interactive Progress™** — per-phase completion bars
- **Business Genome™** — live genome preview
- **Dependency Graph™** — operational graph nodes/edges
- **Founder Journey™** — phase highlights and founder moments
- **Genome Completion™** — completion percentage
- **Headquarters Preview™** — generated HQ proposal

---

## React hook

```typescript
import { useBusinessDiscoveryState } from '@/hooks/useBusinessDiscoveryState';

const { session, visualExperience, nextQuestions, topInsight, refresh } =
  useBusinessDiscoveryState(organizationId, {
    companyName: 'Acme Advisory',
    industryId: 'professional-services',
  });
```

---

## Recording answers

```typescript
import { recordDiscoveryAnswer } from '@/studio-os-core/business-discovery';

const state = recordDiscoveryAnswer(
  organizationId,
  'vision',
  'founder-discovery',
  'Build the most trusted advisory firm in our region.'
);
```

Career Worlds and organization onboarding UIs should call `recordDiscoveryAnswer()` or `syncBusinessDiscovery()` — never hardcode company-specific logic in the engine.

---

## Orb integration

The Orb participates as strategist during discovery:

- Surfaces next discovery questions when onboarding is incomplete
- Celebrates founder moments when insights cross confidence thresholds
- Recommends Headquarters preview when genome evidence is sufficient

Integrated via `buildBusinessDiscoveryOrbRecommendations()` in the main Orb recommendation engine.

---

## Persistence

- **Storage key:** `studio-os:business-discovery`
- **Event:** `studio-os:business-discovery-updated`
- **Adapter interface:** `BusinessDiscoveryPersistenceAdapter` for future Supabase sync

---

## Relationship to Business Discovery Blueprint™

| System | Role |
| --- | --- |
| **Business Discovery™** (this package) | Six-phase consulting onboarding → Company Genome™ |
| **Business Discovery Blueprint™** | Nine-chapter living organizational memory (M90) |

Both integrate via World Graph edges. New onboarding UI should prefer Business Discovery™ for the signature six-phase experience; Blueprint remains the permanent living discovery store.

---

## Related docs

- `docs/studio-os/business-discovery.md` — Master architecture
- `docs/studio-os/business-discovery-blueprint.md` — Blueprint (M90) living discovery
