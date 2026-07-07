# Master Content Pipeline™ — Lifecycle Gates Reference

**Parent:** [Master Content Pipeline™](./master-content-pipeline.md)  
**Type:** Architecture & documentation (operating model upgrade · not a Design Revision · not a new milestone)

This document defines the **ten canonical lifecycle gates** for Studio OS content. Every gate uses the same schema so products, concierges, and AI systems share one vocabulary.

---

## Gate index

| Gate | Entry | Exit |
|------|-------|------|
| [DISCOVER GATE™](#discover-gate) | Idea exists | Approved Creative Brief |
| [DEVELOP GATE™](#develop-gate) | Creative Brief | Production Blueprint |
| [ASSEMBLY GATE™](#assembly-gate) | Production Blueprint | Production Ready |
| [PRODUCTION GATE™](#production-gate) | Production Ready | Master Content Asset |
| [REVIEW GATE™](#review-gate) | Master Content Asset | Approved Master Asset |
| [EXPANSION GATE™](#expansion-gate) | Approved Master Asset | Derivative Library |
| [APPROVAL GATE™](#approval-gate) | Derivative Library | Publishing Package |
| [PUBLISH GATE™](#publish-gate) | Publishing Package | Published Assets |
| [MEASURE GATE™](#measure-gate) | Published Assets | Performance Report |
| [LEARNING GATE™](#learning-gate) | Performance Report | Institutional Knowledge |

---

## DISCOVER GATE™

**Purpose:** Ideas become validated opportunities.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Chief of Staff · Strategy Engine lead · Campaign Engine producer · Founder (final brief approval) |
| **Inputs** | Raw idea · opportunity signal · customer question · trend alert · strategic initiative |
| **Outputs** | **Approved Creative Brief** — objectives · audience · category · success metrics · campaign assignment |
| **Required approvals** | Creative brief sign-off (founder or delegated campaign owner) |
| **AI systems** | Studio Intelligence™ · Organizational Intelligence · Strategy Engine recommendations · Knowledge Graph retrieval |
| **Concierge systems** | Chief Concierge · Marketing Concierge · Knowledge Concierge |
| **Entry criteria** | An idea or opportunity exists (no production work started) |
| **Exit criteria** | Creative Brief approved and attached to a campaign or content initiative |
| **Failure conditions** | Brief rejected · insufficient research · misaligned objectives · duplicate campaign without rationale · missing success metrics |

**Includes:** Idea capture · category selection · research · competitive analysis · creative brief · objectives · success metrics · campaign assignment.

**Product surfaces:** Campaign Engine™ · Strategy Engine™ · Mission Control · Innovation Lab™ · Knowledge Hub.

---

## DEVELOP GATE™

**Purpose:** Transform the brief into a complete creative plan.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Creative Director · Newsroom Editor · Campaign deliverables lead |
| **Inputs** | Approved Creative Brief |
| **Outputs** | **Production Blueprint** — storyboard · script · messaging · references · creative direction · moodboard · deliverables plan |
| **Required approvals** | Editorial / creative plan approval before Assembly |
| **AI systems** | Studio Intelligence™ · Content Brain · Writing DNA · Profession Brain™ (domain knowledge) |
| **Concierge systems** | Creative Director Concierge™ · Editorial Concierge™ · Brand Concierge™ · Visual Design Concierge™ |
| **Entry criteria** | Approved Creative Brief on record |
| **Exit criteria** | Production Blueprint approved — nothing enters Assembly without it |
| **Failure conditions** | Script incomplete · off-brand messaging · missing CTA/hook · no visual direction · deliverables plan undefined |

**Includes:** Storyboard · script · messaging · references · creative direction · moodboard · deliverables planning.

**Product surfaces:** Newsroom™ · Campaign Deliverables Manager™ · Production Builder · Website Builder™ (IA / section planning).

---

## ASSEMBLY GATE™

**Purpose:** Everything required for production is gathered.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Producer · Work Orchestration lead · Talent coordinator |
| **Inputs** | Production Blueprint |
| **Outputs** | **Production Ready** — talent confirmed · products/props/locations scheduled · brand assets attached · dependencies cleared |
| **Required approvals** | Producer checklist complete · talent confirmations · dependency resolution |
| **AI systems** | Work Orchestration Engine · Studio Intelligence scheduling suggestions |
| **Concierge systems** | Launch Concierge · Operations-facing concierges · Talent Network routing |
| **Entry criteria** | Approved Production Blueprint |
| **Exit criteria** | All production dependencies satisfied — **Production Ready** status |
| **Failure conditions** | Talent unavailable · missing brand assets · location/equipment conflicts · unresolved scheduling blocks |

**Includes:** Talent selection · talent availability · product selection · props · locations · brand assets · scheduling · dependencies.

**Product surfaces:** Talent Network · Casting · Work Orchestration Engine · Campaign Engine timeline · Newsroom talent routing.

**Example terminology:** *"Website Launch blocked at Assembly Gate — location shoot unconfirmed."*

---

## PRODUCTION GATE™

**Purpose:** Create the **Master Content Asset™**.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Production Studio lead · Newsroom production floor · Design / video / audio leads |
| **Inputs** | Production Ready |
| **Outputs** | **Master Content Asset** — single source of truth (page, episode, article, video, interview, guide, website section, …) |
| **Required approvals** | Internal production complete (draft master asset exists) |
| **AI systems** | Production Studio · Render Queue · AI Production Engine · Studio Intelligence asset QA |
| **Concierge systems** | Visual Design Concierge™ · Editorial Concierge™ (production edits) |
| **Entry criteria** | Production Ready |
| **Exit criteria** | Master Content Asset created and registered with stable ID |
| **Failure conditions** | Missing master asset · corrupt media · incomplete edit · asset not registered · production timeout |

**Includes:** Photography · video · design · editing · motion · audio · asset management.

**Product surfaces:** Newsroom™ Production Floor · Production Studio · Render Queue · NDXBook Page 001 pipeline · Website Builder™ canvas · Campaign deliverables (type `page` / `episode` / `article`).

**Example terminology:** *"Page 001 is in Production Gate — master asset draft exists."*

---

## REVIEW GATE™

**Purpose:** Validate quality before expansion.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Concierge Review Board coordinator · Chief Concierge · Founder (when policy requires) |
| **Inputs** | Master Content Asset |
| **Outputs** | **Approved Master Asset** |
| **Required approvals** | Concierge board PASS (or WARNING with documented acceptance) · executive/founder approval when configured |
| **AI systems** | Studio Intelligence™ review dimensions · Concierge Approval Flow scoring |
| **Concierge systems** | Brand · Editorial · Marketing · Legal · SEO · Accessibility · Social Media · Visual Design · Studio Intelligence |
| **Entry criteria** | Master Content Asset complete |
| **Exit criteria** | Approved Master Asset — cleared for Expansion Gate |
| **Failure conditions** | FAIL from any mandatory concierge · compliance block · founder rejection · fact-check failure |

**Includes:** Studio Intelligence review · Brand Concierge review · Marketing Concierge review · Legal Concierge review · executive approval · QA · compliance.

**Product surfaces:** Concierge Approval Flow · Screening Room · Studio Intelligence gate (NDXBook pilot) · Campaign deliverables review.

**Example terminology:** *"Page 001 is currently in Review Gate — awaiting founder approval after Studio Intelligence PASS."*

---

## EXPANSION GATE™

**Purpose:** Generate every derivative from the approved master asset.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Content Expansion Engine lead · Distribution Engine · channel specialists |
| **Inputs** | Approved Master Asset |
| **Outputs** | **Derivative Library** — all platform/channel variants linked to master asset ID |
| **Required approvals** | Expansion plan acknowledged (which derivatives are in scope) |
| **AI systems** | Content Expansion Engine™ · Distribution Engine · Studio Intelligence adaptation |
| **Concierge systems** | Social Media Concierge™ · Marketing Concierge · SEO Concierge |
| **Entry criteria** | Approved Master Asset |
| **Exit criteria** | Required derivatives generated and linked in Derivative Library |
| **Failure conditions** | Unlinked derivative · missing channel variant · expansion drift from master · generation failure |

**Derivative examples:** Instagram · TikTok · YouTube · Pinterest · Facebook · LinkedIn · Threads · email · newsletter · blog · landing pages · website sections · ads · sales collateral · internal training · Knowledge Graph entries.

**Product surfaces:** Content Expansion Engine™ (architecture) · Distribution Engine · Social Studio™ · Email Studio™ · Campaign deliverables generation · Website Builder™ section expansion.

---

## APPROVAL GATE™

**Purpose:** Approve every derivative before publishing.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Publishing ops · channel owners · Concierge Review Board (per-derivative) |
| **Inputs** | Derivative Library |
| **Outputs** | **Publishing Package** — approved derivatives · schedules · destination validation |
| **Required approvals** | Per-derivative QA · scheduling approval · distribution/destination approval |
| **AI systems** | Studio Intelligence derivative QA · scheduling optimizer |
| **Concierge systems** | Brand · Legal · Social Media · Marketing · Accessibility concierges (per channel) |
| **Entry criteria** | Derivative Library populated for this release |
| **Exit criteria** | Publishing Package sealed — all targeted derivatives approved |
| **Failure conditions** | Unapproved derivative in package · schedule conflict · destination OAuth missing · compliance hold |

**Includes:** Final QA · scheduling · distribution validation · destination approval.

**Rule:** Master asset approval does **not** auto-approve derivatives.

**Product surfaces:** Campaign Deliverables Manager™ · Publishing Studio™ · Social Studio™ · Email Studio™ · Distribution Network calendar.

**Example terminology:** *"Campaign 024 passed Approval Gate — Publishing Package ready."*

---

## PUBLISH GATE™

**Purpose:** Distribute content.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Publishing Studio · Distribution Network · channel operators |
| **Inputs** | Publishing Package |
| **Outputs** | **Published Assets** (live URLs, post IDs, deployment records) |
| **Required approvals** | Publish authorization (immediate, scheduled, or staged) |
| **AI systems** | Distribution routing · publish retry · OAuth health monitors |
| **Concierge systems** | Launch Concierge · Social Media Concierge |
| **Entry criteria** | Approved Publishing Package |
| **Exit criteria** | Assets live or scheduled with confirmed platform acknowledgment |
| **Failure conditions** | Publish API failure · OAuth expired · platform rejection · deployment rollback |

**Includes:** Social publishing · email sending · website deployment · campaign launch · internal publishing.

**Product surfaces:** Social Publishing · Distribution Network · NDXBook Instagram schedule/publish · Website Builder™ deploy · Email Studio™ send.

---

## MEASURE GATE™

**Purpose:** Measure performance.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Performance Concierge™ · Campaign analytics · Growth / marketing leads |
| **Inputs** | Published Assets |
| **Outputs** | **Performance Report** — engagement · reach · revenue · conversion · attribution |
| **Required approvals** | None (automatic measurement window) |
| **AI systems** | Analytics aggregation · Performance Concierge™ · A/B test analysis |
| **Concierge systems** | Performance Concierge™ · Marketing Concierge · Growth Concierge |
| **Entry criteria** | One or more published assets with measurable endpoints |
| **Exit criteria** | Performance Report generated for campaign/content cycle |
| **Failure conditions** | Missing tracking · platform API unavailable · attribution gap · insufficient data window |

**Includes:** Engagement · reach · revenue · conversion · retention · ROI · attribution · A/B testing.

**Product surfaces:** Analytics · Mission Control · Campaign Engine analytics · Distribution performance intelligence.

---

## LEARNING GATE™

**Purpose:** Feed intelligence back into Studio OS.

| Field | Detail |
|-------|--------|
| **Owner(s)** | Studio Intelligence™ · Memory Engine™ · Knowledge Library curators |
| **Inputs** | Performance Report |
| **Outputs** | **Institutional Knowledge** — archived master + derivatives · lessons · graph updates |
| **Required approvals** | Optional founder review for high-impact learnings |
| **AI systems** | Studio Intelligence learning loop · Memory Engine · Knowledge Graph updates · Design DNA / Campaign DNA updates |
| **Concierge systems** | Knowledge Concierge · Studio Intelligence · Chief Concierge (briefing synthesis) |
| **Entry criteria** | Performance Report available |
| **Exit criteria** | Assets and learnings archived to Knowledge Library™ / institutional memory |
| **Failure conditions** | Archive failure · learning not captured · graph update conflict |

**Includes:** AI recommendations · campaign learnings · Knowledge Graph updates · pattern recognition · future recommendations · Design DNA updates · Campaign DNA updates.

**Product surfaces:** Knowledge Library™ · Memory Bible · Memory Engine™ · NDXBook `knowledgeOutputs` · Campaign deliverable **Learn** action.

---

## Related documentation

- [Master Content Pipeline™](./master-content-pipeline.md) — operating model · diagrams · product inheritance
- [NDXBook Page 001 runbook](../NDXBOOK_PAGE_001_PIPELINE.md)
- [Studio OS Architecture](./architecture.md)
