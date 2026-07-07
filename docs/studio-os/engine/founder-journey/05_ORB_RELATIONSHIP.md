# 05 — Orb Relationship

**Engine Module:** `studio.founder-journey.v1.orb-relationship`  
**Status:** Deepening founder–Orb partnership model  
**Philosophy:** The Orb becomes a trusted executive partner over time.

---

## Design Principle

> The founder–Orb relationship **deepens** — early teaching evolves into anticipation · delegation · challenge · strategic insight.

---

## Relationship Phases

| Phase | Typical Tenure | Orb Behavior |
|-------|----------------|--------------|
| **Onboarding Partner** | Days 1–30 | Teaches · explains · patient · high guidance |
| **Daily Guide** | Months 1–6 | Guides · suggests · learns preferences |
| **Executive Assistant** | Months 6–18 | Anticipates · prioritizes · delegates |
| **Strategic Partner** | Years 2+ | Challenges assumptions · blind spots · strategic framing |
| **Institutional Steward** | Legacy stage | Chronicle · wisdom · succession support |

Phases are **smooth gradients** — not discrete unlocks.

---

## Phase Schema

```yaml
OrbRelationshipPhase:
  phaseId: string
  depthScore: number                # 0–100 continuous
  behaviors:
    teachingIntensity: number
    anticipationLevel: number
    challengeLevel: number
    delegationProactivity: number
    strategicInsightDepth: number
  orbVoiceRegister: string          # Genome-matched
```

---

## Early Relationship

```
Orb teaches department purpose on first Walk the Business.
Orb explains Genome fields when first encountered.
Orb offers full walk scope every morning.
Orb celebrates first milestones extensively.
```

Founder Profile low confidence → more explanation.

---

## Mature Relationship

```
Orb anticipates Creative Direction first stop without asking.
Orb delegates routine marketing approvals proactively.
Orb: "You tend to over-invest in polish before launch — 
      Marketing is ready to ship. Challenge me if you disagree."
Orb surfaces blind spots from Chronicle patterns.
```

Challenge requires **trust score** — earned over time · never day-one harshness.

---

## Challenge Protocol

```yaml
OrbChallenge:
  challengeId: string
  topic: string
  evidence: string[]                # chronicle · metrics · patterns
  tone: enum                        # curious · direct · supportive
  founderResponse: enum | null
  outcome: enum                     # accepted · rejected · deferred
```

Rejected challenges lower `challengeLevel` temporarily — Orb learns.

---

## Trust Model

| Factor | Increases Trust |
|--------|-----------------|
| Consistent walk engagement | + |
| Reflection participation | + |
| Accepted Orb delegation | + |
| Ignored advice that proved right (post-learning) | + challenge carefully |
| Founder explicit "push me" | + challenge |
| Recent crisis overload | − challenge temporarily |

---

## Integration

| System | Role |
|--------|------|
| Adaptive Walk Orb Adaptation (05) | Daily tone overlay |
| Walk the Business Orb Assistant | Delivery |
| Founder Profile (04) | Inputs trust · style |
| Founder Chronicle (10) | Challenge evidence |

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Identical Orb day 1 and year 5 | Breaks journey promise |
| Harsh challenge without trust | Damages relationship |
| Sycophantic forever | No strategic partner value |
| Orb as boss | Founder authority absolute |

---

_Next: [06 — Headquarters Evolution](./06_HEADQUARTERS_EVOLUTION.md)_
