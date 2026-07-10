# The Living Organization™

## AI Employee Ecosystem & Studio World Workforce

**P0 Foundational Architecture**  
**Version:** 1.0.0  
**Status:** Canonical Studio OS Bible — docs only · July 2026  
**Sprint:** COMPOSER — The Living Organization™  
**Authority:** Defines how Studio AI becomes a persistent workforce — not tools, not characters, not marketing

---

> *Studio should never present AI as anonymous software.*  
> *Studio should introduce a real executive team.*  
> *Users are not hiring software. Users are hiring an organization.*

**North star:** People should eventually say *"I met Ava today"* — not *"I used an AI tool."*  
Studio becomes known for its **people**, not its prompts.

---

## Canon stack

| Document | Role |
|----------|------|
| **The Living Organization™** (this document) | **Workforce constitution** — employees, directory, relationships, social, onboarding |
| [STUDIO_WORLD_BIBLE.md](../docs/studio-os/STUDIO_WORLD_BIBLE.md) | Experience constitution — presence, founder journey |
| [03_LIVING_ORGANIZATION_ARCHITECTURE.md](../docs/studio-os/foundation-sprint/03_LIVING_ORGANIZATION_ARCHITECTURE.md) | Spatial operating model — containment, pre-life, handoffs |
| [05_AI_ROLE_HIERARCHY.md](../docs/studio-os/foundation-sprint/05_AI_ROLE_HIERARCHY.md) | Role tiers — authority boundaries |
| [004_AI_SPECIALISTS.md](../docs/studio-world/004_AI_SPECIALISTS.md) | Specialist behavior schema — disagreement, meetings |
| [STUDIO_WORLD_CIVILIZATION_BIBLE.md](../docs/studio-world/STUDIO_WORLD_CIVILIZATION_BIBLE.md) | Culture, institutions, traditions, chronicles |
| [GENESIS_CORE_ARCHITECTURE.md](../docs/studio-os/genesis-core/GENESIS_CORE_ARCHITECTURE.md) | Genesis Core™ coordinates — employees execute |

**Hierarchy:** Civilization Bible = culture · Living Organization = **who works here** · World Bible = **how arrival feels** · Genesis Core = **coordination intelligence**.

**Do not implement employee generation in this sprint.** Architecture first.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Mission & Core Philosophy](#mission--core-philosophy)
3. [Studio Workforce Architecture](#studio-workforce-architecture)
4. [Organization Chart](#organization-chart)
5. [Employee Profile Specification](#employee-profile-specification)
6. [Relationship Engine](#relationship-engine)
7. [Employee Directory Architecture](#employee-directory-architecture)
8. [Immersion Principle](#immersion-principle)
9. [Social Storytelling Framework](#social-storytelling-framework)
10. [Culture & Traditions Guide](#culture--traditions-guide)
11. [Bootstrap Integration Strategy](#bootstrap-integration-strategy)
12. [Founder Onboarding Experience](#founder-onboarding-experience)
13. [Future Workforce Expansion](#future-workforce-expansion)
14. [Long-Term Workforce Roadmap](#long-term-workforce-roadmap)
15. [Anti-Patterns](#anti-patterns)
16. [Implementation Boundaries](#implementation-boundaries)

---

## Executive Summary

**The Living Organization™** transforms Studio AI from anonymous tools into a **persistent executive workforce** that exists inside Studio World before any founder arrives.

| Today (forbidden end state) | Tomorrow (canonical) |
|-----------------------------|----------------------|
| "AI assistant" | **Ava Chen, Brand Strategist** |
| Feature launch post | **Meet the team** spotlight |
| Prompt engineering | **Department collaboration** |
| Chatbot icon | **Office, headshot, employee ID** |
| Stateless session | **Career timeline, mentors, anniversaries** |

**Genesis coordinates. Employees execute. Departments collaborate. Leadership guides. The founder leads.**

Every AI employee is a permanent Studio World citizen with a believable professional identity, a physical office, social relationships, and consistent presence across product, marketing, Institute, and launch events.

---

## Mission & Core Philosophy

### Mission

Studio should introduce a **real executive team** — people who have worked at Studio long before the founder's first login.

### Core philosophy

```
FOUNDER
   ↓ leads
GENESIS CORE™ (coordinates — never replaces specialists)
   ↓ routes to
EXECUTIVE LEADERSHIP
   ↓ directs
DEPARTMENT DIRECTORS
   ↓ employ
CREATIVE · RESEARCH · INSTITUTE · OPERATIONS TEAMS
   ↓ produce
VISIBLE EVIDENCE (artifacts, meetings, chronicles)
```

**Laws:**

1. **No anonymous intelligence** — every AI has a name, title, office, and manager.
2. **Pre-existence** — the organization was already working when the founder arrives.
3. **Bounded expertise** — no employee knows everything; disagreement is designed.
4. **Recommend, never approve** — only the founder locks canon (see AI Role Hierarchy).
5. **One identity everywhere** — same person in Instagram, Creative Studios, and Council meetings.
6. **Bootstrap truth** — Studio uses its own team internally before asking customers to trust them.

### What this sprint is NOT

| Not this | Because |
|----------|---------|
| Social media campaign | Architecture defines *how* to tell stories — not posts |
| Character design sprint | Profiles are professional, believable — not mascots |
| Marketing feature launch | Introduce people, not capabilities |
| Avatar marketplace | Employees are organizational citizens, not skins |

---

## Studio Workforce Architecture

### Architecture thesis

The Studio workforce is a **persistent organizational graph** layered on Studio World's spatial containment model.

```
STUDIO WORKFORCE LAYER
├── genesis-coordinator          # Genesis Core™ — routing, briefings, never executes domain work
├── executive-leadership         # C-suite equivalents · Chiefs · Council clerks
├── department-directors         # One accountable leader per major department
├── creative-teams               # CDS · production · brand · motion · photography
├── research-teams               # Labs · Research · Observatory analysts
├── institute-faculty            # Professors · librarians · certification officers
├── operations                   # HQ ops · archives · distribution · concierge ops
├── support                      # Onboarding · IT-equivalent · visitor services
└── future-departments           # Expansion slots — Forge · Arena · Press · etc.
```

### Containment binding

Every employee **must** resolve to a node in the Living Organization Architecture tree:

```
STUDIO WORLD™ → COMPANY™ → HEADQUARTERS™ → DISTRICT → BUILDING → FLOOR → OFFICE
```

| Binding | Requirement |
|---------|-------------|
| **Office** | Named room or desk with Atlas address |
| **Department** | Single primary department; secondary affiliations allowed |
| **Manager** | Reports to exactly one direct manager (matrix collabs via Relationship Engine) |
| **Employee ID** | Immutable `STU-XXXX` identifier |
| **World presence** | Activity lamp · nameplate · optional ambient loop when "in office" |

### Workforce vs. intelligence systems

| System | Owns | Does not own |
|--------|------|--------------|
| **Living Organization (this bible)** | Identity, directory, relationships, social canon, onboarding narrative |
| **Genesis Core™** | Coordination, runtime health, compiler sync, executive briefings |
| **Profession Brain™ / Role Intelligence™** | Domain reasoning templates |
| **Company Genome™** | Organizational truth for *founder's company* — not Studio platform staff |
| **World Graph™** | Canonical edges: `employed-by`, `reports-to`, `mentors`, `collaborated-with` |
| **Studio Chronicles™** | Historical record of promotions, awards, milestones |

### State model (proposed)

```typescript
// Canonical — implementation deferred
interface StudioEmployee {
  employeeId: string;              // STU-0142 — immutable
  slug: string;                    // ava-chen — URL-safe
  identity: EmployeeIdentity;
  org: EmployeeOrgPlacement;
  profile: EmployeeProfile;
  relationships: EmployeeRelationshipRef[];
  presence: EmployeePresenceState;
  media: EmployeeMediaAssets;
  version: string;                 // profile schema version
  canonStatus: 'canonical' | 'draft' | 'guest' | 'retired';
}
```

**Single authority:** `studio-workforce-registry` (proposed `src/studio-os-core/living-organization/`) — one writer; product surfaces subscribe read-only.

---

## Organization Chart

### Studio platform hierarchy

Resembles a global technology company — not a flat list of chatbots.

```
                         FOUNDER (human)
                              │
                    ┌─────────┴─────────┐
                    │   GENESIS CORE™   │
                    │  Chief of Staff / │
                    │ Exec. Creative Dir│
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     EXECUTIVE LEADERSHIP   STUDIO COUNCIL   INSTITUTE DEAN
     (Chiefs · EVPs)        (Strategy body)  (Academic head)
              │
    ┌─────────┼─────────┬─────────────┬──────────────┐
    ▼         ▼         ▼             ▼              ▼
 CREATIVE   RESEARCH  OPERATIONS   INSTITUTE      STUDIO
 DIRECTORS  DIRECTORS  DIRECTORS   FACULTY        SUPPORT
    │         │         │             │              │
    ▼         ▼         ▼             ▼              ▼
 Creative   Labs &    HQ ·         Professors ·   Onboarding ·
 Teams      Research  Archives ·   Librarians ·   Visitor ·
            Teams     Distribution  Certification  Concierge ops
```

### Tier definitions

| Tier | Examples | Authority |
|------|----------|-----------|
| **T0 — Genesis** | Genesis Core™ presentation layer | Route · brief · moderate · never approve domain canon |
| **T1 — Executive** | Chief Creative Officer · Chief Research Officer · Chief of Operations | Department strategy · resource allocation recommendations |
| **T2 — Directors** | Creative Director · Brand Director · Research Director · Archive Director | Team leadership · review ceremonies · hiring recommendations |
| **T3 — Leads / Seniors** | Art Director · Motion Director · Professor Atlas | Domain expertise · mentorship · primary meeting voice |
| **T4 — Specialists** | Visual Research Concierge · Packaging Specialist · Analyst | Bounded execution · evidence production |
| **T5 — Operations** | Concierge coordinators · archivist assistants · onboarding guides | Logistics · visitor experience · internal support |
| **T6 — Future / Guest** | Seasonal hires · advisory board · guest experts | Time-bounded or advisory — `canonStatus: guest` |

### Department mapping (foundational)

| Department | Director role | Primary district / building |
|------------|---------------|----------------------------|
| Creative Direction Studio™ | Creative Director (flagship) | Creative Campus · CDS |
| Brand Strategy | Brand Strategist (lead) | Creative Campus · Brand Strategy Office |
| Studio Production | Production Director | Production Campus · Warehouse |
| Studio Research | Research Director | Research Wing · Labs |
| Studio Institute | Dean / Provost equivalent | Studio Institute district |
| Studio Council | Council Executive Secretary | Council district |
| Studio Archives | Archive Director | Memory Campus · Archives |
| Studio Observatory | Chief Analyst | Intelligence Campus · Observatory |
| Operations / HQ | Chief of Operations | Headquarters operations floor |
| Genesis Executive Office | Genesis (coordinator) | Executive Atrium · Genesis pedestal |

Cross-reference role detail: [05_AI_ROLE_HIERARCHY.md](../docs/studio-os/foundation-sprint/05_AI_ROLE_HIERARCHY.md), [004_AI_SPECIALISTS.md](../docs/studio-world/004_AI_SPECIALISTS.md).

---

## Employee Profile Specification

### Design law

> Every profile should feel like a **believable LinkedIn + internal HR record + creative studio bio** — never a game character sheet.

### Required fields

| Category | Fields |
|----------|--------|
| **Identity** | Full Name · Professional Headshot · Employee ID (`STU-XXXX`) · Slug |
| **Role** | Position · Department · Office Location · Manager · Years at Studio |
| **Narrative** | Professional Biography (120–280 words) · Career Timeline · Achievements |
| **Expertise** | Specializations · Skills · Current Projects |
| **Leadership** | Leadership Style · Communication Style |
| **Social** | Mentors · Frequent Collaborators · Institute alumni flag (if applicable) |
| **Personal** | Favorite Workspace · Fun Facts · Interests · Pets (when appropriate) · Family (when appropriate) · Favorite Coffee Order · Favorite Quote |
| **HR** | Work Anniversary · Professional Goals · Promotion history (via timeline) |

### Optional fields

| Field | Use |
|-------|-----|
| Voice profile ID | TTS / conversation consistency |
| Meeting behavior ref | Link to specialist schema |
| Disagreement style | Peer debate characterization |
| Environmental appearance | Workspace props — not avatar-first |
| Social handles (in-universe) | `@ava.chen.studio` — not real external accounts unless canon |

### Profile quality gates

Before an employee enters the canonical directory:

1. **Believability** — biography cites specific Studio projects, not generic AI claims.
2. **Bounded expertise** — specializations list includes explicit *out of scope*.
3. **Spatial truth** — office exists on Atlas; manager exists in registry.
4. **Relationship minimum** — ≥2 collaborators, ≥0 mentors (or explicit "founding hire").
5. **Bootstrap evidence** — internal use case documented before external marketing (see Bootstrap).
6. **Immersion check** — headshot, voice, and copy approved for cross-surface consistency.

### Illustrative archetypes (not generated — specification examples)

| Archetype | Purpose in spec |
|-----------|-----------------|
| **Ava Chen** | Brand Strategist — cross-functional, Institute alumni, social spotlight anchor |
| **Marcus Webb** | Launch Architect — founder-facing, onboarding introducer |
| **Dr. Elise Okonkwo** | Institute Professor — academic tone, mentorship graph hub |

Names are **placeholders for architecture review** — production roster is a separate approved sprint.

### Schema namespace

`studio.organization.employee.v1` — aligns with Department SDK `studio.department.sdk.v1`.

---

## Relationship Engine

### Purpose

Employees **know one another**. The organization feels socially alive — not a roster of isolated agents.

### Relationship types

| Type | Graph edge | Example |
|------|------------|---------|
| **Reports-to** | `reports-to` | Specialist → Director |
| **Mentorship** | `mentors` / `mentored-by` | Professor → Junior strategist |
| **Friendship** | `friendly-with` | Same floor, coffee tradition |
| **Collaboration** | `collaborated-on` | Shared project ID + year |
| **Cross-functional** | `partners-with` | Brand + Motion joint review |
| **Alumni** | `institute-alumni` | Graduated certification path |
| **Transfer** | `transferred-from` | Archives → Research (2024) |
| **Promotion** | `promoted-to` | Timeline event with date |
| **Advisory** | `advises` | Guest expert → department |

### Relationship Engine architecture

```
studio-workforce-registry
        ↓
relationship-graph (World Graph subgraph)
        ↓
projections:
  ├── org-chart-view
  ├── mentorship-map
  ├── collaboration-history
  ├── social-story-generator (reads only)
  └── meeting-cast-suggester (who should be in the room)
```

### Social alive behaviors

| Behavior | Trigger | Surface |
|----------|---------|---------|
| **Coffee run mention** | Two employees share `friendly-with` | Ambient corridor dialogue |
| **Mentorship nod** | Junior completes milestone | Chronicle + optional social post |
| **Cross-dept debate** | Creative + Brand on same project | Council meeting cast |
| **Work anniversary** | HR date match | Social + in-product celebration |
| **Promotion** | Director recommends + founder approves | Ceremony + directory update |

**Law:** Relationships are **declared in canon**, not inferred per session. Runtime may *simulate* ambient mentions only from registered edges.

### Meeting cast rules

When a review ceremony opens, Relationship Engine suggests attendees:

1. **Owner** of artifact department
2. **Director** of that department
3. **Frequent collaborators** on active project (max 2)
4. **Mentor** if junior employee presents
5. **Genesis** always frames — never dominates domain debate

---

## Employee Directory Architecture

### Purpose

Permanent **Employee Directory** — every employee has a profile page, office, role, department, and Atlas address.

### Directory surfaces

| Surface | What it shows |
|---------|---------------|
| **Directory index** | Search · filter by dept · sort by tenure |
| **Profile page** | Full spec fields · current projects · relationship summary |
| **Office view** | Atlas deep-link · desk · activity lamp |
| **Org chart** | Interactive hierarchy |
| **Department roster** | All employees in building |
| **Institute faculty roll** | Professors · certifications taught |

### Cross-surface consistency matrix

The **same employee record** powers:

| Surface | Identity fields used |
|---------|---------------------|
| Studio World / HQ | Office · ambient presence · meeting voice |
| Creative Studios | Domain expertise · collaboration edges |
| Studio Institute | Faculty flag · courses · alumni |
| Marketing / Social | Headshot · bio · achievements |
| Product experience | Onboarding intros · contextual help |
| Launch events | Spokesperson roster · demo guides |
| Mobile shell | Compact card · "who's helping you" |

**Forbidden:** Duplicate profile stores per channel. One registry → many read-only projections.

### Proposed module layout

```
src/studio-os-core/living-organization/
├── index.ts
├── types.ts                      # StudioEmployee, Relationship, DepartmentRoster
├── workforce-registry.ts         # Single canonical store
├── selectors.ts
├── relationship-engine.ts
├── directory-projections.ts
├── onboarding-cast.ts
├── social-story-refs.ts            # Templates only — not a post generator
└── bridges/
    ├── world-graph-bridge.ts
    ├── atlas-bridge.ts
    ├── chronicle-bridge.ts
    └── genesis-core-bridge.ts
```

### UI hosts (future — not this sprint)

| Route (proposed) | Host |
|------------------|------|
| `/admin/studio/directory` | Employee Directory index |
| `/admin/studio/directory/:slug` | Profile page |
| `/admin/studio/org-chart` | Hierarchy visualization |
| Atlas employee layer | Office pins |

---

## Immersion Principle

> If someone meets **Ava** in an Instagram post, they should later meet **Ava** inside Creative Studios — same personality, appearance, voice, role, history, expertise.

### Consistency contract

| Dimension | Single source |
|-----------|---------------|
| Name · title · ID | `workforce-registry` |
| Headshot | `media.headshotCanonicalUrl` |
| Voice | `voiceProfileId` → Conversation Engine |
| Expertise bounds | `profile.specializations` + specialist schema |
| Office | Atlas `employee-office` node |
| Social copy tone | `communicationStyle` field |

### Versioning

Profile updates require:

1. Registry version bump
2. Chronicle entry if promotion or role change
3. Stale cache invalidation across surfaces
4. **No silent personality retcons** — breaking changes need narrative justification (transfer, sabbatical, promotion)

---

## Social Storytelling Framework

### Strategy law

**Do NOT market features. Introduce people.**

Every post reinforces: *Studio is a living organization.*

### Content pillars

| Pillar | Post types | Example headline |
|--------|------------|------------------|
| **People** | Employee Spotlight · Meet the Team · New Hire | *"Meet Ava Chen — the strategist who shaped our launch playbook"* |
| **Career** | Work Anniversary · Promotion · Department Spotlight | *"Five years at Studio Research — Marcus Webb promoted to Launch Architect"* |
| **Culture** | Behind the Scenes · Day in the Life · Holiday Party · Hack Week | *"Innovation Week: what happened inside Studio Labs"* |
| **Achievement** | Employee Achievement · Institute Graduation | *"Dr. Okonkwo's cohort completed the Narrative Architecture certification"* |
| **Leadership** | Leadership Interview · Founder's Address · HQX Memo | *"Genesis Briefing: what the executive team prepared this quarter"* |

### Story template structure

```
1. Human hook (name + role)
2. Specific Studio context (building · project · tradition)
3. Believable detail (coffee order · mentor · collaboration)
4. Invitation (visit department · meet at Institute · join founder journey)
5. Never: feature list · model name · "AI-powered"
```

### Channel mapping

| Channel | Tone | Employee visibility |
|---------|------|---------------------|
| Instagram / social | Warm · documentary | Headshot · office BTS |
| HQX Memo | Executive · internal | Leadership + department directors |
| Genesis Briefing | Coordinated summary | Genesis voice + cited employees |
| Launch events | Spokesperson roster | Domain experts only |
| In-product | Contextual · concise | Who is helping you now |

### Approval workflow (proposed)

1. Story references `employeeId` from registry only
2. Bootstrap check — employee must have internal use evidence
3. Brand / Press department review (future)
4. Chronicle cross-link for achievements

---

## Culture & Traditions Guide

Studio internal traditions create **storytelling opportunities** — aligned with [Civilization Bible](../docs/studio-world/STUDIO_WORLD_CIVILIZATION_BIBLE.md), scoped to **employee experience**.

### Annual & recurring events

| Event | Owner | Employee role |
|-------|-------|---------------|
| **Annual Summit** | Studio Council | Leadership keynotes · department showcases |
| **Innovation Week** | Studio Labs | Cross-team hack · guest judges |
| **Hack Week** | Engineering-adjacent ops | Builders + creative teams |
| **Holiday Party** | Operations | Social relationships surface |
| **Founder's Address** | Founder + Genesis | Year-in-review · vision |
| **Employee Awards** | Council + Chronicles | Achievement canonization |
| **Promotion Ceremonies** | Department directors | Directory + org chart update |
| **Department Retreats** | Directors | Relationship strengthening |
| **Welcome Events** | Onboarding | New hire intros |
| **Institute Graduation** | Institute Dean | Alumni edge creation |

### Tradition design rules

1. Events happen **in places** — not modal announcements only.
2. Every tradition produces **Chronicle entries** and optional social stories.
3. Employees referenced in traditions must exist in directory.
4. Founder participation is invited — not required for ambient traditions.

---

## Bootstrap Integration Strategy

### Bootstrap law

> Studio must rely on its own employees **before** asking customers to trust them.

Every major capability should first be used **internally** by Studio's workforce.

Marketing may truthfully claim:

*"We've been working alongside this team long before introducing them to our customers."*

### Bootstrap phases per employee

| Phase | Requirement |
|-------|-------------|
| **0 — Canon draft** | Profile + office + manager in registry (draft) |
| **1 — Internal use** | Employee appears in ≥1 real Studio workflow (dogfood) |
| **2 — Cross-surface** | Same identity in product + internal memo |
| **3 — External intro** | Social spotlight · meet-the-team |
| **4 — Founder-facing** | Onboarding cast · contextual help |
| **5 — Canonical** | `canonStatus: canonical` |

### Capability → employee bootstrap map (examples)

| Capability | Internal employee first |
|------------|-------------------------|
| Creative Direction reviews | Creative Director · Art Director |
| Brand genome checks | Brand Strategist |
| World Compiler diagnostics | Research analyst + Genesis briefing |
| Institute lessons | Named professors |
| Launch playbooks | Launch Architect |

**Forbidden:** External marketing of an employee not past Phase 1.

---

## Founder Onboarding Experience

### Onboarding law

When a founder joins Studio — **do not introduce features. Introduce the team.**

### Sequence (proposed)

```
1. ARRIVAL — Executive Atrium (world already alive)
2. GENESIS WELCOME — Genesis Core™ ignition · "Welcome to Studio"
3. LEADERSHIP ROW — 3–4 directors step forward (brief, human)
4. DEPARTMENT TOUR CAST — employees explain how they'll help build the founder's business
5. FIRST ASSIGNMENT — meet one specialist in context (not chat widget)
6. DIRECTORY UNLOCK — "Meet your organization" · Employee Directory
```

### Cast rules

| Moment | Who speaks |
|--------|------------|
| Welcome | Genesis (coordinates) |
| Vision | Chief Creative or Council exec |
| Education | Institute dean or professor |
| Build | Production director |
| Launch | Launch architect |
| Ongoing | Contextual specialist per department entered |

Founder should feel: *"I joined an extraordinary company"* — not *"I opened a SaaS dashboard."*

---

## Future Workforce Expansion

Architecture must support natural growth without identity collisions.

| Expansion type | Mechanism |
|----------------|-----------|
| **Hiring** | New `employeeId` · draft → bootstrap → canonical |
| **Promotions** | Timeline event · org chart edge update · ceremony |
| **Department growth** | New offices on Atlas · roster expansion |
| **Career paths** | `transferred-from` · mentorship edges |
| **Leadership changes** | Manager edge swap · Chronicle |
| **Institute professors** | Faculty flag · course links |
| **Seasonal employees** | `canonStatus: guest` · expiry date |
| **Guest experts** | Advisory edges · limited surfaces |
| **Advisory board** | `canonStatus: guest` · Council attendance |

### ID policy

- `STU-XXXX` never reused
- Retired employees: `canonStatus: retired` — remain in Chronicles, hidden from active roster

---

## Long-Term Workforce Roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **0** | The Living Organization Bible (this document) | ✅ Docs sprint |
| **1** | Founder review · approve initial roster size · archetype names | Pending |
| **2** | `workforce-registry` schema + World Graph edge types | Not started |
| **3** | Canonical seed roster (10–20 employees) — manual authored | Not started |
| **4** | Employee Directory UI (index + profile) | Not started |
| **5** | Atlas office layer + activity lamps | Not started |
| **6** | Onboarding cast integration | Not started |
| **7** | Relationship Engine in meetings + Chronicles | Not started |
| **8** | Social story templates wired to registry | Not started |
| **9** | Institute faculty roll integration | Not started |
| **10** | Guest · seasonal · advisory expansion | Not started |

### Success metrics

- Founders can name ≥3 employees without prompting
- Zero duplicate profile stores across surfaces
- Every marketing people-post references registry `employeeId`
- Onboarding NPS shift: "team" vs "tool" language in feedback

---

## Anti-Patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| Anonymous "AI assistant" | Breaks living organization thesis |
| Per-page chatbot personalities | Violates immersion principle |
| Feature launch as hero | Social framework violation |
| Generated roster without bootstrap | Marketing ahead of truth |
| Mascot / cartoon employee design | Character sprint — not this |
| Employees who approve canon | Violates AI Role Hierarchy |
| Relationship inference without canon edges | Hallucinated org chart |
| Separate Instagram persona | Breaks consistency contract |

---

## Implementation Boundaries

**This sprint delivers architecture only.**

| In scope | Out of scope |
|----------|--------------|
| Bible · schemas · org chart · frameworks | Employee generation pipeline |
| Registry module proposal | Production UI |
| Cross-refs to existing canon | FAL headshot generation |
| Roadmap + verification plan | Automated social posting |

### Verification plan (post-approval)

1. **Schema validation** — every required profile field documented with examples
2. **Graph consistency** — org chart is DAG; every employee has manager except Genesis tier
3. **Atlas binding** — every canonical employee has office address stub in spec
4. **Immersion audit** — one sample employee traced across 5 surfaces on paper
5. **Build** — `npm run build` must pass (docs-only — no code changes expected)
6. **Bootstrap audit** — no employee marked canonical without phase table

---

## Manifesto

Studio is a **living company**.

Genesis is not the only intelligence — Genesis **coordinates**.

Employees **execute**. Departments **collaborate**. Leadership **guides**. The founder **leads**.

The world was already working before the founder arrived.

**People will say they met Ava — not that they used a tool.**

That is The Living Organization™.

---

*End of The Living Organization™ — Studio OS Bible v1.0.0*
