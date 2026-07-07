# 07 — Personalized Rituals

**Engine Module:** `studio.founder-journey.v1.personalized-rituals`  
**Status:** Stage-aware ritual adaptation  
**Philosophy:** Every recurring experience adapts to founder style and stage.

---

## Design Principle

> Founder Journey personalizes **platform rituals** — not by adding settings screens, but by adapting behavior depth · duration · tone · teaching vs anticipating.

---

## Ritual Registry

| Ritual | Engine | Personalization Levers |
|--------|--------|------------------------|
| **Walk the Business™** | walk-the-business + adaptive-walk | Length · teaching · stops · Orb phase |
| **Walk the Room™** | walk-the-room | Critique depth · preview eagerness |
| **Critique Sessions™** | critique-sessions | Braintrust size · debate intensity |
| **Executive Briefings™** | future · walk conclusion extended | Strategic depth |
| **Learning Reviews™** | post-session learning | Evidence depth |
| **Celebrations™** | executive moments | Ceremony weight |
| **Reflection Sessions™** | reflection (09) | Prompt style · frequency |

---

## Ritual Personalization Bundle

```yaml
RitualPersonalizationBundle:
  founderId: string
  primaryStage: FounderStageId
  orbPhase: OrbRelationshipPhase

  rituals:
    - ritualId: string
      adaptations:
        durationBias: enum           # shorter · standard · extended
        teachingLevel: number        # 0–1
        anticipationLevel: number
        celebrationWeight: number
        challengeEnabled: boolean
        defaultScope: string
      rationale: string
```

Consumed at session start by each ritual orchestrator.

---

## Stage → Ritual Examples

### Dreaming / Building

| Ritual | Adaptation |
|--------|------------|
| Walk the Business | Longer · explains each department |
| Walk the Room | More teaching · fewer debates |
| Critique Sessions | More specialists explain why |
| Reflection | Lighter · encouraging prompts |

### Scaling / Leading

| Ritual | Adaptation |
|--------|------------|
| Walk the Business | Shorter priority walks · more delegate |
| Walk the Room | Faster to action mode |
| Critique Sessions | Braintrust challenges more |
| Reflection | Quarterly deep sessions |

### Legacy

| Ritual | Adaptation |
|--------|------------|
| Walk the Business | Chronicle stops · Founder Walk integration |
| Reflection | Dominant · succession prompts |

---

## Founder Profile Overlay

| Profile Field | Ritual Effect |
|---------------|---------------|
| `verbosityPreference: minimal` | Shorter Orb across all rituals |
| `reviewDepth: deep` | Longer Walk the Room paths |
| `favoriteRituals: walk-the-room` | Orb suggests critique when appropriate |
| `delegationAffinity: high` | Briefs emphasize delegate queue |

---

## Adaptation Directives

```yaml
AdaptationDirective:
  targetSubsystem: string
  directiveType: enum
  payload: object
  validUntil: ISO8601 | null
  priority: number
```

Example:

```yaml
targetSubsystem: adaptive-walk
directiveType: reduce-teaching
payload: { teachingLevel: 0.2 }
```

Subsystems **must** respect Founder Journey directives unless safety/crisis overrides.

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Same 25-minute walk forever | Ignores maturity |
| Hide rituals from Scaling founders | Paternalistic |
| Force reflection weekly | Respects capacity |

---

_Next: [08 — Milestones](./08_MILESTONES.md)_
