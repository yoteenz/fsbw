# ARTICLE-E03 — Knowledge Retention Engine™

**Status:** Canon  
**Approved:** 2026-07-08  
**Layer:** Education / Mastery / Professional Memory  
**Core package:** `src/studio-os-core/knowledge-retention-engine/`

---

## Mission

Studio World should not simply teach knowledge.

Studio World should preserve knowledge for life.

Traditional platforms ask learners to review courses. Studio World treats knowledge as a living professional memory. The learner never returns to a classroom unless they choose to. They revisit the work, the client, the decision, the simulation, the certification, and the professional moment where the knowledge matters.

---

## Core philosophy

> The learner never revisits courses.  
> The learner revisits professional memories.

The system should not say:

- "Review this lesson."
- "Retake this course."
- "Your module is overdue."

The system should say:

- "It's been 214 days since your last corrective color."
- "Today's first client is perfect practice for refreshing lace customization."
- "A new bleaching standard has been added to the profession."
- "You haven't used foil placement in several months."

The learner remains a professional. The platform acts like a lifelong mentor.

---

## System ownership

| System | Responsibility |
| --- | --- |
| **Profession Brain™** | Owns evolving profession knowledge and industry standards. |
| **Knowledge Retention Engine™** | Owns retention profiles, decay scoring, refresher recommendations, and mastery plans. |
| **Studio Institute™** | Provides learning material and demonstrations when deeper refresh is requested. |
| **Profession Simulation Engine™** | Provides applied practice moments for memories that need use, not review. |
| **Career Worlds™** | Provides career goals, upcoming roles, and professional context. |
| **Orb™** | Mentors naturally, explains why a memory matters now, and offers refresher depth. |
| **World Graph™** | Stores durable Professional Memory™ nodes and relationships. |

---

## Professional Memory™

A Professional Memory™ is a retained concept, judgment, technique, standard, or workflow that matters to the learner's career.

It is not a course module.

Examples:

- Hair bleaching chemistry
- Color theory
- Lace installation
- Client consultations
- Corrective color
- Salon management
- Marketing strategy
- Accounting
- Leadership

Each memory has a retention profile:

- Date learned
- Number of successful applications
- Last real usage
- Confidence score
- Recall strength
- Industry updates
- Certification relevance
- Difficulty
- Career goals
- Upcoming simulations
- Upcoming real-world projects

---

## Retention profiles

The engine evaluates retention using:

- **Time** — how long since learning and real usage.
- **Performance** — successful applications protect mastery.
- **Confidence** — low confidence increases refresh priority.
- **Recall strength** — weak recall increases decay risk.
- **Industry change** — changed knowledge interrupts normal decay logic.
- **Frequency of use** — unused knowledge decays faster.
- **Career goals** — career-relevant memories stay prioritized.
- **Upcoming simulations** — refresh can happen through practice.
- **Upcoming real-world projects** — refresh can happen through actual work.
- **Certification relevance** — regulated or credentialed knowledge gets stronger protection.

The output is not "course overdue." The output is a mastery plan and mentor language.

---

## Refresher Modes™

The learner chooses depth:

1. **60-second Memory Spark™** — quick cue, one professional memory, one judgment.
2. **5-minute Skill Refresh™** — compact walkthrough of sequence and decision points.
3. **Interactive Simulation™** — applied practice in a safe professional scenario.
4. **Mentor Demonstration™** — Orb shows the expert move and explains why.
5. **Client Scenario™** — realistic client-facing judgment practice.
6. **Industry Update™** — what changed, why, and how it affects work.
7. **Challenge Mode™** — pressure test for high mastery.
8. **Certification Renewal™** — credential-sensitive refresh path.

---

## Living Knowledge

Profession Brains™ continuously evolve.

When knowledge changes, the engine identifies affected learners and affected memories. The Orb explains:

- **What changed.**
- **Why it changed.**
- **How it affects your work.**

This makes industry updates feel like professional mentorship, not platform notifications.

---

## World Graph integration

ARTICLE-E03 adds **Professional Memory™** as a first-class World Graph node type:

- `professional-memory`
- ID prefix: `W-MEM`

The graph connects:

- Knowledge Retention Engine™ → Professional Memory™ via `refreshes`
- Professional Memory™ → Knowledge Retention Engine™ via `governed-by`
- Professional Memory™ → Profession Brain™ via `depends-on`
- Knowledge Retention Engine™ → Studio World Atlas™ via `projects-to`

Professional memories can later appear in Atlas, Orb, Career Worlds, Studio Institute, simulations, and certification views without duplicating truth.

---

## Implementation notes

Core package:

- `types.ts` — retention profile, refresher, evaluation, living update types.
- `constants.ts` — ARTICLE-E03 metadata, philosophy, refresher modes, thresholds.
- `catalog.ts` — launch memory profiles and industry updates.
- `engine.ts` — decay risk, mastery score, Orb mentor line, update impact, retention plan.
- `index.ts` — package exports.

World Graph:

- `knowledge-retention-ingest.ts` registers E03 relationships and launch Professional Memory™ nodes.
- `WORLD_NODE_TYPES` includes `professional-memory`.
- `WORLD_EDGE_TYPES` includes `refreshes` and `affected-by`.

Knowledge Core:

- `E03-knowledge-retention-engine` canon entry under **Learning Architecture™**.

---

## Success definition

Studio World becomes a lifelong professional mentor that actively preserves mastery.

Education is not remembered as a course library.

Education becomes a living career memory system.
