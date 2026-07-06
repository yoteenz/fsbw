# Shadow Mode™ V1.0 (Milestone 102)

**Route:** `/admin/studio/shadow-mode`

## Purpose

**Shadow Mode™** allows Digital Concierges to **observe organizations before actively participating**.

> Trust should be earned. Digital Staff should learn before they automate. **Observation comes before execution.**

Studio OS earns trust through observation before automation. Every Concierge behaves like an exceptional new employee who first learns the organization before taking independent action.

## Core philosophy

- Trust should be earned
- Digital Staff should learn before they automate
- Observation comes before execution
- Nothing should happen invisibly

## Learning phases

| Phase | Name | Behavior |
|-------|------|----------|
| 1 | **Observe** | Watch workflows · study decisions · learn patterns · no automation |
| 2 | **Recommend** | Suggest improvements · highlight opportunities · founder approval required |
| 3 | **Assist** | Perform portions of approved workflows · request confirmation before completion |
| 4 | **Automate** | Execute recurring workflows independently within approved boundaries |

Phase resolution is driven by the **Confidence Engine** and founder-defined thresholds.

## Confidence Engine

Every Concierge builds confidence over time across four dimensions:

- **Knowledge Confidence** — understanding of organization, brain, and wisdom
- **Workflow Confidence** — familiarity with recurring processes
- **Decision Confidence** — alignment with executive council and trust framework
- **Automation Readiness** — composite readiness for independent execution

Studio OS **never automates workflows** until confidence reaches founder-defined thresholds (default **85%**).

API: `computeConciergeConfidence()` · `resolvePhaseFromConfidence()` · `setConciergeAutomationThreshold()`

## Transparency

Founders should always know:

- What was observed
- What was learned
- What can now be automated
- Why confidence increased

The **Transparency Log** records every phase transition and confidence change. Nothing happens invisibly.

## Integration

- Syncs from **Profession Brain™** · **Memory Engine™** · **Wisdom Capture™** · **Executive Council™** · **Business Discovery Blueprint** · **Concierge Layer**
- Command Dock: **`resolveShadowModeAdvice()`** · **`buildProactiveShadowSuggestion()`** on `/shadow-mode` route
- Brand voice: *"Observe first. Automate later."*

## UI

**ShadowModeWorkspace** — 4 tabs:

1. **Shadow Overview** — trust score · concierges in shadow · ready to automate
2. **Learning Phases** — phase distribution · per-concierge phase cards
3. **Confidence Engine** — dimension scores · automation thresholds
4. **Transparency Log** — observed · learned · can automate · confidence reason

Accent: indigo `#4F46E5`

## Core module

**`src/studio-os-core/shadow-mode/`**

- `constants.ts` — phases · confidence dimensions · thresholds · philosophy
- `types.ts` — `ConciergeShadowProfile` · `ShadowTransparencyEntry` · `OrganizationShadowModeProfile`
- `confidence-engine.ts` — computes confidence · resolves phase
- `shadow-builder.ts` — builds org profile from Digital Executive roster
- `store.ts` — `syncShadowModeFromSources()` · `ensureOrganizationShadowModeProfile()` · `setConciergeAutomationThreshold()`
- `dock-advisor.ts` — Command Dock advice + proactive suggestions
- `bootstrap.ts` · `index.ts`

Demo localStorage: `studioOsShadowMode_v1`
