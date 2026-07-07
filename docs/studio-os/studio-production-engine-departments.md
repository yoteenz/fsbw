# Studio Production Engine™ — Department Workspaces

**Parent:** [Studio Production Engine™](./studio-production-engine.md)  
**Gates:** [Master Content Pipeline Gates](./master-content-pipeline-gates.md)

Each department is a **distinct workspace** inside Studio Headquarters Production Wing — not a section on a shared scroll page.

Every department defines: workspace · responsibilities · tools · UI · navigation · approval criteria · entry state · exit condition.

---

## Standard department schema

| Field | Description |
|-------|-------------|
| **Number** | Canonical order (01–10) |
| **Name** | Department name (DISCOVER DEPARTMENT, …) |
| **Tagline** | User-facing identity line |
| **Gate** | Corresponding Master Content Pipeline gate |
| **Purpose** | Why this department exists |
| **Owner(s)** | Primary organizational owners |
| **Entry state** | What must be true to enter |
| **Exit condition** | Handoff artifact to next department |
| **Tools** | Department-specific capabilities |
| **UI / layout** | Workspace character (not visual redesign) |
| **Navigation** | Entry · continue · back · lock rules |
| **Approval criteria** | What must pass before exit |
| **AI systems** | Intelligence involved |
| **Concierge systems** | Human-facing guidance layer |
| **Failure conditions** | Blocks exit |

---

## 01 — DISCOVER DEPARTMENT

**Tagline:** *"Find the opportunity."*  
**Gate:** DISCOVER GATE™  
**Exit:** Approved Creative Brief

### Purpose

Idea generation · research · Knowledge Graph · market opportunities · trend analysis · competitive intelligence · inspiration.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Research library · opportunity board · trend wall — exploratory, low production pressure |
| **Primary focus** | One opportunity or brief in formation |
| **Layout** | Hero opportunity card · research panels · competitive intel (collapsible) · brief editor as focus panel |

### Tools

- Idea capture · category selection
- Knowledge Graph search · existing asset retrieval
- Market / trend feeds · competitive analysis
- Creative brief builder · objectives · success metrics
- Campaign assignment linker

### Entry state

- Raw idea · opportunity signal · or strategic initiative exists
- No Production Package required

### Exit condition

- **Approved Creative Brief** signed off
- Campaign or content initiative attached

### Navigation

- **Enter:** Production Wing → Discover (default for new assets)
- **Continue:** Hand off to **Development Department** (ceremonial transition)
- **Locked downstream:** Development through Learning until brief approved

### Approval criteria

- Brief completeness · strategic alignment · success metrics defined
- Founder or delegated campaign owner approval

### AI · Concierge

- Studio Intelligence™ · Organizational Intelligence · Strategy Engine
- Chief Concierge · Marketing Concierge · Knowledge Concierge

### Failure conditions

Brief rejected · insufficient research · duplicate opportunity without rationale

---

## 02 — DEVELOPMENT DEPARTMENT

**Tagline:** *"Design the idea."*  
**Gate:** DEVELOP GATE™  
**Exit:** Production Package

### Purpose

Storyboard · script · messaging · hook creation · creative direction · references · moodboards · production planning.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Creative studio · writers' room · visual planning wall |
| **Primary focus** | Production Package assembly |
| **Layout** | Storyboard canvas · script editor · moodboard rail · messaging pillars panel |

### Tools

- Outline · storyboard · hook builder
- Script editor · talking points · CTA planner
- Reference library · moodboards
- Visual direction notes · deliverables plan
- Production planning checklist (non-physical — moves to Assembly)

### Entry state

- Approved Creative Brief on asset passport

### Exit condition

- **Production Package** approved (storyboard + script + creative direction + deliverables plan)

### Navigation

- **Enter:** From Discover handoff or asset passport
- **Continue:** Hand off to **Assembly Department**
- **Back:** Discover history (read-only unless governance allows reopen)

### Approval criteria

- Editorial / creative plan sign-off
- Nothing enters Assembly without approved Production Package

### AI · Concierge

- Studio Intelligence · Content Brain · Writing DNA · Profession Brain™
- Creative Director Concierge™ · Editorial Concierge™ · Brand Concierge™ · Visual Design Concierge™

### Failure conditions

Incomplete script · off-brand messaging · missing hook/CTA · no deliverables plan

---

## 03 — ASSEMBLY DEPARTMENT

**Tagline:** *"Prepare production."*  
**Gate:** ASSEMBLY GATE™  
**Exit:** Production Ready

### Purpose

Talent selection · availability · products · inventory · props · equipment · scheduling · dependencies.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Production prep floor · logistics command · talent roster |
| **Primary focus** | Dependency clearance checklist |
| **Layout** | Talent grid · schedule timeline · props/products inventory · dependency status board |

### Tools

- Talent Network · casting · availability calendar
- Product / inventory selection · props list
- Location · equipment booking
- Brand asset attachment · wardrobe/hair notes
- Production checklist · producer sign-off

### Entry state

- Approved Production Package

### Exit condition

- **Production Ready** — all dependencies satisfied · talent confirmed

### Navigation

- **Enter:** From Development handoff
- **Continue:** Hand off to **Production Department**
- **Example block message:** *"Website Launch blocked at Assembly Department — location shoot unconfirmed."*

### Approval criteria

- Producer checklist complete · talent confirmations · no open blocking dependencies

### AI · Concierge

- Work Orchestration Engine · Studio Intelligence scheduling
- Launch Concierge · operations concierges

### Failure conditions

Talent unavailable · missing assets · schedule conflicts · equipment gaps

---

## 04 — PRODUCTION DEPARTMENT

**Tagline:** *"Create the master asset."*  
**Gate:** PRODUCTION GATE™  
**Exit:** Master Content Asset v1

### Purpose

Actual creation workspace — **NOT a report**. A studio.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Full production studio · infinite canvas · live preview stage |
| **Primary focus** | Master Content Asset v1 creation |
| **Layout** | Canvas-first · tool palettes ephemeral · asset library persistent rail |

### Tools (canonical)

- **Infinite Canvas**
- **Editor** (text · visual · structured content)
- **Asset Library**
- **Prompt Builder**
- **Reference Images**
- **Director Notes**
- **Version History**
- **Live Preview**
- **Collaboration** (comments · presence · handoff notes)

### Entry state

- Production Ready

### Exit condition

- **Master Content Asset v1** registered · stable ID · minimum viable master complete

### Navigation

- **Enter:** From Assembly handoff — unlocks full studio (not summary card only)
- **Continue:** Hand off to **Review Department**
- **Anti-pattern rejected:** Single scrolling panel with create/review/approve buttons stacked

### Approval criteria

- Master asset exists in registry · version 1 checkpoint saved

### AI · Concierge

- Production Studio · Render Queue · AI Production Engine
- Visual Design Concierge™ · Editorial Concierge™

### Failure conditions

Missing master asset · corrupt media · incomplete edit · failed registration

**NDXBook pilot note:** `createNdxbookPage()` today approximates Production Department exit — target UX is full department workspace.

---

## 05 — REVIEW DEPARTMENT

**Tagline:** *"Perfect the experience."*  
**Gate:** REVIEW GATE™  
**Exit:** Quality Approved

### Purpose

Quality Assurance — every concierge reviews **independently**.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | QA floor · concierge review rooms · screening theater sub-zone |
| **Primary focus** | Multidisciplinary review of Master Content Asset v1 |
| **Layout** | Master asset preview (hero) · concierge review cards (independent) · aggregate readiness score |

### Concierge review model

Each concierge has independent:

- **Approval**
- **Revision Request**
- **Notes**
- **Score**
- **Recommendations**

**Concierges:** Brand · Marketing · SEO · Legal · Accessibility · Executive (+ Editorial · Social · Visual Design as required)

### Entry state

- Master Content Asset v1 complete

### Exit condition

- **Quality Approved** — mandatory concierges PASS (or accepted WARNING) · executive/founder when policy requires

### Navigation

- **Enter:** From Production handoff
- **Continue:** Hand off to **Expansion Department**
- **User mindset:** *"I'm waiting on Marketing Concierge approval."*

### Approval criteria

- Concierge Review Board aggregate readiness · compliance cleared

### AI · Concierge

- Studio Intelligence™ dimensions · Concierge Approval Flow
- Full concierge roster per policy

### Failure conditions

Any mandatory FAIL · compliance block · founder rejection

---

## 06 — EXPANSION DEPARTMENT

**Tagline:** *"Multiply the content."*  
**Gate:** EXPANSION GATE™  
**Exit:** Derivative Asset Library

### Purpose

Transform approved master asset into **every derivative** — each opens its **own dedicated workspace**.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Expansion factory · channel wings · derivative workshop rooms |
| **Primary focus** | Derivative generation + per-channel refinement |
| **Layout** | Master asset anchor · derivative grid · channel-specific workspace on drill-in |

### Channel workspaces (each dedicated)

Instagram · Stories · TikTok · Facebook · Threads · Pinterest · LinkedIn · Email · Landing Pages · Website · Blog · Podcast · Ads · YouTube · (extensible)

### Tools

- Content Expansion Engine™ · channel adapters
- Per-derivative editor · format validators
- Lineage viewer (always linked to master ID)

### Entry state

- Quality Approved master asset

### Exit condition

- **Derivative Asset Library** — required derivatives generated and linked

### Navigation

- **Enter:** From Review handoff
- **Continue:** Hand off to **Approval Department**
- **Drill-in:** Selecting TikTok opens TikTok workspace — not inline accordion on one page

### Approval criteria

- Expansion plan acknowledged · required derivatives present in library

### AI · Concierge

- Content Expansion Engine · Distribution Engine · Studio Intelligence adaptation
- Social Media Concierge™ · Marketing Concierge · SEO Concierge

### Failure conditions

Unlinked derivative · missing channel · generation failure · drift from master

---

## 07 — APPROVAL DEPARTMENT

**Tagline:** *"Authorize launch."*  
**Gate:** APPROVAL GATE™  
**Exit:** Publishing Authorization

### Purpose

Campaign approval workspace — every derivative visible · individually and collectively approvable.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Launch authorization chamber · campaign command table |
| **Primary focus** | Derivative approval grid |
| **Layout** | All derivatives · status columns · bulk and individual actions |

### Derivative status

- **Ready**
- **Needs Changes**
- **Approved**

### Actions

- Approve **individual** assets
- Approve **entire campaign** (when all criteria met)

### Entry state

- Derivative Asset Library populated

### Exit condition

- **Publishing Authorization** sealed

### Navigation

- **Enter:** From Expansion handoff
- **Continue:** Hand off to **Publishing Department**
- **User mindset:** *"Campaign 024 passed Approval Department."*

### Approval criteria

- Per-derivative QA · scheduling validated · destinations confirmed

### AI · Concierge

- Studio Intelligence derivative QA · scheduling optimizer
- Brand · Legal · Social · Marketing · Accessibility concierges

### Failure conditions

Unapproved asset in package · schedule conflict · destination OAuth missing

---

## 08 — PUBLISHING DEPARTMENT

**Tagline:** *"Release to the world."*  
**Gate:** PUBLISH GATE™  
**Exit:** Campaign Live

### Purpose

Mission Control for distribution.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Publishing Mission Control · live ops floor |
| **Primary focus** | Publishing queue + live status |
| **Layout** | Queue hero · channel status board · deployment timeline · failure/retry panel |

### Tools

- Publishing Queue
- Schedule manager
- Channel connectors · OAuth health
- Live status · failures · retries
- Confirmation receipts · deployment timeline

### Entry state

- Publishing Authorization granted

### Exit condition

- **Campaign Live** — assets published or scheduled with platform acknowledgment

### Navigation

- **Enter:** From Approval handoff
- **Continue:** Hand off to **Intelligence Department** (when live)
- **User mindset:** *"I'm sending this to Publishing."*

### Approval criteria

- Publish authorization · channel readiness

### AI · Concierge

- Distribution routing · retry intelligence
- Launch Concierge · Social Media Concierge

### Failure conditions

API failure · OAuth expired · platform rejection · rollback required

---

## 09 — INTELLIGENCE DEPARTMENT

**Tagline:** *"Measure impact."*  
**Gate:** MEASURE GATE™  
**Exit:** Performance Report

### Purpose

Live analytics — post-publish measurement.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Analytics observatory · performance dashboard wing |
| **Primary focus** | Live and historical performance |
| **Layout** | KPI hero rings · asset performance grid · sentiment · heatmaps |

### Tools

- Revenue · CTR · engagement · watch time
- Audience growth · comments · sentiment
- Conversions · attribution · A/B results
- Heatmaps · top performing assets

### Entry state

- Campaign Live · measurable endpoints active

### Exit condition

- **Performance Report** generated for cycle

### Navigation

- **Enter:** From Publishing handoff (or parallel once live)
- **Continue:** Hand off to **Learning Department**
- **User mindset:** *"I need Intelligence before creating the next campaign."*

### Approval criteria

- Measurement window satisfied (automatic)

### AI · Concierge

- Performance Concierge™ · analytics aggregation · A/B analysis
- Marketing Concierge · Growth Concierge

### Failure conditions

Missing tracking · API unavailable · insufficient data window

---

## 10 — LEARNING DEPARTMENT

**Tagline:** *"Improve the next campaign."*  
**Gate:** LEARNING GATE™  
**Exit:** Continuous Improvement

### Purpose

Studio Intelligence learns — feeds institutional memory.

### Workspace

| Aspect | Definition |
|--------|------------|
| **Environment** | Learning atelier · institutional memory vault entrance |
| **Primary focus** | Lessons · patterns · recommendations |
| **Layout** | Lessons learned panel · recommendation engine · graph update log · future campaign suggestions |

### Tools

- AI recommendations · pattern recognition
- Knowledge Graph updates · Campaign DNA · Design DNA updates
- Future campaign suggestions · optimization opportunities
- Archive to Knowledge Library™

### Entry state

- Performance Report available

### Exit condition

- **Continuous Improvement** recorded · asset archived to institutional knowledge
- **Loops back** to Discover Department for next cycle

### Navigation

- **Enter:** From Intelligence handoff
- **Continue:** Return to **Discover Department** (new opportunity / next asset)
- Closes the living OS loop

### Approval criteria

- Archive complete · learnings captured (optional founder review for high-impact)

### AI · Concierge

- Studio Intelligence learning loop · Memory Engine · Knowledge Graph
- Knowledge Concierge · Chief Concierge synthesis

### Failure conditions

Archive failure · learning not captured · graph conflict

---

## Cross-department rules

1. **One asset passport** travels all departments — no duplication.
2. **Completed departments** → history (collapsed · read-only default).
3. **Future departments** → locked with visible prerequisite message.
4. **Continue** is ceremonial handoff — not silent route change.
5. **Breadcrumbs** always show campaign · asset · department · status.
6. **Products consume departments** — never reimplement full lifecycle as one page.

---

## Related documentation

- [Studio Production Engine™](./studio-production-engine.md)
- [Master Content Pipeline™](./master-content-pipeline.md)
- [Executive Information Architecture](./executive-information-architecture.md)
