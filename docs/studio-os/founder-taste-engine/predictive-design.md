# Predictive Design™

**Studio OS thinks ahead of the founder**

---

## Purpose

Define how Founder Taste Engine™ **predicts founder preferences** — prioritizing concepts that match established taste and eliminating weak directions before the founder sees them.

Over time, Studio OS becomes increasingly aligned with the founder.

---

## Core Law

**Predict with transparency — never surprise.**

Every prediction must be explainable. The founder always retains Creative Director authority.

---

## Prediction Behaviors

### Concept Prioritization

When generating Concept A · B · C:

| Maturity | Behavior |
|----------|----------|
| Nascent genome | Equal exploration · maximum learning |
| Developing | 1 concept taste-weighted · 2 exploratory |
| Established | 2 concepts taste-aligned · 1 exploratory |
| Deep | 3 concepts taste-aligned · optional 4th bold outlier |

Orb explains:

> **"I generated three options, but prioritized these because they closely match your established taste."**

### Weak Concept Elimination

Before presentation, Studio OS may eliminate concepts that **strongly conflict** with Founder Taste Genome™:

> **"We eliminated twelve weaker concepts because they conflict with your Founder Taste Genome™."**

| Rule | Constraint |
|------|------------|
| Never eliminate all exploration | At least 1 concept must diverge for learning |
| Never eliminate without logging | Transparency in generation report |
| Founder may request "surprise me" | Bypass elimination · pure exploration |

### Generation Weighting

Prompt Compiler™ and concept generators consult Taste Genome™:

| Taste signal | Generation effect |
|--------------|-------------------|
| Prefers marble + glass | Material prompts weighted |
| Rejects clutter | Density constraints applied |
| Loves cinematic lighting | Lighting intent defaulted |
| Anti-SaaS dashboard | Layout patterns blocked |
| Dramatic scale preference | Spatial scale parameter raised |

### Refinement Prediction

During Refinement Pipeline™:

> **"We increased architectural scale because your previous Golden Builds consistently favored dramatic environments."**

Studio OS pre-applies taste-aligned defaults to refinement suggestions.

---

## Prediction Confidence

| Confidence | Orb language |
|------------|--------------|
| Hypothesis | "I think you might prefer…" |
| Emerging | "Based on recent choices…" |
| Established | "This matches your established taste…" |
| Core identity | "This is signature to how you create…" |

---

## Prediction Transparency Report

Every concept generation includes internal (and optionally founder-visible) report:

```typescript
interface PredictiveDesignReport {
  conceptsGenerated: number;
  conceptsEliminated: number;
  eliminationReasons: string[];
  tasteDimensionsApplied: string[];
  tasteAlignmentScores: Record<string, number>;  // per concept
  explorationConceptId?: string;                 // intentional outlier
}
```

---

## Learning Loop

```
Predict → Present → Founder selects → Taste Learning™ updates genome
        ↑                                                    ↓
        └──────────── Better predictions next time ──────────┘
```

Prediction errors (founder selects unpredicted concept) are **high-value learning signals**.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Filter to one predictable concept | No choice · no learning |
| Hide elimination | Breaks trust |
| Predict without genome evidence | Fabricated personalization |
| Taste lock-in (no exploration) | Founders evolve · taste evolves |
| Override founder selection | Prediction advises · founder decides |

---

## Cross-References

- [taste-genome.md](./taste-genome.md)
- [concept-first.md](./concept-first.md)
- [orb-taste-dialogue.md](./orb-taste-dialogue.md)
- [Prompt Compiler™](../alpha/studio-builder/production-flow.md)
