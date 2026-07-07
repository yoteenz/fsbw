# 02 — Session Types

**Engine Module:** `studio.critique-sessions.v1.session-types`  
**Status:** Canonical session taxonomy  
**Philosophy:** Different decisions require different tables.

---

## Design Principle

> Not every critique is the same. A launch readiness conversation needs different specialists than a brand alignment review. Session types define **purpose**, **default roster**, **agenda**, and **exit criteria**.

---

## Session Type Registry

| Session Type | ID | Primary Purpose |
|--------------|-----|-----------------|
| **Creative Direction Review™** | `creative-direction-review` | Validate strategic creative vision before production |
| **Brand Alignment Review™** | `brand-alignment-review` | Genome inevitability · identity protection |
| **Editorial Review™** | `editorial-review` | Composition · typography · editorial quality |
| **Visual Design Review™** | `visual-design-review` | Art direction · hierarchy · luxury register |
| **Marketing Review™** | `marketing-review` | Audience resonance · CTA · campaign readiness |
| **Launch Readiness Review™** | `launch-readiness-review` | Pre-ship checklist conversation (not checklist UI) |
| **Executive Review™** | `executive-review` | Cross-department impact · maturity · strategy |
| **Experience Review™** | `experience-review` | Place · immersion · delight · return intent |
| **Marketplace Certification Review™** | `marketplace-certification-review` | Trust · quality · buyer confidence |
| **Department Review™** | `department-review` | Holistic department package critique |
| **Project Retrospective™** | `project-retrospective` | Post-completion learning conversation |

---

## Session Type Profiles

### Creative Direction Review™

```yaml
CreativeDirectionReview:
  whenToSchedule:
    - New project direction approved in CDS
    - Major mood board pivot
    - Production department requests direction clarification
    - Founder initiates "direction check" via Orb
  defaultRoster:
    required: [creative-director, editorial-art-director, brand-concierge, studio-orb]
    optional: [marketing-concierge, experience-architect, strategy-concierge]
  agenda:
    - Does direction feel inevitable for this company?
    - Is the emotional register correct?
    - What downstream departments will be impacted?
    - What risks exist if we proceed as-is?
  exitCriteria:
    - Founder records direction decisions OR explicit "proceed unchanged"
    - Downstream impact acknowledged
    - Action items routed to affected departments
```

### Brand Alignment Review™

```yaml
BrandAlignmentReview:
  whenToSchedule:
    - Genome drift suspected
    - New expansion or marketplace package
    - Cross-industry inspiration introduced
  defaultRoster:
    required: [brand-concierge, creative-director, studio-orb]
    optional: [editorial-art-director, legal-concierge, accessibility-concierge]
  agenda:
    - Two-Genome swap test (would this work for another company?)
    - Voice · pacing · luxury register alignment
    - thingsWeNeverDo violations
  exitCriteria:
    - Genome alignment confirmed OR revision plan created
```

### Editorial Review™

```yaml
EditorialReview:
  whenToSchedule:
    - Content assets before publishing
    - Typography or layout decisions
    - Newsletter · landing page · reel copy review
  defaultRoster:
    required: [editorial-art-director, brand-concierge]
    optional: [marketing-concierge, accessibility-concierge]
  agenda:
    - Composition · hierarchy · readability
    - Editorial quality · intentionality
    - Anti-generic check
```

### Visual Design Review™

```yaml
VisualDesignReview:
  whenToSchedule:
    - Asset package visual pass
    - Mood board evolution
    - Department environment visual critique
  defaultRoster:
    required: [creative-director, editorial-art-director, motion-director]
    optional: [photography-director, brand-concierge]
  agenda:
    - Focal point · visual hierarchy
    - Luxury register · art direction coherence
    - Motion and still harmony
```

### Marketing Review™

```yaml
MarketingReview:
  whenToSchedule:
    - Campaign before launch
    - CTA and conversion path review
    - Audience targeting validation
  defaultRoster:
    required: [marketing-concierge, growth-strategist, brand-concierge]
    optional: [creative-director, ux-concierge]
  agenda:
    - Business outcome alignment
    - First-time visitor experience
    - Call-to-action compellingness
```

### Launch Readiness Review™

```yaml
LaunchReadinessReview:
  whenToSchedule:
    - Pre-launch for any Project output
    - Marketplace listing publish
    - Headquarters expansion go-live
  defaultRoster:
    required: [marketing-concierge, engineering-concierge, experience-architect, studio-orb]
    optional: [legal-concierge, accessibility-concierge, marketplace-concierge]
  agenda:
    - Cross-functional readiness conversation
    - Risk surfacing · dependency check
    - Founder final go/no-go dialogue
  exitCriteria:
    - Launch decision recorded
    - Blockers assigned as action items
```

### Executive Review™

```yaml
ExecutiveReview:
  whenToSchedule:
    - Cross-department strategic decisions
    - Maturity-gated features
    - Major resource allocation
  defaultRoster:
    required: [strategy-concierge, studio-orb]
    optional: [creative-director, marketing-concierge, engineering-concierge, legal-concierge]
  agenda:
    - Strategic fit · ROI · organizational impact
    - Chief of Staff escalation context
```

### Experience Review™

```yaml
ExperienceReview:
  whenToSchedule:
    - Department Runtime preview ready
    - New environment or zone design
    - Immersion regression suspected
  defaultRoster:
    required: [experience-architect, ux-concierge, creative-director]
    optional: [motion-director, audio-director, accessibility-concierge]
  agenda:
    - Nine place questions (Validation Loop 04 aligned)
    - Headquarters fantasy reinforcement
    - Return intent · delight · aliveness
```

### Marketplace Certification Review™

```yaml
MarketplaceCertificationReview:
  whenToSchedule:
    - Pre-publish Marketplace listing
    - Certification badge application
  defaultRoster:
    required: [marketplace-concierge, brand-concierge, engineering-concierge]
    optional: [experience-architect, legal-concierge]
  agenda:
    - Buyer trust · quality signals
    - Performance · compatibility
    - Certification tier recommendation
```

### Department Review™

```yaml
DepartmentReview:
  whenToSchedule:
    - Department Package complete (Generator + Compiler)
    - Major department regeneration
  defaultRoster:
    required: [creative-director, experience-architect, brand-concierge, engineering-concierge, studio-orb]
    optional: [motion-director, audio-director, accessibility-concierge, marketplace-concierge]
  agenda:
    - Per-asset and holistic department audit
    - Runtime preview walkthrough
    - Marketplace compatibility
  exitCriteria:
    - Ready for Validation Loop OR revision plan
```

### Project Retrospective™

```yaml
ProjectRetrospective:
  whenToSchedule:
    - Project marked complete
    - 30/60/90 days post-launch
    - Founder requests retrospective via Orb
  defaultRoster:
    required: [strategy-concierge, marketing-concierge, creative-director]
    optional: [growth-strategist, experience-architect]
  agenda:
    - What worked · what didn't
    - Critique recommendations vs actual outcomes
    - Genome and process learnings
  exitCriteria:
    - Post Session Learning events triggered (11)
```

---

## Multi-Session Sequences

Complex subjects may require **session chains**:

```
Department Package:
  Creative Direction Review → Experience Review → Department Review → Marketplace Certification Review

Project Launch:
  Editorial Review → Marketing Review → Launch Readiness Review

Post-Launch:
  Project Retrospective (30d) → Project Retrospective (90d)
```

**Rule:** Each session in a chain produces independent Action Items. Later sessions receive prior session memory as context.

---

## Session Selection

| Trigger | Resolver |
|---------|----------|
| Founder requests via Orb | Orb suggests type from subject + agenda |
| Validation Loop flags founder review | Suggest matching session type before gate |
| Production Engine gate | Creative Direction Review before department unlock |
| Marketplace publish flow | Marketplace Certification Review mandatory |
| Scheduled retrospective | Project Retrospective on calendar |

---

## Schema

```yaml
CritiqueSessionType:
  id: string
  displayName: string
  description: string
  defaultRoster: RosterProfile
  agenda: string[]
  exitCriteria: string[]
  typicalDuration: enum          # brief | standard | extended
  validationLoopHandoff: boolean # produces ValidationHandoff on complete
```

---

_Next: [03 — Braintrust Model](./03_BRAINTRUST_MODEL.md)_
