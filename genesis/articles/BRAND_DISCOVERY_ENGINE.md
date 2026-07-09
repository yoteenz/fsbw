# Brand Discovery Engine™ · Brand DNA™ · Brand Intelligence Layer™

**Project:** Studio OS  
**Systems:** Brand Discovery Engine™ · Brand DNA™ · Brand Intelligence Layer™ · Brand Elevation Engine™ · Brand Consistency Check™  
**Status:** Canonical architecture draft for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Parent:** Genesis™ · Company Genome™ · Orb™ · Experience Engine™ · Experience Runtime™ · Brand Architect™ · Studio Foundry™  
**Depends on:** Company Genome™, Identity Engine™, Orb™, Organization Genome™, Experience Engine™, Experience Runtime™, Brand Architect™, Design Genome™, Studio Intelligence™, Asset Registry™, Studio Foundry™  
**Constitutional posture:** Studio OS does not treat branding as colors, fonts, and logos. Studio OS understands a brand as a **living strategic identity** that governs every creative, commercial, and experiential decision.

---

## 0. Prime directive

```text
Brand is not decoration.

Brand is strategic intelligence.

Every system in Studio OS must ask whether its output strengthens,
protects, and evolves the brand — before it ships.
```

Experience Engine™ and Experience Runtime™ already consume **Experience Brand DNA™**
(expression layer: color, glass, lighting, motion, Orb atmosphere).

Brand Discovery Engine™ and Brand Intelligence Layer™ own the **canonical strategic
Brand DNA™** — philosophy, audience, positioning, voice, packaging language,
pricing perception, competitive difference, and experience rules.

Strategic Brand DNA™ compiles downward into Experience Brand DNA™ and outward into
every creative and strategic system.

### 0.1 Relationship to existing Brand DNA

| Layer | Owner | Scope |
|-------|-------|-------|
| **Brand DNA™ (Strategic)** | Brand Intelligence Layer™ | Living strategic identity — why the brand exists, who it serves, how it wins |
| **Experience Brand DNA™** | Experience Engine™ | Expression layer — how the brand looks, moves, sounds, and feels in operating environments |
| **Department DNA™** | Experience Engine™ | Operational wing translation of brand |
| **Runtime assembly** | Experience Runtime™ | Real-time execution of inherited DNA |

Do **not** redesign Experience Engine™ or Experience Runtime™.

Expand Brand DNA™ upward into strategic intelligence, then compile strategic
DNA into the existing Experience Brand DNA schema.

```text
Brand Discovery Engine™
  -> canonical Brand DNA™ (strategic)
    -> Brand Intelligence Layer™
      -> Experience Brand DNA™ (expression)
        -> Experience Runtime™
      -> Packaging · Marketing · Foundry · Orb · Academy · Marketplace · ...
```

---

## 1. Brand hierarchy

```text
Studio OS Brand Platform
  -> Brand Discovery Engine™
    -> Brand DNA™ (Strategic Intelligence)
      -> Brand Intelligence Layer™
        -> Experience Brand DNA™
        -> Creative Systems DNA Bindings
        -> Commercial Systems DNA Bindings
        -> Orb Brand Strategist Mode™
        -> Brand Elevation Engine™
        -> Brand Consistency Check™
```

### 1.1 System responsibilities

| System | Responsibility |
|--------|----------------|
| **Brand Discovery Engine™** | Discover, interview, ingest, synthesize, validate, and version canonical Brand DNA™ |
| **Brand DNA™** | Machine-readable living strategic identity for a company |
| **Brand Intelligence Layer™** | Reusable brand reasoning API consumed by every Studio OS system |
| **Brand Elevation Engine™** | Evaluate existing brand health and propose upgrades |
| **Brand Consistency Check™** | Score every generated asset against Brand DNA™ before approval/shipping |
| **Orb Brand Strategist Mode™** | Lead discovery, challenge weak positioning, protect brand integrity |

---

## 2. Brand Discovery Engine™

Brand Discovery Engine™ is how Studio OS **learns** a brand — not how it guesses
colors from a logo.

### 2.1 Discovery posture

Discovery is:

- founder-led but Orb-guided
- evidence-based, not aesthetic-only
- iterative and versioned
- connected to Company Genome™
- auditable and explainable
- conservative when evidence is weak
- ambitious when evidence is strong

Discovery is **not**:

- a moodboard generator
- a logo color picker
- a one-shot AI brand summary
- a replacement for founder judgment
- a bypass of Company Genome truth

### 2.2 Discovery inputs

| Input category | Examples | Intelligence extracted |
|----------------|----------|------------------------|
| **Founder source** | Founder interview, preferences, energy, rituals, non-negotiables | Founder Energy, Brand Philosophy, Anti-patterns |
| **Organizational source** | Company Genome™, mission history, decisions, approvals | Values, Decision DNA, Market Positioning |
| **Visual source** | Logo, website, product images, packaging, moodboards, references | Design Language, Photography Style, Luxury Level, Aesthetic Rules |
| **Verbal source** | Brand guide, copy samples, campaigns, reviews | Writing Voice, Content Style, Customer Desire |
| **Market source** | Competitors, audience data, sales data, pricing | Competitive Difference, Price Perception, Audience Psychology |
| **Channel source** | Social media, email, ads, marketplace listings | Community Style, Launch Style, Product Presentation Rules |
| **Experience source** | Existing HQ, customer journey, support tone | Customer Experience Rules, Orb behavior, Headquarters expression |

### 2.3 Discovery pipeline

```text
Input intake
  -> evidence normalization
  -> founder interview (Orb-led)
  -> Company Genome cross-reference
  -> competitor + audience analysis
  -> strategic synthesis
  -> Brand DNA draft
  -> founder review
  -> confidence scoring
  -> canonization or revision
  -> compile Experience Brand DNA
  -> publish to Brand Intelligence Layer
```

### 2.4 Orb Brand Strategist Mode™

The Orb leads discovery like an elite brand strategist:

1. **Interview** — asks why the brand exists, who it rejects, who it serves, what it will never do.
2. **Challenge** — surfaces generic language, weak differentiation, luxury gaps, audience mismatch.
3. **Synthesize** — merges founder intent with evidence from Genome, web, packaging, and market.
4. **Protect** — flags outputs across Studio OS that weaken trust, luxury, or positioning.
5. **Elevate** — proposes upgrades through Brand Elevation Engine™.
6. **Explain** — every Brand DNA field includes provenance, confidence, and rationale.

Orb does not replace founder approval. Orb makes brand thinking visible, rigorous,
and reusable.

### 2.5 Discovery sessions

```ts
type BrandDiscoverySession = {
  sessionId: string;
  companyId: string;
  ledBy: 'orb-brand-strategist';
  inputs: BrandDiscoveryInput[];
  interviewTranscript: BrandInterviewTurn[];
  draftDnaVersion: string;
  confidence: BrandDiscoveryConfidence;
  status: 'intake' | 'interview' | 'synthesis' | 'review' | 'canonized' | 'revised';
  provenance: BrandProvenanceRecord[];
};
```

---

## 3. Brand DNA™ model (strategic intelligence)

Canonical Brand DNA™ is the **strategic identity genome** for a company.

Experience Engine™ Brand DNA remains the **expression profile** compiled from this
canonical model.

### 3.1 Strategic Brand DNA schema

```ts
type StrategicBrandDna = {
  brandId: string;
  companyId: string;
  version: string;
  officialName: string;

  // Core identity
  brandPhilosophy: string;
  mission: string;
  vision: string;
  values: BrandValue[];

  // Audience & psychology
  audiencePsychology: AudiencePsychologyProfile;
  customerDesire: string;
  emotionalTerritory: string[];
  targetAudiences: TargetAudienceProfile[];

  // Expression intelligence
  visualPersonality: string[];
  writingVoice: WritingVoiceSystem;
  designLanguage: DesignLanguageSystem;
  packagingLanguage: PackagingLanguageSystem;
  photographyStyle: PhotographyStyleSystem;
  contentStyle: ContentStyleSystem;
  founderEnergy: FounderEnergyProfile;

  // Market intelligence
  marketPositioning: MarketPositioningProfile;
  pricePerception: PricePerceptionProfile;
  competitiveDifference: CompetitiveDifferenceProfile;

  // Rules & boundaries
  aestheticRules: string[];
  antiPatterns: string[];
  culturalReferences: string[];
  brandRituals: string[];
  customerExperienceRules: string[];
  productPresentationRules: string[];
  launchStyle: LaunchStyleProfile;
  communityStyle: CommunityStyleProfile;

  // Balance scales (0–100)
  luxuryLevel: number;
  boldnessLevel: number;
  feminineMasculineBalance: number;
  editorialCommercialBalance: number;
  futuristicTimelessBalance: number;

  // Governance
  confidence: BrandDnaConfidenceMap;
  provenance: BrandProvenanceRecord[];
  canonStatus: 'draft' | 'approved' | 'canonical';
  compiledExperienceBrandDnaId?: string;
};
```

### 3.2 Field groups

#### Core identity

| Field | Definition |
|-------|------------|
| **Brand Philosophy** | Why the brand exists in the world |
| **Mission** | What the brand does every day |
| **Vision** | What future the brand is building |
| **Values** | Non-negotiable beliefs with behavioral examples |

#### Audience & psychology

| Field | Definition |
|-------|------------|
| **Audience Psychology** | Motivations, fears, aspirations, identity signals |
| **Customer Desire** | What the customer wants to feel/become |
| **Emotional Territory** | Owned emotional space (e.g. protected, glamorous, informed) |
| **Target Audiences** | Primary, secondary, aspirational audience profiles |

#### Expression intelligence

| Field | Definition |
|-------|------------|
| **Visual Personality** | Temperament of the brand's look |
| **Writing Voice** | Tone, cadence, vocabulary, forbidden language |
| **Design Language** | Layout, material, hierarchy, ornament rules |
| **Packaging Language** | Unboxing, product card, label, gift, retail presentation |
| **Photography Style** | Lighting, framing, casting, environment, post tone |
| **Content Style** | Editorial rhythm, proof style, CTA posture, story structure |
| **Founder Energy** | How founder presence should feel in brand touchpoints |

#### Market intelligence

| Field | Definition |
|-------|------------|
| **Market Positioning** | Category, frame, premium reason, proof |
| **Price Perception** | How price should feel relative to value |
| **Competitive Difference** | What competitors cannot copy easily |

#### Rules & balance

| Field | Definition |
|-------|------------|
| **Aesthetic Rules** | What the brand always does visually |
| **Anti-patterns** | What the brand must never do |
| **Cultural References** | Taste anchors, not copies |
| **Brand Rituals** | Repeated moments that build memory |
| **Customer Experience Rules** | Service, support, onboarding, recovery behavior |
| **Product Presentation Rules** | How products are named, framed, priced, revealed |
| **Launch Style** | How the brand enters markets and moments |
| **Community Style** | How the brand gathers, rewards, and speaks to community |
| **Luxury Level** | 0–100 perceived premium posture |
| **Boldness Level** | 0–100 visual/voice assertiveness |
| **Feminine/Masculine Balance** | Brand gender energy balance |
| **Editorial vs Commercial Balance** | Story-first vs conversion-first balance |
| **Futuristic vs Timeless Balance** | Innovation vs permanence balance |

### 3.3 Compilation to Experience Brand DNA™

Strategic Brand DNA™ compiles into Experience Engine Brand DNA through a governed
mapping:

```text
Strategic Brand DNA
  -> expression compiler
  -> Experience Brand DNA
  -> Experience Runtime
```

Example mappings:

| Strategic field | Experience field |
|-----------------|------------------|
| Visual Personality | visualPersonality, materials, architecturalStyle |
| Design Language | typography, colorSystem, glassTreatment |
| Writing Voice | writingVoice, navigationTone |
| Emotional Territory | emotionalPersonality, environmentalStorytelling |
| Founder Energy | executivePersonality, Orb personality |
| Luxury Level | lighting, glass, motion pacing, density |
| Anti-patterns | designConstraints, experienceRules |

---

## 4. Brand Intelligence Layer™

Brand Intelligence Layer™ is the reusable reasoning substrate every Studio OS
system consults before creating, approving, or shipping brand-related output.

### 4.1 Prime questions

Before any brand-related output ships, the layer asks:

1. Does this match the Brand DNA™?
2. Does this strengthen the brand?
3. Does this attract the right audience?
4. Does this contradict the brand?
5. Does this feel premium enough?
6. Does this support the company's positioning?

### 4.2 Intelligence API

```ts
type BrandIntelligenceQuery = {
  companyId: string;
  artifactType: BrandArtifactType;
  artifactPayload: unknown;
  channel?: string;
  audienceId?: string;
  context?: BrandEvaluationContext;
};

type BrandIntelligenceResult = {
  matchScore: number;
  strengthenScore: number;
  audienceFitScore: number;
  contradictionFlags: BrandContradiction[];
  premiumScore: number;
  positioningScore: number;
  recommendation: 'approve' | 'revise' | 'reject' | 'escalate';
  rationale: string[];
  suggestedFixes: BrandFixSuggestion[];
};
```

### 4.3 Consumption map

Every creative and strategic system must consult Brand Intelligence Layer™:

| System | Brand question |
|--------|----------------|
| **Executive Headquarters™** | Does this HQ feel like the company's strategic home? |
| **Orb™** | Does this recommendation sound like the brand strategist should speak? |
| **Experience Engine / Runtime** | Does this environment express the approved brand? |
| **Studio Foundry™** | Does this generated asset belong in this brand world? |
| **Packaging Design** | Does this packaging increase desire and trust? |
| **Campaign Strategy** | Does this campaign attract the right audience with the right promise? |
| **Content Creation** | Does this content sound and feel on-brand? |
| **Website / Product Pages** | Does this page support positioning and price perception? |
| **Photography Direction** | Does this shot match photography style and luxury level? |
| **Academy / Courses** | Does this teaching experience match brand rituals and voice? |
| **Marketplace Listings** | Does this listing preserve brand elevation in-channel? |
| **Launch Campaigns** | Does this launch match launch style and community rules? |

### 4.4 Event model

```text
brand.dna.canonized
brand.dna.revised
brand.discovery.completed
brand.consistency.scored
brand.elevation.proposed
brand.contradiction.detected
```

Downstream systems subscribe and recompile bindings when canonical Brand DNA changes.

---

## 5. Brand applications architecture

Brand DNA™ informs every brand decision through **application profiles** — not
handcrafted one-off rules.

### 5.1 Application profile pattern

```ts
type BrandApplicationProfile = {
  applicationId: BrandApplicationType;
  inheritsFrom: 'strategic-brand-dna';
  requiredFields: string[];
  evaluationDimensions: BrandConsistencyDimension[];
  outputContract: string;
  orbReviewRequired: boolean;
};
```

### 5.2 Application matrix

| Application | Primary Brand DNA fields consumed |
|-------------|-----------------------------------|
| **Packaging Design** | packagingLanguage, luxuryLevel, photographyStyle, productPresentationRules |
| **Target Audience Discovery** | audiencePsychology, customerDesire, targetAudiences, competitiveDifference |
| **Campaign Strategy** | marketPositioning, launchStyle, writingVoice, boldnessLevel |
| **Content Creation** | contentStyle, writingVoice, culturalReferences, editorialCommercialBalance |
| **Email Marketing** | writingVoice, customerExperienceRules, communityStyle |
| **Product Pages** | productPresentationRules, pricePerception, photographyStyle, designLanguage |
| **Website Design** | designLanguage, visualPersonality, customerExperienceRules |
| **Social Media** | contentStyle, communityStyle, boldnessLevel |
| **Ad Creative** | competitiveDifference, customerDesire, launchStyle |
| **Photography Direction** | photographyStyle, aestheticRules, luxuryLevel |
| **Influencer Strategy** | targetAudiences, communityStyle, brandPhilosophy |
| **Community Strategy** | communityStyle, brandRituals, customerExperienceRules |
| **Academy / Course Design** | contentStyle, founderEnergy, brand rituals |
| **Marketplace Listings** | pricePerception, productPresentationRules, packagingLanguage |
| **Hero Objects** | emotionalTerritory, designLanguage, visualPersonality |
| **Studio Foundry Assets** | full strategic DNA + application profile |
| **Headquarters Environments** | compiled Experience Brand DNA + environmentalStorytelling |
| **Orb Voice** | writingVoice, founderEnergy, executivePersonality |
| **Customer Journey** | customerExperienceRules, emotionalTerritory, brandRituals |
| **Offer Architecture** | pricePerception, marketPositioning, customerDesire |

---

## 6. Brand Elevation Engine™

Brand Elevation Engine™ evaluates an existing brand and proposes upgrades without
destroying what is working.

### 6.1 Evaluation domains

| Domain | Questions |
|--------|-----------|
| **What is working** | Which assets, messages, and experiences build trust and memory? |
| **Inconsistency** | Where do channels contradict each other? |
| **Generic signals** | Where could this brand belong to any competitor? |
| **Trust erosion** | What weakens credibility, proof, or care? |
| **Luxury erosion** | What makes the brand feel cheaper than its positioning? |
| **Audience miss** | Which desirable segments are ignored or repelled? |
| **Visual refinement** | Which materials, layouts, or photo styles need tightening? |
| **Messaging sharpening** | Which claims are vague, overhyped, or off-voice? |
| **Packaging elevation** | Where does physical presentation undersell the brand? |
| **Content direction** | Which content types need stronger editorial POV? |
| **Competitive gap** | What are competitors doing better in perception or proof? |
| **Opportunity space** | Where can the brand own new territory safely? |

### 6.2 Elevation output

```ts
type BrandElevationReport = {
  reportId: string;
  companyId: string;
  overallBrandHealth: number;
  working: BrandElevationFinding[];
  inconsistent: BrandElevationFinding[];
  generic: BrandElevationFinding[];
  trustRisks: BrandElevationFinding[];
  luxuryRisks: BrandElevationFinding[];
  audienceGaps: BrandElevationFinding[];
  visualRefinements: BrandElevationFinding[];
  messagingRefinements: BrandElevationFinding[];
  packagingUpgrades: BrandElevationFinding[];
  contentUpgrades: BrandElevationFinding[];
  competitorInsights: BrandElevationFinding[];
  opportunities: BrandElevationFinding[];
  proposedDnaRevisions: StrategicBrandDnaPatch[];
};
```

Elevation proposes **patches** to Brand DNA™, not silent overwrites.

---

## 7. Brand Consistency Check™

Every generated asset receives a Brand DNA compliance score before approval.

### 7.1 Scoring dimensions

| Dimension | Definition |
|-----------|------------|
| **Visual Alignment** | Colors, materials, typography, photography, layout match Design Language |
| **Voice Alignment** | Copy tone, cadence, vocabulary, forbidden language compliance |
| **Audience Alignment** | Message and aesthetic fit target audience psychology |
| **Luxury Alignment** | Premium cues match luxury level and price perception |
| **Positioning Alignment** | Supports market positioning and competitive difference |
| **Emotional Alignment** | Evokes approved emotional territory |
| **Market Fit** | Appropriate for channel, offer, and moment |
| **Differentiation** | Distinct from generic category language and look |
| **Conversion Potential** | On-brand while preserving commercial effectiveness |

### 7.2 Score output

```ts
type BrandConsistencyScore = {
  artifactId: string;
  companyId: string;
  brandDnaVersion: string;
  dimensions: {
    visualAlignment: number;
    voiceAlignment: number;
    audienceAlignment: number;
    luxuryAlignment: number;
    positioningAlignment: number;
    emotionalAlignment: number;
    marketFit: number;
    differentiation: number;
    conversionPotential: number;
  };
  overallScore: number;
  passThreshold: number;
  status: 'pass' | 'revise' | 'fail' | 'escalate';
  contradictions: BrandContradiction[];
  fixSuggestions: BrandFixSuggestion[];
};
```

Default pass threshold: **80/100** with no critical contradiction in positioning,
audience, or anti-pattern violation.

---

## 8. Case studies

### 8.1 Frontal Slayer™

| Application | Brand-informed output |
|-------------|----------------------|
| **Packaging** | Gloss white boxes, salon-light product cards, founder handwritten warmth, red accent sparingly |
| **Headquarters** | Luxury beauty mansion, concierge warmth, mirror glow, appointment flow |
| **Campaigns** | Intimate direct language, glam without gimmick, personal stylist energy |
| **Target audiences** | Luxury hair clients, founder-led beauty believers, appointment-first buyers |
| **Orb behavior** | Hair bestie + executive concierge — protective, stylish, never generic SaaS |
| **Content direction** | Editorial beauty, product as ritual, founder warmth, no discount language |
| **Website experience** | Mansion corridors, concierge rooms, white/red/black polish, breathing room |

### 8.2 Studio OS™

| Application | Brand-informed output |
|-------------|----------------------|
| **Packaging** | Institutional product cards, manuscript paper cues, executive restraint |
| **Headquarters** | Marble executive institution, constitutional calm, red/gold approval glow |
| **Campaigns** | Legacy, expertise preservation, founder empowerment, no hype |
| **Target audiences** | Visionary founders, operators, institutional builders |
| **Orb behavior** | Chief of Staff crystal intelligence — precise, protective, strategic |
| **Content direction** | Concise executive clarity, architecture metaphors, permanent systems language |
| **Website experience** | Headquarters metaphor, institutional glass, cognitive calm |

### 8.3 NDX™

| Application | Brand-informed output |
|-------------|----------------------|
| **Packaging** | Broadcast panel cards, signal badges, dark acrylic, editorial metadata |
| **Headquarters** | Media command floor, newsroom urgency, screen fields |
| **Campaigns** | Signal detection, cultural relevance, headline-aware analysis |
| **Target audiences** | Media strategists, cultural analysts, publishing operators |
| **Orb behavior** | Producer / research editor / signal analyst — sharp, current, evidence-led |
| **Content direction** | Crisp media language, rundown rhythm, analytical confidence |
| **Website experience** | Newsroom desks, switcher motion, dark glass, editorial hierarchy |

Same Brand Intelligence Layer. Radically different strategic genomes.

---

## 9. Platform ownership

| Layer | Owner | Tenant-specific? |
|-------|-------|------------------|
| Brand Discovery Engine™ | Studio OS platform | No |
| Brand Intelligence Layer™ | Studio OS platform | No |
| Brand Elevation Engine™ | Studio OS platform | No |
| Brand Consistency Check™ | Studio OS platform | No |
| Strategic Brand DNA™ | Company / organization | Yes |
| Experience Brand DNA™ | Compiled per company | Yes |
| Brand discovery sessions | Company / founder | Yes |
| Brand elevation reports | Company / founder | Yes |

Companies own their Brand DNA™.

Studio OS owns the discovery, intelligence, elevation, and consistency engines.

---

## 10. Integration with existing systems

| Existing system | Relationship |
|-----------------|--------------|
| **Brand Architect (M53)** | Upstream creative architect; consumes and extends canonical Brand DNA |
| **Experience Architect (M54)** | Maps customer journey and touchpoints to Brand DNA rules |
| **Company Genome™** | Evidence source for values, decisions, confidence, learning |
| **Design Genome (M85)** | Organizational visual memory; informs but does not override Brand DNA |
| **Experience Engine / Runtime** | Downstream expression execution of compiled Experience Brand DNA |
| **Studio Foundry™** | Generation pipeline must pass Brand Consistency Check™ |
| **Orb™** | Leads discovery, evaluates contradictions, explains brand rationale |
| **Architect's Prompt Library™** | Brand-aware prompt templates inherit Brand DNA context |

---

## 11. Implementation posture

Implement incrementally without disrupting approved Experience Engine / Runtime:

1. Define Strategic Brand DNA schema and versioning.
2. Build Brand Discovery sessions with Orb Brand Strategist Mode™.
3. Publish Brand Intelligence Layer query API.
4. Add Experience Brand DNA compiler from strategic DNA.
5. Wire Brand Consistency Check™ into Studio Foundry and asset approval flows.
6. Add Brand Elevation Engine™ reports and DNA patch proposals.
7. Expand case-study seeds for Studio OS™, Frontal Slayer™, NDX™.

First proof:

- one canonical strategic Brand DNA per demo company
- one compiled Experience Brand DNA per company
- one Brand Consistency score on a sample asset
- Orb can explain why an asset passes or fails

---

## 12. Canon rule

```text
Studio OS understands brands as living strategic identities.

Brand Discovery Engine™ discovers them.
Brand DNA™ defines them.
Brand Intelligence Layer™ protects and applies them.
Brand Elevation Engine™ improves them.
Brand Consistency Check™ governs every generated output.

No brand decision should happen outside this system.
```

This is the permanent brand intelligence architecture for Studio OS.
