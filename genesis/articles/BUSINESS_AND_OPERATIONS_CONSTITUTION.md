# Business & Operations Constitutional Amendment™

**Project:** Studio OS  
**Status:** Constitutional architecture proposal for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Decision:** Reject new peer engines named **Business DNA™** and **Operations DNA™**.  
**Amends:** Company Genome™, Studio Intelligence Layer™, Brand Discovery Engine™,
Experience Engine™, Experience Runtime™, Workflow Engine™, Business Discovery™

---

## 0. Executive decision

The proposal identifies a real need: Studio OS must understand how a company
creates value and operates before it can responsibly generate departments,
workflows, headquarters, or experiences.

The proposed solution is architecturally incorrect.

Studio OS must **not** introduce Business DNA™ and Operations DNA™ as new,
independent constitutional engines.

Doing so would duplicate existing constitutional owners:

| Proposed engine | Existing owners it would overlap |
|---|---|
| **Business DNA™** | Company Genome™, Business Genome™, Business Discovery™, Audience DNA™, Product DNA™, Company Operating Manual™ |
| **Operations DNA™** | Company Genome™ Operational DNA™, Company Operating Manual™, Workflow Engine™, Universal Interaction Model™, Studio Production System™ |

The constitutional correction is:

```text
Founder context
  -> Company Genome™
      -> Business Architecture™ facet
      -> Operating Model™ facet
      -> Operational DNA™ preference strand
  -> Studio Intelligence Layer™
      -> Company Operating Manual™
      -> Decision / Audience / Product / Creative intelligence
  -> Workflow Engine™
  -> Brand Discovery™
  -> Experience Compiler™
  -> Experience Engine™
  -> Experience Runtime™
```

**Business Architecture™** and **Operating Model™** are bounded, versioned
facets of Company Genome™. They are not peer engines and they do not own
parallel memory stores.

---

## 1. Answers to the constitutional questions

### 1.1 Should Studio OS understand the business before the brand?

**Yes, in causal order; no, as a total ordering of all intelligence.**

Business architecture determines the durable constraints under which a brand
must operate: value creation, customer promise, offers, economics, regulated
boundaries, delivery model, lifecycle, and operating capability.

Brand is not downstream decoration. Brand is a strategic identity system that
interprets and expresses the company’s purpose, category, audience, and
commercial posture.

Therefore:

```text
Business architecture constrains Brand DNA™.
Brand DNA™ expresses and differentiates the business.
Neither system may silently overwrite the other.
```

Example: a premium membership business may require a trust-forward service
model; it does not determine whether the brand feels editorial, intimate, or
institutional. Those are Brand DNA™ decisions.

### 1.2 Is Business DNA™ the highest business abstraction?

**No. Company Genome™ remains the highest company abstraction.**

The hierarchy above a company is founder context, not another company engine:

```text
Founder Genome™ / Founder Decision Context
  -> Company Genome™
    -> company identity, learned beliefs, business architecture,
       operating model, brand/creative/visual/operational preference strands
```

Introducing an engine above Company Genome™ would split company truth between
two apex stores. That violates the existing no-duplicate-genome rule.

### 1.3 Should Operations DNA™ exist independently?

**No. The term already has an appropriate bounded meaning.**

**Operational DNA™** remains a Company Genome™ learning strand for stable
execution preferences, such as approval tempo, quality tier, regeneration
tolerance, reuse posture, and cost/quality bias.

It must not become the owner of procedures, workflow graphs, department
relationships, capacity plans, or routing logic.

Those responsibilities are split deliberately:

| Concern | Constitutional owner |
|---|---|
| Learned operational preferences | Company Genome™ Operational DNA™ |
| Operating doctrine, roles, approvals, SOPs, escalation | Company Operating Manual™ |
| Executable process topology, triggers, state, retries | Workflow Engine™ + Universal Interaction Model™ |
| Department production work | Studio Production System™ |
| Continuous creative coordination | Creative Operating System™ |

### 1.4 Should Department DNA™ inherit from Operations DNA™?

**Not as a general law. The question conflates two Department DNA meanings.**

1. **Experience Department DNA™** defines how a department’s environment feels.
   It inherits from **Experience Brand DNA™**, then specializes into a
   department/scene expression. It must not inherit operating procedures.
2. **Department operating charters** define mandate, decision rights, capacity,
   interfaces, SLAs, and playbooks. They are compiled from the **Operating
   Model™**, Company Operating Manual™, and Workflow Engine references.

Use the explicit term **Department Operating Charter™** for the second concept.
Do not overload Experience Department DNA™ with operations.

### 1.5 Should Brand DNA™ inherit from Business DNA™?

**No direct inheritance. Use governed constraints and a strategic brief.**

Brand DNA™ must remain an independent strategic identity system. It consumes a
read-only **Business Architecture Brief™** containing the relevant constraints:

- category and customer promise
- offer and service boundaries
- market positioning constraints
- regulatory / trust requirements
- commercial posture
- lifecycle and channel realities

Brand DNA™ may propose a change that conflicts with business architecture, but
the conflict must become a Decision DNA™ / founder decision, never an implicit
override.

### 1.6 Does this simplify the architecture?

**Yes.** It preserves one owner per truth class:

```text
Business facts / learned company beliefs  -> Company Genome™
Operating doctrine                         -> Company Operating Manual™
Executable workflows                       -> Workflow Engine™
Brand strategy                             -> Brand Discovery / Strategic Brand DNA™
Experience expression                      -> Experience Engine™
Runtime assembly                           -> Experience Runtime™
```

---

## 2. Rejected hierarchy and replacement

### 2.1 Why the proposed linear hierarchy is incorrect

```text
Business DNA™
  -> Operations DNA™
    -> Department DNA™
      -> Brand DNA™
        -> Design DNA™
          -> Experience Engine™
            -> Studio Runtime™
              -> Studio Experience™
```

It is incorrect because:

1. It treats a dependency graph as a single inheritance chain.
2. It places Brand DNA™ below Department DNA™, even though Experience
   Department DNA™ already inherits from Brand DNA™.
3. It treats Design DNA™ as company-derived, while Studio OS Design DNA™ is
   the platform’s visual constitution.
4. It merges operating doctrine, executable workflow, spatial department
   topology, and visual expression.
5. It makes Studio Runtime™ ambiguous: Experience Runtime™, Workspace Runtime™,
   and Department/Studio Runtime™ have distinct responsibilities.
6. It removes the Studio Intelligence Layer™ even though that layer owns
   operational doctrine, Decision DNA™, Audience DNA™, Product DNA™, and
   Experience Compiler™.

### 2.2 Replacement dependency graph

```text
Founder context
  -> Business Discovery™
    -> Company Genome™
      -> Business Architecture™            [company facts + economic model]
      -> Operating Model™                  [operating shape + capability model]
      -> Operational DNA™                  [learned execution preferences]
      -> Business Architecture Brief™ -----+
      -> Operating Model Brief™ -----------+-----------------------------+
                                                                            |
Studio Intelligence Layer™ <------------------------------------------------+
  -> Company Operating Manual™      [doctrine / SOP / ownership / approval]
  -> Decision DNA™                  [trade-offs and founder judgment]
  -> Audience DNA™ / Product DNA™   [market and offer intelligence]
  -> Experience Compiler™           [mission-specific selection / weighting]
        |                                      |
        +-> Workflow Engine™                   +-> Brand Discovery Engine™
        |    [executable work]                      -> Strategic Brand DNA™
        |                                                     |
        +-> Department Operating Charters™                  |
                                                              v
Studio OS Design DNA™ ------------------------------> Experience Engine™
                                                        -> Experience Brand DNA™
                                                          -> Experience Department DNA™
                                                            -> Scene / Component / Motion /
                                                               Interaction DNA™
                                                                  -> Experience Runtime™
                                                                     -> Studio Experience™
```

This is a directed dependency graph, not an inheritance ladder.

---

## 3. Constitutional responsibilities

| System | Single responsibility | Explicit non-responsibilities |
|---|---|---|
| **Company Genome™** | Company-level, confidence-scored truth and learned beliefs. | SOPs, workflow execution, UI rendering. |
| **Business Architecture™ facet** | Economic and value-creation structure of one company. | Brand expression, process execution, headquarters UI. |
| **Operating Model™ facet** | Structural shape of how one company organizes and delivers work. | Step-by-step procedures, learned preference, UI theming. |
| **Operational DNA™** | Learned stable execution preferences. | Operating doctrine and process graphs. |
| **Company Operating Manual™** | Founder-approved operating doctrine, decision rights, playbooks, SOPs, approvals, escalation. | Belief learning, runtime execution, employee-facing projection ownership. |
| **Workflow Engine™** | Executable workflow topology and lifecycle. | Policy invention, brand strategy, company truth. |
| **Department Operating Charter™** | Department mandate, interfaces, decision rights, capability/capacity assumptions. | Visual department expression. |
| **Strategic Brand DNA™** | Company identity, positioning, voice, promise, differentiation. | Revenue truth, SOPs, runtime assembly. |
| **Studio OS Design DNA™** | Platform-wide visual constitution for Studio OS. | Per-company brand strategy. |
| **Experience Engine™** | Validates and resolves branded experience-expression inheritance. | Company business facts and real-time rendering. |
| **Experience Compiler™** | Selects and weights relevant intelligence for a mission, role, device, and state. | Owning source DNA. |
| **Experience Runtime™** | Executes the resolved experience safely with state continuity. | Inventing narrative, business, or operating doctrine. |
| **Studio Intelligence™** | Evidence retrieval, reasoning, recommendation, and governed learning across source systems. | Replacing founder judgment or source-of-truth ownership. |
| **Studio Experience™** | The founder/team-facing experience generated from resolved intelligence and DNA. | Owning the intelligence it presents. |
| **Studio OS™** | Platform infrastructure: identity, tenancy, storage, APIs, integrations, policy enforcement. | Defining each company’s business model. |

---

## 4. Business Architecture™ facet

Business Architecture™ belongs inside Company Genome™ and is initially produced
by Business Discovery™. Its job is to answer:

```text
How does this company create, deliver, capture, and sustain value?
```

### 4.1 Required fields

Business Architecture™ should own:

- industry / category and regulatory context
- business model and revenue model
- offer, product, service, membership, subscription, and marketplace model
- unit of value and primary customer promise
- pricing, margin, cost-to-serve, and monetization constraints
- customer segments, buying committee, and customer lifecycle
- demand sources and channel assumptions
- fulfillment / delivery model
- inventory, manufacturing, procurement, or supply-chain model where relevant
- intellectual-property, rights, privacy, and compliance constraints
- required capabilities and strategic partners
- company stage, growth posture, and capital constraints
- business-level success metrics and leading/lagging indicators
- headquarters capability requirements

### 4.2 Exclusions

Business Architecture™ must not own:

- detailed department procedures
- workflow definitions
- executive approval policy
- AI worker routing
- brand visual identity
- experience components, scenes, or runtime state

### 4.3 Missing concepts from the original proposal

The original list should add:

- legal entity / jurisdiction and regulatory exposure
- data classification, privacy, and records obligations
- rights, licensing, and intellectual-property posture
- unit economics and cost-to-serve
- procurement and vendor dependency
- resilience / continuity requirements
- ecosystem and partner model
- company stage and capital allocation posture
- strategic moat and capability dependencies
- measurable leading indicators, not only outcome metrics

---

## 5. Operating Model™ facet

Operating Model™ belongs inside Company Genome™ and answers:

```text
What enduring organizational capabilities, boundaries, and coordination patterns
must exist for this company to deliver its promise?
```

It is structural, not procedural.

### 5.1 Required fields

Operating Model™ should own:

- value-stream map from demand to value realization
- operating lifecycle and major business states
- capability map and required departments
- department interfaces and handoff contracts
- decision-rights map and escalation topology
- customer, product, finance, risk, and knowledge ownership boundaries
- service levels and operating cadence
- capacity and resource-planning assumptions
- automation suitability classifications
- control points, risk classes, and audit requirements
- measurement architecture and feedback loops
- required systems of record and integration boundaries
- resilience, fallback, and continuity posture
- AI workforce eligibility and human approval boundaries

### 5.2 Explicit handoffs

| Operating Model output | Recipient |
|---|---|
| Department capability + interface definitions | Department Operating Charters™ |
| Approval / escalation boundaries | Company Operating Manual™ + Decision DNA™ |
| Workflow candidates and lifecycle states | Workflow Engine™ |
| Capacity assumptions / service levels | Mission Control™ + resource planning surfaces |
| AI eligibility and restricted actions | Studio Intelligence policy layer / AI workforce governance |
| HQ role and capability requirements | Executive Headquarters™ + Experience Compiler™ |

### 5.3 Missing concepts from the original proposal

The original list should add:

- ownership and accountability model
- exception / incident / crisis management
- policy and compliance controls
- data stewardship and systems-of-record map
- service-level objectives and quality floors
- change-management and versioning rules
- observability, auditability, and provenance
- human-in-the-loop boundaries
- vendor and integration failure handling
- continuity and disaster-recovery expectations

---

## 6. Inheritance and influence model

No consumer receives mutable inheritance from Business Architecture™ or Operating
Model™. Consumers receive a versioned, read-only brief plus traceable references.

```text
Company Genome snapshot
  -> Business Architecture Brief™
  -> Operating Model Brief™
  -> consumer-specific compilation
  -> recommendation / configuration / workflow proposal
  -> founder or delegated approval where policy requires
```

### 6.1 Consumer influence

| Consumer | Influence |
|---|---|
| **Company Genome™** | Owns the facets, their confidence, provenance, version history, and contradictions. |
| **Narrative Intelligence™** | Uses audience, offer, proof, category, and trust constraints to determine what narrative is credible; it does not invent the commercial model. |
| **Creative Operating System™** | Uses strategic priorities, resource constraints, capability requirements, and risk posture when councils recommend creative initiatives. |
| **AI Workforce™** | Receives eligible role boundaries, authority limits, data classification, approval/escalation policy, and required manual sections. |
| **Executive Headquarters™** | Receives capability, decision, and briefing requirements; it hosts projections and never becomes business truth. |
| **Institute of Knowledge™** | Receives approved manuals, rationale, decisions, playbooks, learning records, and versioned briefs with provenance. |
| **Mission Engine™** | Converts priorities and value streams into governed missions; it does not define strategy or operating doctrine. |
| **Studio Foundry™** | Uses approved capability needs and reusable constraints to build systems/assets; it cannot infer company policy. |
| **Experience Runtime™** | Receives only compiled Experience DNA and safe state/role constraints; it never reads raw operating doctrine to determine UI styling. |
| **Orb™** | Retrieves evidence across these sources and explains conflicts, uncertainty, and decision options; Orb owns no source truth. |
| **Future engines** | Must declare whether they consume a business brief, operating brief, manual, workflow, or experience compilation. They may not create duplicate primary stores. |

---

## 7. New-company onboarding architecture

Studio OS should be able to generate a first governed company model from roughly
twenty strategic prompts. It must not pretend that twenty answers produce
permanent truth.

The output is a **provisional, confidence-scored Company Genome™** that requires
validation through decisions and operations.

### 7.1 Founder consultation sequence

1. **Founder context** — mission, values, decision posture, ambition, non-negotiables.
2. **Value creation** — customer problem, offer, customer promise, category.
3. **Economics** — revenue model, pricing, cost drivers, capital constraints.
4. **Customer lifecycle** — acquisition, conversion, delivery, support, retention.
5. **Delivery reality** — products/services, fulfillment, inventory/manufacturing where applicable.
6. **Operating shape** — current team, required capabilities, decision ownership, bottlenecks.
7. **Risk and trust** — regulation, privacy, rights, quality, reputation, founder approvals.
8. **Brand direction** — desired positioning, distinction, audience perception, anti-patterns.
9. **Experience ambition** — required HQ capabilities, roles, surfaces, and modes.
10. **Validation** — Orb surfaces assumptions, confidence gaps, contradictions, and first priorities.

### 7.2 Compilation sequence

```text
Founder answers + evidence
  -> Founder context draft
  -> Company Genome™ provisional snapshot
      -> Business Architecture™ facet
      -> Operating Model™ facet
      -> Operational DNA™ initial hypotheses
  -> Company Operating Manual™ draft
  -> Department Operating Charter™ proposals
  -> AI workforce eligibility / authority proposals
  -> Workflow Engine™ draft graphs
  -> Strategic Brand DNA™ brief and draft
  -> Experience Compiler™ brief
  -> Executive Headquarters™ capability proposal
  -> Experience DNA™ proposal
  -> Adaptive workspaces
  -> Founder review and staged activation
```

### 7.3 Activation gates

| Gate | Required before |
|---|---|
| Founder validates company purpose, offer, customers, and constraints | Any autonomous external action |
| Founder approves decision rights and restricted-action policy | AI workforce execution |
| Manual approval and workflow validation | Operational automation |
| Brand approval | Public experience / communication assembly |
| Experience QA and accessibility review | Workspace/HQ activation |

The onboarding flow should generate a coherent proposal, not falsely claim
complete organizational understanding.

---

## 8. Scalability and governance

### 8.1 Multi-company scalability

- Every Company Genome snapshot is tenant-scoped, versioned, and immutable once
  used in a material decision or external action.
- Shared Studio OS templates are capability templates, not shared company truth.
- Cross-company learning requires explicit permission, anonymization, and
  provenance; no company data becomes generic intelligence by default.
- Brand and operating models may share a framework but never share mutable
  identity records.

### 8.2 Change governance

| Change | Required governance |
|---|---|
| Business Architecture fact | Evidence source + owner + confidence + review date |
| Operating Model change | Impact analysis across department charters, workflows, manual, metrics, AI authority |
| Operational DNA preference | Sufficient repeated evidence; reversible update; founder visibility |
| Manual doctrine | Owner, approval policy, version, rollback / exception path |
| Workflow | Simulation / validation, audit trail, owner, rollback |
| Brand or experience implication | Brand approval + Experience Engine validation |

### 8.3 Canonization rules

1. No inference becomes permanent company doctrine automatically.
2. Inferred facts expire or request confirmation when evidence is weak.
3. A workflow cannot grant authority beyond the manual and policy layer.
4. A visual environment cannot silently imply operational authority.
5. Every compiled brief must preserve source version IDs and reasoning.
6. Conflicts are first-class objects; do not flatten them into an average.
7. Founder approval remains required for constitutional, high-risk, and
   externally consequential changes.

---

## 9. Architectural risks and mitigations

| Risk | Consequence | Constitutional mitigation |
|---|---|---|
| Duplicate truth stores | Contradictory recommendations and unsafe compilation | Company Genome remains the single owner of company beliefs/facts. |
| “DNA” becomes an overloaded marketing term | Resolver ambiguity and arbitrary precedence | Name every layer by its responsibility; tag experience vs operating concepts. |
| Linear inheritance model | Brand, operations, and experience become incorrectly coupled | Use versioned dependency graph plus consumer-specific compilation. |
| Twenty-question overconfidence | Unsafe automation based on shallow onboarding | Confidence, provenance, activation gates, and evidence-seeking behavior. |
| AI authority creep | AI executes actions without appropriate consent | Manual + Decision DNA + policy and workflow gates. |
| Brand/business conflict hidden by inheritance | Strategic decisions become invisible | Surface conflict as a Decision DNA™ object with founder options. |
| Operational manual becomes a second genome | Drift between “what is true” and “how to act” | Genome owns facts; Manual owns doctrine; Workflow owns execution. |
| HQ becomes a configuration source | UI edits mutate business policy | Headquarters is a projection and approved command surface only. |
| Excessive granularity | Implementation slows while owners overlap | Add a constitutional engine only when no existing owner can hold the truth without violating its single responsibility. |

---

## 10. Recommended constitutional amendments

1. **Reject** Business DNA™ as a separate constitutional engine.
2. **Reject** Operations DNA™ as a separate constitutional engine.
3. Amend **Company Genome™** to explicitly own:
   - Business Architecture™ facet
   - Operating Model™ facet
   - Operational DNA™ as the learned preference strand
4. Amend **Studio Intelligence Layer™** to require Company Operating Manual™,
   Decision DNA™, and Experience Compiler™ to consume versioned Business
   Architecture and Operating Model briefs.
5. Define **Department Operating Charter™** as the non-visual department model.
   Preserve **Experience Department DNA™** exclusively for environment
   inheritance.
6. Amend **Brand Discovery Engine™**: Strategic Brand DNA™ consumes business
   constraints through a brief, not direct mutable inheritance.
7. Amend **Experience Engine™ / Runtime™**: they consume compiled expression
   outputs only; neither may become a reader or owner of raw operating doctrine.
8. Amend **Business Discovery™**: produce provisional facets with confidence,
   provenance, and founder validation gates rather than declaring completed DNA.
9. Establish a **No Duplicate Company Truth** constitutional rule:

```text
Company beliefs and business/operating facts -> Company Genome™
Operating doctrine                            -> Company Operating Manual™
Executable process                            -> Workflow Engine™
Experience expression                         -> Experience Engine™
Rendered environment                          -> Experience Runtime™
```

10. Do not authorize implementation until the Company Genome canonical article
    and these ownership boundaries are reviewed by Genesis.

---

## 11. Approval recommendation

Approve the **intent**:

```text
Studio OS must understand business architecture and operating model before it
proposes departments, AI authority, workflows, headquarters capabilities, or
experience environments.
```

Reject the **proposed new-engine form**.

Adopt this amendment’s bounded facets and ownership model instead.

This is the minimum architecture that improves company comprehension without
creating a second company genome, a second operating manual, or a second
workflow system.
