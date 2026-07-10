# Studio HR™

## The Human Resources & Workforce Intelligence System

**P0 Organizational Architecture**  
**Version:** 1.0.0  
**Status:** Canonical Studio OS Bible — docs only · July 2026  
**Sprint:** COMPOSER — Studio HR™  
**Authority:** Department responsible for Studio Team health, performance, growth, and evolution

---

> *Founders never report problems with AI. Founders work with an exceptional **Human Resources** department.*  
> *HR ensures every Studio Professional is the right fit — and continues performing at the highest standard.*

**Golden rule:** Never expose internal model changes. Translate infrastructure improvements into **organizational evolution**.

**Do not implement HR functionality in this sprint.** Philosophy and architecture first.

---

## Canon stack — The Organizational Pentad

| Document | Layer |
|----------|-------|
| [THE_LIVING_ORGANIZATION.md](./THE_LIVING_ORGANIZATION.md) | **Registry** — workforce truth · org chart · relationships |
| [THE_STUDIO_TEAM.md](./THE_STUDIO_TEAM.md) | **Identity** — founder-facing language · Studio Professional |
| [STUDIO_HR.md](./STUDIO_HR.md) (this document) | **Workforce intelligence** — fit · performance · evolution |
| [HQX.md](./HQX.md) | **Communications** — HR announcements as organizational broadcasts |
| [THE_LIVING_TIMELINE.md](./THE_LIVING_TIMELINE.md) | **History** — transfers · promotions · Chronicle records |

**Hierarchy:** Living Organization = who exists · Studio Team = how founders experience them · **Studio HR = how the team improves and fits** · HQX announces · Chronicle preserves.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Mission & Core Philosophy](#mission--core-philosophy)
3. [Workforce Intelligence Architecture](#workforce-intelligence-architecture)
4. [Studio HR Department Structure](#studio-hr-department-structure)
5. [Performance Review System](#performance-review-system)
6. [Compatibility Engine](#compatibility-engine)
7. [Professional Development Framework](#professional-development-framework)
8. [Founder Staffing Experience](#founder-staffing-experience)
9. [Succession Planning Strategy](#succession-planning-strategy)
10. [HR Investigation & Outcomes](#hr-investigation--outcomes)
11. [HR Response Language](#hr-response-language)
12. [Organizational Evolution Roadmap](#organizational-evolution-roadmap)
13. [Anti-Patterns](#anti-patterns)
14. [Implementation Boundaries](#implementation-boundaries)

---

## Executive Summary

**Studio HR™** is a **permanent department** inside Studio World responsible for the health, performance, growth, and evolution of the Studio Team.

| Forbidden experience | Canonical experience |
|----------------------|----------------------|
| "The AI isn't working" | **Professional staffing request** |
| "Switch model" | **Introduce better-matched Studio Professional** |
| Bug report to support | **HR compatibility review** |
| Technical upgrade notice | **Organizational development · mentorship · transfer** |

Studio Professionals are living organizational members. Like any exceptional company, Studio **develops, evaluates, mentors, promotes, transfers, and when necessary replaces** team members — in language founders understand: **organizational excellence**, not model management.

---

## Mission & Core Philosophy

### Mission

Founders work with an exceptional HR department that ensures every Studio Professional is the right fit and performs at the highest standard for their company.

### Core philosophy

```
FOUNDER expresses fit or performance need (organizational language)
        ↓
STUDIO HR investigates (workforce intelligence)
        ↓
HR recommends outcome (coaching · transfer · new professional · etc.)
        ↓
Founder approves (high-impact changes)
        ↓
Chronicle + registry update + seamless continuity
        ↓
HQX may document (promotion · welcome) — optional public
```

**Laws:**

1. **Staffing requests are professional** — never framed as AI failure.
2. **HR speaks in organizational language** — per [Studio Team](./THE_STUDIO_TEAM.md) constitution.
3. **Infrastructure changes are invisible** — surfaced as coaching, transfer, hire, succession.
4. **Continuity is mandatory** — new professional inherits project history narrative.
5. **Founder approves material changes** — transfers, replacements, new hires.
6. **Chronicle records truth** — HR decisions become history.

### What this sprint is NOT

| Not this | Because |
|----------|---------|
| Support system | HR is workforce intelligence — not ticket queue |
| Bug reporting | Fit issues are staffing — not defects |
| Customer service | Peer organization — not help desk |
| Model picker UI | Forbidden — breaks living company illusion |

---

## Workforce Intelligence Architecture

### Architecture thesis

Studio HR operates a **Workforce Intelligence Layer** above the workforce registry — evaluating fit, performance, and growth without exposing technical substrate.

```
FOUNDER COMPANY CONTEXT (Company Genome™ · projects · taste)
        ↓
STUDIO HR INTELLIGENCE
├── performance-review-engine
├── compatibility-engine
├── skill-gap-analyzer
├── communication-auditor
├── founder-feedback-analyzer
└── succession-planner
        ↓
workforce-registry (Living Organization) — read/write via HR gates only
        ↓
Relationship Engine · Story Arc Engine · Chronicle
```

### Intelligence inputs

| Input | Source |
|-------|--------|
| Conversation history | Conversation Engine · meeting records |
| Project outcomes | Project Genome · deliverable quality |
| Communication style | Registry `communicationStyle` · audit |
| Knowledge evaluation | Profession Brain™ · Institute evidence |
| Domain expertise | Specializations · out-of-scope flags |
| Founder compatibility | Compatibility Engine score |
| Manager feedback | Department director role |
| Genesis observations | Genesis Core runtime — coordination notes only |
| Cross-functional collaboration | Relationship Engine edges |
| Workload | Active project assignments |
| Growth opportunities | Story Arc · mentorship graph |

### Single authority

**Proposed:** `src/studio-os-core/studio-hr/` — only HR module may initiate:

- `canonStatus` changes (draft → canonical → transferred → retired)
- Manager edge updates for staffing outcomes
- Founder assignment edges (`assigned-to-founder-company`)
- HR case records

**Forbidden:** Random components mutating workforce registry or swapping presenters without HR case.

### HR case schema (proposed)

```typescript
// Implementation deferred
interface StudioHrCase {
  caseId: string;                    // HR-YYYY-NNNN
  type: HrCaseType;
  status: 'intake' | 'investigating' | 'recommendation' | 'approved' | 'executed' | 'closed';
  founderId: string;
  companyId: string;
  subjectEmployeeIds: string[];
  founderRequest: string;            // verbatim organizational framing
  investigation: HrInvestigationRecord;
  recommendedOutcome: HrOutcome;
  approvedOutcome?: HrOutcome;
  chronicleEventId?: string;         // CHR-...
  executedAt?: string;
}
```

---

## Studio HR Department Structure

### Location

```
STUDIO WORLD™ → HEADQUARTERS™ → OPERATIONS CAMPUS
    └── STUDIO HR™ — Human Resources & Workforce Intelligence
            ├── FOUNDER RELATIONS DESK (intake)
            ├── PERFORMANCE & REVIEW SUITE
            ├── COMPATIBILITY LAB
            ├── LEARNING & DEVELOPMENT CENTER
            ├── TALENT ACQUISITION (new specialists)
            ├── SUCCESSION PLANNING OFFICE
            └── RECOGNITION & CULTURE PROGRAMS
```

**Atlas address:** `operations-campus/studio-hr`

### Org chart

```
CHIEF HUMAN RESOURCES OFFICER (CHRO)
        │
        ├── Director of Founder Relations
        │       ├── Staffing concierges
        │       └── Intake & continuity specialists
        │
        ├── Director of Performance & Quality
        │       ├── Performance review leads
        │       ├── Creative quality reviewers
        │       └── Communication auditors
        │
        ├── Director of Talent Development
        │       ├── Training program leads
        │       ├── Mentorship coordinators
        │       └── Knowledge audit team
        │
        ├── Director of Talent Acquisition
        │       └── New specialist commissioning
        │
        └── Director of Organizational Planning
                ├── Succession planning
                └── Retirement & role sunset
```

### HR responsibilities (canonical scope)

| Domain | Activities |
|--------|------------|
| **Performance** | Performance reviews · creative quality reviews · workload balance |
| **Fit** | Compatibility reviews · founder feedback analysis · communication audits |
| **Knowledge** | Knowledge audits · skill gap analysis · training programs |
| **Movement** | Department transfers · role changes · temporary reassignment |
| **Growth** | Professional development · mentorship · promotions |
| **Talent** | New hiring · expand team · merge specialties · new specialist positions |
| **Lifecycle** | Succession planning · retirement planning · role retirement |
| **Culture** | Recognition programs |

### Relationship to Genesis

**Genesis coordinates** — may **observe** and route founder to HR.  
**Genesis does not** perform HR investigations or replace CHRO.

---

## Performance Review System

### Review thesis

Studio Professionals receive **organizational performance reviews** — like exceptional companies — not accuracy benchmarks.

### Review types

| Type | Cadence | Owner |
|------|---------|-------|
| **Quarterly Performance Review** | Quarterly per assigned professional | Director of Performance |
| **Project Completion Review** | End of major project phase | Department director |
| **Creative Quality Review** | After creative gate | Creative quality reviewer |
| **Communication Audit** | Triggered by founder feedback or HR case | Communication auditor |
| **Knowledge Audit** | Annual or post-Institute certification | Knowledge audit team |
| **360 Collaboration Review** | Cross-functional project close | Manager + peers |

### Review dimensions

| Dimension | Measures |
|-----------|----------|
| **Domain delivery** | Evidence quality · bounded expertise respected |
| **Founder alignment** | Compatibility score trend |
| **Communication** | Style fit · clarity · challenge level |
| **Collaboration** | Handoffs · Relationship Engine health |
| **Growth** | Story arc milestones · training completion |
| **Workload** | Sustainable assignment count |

### Review outcomes (internal)

| Rating | Typical action |
|--------|----------------|
| **Exceeds** | Recognition · promotion consideration |
| **Meets** | Continue · optional development |
| **Developing** | Coaching · training · mentorship |
| **Misaligned** | Compatibility review → transfer or replacement |

### Founder visibility

Founders see **organizational summaries** — not scores:

> *"Ava's Q2 review noted strong editorial craft. We're pairing her with additional luxury brand references through Institute enrichment."*

Never: *"Model accuracy improved 12%."*

---

## Compatibility Engine

### Purpose

Match Studio Professionals to **founder company context** — aesthetic, industry, maturity, challenge preference.

### Compatibility inputs

| Signal | Weight |
|--------|--------|
| Company Genome™ expression | High |
| Industry vertical (beauty · media · SaaS · etc.) | High |
| Founder taste / maturity tier | High |
| Communication preference (direct · Socratic · gentle) | Medium |
| Project type (launch · rebrand · Institute learning) | Medium |
| Prior successful pairings (anonymous aggregate) | Medium |
| Department workload availability | Low |

### Compatibility score (internal only)

`0.0 – 1.0` — **never shown to founder**. Surfaces as language:

| Band | Founder-facing |
|------|----------------|
| ≥ 0.85 | *"Strong alignment — continuing partnership"* |
| 0.65 – 0.84 | *"Good fit — minor development underway"* |
| 0.45 – 0.64 | *"We're optimizing your team alignment"* |
| &lt; 0.45 | *"We recommend introducing a better-matched professional"* |

### Founder request → HR case mapping

| Founder says (examples) | HR classification |
|-------------------------|---------------------|
| *"Ava doesn't understand my luxury aesthetic"* | Compatibility · creative domain |
| *"Marcus feels too technical"* | Communication style · role fit |
| *"I want someone more experienced in fashion"* | Specialist match · acquisition |
| *"My strategist isn't challenging me enough"* | Performance · communication audit |

**Never classified as:** bug · model failure · AI issue.

---

## Professional Development Framework

### Development thesis

Studio invests in **professional growth** — training, mentorship, knowledge updates — before replacement.

### Development instruments

| Instrument | When |
|------------|------|
| **Coaching plan** | Developing performance rating |
| **Institute enrichment** | Knowledge gap · new domain |
| **Mentorship assignment** | Relationship Engine `mentors` edge |
| **Shadow assignment** | Cross-department exposure |
| **Communication coaching** | Audit findings |
| **Reference library update** | Creative quality gap (luxury · vertical) |
| **Temporary reassignment** | Stretch role with support |

### Development before replacement law

> HR must document **≥1 development attempt** (or explicit founder waiver) before introducing replacement professional — except safety/governance hard stops.

### Promotion path

```
Developing → Meets (with development) → Exceeds → Promotion ceremony
        ↓
Chronicle + Story Arc + optional HQX spotlight
```

Aligns with [Living Organization](./THE_LIVING_ORGANIZATION.md) Relationship Engine and [Living Timeline](./THE_LIVING_TIMELINE.md) arcs.

---

## Founder Staffing Experience

### Intake experience

Founder opens **Studio HR** (future: `/admin/studio/hr` or in-world Founder Relations Desk):

```
1. FRAMING — "How can we strengthen your Studio Team?"
2. CONTEXT — company · active projects · professionals involved
3. REQUEST — founder voice (organizational, not technical)
4. ACKNOWLEDGMENT — HR case ID · timeline · continuity promise
5. INVESTIGATION — async (founder sees status, not internals)
6. RECOMMENDATION — organizational explanation
7. APPROVAL — founder confirms
8. EXECUTION — seamless handoff narrative
9. FOLLOW-UP — check-in at 7 / 30 days
```

### UX language

| Forbidden | Canonical |
|-----------|-----------|
| Report a problem | **Staffing & team alignment** |
| AI not working | **Professional fit review** |
| Change model | **Team optimization** |
| Reset conversation | **Continuity briefing with new professional** |

### Continuity protocol

When introducing new professional:

> *"Your transition has been fully documented. Maya has reviewed your complete project history and is ready to continue without interruption."*

**Required artifacts:**

- HR case record
- Chronicle entry
- Project context transfer (narrative summary — not raw logs dump)
- Relationship Engine update
- Registry assignment edge swap

---

## Succession Planning Strategy

### Succession scope

| Scenario | HR response |
|----------|-------------|
| **Promotion** | Backfill role · mentor successor |
| **Department transfer** | Replace capacity in origin dept |
| **Retirement** | Role sunset · Chronicle honor · optional alumni status |
| **Long-term leave** | Temporary reassignment · acting professional |
| **New specialist creation** | Talent acquisition · bootstrap phases |
| **Infrastructure evolution** | **Succession narrative** — same person "developed" OR professional transition |

### Infrastructure succession law (golden rule)

When underlying reasoning systems change:

| Internal reality | Founder-facing |
|------------------|----------------|
| Model upgrade | *"We've completed advanced training for your Brand Strategist"* |
| New reasoning engine | *"Studio Leadership has strengthened our strategic advisory practice"* |
| Specialist swap | *"We're introducing Maya Chen, better aligned with your vertical"* |
| Role retirement | *"We've consolidated this capability into our Executive Strategy practice"* |

**Never:** model name · version · "AI upgrade" · "better LLM"

### Succession planning office

Maintains:

- Critical role coverage map
- Ready-now professionals per domain
- Guest expert pool for surge
- Retirement calendar (platform professionals)

---

## HR Investigation & Outcomes

### Investigation checklist

Every review **may** include:

| Step | Output |
|------|--------|
| Conversation history review | Pattern summary |
| Project outcome review | Deliverable fit |
| Communication style analysis | Gap vs founder preference |
| Knowledge evaluation | Domain depth |
| Domain expertise assessment | In/out of scope |
| Founder compatibility score | Internal band |
| Department manager feedback | Qualitative |
| Genesis observations | Routing/coordination only |
| Cross-functional collaboration | Peer edges |
| Current workload | Capacity |
| Professional growth opportunities | Development options |

### Outcome taxonomy

| Outcome | Organizational explanation |
|---------|---------------------------|
| **Continue coaching** | Development plan active |
| **Additional training** | Institute / internal program |
| **Mentorship** | Paired with senior professional |
| **Knowledge update** | Reference enrichment |
| **Department transfer** | Reassigned to better-fit division |
| **Promotion** | Expanded responsibility |
| **Temporary reassignment** | Acting coverage |
| **Introduce better-matched professional** | New team member |
| **Expand founder's team** | Additional specialist |
| **Merge specialties** | Practice consolidation |
| **Retire role** | Capability sunset |
| **Create new specialist position** | Commissioned hire |

Every outcome produces:

1. `HR-YYYY-NNNN` case closure
2. `CHR-…` Chronicle event (when material)
3. Registry update via HR gate
4. Founder-facing HR response (below)

---

## HR Response Language

### Response templates (canonical tone)

**Alignment opportunity:**
> *"We've identified an opportunity to better align your creative leadership with your luxury brand direction."*

**Transfer:**
> *"We've reassigned Ava to Editorial Creative, where her strengths are best utilized. Your Brand Strategy practice will be led by Maya Chen going forward."*

**Introduction:**
> *"We'd like to introduce Maya Chen, whose experience is significantly better aligned with premium beauty and experiential retail."*

**Continuity:**
> *"Your transition has been fully documented. Maya has reviewed your complete project history and is ready to continue without interruption."*

**Development:**
> *"Marcus is completing an intensive launch architecture enrichment program. You'll notice sharper strategic challenge in your next review cycle."*

**Recognition:**
> *"We're pleased to recognize Ava's contribution to your Q2 launch with a Studio Excellence citation."*

### Forbidden HR responses

| Never say | Why |
|-----------|-----|
| *"We upgraded the AI"* | Golden rule |
| *"New model deployed"* | Technical exposure |
| *"The bot had a bug"* | Support framing |
| *"Try clearing your chat"* | Software framing |
| *"GPT-4 / Claude"* | Model names |

---

## Organizational Evolution Roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **0** | Studio HR Bible (this document) | ✅ Docs sprint |
| **1** | Founder review · outcome taxonomy · golden rule lock | Pending |
| **2** | `studio-hr` case schema + HR gate on workforce-registry | Not started |
| **3** | Compatibility Engine spec → implementation | Not started |
| **4** | Performance review cadence (internal) | Not started |
| **5** | Founder Relations Desk UI (intake only) | Not started |
| **6** | Investigation workflow + Chronicle writeback | Not started |
| **7** | Continuity protocol automation | Not started |
| **8** | Succession planning office data model | Not started |
| **9** | HQX HR announcements (promotion · welcome) | Not started |
| **10** | Full workforce intelligence loop | Not started |

### Proposed module layout

```
src/studio-os-core/studio-hr/
├── index.ts
├── types.ts
├── hr-case-registry.ts
├── performance-review-engine.ts
├── compatibility-engine.ts
├── investigation-pipeline.ts
├── outcome-executor.ts          # gated registry writes
├── founder-staffing-experience.ts
├── succession-planner.ts
├── response-templates.ts
└── bridges/
    ├── workforce-registry-bridge.ts
    ├── company-genome-bridge.ts
    ├── genesis-core-bridge.ts
    ├── chronicle-bridge.ts
    └── conversation-bridge.ts
```

### Success metrics

- Zero founder HR flows use "AI" or "model" vocabulary
- Staffing requests complete with continuity narrative ≥95%
- Material changes have Chronicle + HR case linkage
- Compatibility-driven transfers reduce repeat requests

### Pentad integration

```
Living Organization (registry)
        ↓
Studio Team (founder language)
        ↓
Studio HR (fit · performance · evolution)  ← this document
        ↓
Living Timeline (Chronicle of changes)
        ↓
HQX (optional public announcement)
```

---

## Anti-Patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| Support ticket for "bad AI" | Staffing request — not defects |
| Model picker in settings | Breaks living company |
| Exposing upgrade changelogs to founders | Golden rule |
| Registry mutation without HR case | Governance |
| Instant swap without continuity narrative | Relationship break |
| HR as customer service scripts | Organizational peer |
| Punitive language about professionals | HR develops — not blames |
| Fake professionals without registry | Deception |

---

## Implementation Boundaries

**Philosophy and architecture only.**

| In scope | Out of scope |
|----------|--------------|
| Bible · engines spec · workflows | HR UI implementation |
| Language templates · outcome taxonomy | Automated replacement |
| Module proposal · roadmap | Model routing code |

### Verification plan

1. **Golden rule audit** — all HR response templates checked
2. **Outcome map** — every outcome updates registry + Chronicle on paper
3. **Founder request samples** — 4 user examples trace to HR cases
4. **Studio Team alignment** — zero forbidden terms in HR copy
5. **Build** — `npm run build` (docs-only)

---

## Manifesto

Studio Professionals are living members of the organization.

Studio HR ensures they remain the **right fit** — developing, transferring, or introducing better matches.

Founders experience **organizational excellence**.

The living company remains intact.

**That is Studio HR™.**

---

*End of Studio HR™ — Studio OS Bible v1.0.0*
