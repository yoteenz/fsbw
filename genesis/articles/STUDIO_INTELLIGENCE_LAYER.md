# Studio Intelligence Layer™

**Project:** Studio OS  
**System:** Studio Intelligence Layer™  
**Status:** Canonical architecture draft for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Parent:** Genesis™ · Orb™ · Company Genome™ · Institute of Knowledge™ · Experience Engine™ · Experience Runtime™ · Brand Discovery Engine™  
**Depends on:** Company Genome™, Brand DNA™, Experience Engine™, Experience Runtime™, Institute of Knowledge™, Orb™, Executive Headquarters™, Mission Engine™, Content Engine™, Studio Foundry™, Universal Decision Architecture™  
**Constitutional posture:** Studio OS must understand companies as living executive systems. It must reason from company truth, founder judgment, brand strategy, audience psychology, product identity, creative canon, and operating history before recommending action.

---

## 0. Prime directive

```text
Studio OS should not merely store business information.

Studio OS should understand how the company thinks, operates, decides,
creates, sells, learns, and evolves.
```

The Studio Intelligence Layer™ is the executive reasoning system that allows
Studio OS to behave like a senior leadership team instead of a collection of
software screens.

It sits above the registries and runtimes:

```text
Company Genome™
  + Brand DNA™
  + Institute of Knowledge™
  + Experience Engine™
  + Experience Runtime™
  + Mission Engine™
  + Executive Headquarters™
    -> Studio Intelligence Layer™
      -> executive reasoning
      -> recommendations
      -> canonical decisions
      -> compiled experiences
      -> guided action
```

The Intelligence Layer never replaces founder judgment. It prepares reasoning,
trade-offs, evidence, recommendations, and consequences so the founder can make
better decisions faster.

---

## 1. Intelligence hierarchy

```text
Studio Intelligence Layer™
  -> Company Operating Manual™
  -> Decision DNA™
  -> Taste Genome™
  -> Canon Engine™
  -> Experience Compiler™
  -> Audience DNA™
  -> Product DNA™
  -> Creative Genome™
```

### 1.1 Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Company Operating Manual™** | Living operational doctrine every AI worker consults before acting. |
| **Decision DNA™** | Founder decision model: trade-offs, risk, speed, approval, confidence, history, outcomes. |
| **Taste Genome™** | Founder creative fingerprint: approved/rejected aesthetics, confidence, patterns, anti-patterns. |
| **Canon Engine™** | Canonization governance: decides what is temporary, experimental, canonical, amended, archived, or reusable. |
| **Experience Compiler™** | Assembles complete branded operating environments from every intelligence and DNA layer. |
| **Audience DNA™** | Permanent audience intelligence used by marketing, content, product, experience, and sales decisions. |
| **Product DNA™** | Product identity layer: purpose, promise, lifecycle, packaging, launch, cross-sell, content, reviews. |
| **Creative Genome™** | Creative knowledge graph connecting campaigns, references, assets, decisions, approvals, and outcomes. |

---

## 2. Company Operating Manual™

The Company Operating Manual™ is the living operational constitution for a
company. It answers: **how does this business run when nobody is improvising?**

Every AI worker, Orb recommendation, workflow, automation, mission, and
department room must consult it before acting.

### 2.1 Manual scope

| Domain | Captures |
|--------|----------|
| **Operating philosophy** | Why the company operates the way it does; what must never be optimized away. |
| **Executive principles** | Founder standards, leadership expectations, decision posture, values in action. |
| **Department playbooks** | Department purpose, responsibilities, cadence, artifacts, escalation paths. |
| **SOPs** | Repeatable procedures, required inputs, responsible owner, quality gates, exceptions. |
| **Approval workflows** | Who approves what, confidence thresholds, founder review triggers, rollback rules. |
| **Quality standards** | Minimum acceptable quality, luxury floor, accuracy floor, service floor, accessibility floor. |
| **Launch processes** | Readiness checklist, pre-launch reviews, content packages, QA, rollback, after-action review. |
| **Marketing cadence** | Campaign rhythm, channel standards, calendar rules, approval gates, learning loops. |
| **Creative workflows** | Briefing, references, generation, review, revision, approval, archive, canonization. |
| **Product development** | Discovery, specification, prototype, launch, lifecycle, iteration, retirement. |
| **Customer support** | Tone, escalation, response time, recovery principles, compensation boundaries. |
| **Hiring** | Role scorecards, interview criteria, culture standards, onboarding, performance rituals. |
| **Meetings** | Cadence, purpose, agenda, attendance, decision capture, follow-up ownership. |
| **Automation rules** | What may automate, what must recommend only, what requires founder approval. |
| **Decision ownership** | Decision rights by domain, escalation triggers, accountability, audit trail. |
| **Escalation paths** | Risk classes, response SLAs, emergency doctrine, founder notification rules. |

### 2.2 Manual record

```typescript
type CompanyOperatingManual = {
  companyId: string;
  version: string;
  operatingPhilosophy: string;
  executivePrinciples: ExecutivePrinciple[];
  departmentPlaybooks: DepartmentPlaybook[];
  sops: StandardOperatingProcedure[];
  approvalWorkflows: ApprovalWorkflow[];
  qualityStandards: QualityStandard[];
  launchProcesses: LaunchProcess[];
  marketingCadence: MarketingCadence;
  creativeWorkflows: CreativeWorkflow[];
  productDevelopment: ProductDevelopmentDoctrine;
  customerSupport: SupportDoctrine;
  hiring: HiringDoctrine;
  meetings: MeetingDoctrine[];
  automationRules: AutomationRule[];
  decisionOwnership: DecisionOwner[];
  escalationPaths: EscalationPath[];
  canonStatus: 'draft' | 'approved' | 'canonical' | 'archived';
  founderApprovedAt?: string;
  updatedAt: string;
};
```

### 2.3 AI worker rule

Before acting, every AI worker must answer:

1. Which manual section governs this action?
2. Who owns this decision?
3. Is this action allowed to execute, or only recommend?
4. Which approval workflow applies?
5. Which quality standard applies?
6. Which escalation path applies if confidence drops?

If the answer is unknown, the worker must escalate or ask, not invent doctrine.

---

## 3. Decision DNA™

Decision DNA™ models how founders and executive teams make decisions. It learns
from approvals, rejections, revisions, outcomes, and explicit founder coaching.

Orb uses Decision DNA™ to make recommendations that feel like the founder's
judgment scaled through Studio OS.

### 3.1 Captured dimensions

| Dimension | Meaning |
|-----------|---------|
| **Risk tolerance** | Appetite for uncertainty, downside, reputational risk, financial risk. |
| **Speed vs quality** | Whether speed, polish, evidence, or craft wins in specific contexts. |
| **Luxury vs affordability** | Premium floor, discount aversion, accessibility philosophy, margin posture. |
| **Innovation vs convention** | When to invent, when to follow category expectations, when to reject trends. |
| **Automation preferences** | Execute automatically, recommend only, require approval, never automate. |
| **Leadership style** | Direct, nurturing, decisive, collaborative, visionary, protective, analytical. |
| **Approval patterns** | What the founder approves quickly, revises repeatedly, or rejects outright. |
| **Trade-off philosophy** | How conflicts resolve between growth, brand, cost, team, speed, quality. |
| **Long-term thinking** | Preference for durable infrastructure vs immediate conversion or quick wins. |
| **Platform philosophy** | How much the company values systemization, documentation, reusability. |
| **Decision confidence** | Evidence thresholds, uncertainty tolerance, confidence calibration. |
| **Decision history** | Decisions made, context, evidence, owner, alternatives, rationale. |
| **Decision outcomes** | Result quality, revenue/brand/team/customer impact, lessons learned. |

### 3.2 Decision DNA record

```typescript
type DecisionDna = {
  companyId: string;
  founderId: string;
  riskTolerance: ScaleProfile;
  speedQualityBias: ScaleProfile;
  luxuryAffordabilityBias: ScaleProfile;
  innovationConventionBias: ScaleProfile;
  automationPreferences: AutomationPreference[];
  leadershipStyle: string[];
  approvalPatterns: ApprovalPattern[];
  tradeOffPhilosophy: TradeOffRule[];
  longTermThinking: ScaleProfile;
  platformPhilosophy: string;
  confidenceModel: ConfidenceModel;
  decisionHistory: DecisionRecord[];
  decisionOutcomes: DecisionOutcome[];
  learnedPrinciples: string[];
  antiPatterns: string[];
  founderApprovedAt?: string;
  updatedAt: string;
};
```

### 3.3 Orb recommendation rule

Orb recommendations must include:

- Decision DNA signals used
- likely founder preference
- risks and trade-offs
- confidence score
- what would require founder approval
- what historical decision this resembles
- what outcome should be measured later

---

## 4. Taste Genome™

Taste Genome™ is the founder's creative fingerprint. It lets Studio OS learn
creative judgment instead of repeatedly asking for aesthetic preferences.

Taste Genome™ does not replace Brand DNA™. Brand DNA™ describes the brand's
strategic identity. Taste Genome™ models the founder's creative judgment,
preferences, rejections, confidence, and pattern recognition.

### 4.1 Captured taste signals

| Signal | Examples |
|--------|----------|
| **Typography** | Serif/sans, display energy, scale, handwritten tolerance, editorial preferences. |
| **Layout** | Density, asymmetry, whitespace, grid discipline, hero composition. |
| **Photography** | Lighting, angle, subject presence, editorial vs product-first, texture. |
| **Lighting** | Bright marble daylight, moody cinematic, salon glow, broadcast contrast. |
| **Luxury level** | Minimal premium, opulent, editorial, accessible, couture, executive restraint. |
| **Motion** | Stillness, subtle transitions, kinetic broadcast energy, ceremonial reveal. |
| **Illustration** | Iconic, hand-drawn, architectural, absent, editorial, playful. |
| **Copywriting** | Directness, warmth, institutional language, humor, intimacy, authority. |
| **Color preferences** | Primary/accent relationships, saturation, contrast, forbidden palettes. |
| **Animation** | Pace, easing, reveal style, delight tolerance, reduced-motion requirements. |
| **Architecture** | Mansion, headquarters, campus, command floor, salon, museum, lab. |
| **Interaction patterns** | Hover, focus, cards, rails, modals, confirmations, approval flows. |
| **Rejected ideas** | Explicit no-list with rationale and confidence. |
| **Approved ideas** | Canonical yes-list with rationale and reusable tags. |
| **Confidence levels** | How certain the system is that a pattern reflects durable taste. |

### 4.2 Taste learning loop

```text
Creative proposal
  -> founder approves / revises / rejects
  -> reason captured
  -> Taste Genome signal updated
  -> confidence adjusted
  -> Brand DNA + Experience DNA cross-check
  -> future recommendations adapt
```

### 4.3 Taste rule

Taste Genome™ may personalize recommendations. It may not override canonical
Brand DNA™, accessibility, quality standards, or founder-approved Company Canon.

---

## 5. Canon Engine™

The Canon Engine™ governs what becomes permanent. It protects Studio OS from
turning every brainstorm, generated asset, or one-off preference into permanent
truth.

Nothing becomes canonical automatically. Founder approval is always required.

### 5.1 Canon classes

| Class | Meaning |
|-------|---------|
| **Temporary** | Working material, session note, low-confidence observation. |
| **Experiment** | Trial pattern or output being evaluated. |
| **Company Canon** | Permanent operational truth about the company. |
| **Brand Canon** | Permanent strategic or expressive Brand DNA truth. |
| **Knowledge Canon** | Approved Institute of Knowledge material. |
| **Genesis Amendment** | Canonical platform/kernel change. |
| **Prompt Library Asset** | Reusable approved prompt, workflow, or instruction. |
| **Experience DNA** | Approved expression layer consumed by Experience Engine/Runtime. |
| **Platform Pattern** | Reusable Studio OS pattern beyond one company. |
| **Archive** | Retained historical material not currently active. |

### 5.2 Canonization pipeline

```text
Candidate information
  -> classify
  -> evidence attach
  -> contradiction scan
  -> owner assignment
  -> founder review
  -> approval / revision / rejection / archive
  -> versioned canonical record
  -> downstream invalidation + recompile
```

### 5.3 Canon Engine rules

1. No AI worker can canonize information silently.
2. Canon candidates must include source, rationale, confidence, affected systems,
   contradiction check, and rollback plan.
3. Founder approval is required for Company Canon, Brand Canon, Genesis
   Amendment, Experience DNA, and Platform Pattern.
4. Canon may be superseded but not erased; history remains searchable.
5. Canon changes trigger recompilation for affected experiences, prompts,
   workflows, manuals, and recommendations.

---

## 6. Experience Compiler™

Experience Compiler™ is the intelligence-aware compiler responsible for
assembling complete branded operating environments.

Experience Engine™ defines the inheritance model. Experience Runtime™ executes
it. Experience Compiler™ decides **which intelligence and DNA inputs should be
assembled for this mission, audience, role, device, state, and business context**.

### 6.1 Inputs

| Input | Use |
|-------|-----|
| **Platform DNA** | Platform anatomy, accessibility floor, layout contracts. |
| **Brand DNA** | Strategic brand, voice, positioning, expression constraints. |
| **Department DNA** | Operational wing purpose, color, language, workflow rules. |
| **Scene DNA** | Environment structure, zones, object graph, density. |
| **Component DNA** | Component anatomy, variants, token bindings. |
| **Motion DNA** | Motion pacing, transitions, reduced-motion equivalents. |
| **Interaction DNA** | Hover/focus/select/loading/success/warning/approval patterns. |
| **Audience DNA** | Who the experience is for and what transformation they need. |
| **Decision DNA** | Founder trade-off preferences and approval posture. |
| **State** | Current session, user, workflow, progress, pending approvals. |
| **Mission** | Current objective or business task. |
| **Role** | Founder, team member, client, AI worker, guest, customer. |
| **Device** | Desktop, mobile, kiosk, public display, reduced capability. |

### 6.2 Output

The compiler outputs a **Complete Branded Operating Environment™**:

- resolved experience graph
- brand/department/scene/component/motion/interaction bindings
- audience-specific emphasis
- decision-aware defaults
- Orb context
- quality gates
- state slots
- approval requirements
- runtime compile manifest
- explainability trace

### 6.3 Compiler hierarchy

```text
Mission + Role + Device + State
  -> Intelligence Context Resolver™
  -> DNA Selector™
  -> Audience/Decision/Taste weighting
  -> Experience Engine inheritance profile
  -> Experience Runtime graph
  -> Quality + Canon gates
  -> Complete branded operating environment
```

---

## 7. Audience DNA™

Audience DNA™ is the permanent audience intelligence model. Every marketing,
content, product, pricing, community, and experience decision should consult it.

### 7.1 Audience DNA fields

| Field | Captures |
|-------|----------|
| **Demographics** | Age, location, income, profession, life stage, household, market segment. |
| **Psychographics** | Identity, beliefs, fears, aspirations, status signals, self-image. |
| **Emotional triggers** | Desire, insecurity, pride, belonging, urgency, relief, transformation. |
| **Buying motivations** | Functional, emotional, social, identity, luxury, convenience, trust. |
| **Luxury expectations** | Service level, design expectation, exclusivity, packaging, proof, speed. |
| **Communication preferences** | Tone, length, directness, visuals, channels, proof, story. |
| **Learning preferences** | Tutorial, expert guidance, visual examples, checklist, concierge, community. |
| **Platform preferences** | Mobile/desktop, social channels, marketplace habits, content formats. |
| **Shopping behaviors** | Discovery, comparison, objections, cart behavior, review reliance, financing. |
| **Community behaviors** | Sharing, referrals, belonging, rituals, events, creator influence. |
| **Cultural references** | Influences, aesthetics, media, language, trends, taboo references. |
| **Pain points** | Frictions, anxieties, unmet needs, category distrust, service failures. |
| **Desired transformation** | How the audience wants life, work, identity, or status to change. |

### 7.2 Audience rule

Marketing decisions must declare which Audience DNA segment they serve and which
trigger, motivation, or transformation they are activating. Generic marketing is
a failure of intelligence.

---

## 8. Product DNA™

Product DNA™ is the identity layer for products. It lets Studio OS understand
products as strategic assets, not inventory rows.

### 8.1 Product DNA fields

| Field | Captures |
|-------|----------|
| **Purpose** | Why the product exists and what business/customer job it performs. |
| **Emotional promise** | How the product should make the customer feel. |
| **Visual language** | Product-specific materials, colors, texture, form, presentation. |
| **Packaging rules** | Box, inserts, labels, rituals, unboxing, protection, luxury floor. |
| **Photography rules** | Angles, lighting, model use, background, details, scale, styling. |
| **Launch strategy** | Campaign sequence, teaser, offer, audience, proof, scarcity, post-launch. |
| **Audience fit** | Primary/secondary segments, buying motivations, objections. |
| **Lifecycle** | New, flagship, evergreen, seasonal, limited, retiring, archived. |
| **Cross-selling relationships** | Bundles, companions, dependencies, compatible products. |
| **Upsell rules** | When to upgrade, premium alternatives, financing, service add-ons. |
| **Competitive positioning** | Category alternatives, difference, price defense, proof. |
| **Content requirements** | PDP copy, FAQs, tutorials, social, email, video, comparison content. |
| **Review patterns** | Common praise, objections, returns, defects, sentiment, proof language. |

### 8.2 Product reasoning rule

Every generated product page, campaign, packaging concept, social post, and
upsell must consult Product DNA™ plus Brand DNA™ plus Audience DNA™. If these
conflict, Product DNA™ cannot override Brand Canon or customer trust.

---

## 9. Creative Genome™

Creative Genome™ is the complete creative knowledge graph. It connects every
creative artifact, reference, decision, approval, rejection, campaign, and result.

### 9.1 Connected objects

- campaigns
- photography
- packaging
- motion
- video
- moodboards
- typography
- music
- brand references
- generated assets
- creative decisions
- approvals and rejections
- revisions
- source prompts
- performance outcomes
- canon status

### 9.2 Creative graph relationships

| Relationship | Meaning |
|--------------|---------|
| **inspired_by** | Asset or campaign references another creative object. |
| **approved_for** | Founder approved object for a brand, campaign, product, or platform pattern. |
| **rejected_for** | Founder rejected object with rationale. |
| **derived_from** | Generated or edited asset descends from a prompt, moodboard, or source. |
| **belongs_to_campaign** | Asset is part of a campaign system. |
| **expresses_brand_rule** | Asset expresses a Brand DNA or Experience DNA rule. |
| **targets_audience** | Asset targets an Audience DNA segment. |
| **supports_product** | Asset supports a Product DNA profile. |
| **became_canon** | Asset or pattern became canon through Canon Engine approval. |
| **archived_after** | Asset was retired after campaign, season, or replacement. |

### 9.3 Creative search rule

Everything creative must be searchable by brand, audience, product, campaign,
emotion, aesthetic, approval status, founder rationale, prompt, source asset,
performance, and canon class.

---

## 10. Intelligence relationships

### 10.1 Relationship matrix

| System | Studio Intelligence relationship |
|--------|----------------------------------|
| **Orb™** | Primary conversational executive interface. Uses Decision DNA, Manual, Canon, Audience/Product/Creative intelligence to recommend, challenge, explain, and escalate. |
| **Company Genome™** | Source of company identity, structure, goals, history, and operating truth. Intelligence Layer interprets and reasons over it. |
| **Institute of Knowledge™** | Stores canonical knowledge, lessons, prompt assets, manuals, and reusable doctrine. Canon Engine decides what graduates into Knowledge Canon. |
| **Experience Engine™** | Receives Brand, Taste, Audience, Decision, Product, and Creative signals as compiled Experience DNA constraints. |
| **Experience Runtime™** | Executes compiled environments and returns state, behavior, and outcome signals to the Intelligence Layer. |
| **Brand Discovery™** | Owns Strategic Brand DNA. Intelligence Layer consumes Brand DNA and cross-checks brand decisions against Audience/Product/Taste/Canon. |
| **Content Engine™** | Uses Audience DNA, Brand DNA, Product DNA, Creative Genome, and Decision DNA to generate content that fits strategy. |
| **Studio Foundry™** | Uses Taste Genome, Creative Genome, Canon Engine, and Brand DNA to generate assets under approval workflows. |
| **Mission Engine™** | Converts business goals into missions using Manual rules, Decision DNA, Audience/Product intelligence, and operational impact. |
| **Executive Headquarters™** | Home for executive reasoning surfaces: board recommendations, approvals, risks, canon candidates, operating manual, missions. |

### 10.2 Event relationships

```text
Founder decision made
  -> Decision DNA learns
  -> Canon candidate may be created
  -> Company Operating Manual may update
  -> Experience Compiler may recompile affected HQ rooms

Creative asset approved
  -> Taste Genome learns
  -> Creative Genome edge created
  -> Brand Consistency score stored
  -> Canon Engine proposes Brand Canon / Experience DNA / Archive

Product launch completed
  -> Product DNA outcome updates
  -> Audience DNA behavior updates
  -> Company Operating Manual launch process learns
  -> Mission Engine creates after-action mission
```

---

## 11. Executive Intelligence™

Executive Intelligence™ is the reasoning posture used when Studio OS makes any
meaningful recommendation.

Every recommendation must consider:

- Brand
- Audience
- Products
- founder preferences
- business goals
- knowledge
- history
- creative direction
- financial impact
- operational impact
- long-term platform implications

### 11.1 Executive reasoning frame

```text
Question / mission / opportunity
  -> gather company truth
  -> gather brand truth
  -> gather audience truth
  -> gather product truth
  -> gather decision/taste signals
  -> gather knowledge + history
  -> evaluate financial impact
  -> evaluate operational impact
  -> evaluate platform implication
  -> identify contradictions
  -> produce recommendation + alternatives + risks + approval path
```

### 11.2 Recommendation object

```typescript
type ExecutiveRecommendation = {
  recommendationId: string;
  companyId: string;
  missionId?: string;
  summary: string;
  recommendedAction: string;
  alternatives: string[];
  evidence: EvidenceReference[];
  brandImpact: ImpactAssessment;
  audienceImpact: ImpactAssessment;
  productImpact: ImpactAssessment;
  financialImpact: ImpactAssessment;
  operationalImpact: ImpactAssessment;
  platformImpact: ImpactAssessment;
  decisionDnaSignals: string[];
  tasteGenomeSignals: string[];
  canonImplications: CanonImplication[];
  confidence: number;
  requiresFounderApproval: boolean;
  approvalWorkflowId?: string;
  rollbackPlan?: string;
};
```

### 11.3 Recommendation rule

Studio OS must not recommend action from a single subsystem perspective when the
decision affects multiple domains. A marketing recommendation must also consider
brand, audience, products, operations, finance, founder preference, and long-term
platform implication.

---

## 12. Governance and safeguards

1. **Founder approval required for canon.** The Intelligence Layer can propose,
   classify, and explain canon candidates, but cannot canonize them silently.
2. **Evidence-first reasoning.** Recommendations cite source objects, history,
   decisions, outcomes, and confidence.
3. **No preference overfitting.** Taste Genome and Decision DNA must distinguish
   durable founder judgment from one-off contextual choices.
4. **No brand drift.** Brand DNA and Brand Canon constrain creative and commercial
   recommendations unless founder approves a Brand Canon update.
5. **Manual before automation.** AI workers consult Company Operating Manual™
   before executing workflows.
6. **Experience compilation is auditable.** Every compiled operating environment
   includes a manifest showing which DNA/intelligence layers were used.
7. **Contradictions escalate.** Conflicts between Company Canon, Brand Canon,
   Knowledge Canon, Manual, Decision DNA, and mission goals require explanation
   and review.
8. **Learning is versioned.** Decision, taste, audience, product, and creative
   learning updates are versioned with source evidence and confidence.

---

## 13. Success definition

Studio Intelligence Layer™ succeeds when:

- Studio OS understands why a company operates a certain way
- Orb recommendations feel like senior executive reasoning
- AI workers consult the company manual before acting
- founder preferences are learned without repetitive questioning
- creative decisions become searchable and connected
- canon is protected from accidental drift
- marketing consults Audience DNA before shipping
- product decisions consult Product DNA before launch
- experiences compile from business truth, not page-by-page invention
- every recommendation explains brand, audience, product, financial,
  operational, historical, creative, and platform implications

Studio OS should now begin thinking like an executive board.
