# Founder Taste Genome™

**The permanent creative DNA of the founder**

---

## Purpose

Define the **Founder Taste Genome™** — a permanent, founder-scoped profile of creative instincts learned through every decision.

Company Genome™ = who the **company** is.  
Founder Taste Genome™ = how the **founder** creates.

---

## Core Law

**Every decision contributes. Nothing is wasted.**

---

## Genome Schema

```typescript
interface FounderTasteGenome {
  id: string;
  founderId: string;
  version: number;

  // Taste dimensions (0.0–1.0 scales · negative allowed for aversions)
  dimensions: TasteDimensionMap;

  // Pattern library
  establishedPatterns: TastePattern[];
  emergingPatterns: TastePattern[];
  rejectedPatterns: TastePattern[];    // confirmed false by founder

  // Decision history summary
  totalSignals: number;
  companiesContributed: string[];
  lastUpdated: string;

  // Confidence
  overallMaturity: 'nascent' | 'developing' | 'established' | 'deep';
}

interface TasteDimensionMap {
  // Visual
  visualTaste: VisualTasteProfile;
  architecturalTaste: ArchitecturalTasteProfile;
  lightingTaste: LightingTasteProfile;
  typographyTaste: TypographyTasteProfile;
  colorTaste: ColorTasteProfile;
  materialTaste: MaterialTasteProfile;

  // Experience
  motionTaste: MotionTasteProfile;
  audioTaste: AudioTasteProfile;
  interactionTaste: InteractionTasteProfile;

  // Brand & marketing
  brandTaste: BrandTasteProfile;
  packagingTaste: PackagingTasteProfile;
  marketingTaste: MarketingTasteProfile;
  writingStyle: WritingStyleProfile;

  // Leadership & decision
  leadershipStyle: LeadershipStyleProfile;
  decisionPatterns: DecisionPatternProfile;
  creativeRiskTolerance: RiskToleranceProfile;
  innovationStyle: InnovationStyleProfile;
}
```

---

## Taste Dimensions (Canonical)

### Visual Taste

| Attribute | Spectrum |
|-----------|----------|
| Density | Minimal ↔ Rich |
| Clutter tolerance | Low ↔ High |
| Hero emphasis | Single focal ↔ Distributed |
| Photography style | Editorial ↔ Cinematic ↔ Documentary |
| Luxury tier | Accessible ↔ Ultra-premium |

### Architectural Taste

| Attribute | Spectrum |
|-----------|----------|
| Scale | Intimate ↔ Monumental |
| Composition | Symmetric ↔ Dynamic |
| Openness | Enclosed ↔ Panoramic |
| Structural emphasis | Strong lines ↔ Soft forms |
| Spatial navigation | Traditional ↔ Experiential ↔ Game-inspired |

### Lighting Taste

| Attribute | Spectrum |
|-----------|----------|
| Temperature | Cool ↔ Warm |
| Contrast | Low ↔ Dramatic |
| Key style | Soft editorial ↔ Hard cinematic |
| Brightness | Moody ↔ Bright |

### Material Taste

| Attribute | Examples |
|-----------|----------|
| Preferred | Marble · glass · chrome · acrylic · warm wood |
| Avoided | Plastic · flat gradients · stock UI chrome |
| Weight | Light ↔ Heavy |

### Motion Taste

| Attribute | Spectrum |
|-----------|----------|
| Transition style | Instant ↔ Cinematic |
| Pacing | Calm ↔ Energetic |
| Camera movement | Static ↔ Dynamic |

### Interaction Taste

| Attribute | Spectrum |
|-----------|----------|
| Navigation | Page-based ↔ Spatial · Studio World™ |
| Feedback | Subtle ↔ Celebratory |
| Information density | Summary-first ↔ Deep detail |

### Brand Taste

| Attribute | Spectrum |
|-----------|----------|
| Voice | Warm ↔ Authoritative ↔ Playful |
| Visual identity | Minimal ↔ Expressive |
| Storytelling | Product-first ↔ Narrative-first |

### Decision Patterns

| Attribute | Examples |
|-----------|----------|
| Approval style | Fast instinct ↔ Deliberate review |
| Comparison habit | Quick select ↔ Extended compare |
| Braintrust reliance | Trust instinct ↔ Deep dive |
| Revision tolerance | Few iterations ↔ Many refinements |

### Creative Risk Tolerance

| Level | Behavior |
|-------|----------|
| Conservative | Proven aesthetics · safe concepts prioritized |
| Balanced | Mix of safe + one bold option |
| Bold | Pushes boundaries · selects experimental concepts |
| Experimental | Actively seeks Alternate Branches™ |

### Innovation Style

| Style | Signal |
|-------|--------|
| Incremental | Small refinements within Canon™ |
| Directional | New vision locks · bold selections |
| Exploratory | Saves many Alternate Branches™ |
| Synthesis | Frequent blend requests |

---

## Pattern Records

```typescript
interface TastePattern {
  id: string;
  dimension: string;
  observation: string;           // "Prefers single architectural focal point"
  confidence: 'hypothesis' | 'emerging' | 'established' | 'core';
  evidenceCount: number;
  evidenceSummary: string[];     // anonymized decision refs
  founderConfirmed?: boolean;
  founderRejected?: boolean;
  firstDetected: string;
  lastReinforced: string;
}
```

---

## Mutation Rules

| Rule | Meaning |
|------|---------|
| **Incremental** | Small weight changes per signal |
| **Decay** | Old patterns fade without reinforcement |
| **Reinforcement** | Consistent signals compound |
| **Cap** | Extreme values require strong evidence |
| **Founder veto** | Confirm/reject overrides automation |

---

## Company Overlay (Optional)

Founder may allow **company-specific taste adjustments** without corrupting core genome:

```typescript
interface CompanyTasteOverlay {
  companyId: string;
  adjustments: Partial<TasteDimensionMap>;
  reason: string;               // "This brand is more playful"
}
```

Core Founder Taste Genome™ unchanged. Overlay applies only within that company's generation context.

---

## Storage & Portability

| Property | Value |
|----------|-------|
| Scope | Founder ID — not organization ID |
| Persistence | Permanent · exportable |
| Privacy | Founder-controlled · never shared without consent |
| Transfer | Travels to every new company |

**Detail:** [taste-transfer.md](./taste-transfer.md)

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Taste Genome per company only | Violates founder identity |
| Manual genome entry | Decisions must populate |
| Static genome | Must evolve continuously |
| Genome without confidence | Unreliable predictions |

---

## Cross-References

- [taste-learning.md](./taste-learning.md)
- [predictive-design.md](./predictive-design.md)
- [Organization Genome™](../organization-genome.md)
