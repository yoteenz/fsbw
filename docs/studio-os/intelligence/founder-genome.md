# Founder Genome™

**Who the founder is**

---

## Purpose

Define **Founder Genome™** — the permanent intelligence profile describing **who the founder is** as a leader · thinker · and builder.

Distinct from:
- **Founder Taste Genome™** — how they create aesthetically
- **Company Genome™** — what the business is

---

## Core Law

**The Founder Genome™ evolves as the founder evolves.**

It travels with the founder across every company.

---

## What Founder Genome™ Preserves

| Domain | Examples |
|--------|----------|
| **Leadership style** | Founder-led · delegating · collaborative |
| **Communication style** | Direct · narrative · visual-first · concise |
| **Decision-making style** | Fast instinct · deliberate · consensus-seeking |
| **Creative process** | Vision-first · iterative · collaborative critique |
| **Business philosophy** | Build legacy · move fast · relationship-driven |
| **Risk tolerance** | Conservative · balanced · bold · experimental |
| **Goals** | Short-term launches · long-term empire · lifestyle |
| **Strengths** | Brand vision · operations · storytelling |
| **Weaknesses** | Delegation gaps · detail fatigue (self-reported + observed) |
| **Working habits** | Morning strategic blocks · evening creative |
| **Preferred learning style** | Visual · conversational · documented |
| **Collaboration style** | Solo · small team · executive council |
| **Long-term vision** | One company forever · portfolio · holding structure |
| **Founder Journey™** | Dreaming → Building → Legacy stage |

---

## Schema (Conceptual)

```typescript
interface FounderGenome {
  id: string;
  founderId: string;
  version: number;

  leadership: LeadershipProfile;
  communication: CommunicationProfile;
  decisionMaking: DecisionMakingProfile;
  creativeProcess: CreativeProcessProfile;
  businessPhilosophy: string[];
  riskTolerance: RiskLevel;
  goals: FounderGoal[];
  strengths: string[];
  growthAreas: string[];          // never "weaknesses" in UI tone

  workingHabits: WorkingHabitsProfile;
  learningStyle: LearningStyleProfile;
  collaboration: CollaborationProfile;
  longTermVision: VisionProfile;

  founderJourneyStage: FounderJourneyStage;
  journeyHistory: JourneyMilestone[];

  // Learning metadata
  totalSignals: number;
  companiesContributed: string[];
  lastUpdated: string;
  maturity: 'nascent' | 'developing' | 'established' | 'deep';
}
```

---

## Signal Sources

| Source | What it teaches |
|--------|-----------------|
| **Adaptive Onboarding™** | Goals · team · vision · working style |
| **Business Discovery Blueprint™** | Founder Brain chapter |
| **Relationship Memory™** | Operational patterns (synced · not duplicated) |
| **Founder Journey™** | Stage transitions · milestones |
| **Founder Operating System™** | Energy · focus · cognitive load patterns |
| **Executive decisions** | Risk · delegation · approval style |
| **Orb conversations** | Stated values · corrections |
| **Founder's Promise™** | Personal north star |

---

## Relationship to Relationship Memory™

| System | Focus |
|--------|-------|
| **Relationship Memory™** | Day-to-day operational preferences |
| **Founder Genome™** | Identity · philosophy · journey · leadership |

Relationship Memory feeds Founder Genome — operational patterns inform leadership and decision profiles. Founder Genome provides **context** for why those patterns exist.

---

## Relationship to Founder Taste Genome™

| Genome | Question |
|--------|----------|
| **Founder Genome™** | Who are you as a builder? |
| **Founder Taste Genome™** | What do you prefer creatively? |

A founder may be **bold in business** but **minimal in aesthetics** — both genomes capture different truths.

---

## Evolution

Founder Genome™ is **living**:

| Event | Update |
|-------|--------|
| Company scales | Leadership style may shift |
| New venture | Goals · vision may expand |
| Founder Journey™ stage change | Maturity recalibration |
| Orb confirmed observation | Pattern locked |
| Founder self-correction | Override automatic inference |

Version history preserved — never silent overwrite of identity.

---

## Taste Transfer™

Founder Genome™ travels to every new company:

> Teena builds Frontal Slayer → later builds NDX → Studio OS already understands **who she is** as a founder. NDX develops its own Company Genome™.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Confuse with Company Genome™ | Founder ≠ company |
| Static profile after onboarding | Founders evolve |
| Infer taste from genome | Separate genomes |
| Manual 50-field form | Learn through living |

---

## Cross-References

- [founder-taste-genome.md](./founder-taste-genome.md)
- [company-genome.md](./company-genome.md)
- [Founder Journey™](../engine/founder-journey/)
- [Relationship Memory™](../relationship-memory.md)
