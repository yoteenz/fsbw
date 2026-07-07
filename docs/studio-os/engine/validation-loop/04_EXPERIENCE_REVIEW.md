# 04 — Experience Review

**Engine Module:** `studio.validation-loop.v1.experience-review`  
**Status:** Experiential quality evaluation system  
**Philosophy:** Does it feel like a place?

---

## Design Principle

> Experience Review evaluates whether output creates a **Headquarters fantasy** — ownership, immersion, delight, and return intent.

---

## The Nine Experience Questions

Every department must answer **yes** with evidence:

| # | Question | Evidence Method |
|---|----------|-----------------|
| 1 | **Does it feel like a place?** | Founder/Braintrust narrative · no page chrome |
| 2 | **Does it encourage exploration?** | Zone discoverability · camera travel reward |
| 3 | **Does it communicate ownership?** | *"This is mine"* reaction · Genome presence |
| 4 | **Does it support immersion?** | Audio + motion + spatial depth coherence |
| 5 | **Does it create delight?** | Surprise moments · ceremony weight · Orb personality |
| 6 | **Does it feel alive?** | 30s idle test · continuous ambient motion |
| 7 | **Would users want to return?** | Pull factors · unresolved creative tension (healthy) |
| 8 | **Does it reinforce Headquarters fantasy?** | Lot metaphor · department as building |
| 9 | **Does arrival feel ceremonial?** | 5–7s sequence · not loading screen |

---

## Evaluation Dimensions

| Dimension | Weight | Measures |
|-----------|--------|----------|
| **Place-ness** | High | Room envelope · floor/walls/ceiling · human scale |
| **Exploration** | Medium | Zone relationships · discover-without-tutorial |
| **Ownership** | High | Genome expression · founder tool reach |
| **Immersion** | High | Audio layers · parallax · spatial audio |
| **Delight** | Medium | Pin bounce · approval ceremony · Orb greeting |
| **Aliveness** | High | Idle motion · particles · audio hum |
| **Return intent** | Medium | Unfinished branches · living mood wall |
| **HQ fantasy** | High | Entry portal · exit portal · lot continuity |
| **Arrival quality** | High | Camera path · identity crossfade · Orb voice |

---

## Experience Review Result Schema

```yaml
ExperienceReviewResult:
  overallScore: number
  nineQuestions: QuestionResult[]      # yes | no | partial + evidence
  dimensionScores: DimensionScore[]
  arrivalSequencePass: boolean
  idleAlivenessPass: boolean
  reducedMotionPass: boolean           # static elegance functional
  narrativeArc: enum                   # complete | partial | missing
  headquartersFantasyScore: number
  pass: boolean
  revisionSuggestions: RevisionSuggestion[]
```

---

## Runtime Preview Protocol

Experience Review **requires** Runtime preview session:

| Step | Action |
|------|--------|
| 1 | Assemble package in preview mode |
| 2 | Run arrival sequence (first visit profile) |
| 3 | Idle 30 seconds — observe ambient motion |
| 4 | Walk camera to each zone |
| 5 | Execute primary verbs (pin · scrub · speak) |
| 6 | Trigger approval ceremony (if applicable) |
| 7 | Run departure sequence |
| 8 | Repeat with `prefers-reduced-motion` |

No preview → Experience Review **blocked**.

---

## Golden Department Benchmark

Creative Direction Studio™ Experience Narrative (Golden Department 13) is the **reference arc**:

```
Arrival → Orientation → Inspiration → Experimentation → Decision → Departure
```

Departments in creative pipeline must deliver equivalent emotional arc adapted to their purpose.

---

## Fail Patterns

| Pattern | Experience Fail |
|---------|-----------------|
| Feels like opening software | Critical |
| Tutorial modal on first visit | High |
| Static screensaver idle | High |
| No entry portal | Medium |
| Orb as chat widget | Critical |
| Cannot scroll/travel between zones | High |
| Ceremony feels like checkbox | Medium |

---

## Braintrust Experience Contributors

| Role | Focus |
|------|-------|
| Experience Architect™ | Journey coherence |
| UX Concierge™ | Verb discoverability · friction |
| Motion Director™ | Continuous motion quality |
| Audio Director™ | Sonic atmosphere |

---

_Next: [05 — Company Genome Validation](./05_COMPANY_GENOME_VALIDATION.md)_
