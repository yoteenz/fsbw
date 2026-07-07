# 01 — Journey Overview

**Engine Module:** `studio.founder-journey.v1.overview`  
**Status:** Canonical subsystem definition

---

## What Is Founder Journey™?

Founder Journey™ is the **lifelong business evolution intelligence system** — understanding where a founder is in their journey and adapting every Studio OS experience accordingly.

> Businesses evolve. Founders evolve. Leadership evolves. Studio OS evolves alongside them.

---

## Core Philosophy

> Software should not remain static while businesses transform. The platform should feel like a **mentor that grows with its founder**.

| Static Software | Founder Journey |
|-----------------|-----------------|
| Same onboarding forever | Stage-appropriate guidance |
| Same Orb tone year 5 as day 1 | Relationship deepens |
| Same HQ layout at $1M and $100M | Headquarters tells growth story |
| Usage badges | Meaningful business milestones |
| Tracks tasks | Develops leaders |

---

## Mission

Founder Journey understands and adapts:

- Company maturity
- Founder maturity
- Leadership style
- Decision-making patterns
- Business complexity
- Organizational growth
- Long-term vision

**Everything** inside Studio OS becomes more appropriate as these evolve.

---

## Dual Evolution Model

```
COMPANY EVOLUTION          FOUNDER EVOLUTION
(business signals)         (behavior · decisions · reflection)
        ↓                           ↓
        └───────────┬───────────────┘
                    ↓
           FOUNDER JOURNEY™
                    ↓
        Platform adaptation layer
```

Company and founder evolve **together** — not always in sync. A Scaling company may have a founder revisiting Building-stage creative habits.

---

## Inputs

```yaml
FounderJourneyInput:
  founderId: string
  companyId: string
  portfolioId: string | null          # multi-brand

  # Company signals
  companyMaturity: CompanyMaturitySnapshot
  headquartersState: HeadquartersStateSnapshot
  revenueStage: RevenueStageSnapshot
  teamSize: TeamSnapshot
  departmentInventory: string[]
  automationMaturity: number

  # Founder signals
  behaviorHistory: FounderBehaviorHistory
  decisionPatterns: DecisionPatternSnapshot
  ritualEngagement: RitualEngagementSnapshot
  reflectionResponses: ReflectionSnapshot[]
  chronicleEvents: ChronicleEvent[]

  # Genome
  companyGenome: CompanyGenomeSnapshot
  leadershipDNA: LeadershipDNASnapshot | null
  foundersPromise: FoundersPromiseSnapshot | null
```

---

## Outputs

```yaml
FounderJourneyOutput:
  journeyId: string
  computedAt: ISO8601

  founderStages: FounderStageAssessment[]    # may be multiple simultaneous
  primaryStage: FounderStageId
  stageConfidence: number

  founderProfile: FounderProfile
  orbRelationshipPhase: OrbRelationshipPhase
  headquartersEvolutionTier: HQEvolutionTier
  ritualPersonalization: RitualPersonalizationBundle
  milestoneState: MilestoneState
  reflectionSchedule: ReflectionPrompt[]

  adaptationDirectives: AdaptationDirective[]   # consumed by subsystems
```

---

## Lifecycle

```
CONTINUOUS OBSERVATION
    ↓
SIGNAL_INGESTION (business · behavior · decisions · reflection)
    ↓
STAGE_ASSESSMENT (02) — flexible · non-rigid
    ↓
PROFILE_UPDATE (04)
    ↓
CHRONICLE_APPEND (10) — significant events
    ↓
ADAPTATION_DIRECTIVES → subsystems
    ↓
PERIODIC_REFLECTION (09) — quarterly · stage-triggered
    ↓
MILESTONE_RECOGNITION (08) — meaningful moments
```

Founder Journey runs **continuously** — not only at login.

---

## Guidance Stages ≠ Achievements

Stages (Dreaming · Building · Launching · Growing · Scaling · Leading · Diversifying · Legacy) are **guidance** — not gamified levels.

| Allowed | Forbidden |
|---------|-----------|
| Multiple simultaneous stages | Single locked level |
| Revisit earlier stages | "You downgraded" shame |
| AI-inferred from behavior | Arbitrary revenue gate only |
| Stage informs tone | Stage blocks features punitively |

---

## Relationship to Company Maturity Engine (M52)

| Company Maturity Engine | Founder Journey |
|-------------------------|-----------------|
| Organizational domains · diagnostics | Founder-centric evolution |
| Company blueprint · import | Leadership · chronicle · Orb |
| Architect recommendations | Ritual · HQ · mentor adaptation |

Complementary — Founder Journey consumes M52 snapshots · adds founder lens.

---

## Canonical Statement

> Together, Headquarters and Founder Journey create an operating system that **grows with both** the business and the person building it.

---

_Next: [02 — Founder Stages](./02_FOUNDER_STAGES.md)_
