# Headquarters Principles™ — Platform Guide

**Constitutional basis:** ARTICLE-C04  
**Route:** `/admin/studio/headquarters-principles`  
**Core:** `src/studio-os-core/headquarters-principles/`

---

## Purpose

Studio OS is **Company Headquarters™**, not an admin dashboard. This platform enforces ARTICLE-C04:

1. **Headquarters Principle™** — replace dashboard paradigm with living executive headquarters.
2. **Proof Before Expansion Principle™** — subsystems prove internal value before external platform release.

---

## Module structure

| Path | Responsibility |
|------|----------------|
| `/terminology` | Constitutional vocabulary (Dashboard → Headquarters™, etc.) |
| `/routing` | Founder arrival and spatial routing philosophy |
| `/headquarters` | Executive Atrium™, Founder Office™, Department Wings™, zones |
| `/maturity/stages` | Platform Maturity Model™ (4 stages) |
| `/maturity/registry` | Subsystem maturity records |
| `/maturity/readiness` | Readiness score computation (8 dimensions) |
| `/maturity/promotion-gate` | Expansion eligibility enforcement |
| `/briefing` | Daily Briefing™ for Executive Atrium |
| `/orb` | Headquarters Advisor™ Orb integration |
| `/persistence` | localStorage registry (`headquartersPrinciples_v1`) |

---

## Constitutional terminology

| Legacy | Constitutional |
|--------|----------------|
| Admin Dashboard | Company Headquarters™ |
| Dashboard Widgets | Workspaces™ |
| Navigation Menu | Atlas™ |
| Notifications | Executive Advisories™ |
| Reports | Intelligence Briefings™ |
| Settings | Operations Rooms™ |
| Assistant | Orb™ |

Use `resolveConstitutionalTerm()` and `translateFounderFacingLabel()` in founder-facing UI.

---

## Platform Maturity Model™

```text
Internal Tool → Founder Workflow → Company Capability → Platform Product
```

Every subsystem record stores:

- `currentStage`
- `internalValidation`
- `founderUsage` / `companyUsage`
- `platformReadiness` (0–100)
- `readinessDimensions` (8 weighted scores)
- `dependencies`
- `expansionEligible` + `expansionBlockers`

---

## Readiness score dimensions

1. Founder adoption (15%)
2. Daily usage (15%)
3. Business impact (12%)
4. Technical stability (14%)
5. Architectural completeness (12%)
6. Integration quality (12%)
7. User delight (10%)
8. Documentation completeness (10%)

**Constitutional gate:** readiness ≥ **75** and stage ≥ **Company Capability** before external expansion.

---

## Expansion gate API

```typescript
import {
  canPromoteToPlatformProduct,
  assertPlatformExpansionAllowed,
  constitutionalExpansionSummary,
} from '@/studio-os-core/headquarters-principles';

const gate = canPromoteToPlatformProduct(subsystemRecord);
if (!gate.allowed) {
  // Block external release — proof incomplete
}
```

---

## Headquarters zones

- Executive Atrium™ — `/admin/studio/overview`
- Founder Office™ — `/admin/studio/chief-of-staff`
- Mission Control™ — `/admin/studio/world/command-center`
- Daily Briefing™ — `/admin/studio/headquarters-principles`
- Atlas™ — `/admin/studio/world-atlas`
- Orb™ — contextual at Executive Atrium

---

## Graduation path (internal → platform)

1. **Internal Tool** — solves a real Studio OS operational need.
2. **Founder Workflow** — founder uses it daily to lead.
3. **Company Capability** — stable, integrated, measurable value.
4. **Platform Product** — only after constitutional readiness passes.

Document every graduation decision in the Codex and Institute review pipeline.

---

## Admin workspace

**HeadquartersPrinciplesWorkspace** at `/admin/studio/headquarters-principles`

Hook: `useHeadquartersPrinciplesState()`

Tabs: Daily Briefing™, Platform Maturity, Readiness Scores, Constitutional Terms, Headquarters Zones.

---

## Related docs

- [ARTICLE-C04](../codex/ARTICLE_C04_HEADQUARTERS_PROOF_BEFORE_EXPANSION.md)
- [Headquarters Engine](../headquarters-engine.md)
- [Institute Platform](../institute/INSTITUTE_PLATFORM.md)
