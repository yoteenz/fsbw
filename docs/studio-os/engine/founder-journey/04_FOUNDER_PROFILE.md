# 04 — Founder Profile

**Engine Module:** `studio.founder-journey.v1.founder-profile`  
**Status:** Living founder intelligence model  
**Philosophy:** Studio OS builds a Founder Profile that continuously evolves.

---

## Design Principle

> The Founder Profile is a **living model** — not a settings form filled once. Updated from behavior · decisions · reflection · rituals.

---

## Profile Schema

```yaml
FounderProfile:
  founderId: string
  companyId: string
  lastUpdated: ISO8601
  version: number

  leadership:
    style: enum                      # visionary · operational · collaborative · decisive · reflective
    decisionSpeed: enum              # fast · deliberate · context-dependent
    riskTolerance: enum              # conservative · balanced · aggressive
    delegationAffinity: number       # 0–1
    challengeAppetite: enum          # wants pushback · prefers support

  creative:
    tendencies: string[]             # hands-on creative · director · delegator
    preferredDepartments: string[]
    reviewDepth: enum

  communication:
    verbosityPreference: enum
    voiceVsText: enum
    meetingTolerance: enum

  operational:
    favoriteRituals: string[]        # walk-the-business · walk-the-room · reflection
    preferredSpecialists: AIRoleId[]
    walkthroughPreferences: WalkPreferenceProfile
    alertTolerance: enum

  learning:
    learningStyle: enum              # experiential · analytical · conversational
    reflectionEngagement: number

  capacity:
    estimatedExecutiveBandwidth: enum
    multiBrandCapacity: number | null

  confidence: ProfileConfidenceMap   # per-field confidence from evidence count
```

---

## Profile Sources

| Source | Updates |
|--------|---------|
| Adaptive Walk memory | Routes · skips · dwell |
| Critique Sessions memory | Creative philosophy · debate resolution |
| Walk the Room Room Memory | Spatial decisions |
| Founder decisions | Approval · rejection patterns |
| Reflection sessions (09) | Self-reported growth |
| Orb conversations | Stated preferences |
| Milestones (08) | Life/business turning points |

**Merge rule:** Behavioral evidence > single self-report > default Genome inference.

---

## Profile Consumers

| Consumer | Uses Profile For |
|----------|------------------|
| Adaptive Walk | Mode bias · Orb verbosity · delegation |
| Walk the Business | Stop order · brief depth |
| Walk the Room | Braintrust roster · debate intensity |
| Studio Orb | Relationship phase (05) |
| Critique Sessions | Specialist emphasis |
| Onboarding | Stage-appropriate depth |
| HQ Evolution | Unlock pacing |

---

## Privacy & Boundaries

| Rule | Detail |
|------|--------|
| Per-founder within company | Co-founders have separate profiles |
| Never sold or shared cross-company | Isolated |
| Founder can view profile via Orb | "What do you know about how I lead?" |
| Founder can correct | "I'm not risk-averse" → updates with override weight |

---

## Profile Drift Detection

When behavior contradicts profile > 5 times:

```
Orb: "You've been approving faster than your usual deliberate style — 
      should I adjust how I prepare decisions for you?"
```

Founder confirms → profile update · Chronicle note optional.

---

## Shared Executive Profile Service

Implementation recommendation: unify `FounderProfile` with Adaptive Walk `AdaptiveWalkMemoryProfile` and Critique `FounderPreferenceProfile` under `FounderJourneyProfile` canonical store.

---

_Next: [05 — Orb Relationship](./05_ORB_RELATIONSHIP.md)_
