# 03 — Creative Review

**Engine Module:** `studio.validation-loop.v1.creative-review`  
**Status:** Creative quality evaluation system  
**Philosophy:** Nothing should feel generic.

---

## Design Principle

> Creative Review evaluates whether output deserves to exist **as creative work** — not merely as functional software.

---

## Evaluation Dimensions

| Dimension | Question | Fail Signals |
|-----------|----------|--------------|
| **Originality** | Does this feel newly authored for this company? | Stock aesthetic · template drift · competitor clone |
| **Composition** | Is spatial hierarchy intentional? | Card grid · symmetric dashboard · floating panels |
| **Art Direction** | Does visual language communicate luxury and intelligence? | Bootstrap buttons · generic SaaS chrome |
| **Visual Hierarchy** | Does the eye know where to go? | Flat priority · no hero focal point |
| **Luxury** | Does it feel expensive and considered? | Cheap materials · harsh lighting · clutter |
| **Storytelling** | Does the environment tell a story before words? | White void · no arrival narrative |
| **Brand Personality** | Does Genome personality express spatially? | Interchangeable room · could be any brand |
| **Creative Confidence** | Does the room commit to a point of view? | Timid neutrals · afraid of character |
| **Editorial Quality** | Would this appear in Architectural Digest or Wallpaper*? | Admin template · productivity software |
| **Intentionality** | Does every object earn its place? | Decorative noise · filler objects |

---

## Review Method

| Method | Application |
|--------|-------------|
| Runtime preview walkthrough | Arrival → work → ceremony → departure |
| Golden Department comparison | Creative pipeline vs CDS reference |
| Anti-SaaS scan | Automated + human/AI review |
| Reference library cross-check | Mood Board alignment |
| Braintrust Creative Director | Independent critique (07) |

**Not evaluated via:** static screenshots alone · flattened mockups · wireframes.

---

## Scoring Rubric

| Score | Meaning |
|-------|---------|
| 90–100 | Exceptional — editorial reference quality |
| 75–89 | Strong — passes with minor notes |
| 60–74 | Conditional — revision recommended |
| 40–59 | Weak — revision required |
| 0–39 | Fail — does not deserve to exist as-is |

Each dimension receives score + **explanation paragraph** — never number alone.

---

## Creative Review Result Schema

```yaml
CreativeReviewResult:
  overallScore: number
  dimensionScores:
    originality: { score, explanation, evidence[] }
    composition: { score, explanation, evidence[] }
    artDirection: { score, explanation, evidence[] }
    visualHierarchy: { score, explanation, evidence[] }
    luxury: { score, explanation, evidence[] }
    storytelling: { score, explanation, evidence[] }
    brandPersonality: { score, explanation, evidence[] }
    creativeConfidence: { score, explanation, evidence[] }
    editorialQuality: { score, explanation, evidence[] }
    intentionality: { score, explanation, evidence[] }
  strengths: string[]
  weaknesses: string[]
  revisionSuggestions: RevisionSuggestion[]
  genericRisk: enum           # none | low | medium | high | critical
  pass: boolean
```

---

## Generic Risk Detection

| Signal | Risk Level |
|--------|------------|
| Card grid layout detected | Critical |
| Sidebar navigation | Critical |
| Chat bubble Orb | Critical |
| Stock photo hero | High |
| Rounded rectangle button chrome | High |
| Data table as furniture | High |
| White void environment | Medium |
| Missing hero focal point | Medium |
| No continuous ambient motion | Low |

Automated Anti-SaaS scan feeds `genericRisk`. Braintrust confirms.

---

## Department-Type Creative Benchmarks

| Department Type | Creative Benchmark |
|-----------------|-------------------|
| creative-direction | Golden Department CDS — canonical |
| discovery | Editorial research library — curious not cluttered |
| production | Hollywood command floor — capable not chaotic |
| executive-hq | Strategy observatory — commanding not corporate |
| law-firm | Library headquarters — authoritative not austere |
| restaurant | Culinary studio — warm not rustic cliché |
| salon | Luxury service atelier — intimate not kitsch |

---

## Revision Triggers

| Fail Dimension | Typical Revision Scope |
|----------------|----------------------|
| Art direction | Environment materials + lighting |
| Visual hierarchy | Zone rebalancing · hero emphasis |
| Luxury | Material families · particle density |
| Storytelling | Arrival sequence · environmental storytelling prompts |
| Generic risk critical | Full environment recompile — founder confirm |

---

## Relationship to Creative Direction Studio™

Production-adjacent departments **read active Creative Direction** before Creative Review scores. Misalignment with locked direction triggers revision recommendation — not auto-fail unless Genome conflict.

---

_Next: [04 — Experience Review](./04_EXPERIENCE_REVIEW.md)_
