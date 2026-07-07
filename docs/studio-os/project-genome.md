# Project Genome™

**Version:** 1.0.0  
**Status:** Ratified via CA-002  
**Milestone:** M278  
**Module ID:** `project-genome`  
**Parent:** [Company Genome™](./company-genome.md)

---

> Every Project receives its own Genome.  
> Everything created inherits **Company Genome + Project Genome**.

---

## Purpose

Project Genome™ scopes creative identity to a **single production** — campaign, website, experience, or content initiative — while inheriting the full Company Genome™ as non-negotiable foundation.

**Without Project Genome:** outputs reflect company identity but miss production intent.  
**With Project Genome:** outputs feel inevitable for this company **and** this specific moment.

---

## Inheritance Model

```
Company Genome™ (apex — always applied)
        +
Project Genome™ (production-specific)
        =
Creative Output Constraint Set
```

Project Genome **cannot override** Company Genome `thingsWeNeverDo`, `values`, `voice` bounds, or accessibility principles. It **may specialize** mood, audience, story, and deliverables.

---

## Project Genome Domains

| Domain | Description | Example |
|--------|-------------|---------|
| `objective` | What this production achieves | Launch spring collection |
| `audience` | Who it's for | Existing loyal guests · 35–55 |
| `mood` | Atmospheric intent | Editorial warmth · winter light |
| `desiredEmotion` | What audience should feel | Inspired · exclusive |
| `visualReferences` | Project-specific refs | Pinterest board · Reel |
| `photographyStyle` | Lens for this production | Soft natural · golden hour |
| `videoStyle` | Motion capture character | Slow editorial cuts |
| `storyArc` | Narrative structure | Arrival → reveal → invitation |
| `creativeConstraints` | Hard boundaries | No price mentions · no urgency |
| `deliverables` | What must exist | Hero · 3 features · booking CTA |
| `callToAction` | Primary conversion | Reserve consultation |
| `successMetrics` | How success is measured | Booking rate · time on hero |

**Schema extension:** `master-spec/company-genome.yaml` → `projectGenome` section

---

## Learning Sources (Project-Scoped)

| Source | Effect |
|--------|--------|
| Creative Direction Studio interview | Seeds objective · audience · mood |
| Inspiration wall drops | visualReferences · mood |
| Mood board branches | creativeConstraints |
| Founder Notes | objective · constraints |
| Director proposals accepted/rejected | refines constraints |
| Department handoffs | deliverables validation |

---

## Genome-First Position

In [Genome-First Orchestration](./master-spec/genome-first-orchestration.yaml):

```
Step 1: Company Genome™
Step 2: Project Genome™  ← this document
Step 3+: Mood board · inspiration · assets...
```

---

## Experience Studio Impact

Experience Studio™ workflow per CA-002:

```
Understand (Company + Project Genome)
    ↓
Interpret
    ↓
Creative Direction
    ↓
Art Direction
    ↓
Experience Design
    ↓
Content Strategy
    ↓
Prototype
    ↓
Implementation
```

**Never:** "Generate a website" as first intent.

---

## Registry Object

| Field | Type |
|-------|------|
| `project-genome` | System Registry™ object |
| Parent | `es-project` (Experience Project) |
| Persistence | Per-project · workspace-scoped |

---

## Cross-References

| Document | Path |
|----------|------|
| Company Genome™ | [company-genome.md](./company-genome.md) |
| Experience Studio spec | `products/experience-studio/EXPERIENCE_STUDIO_PRODUCT_SPEC.md` |
| Project Lifecycle v2 | `products/experience-studio/experience-v2/PROJECT_LIFECYCLE_EXPERIENCE.md` |

---

*Project Genome™ — this production · this company · inevitable together.*
