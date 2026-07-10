# HQX™

## Headquarters Communications & Broadcast Center

**P0 World-Building Architecture**  
**Version:** 1.0.0  
**Status:** Canonical Studio OS Bible — docs only · July 2026  
**Sprint:** COMPOSER — HQX™  
**Authority:** Defines Studio World's official communications headquarters — not marketing, not a content calendar

---

> *Studio doesn't "post." Studio **broadcasts**.*  
> *Social media should feel like the public communications department of a living technology company.*

**North star:** People should eventually say *"HQX just announced something"* — not *"I saw a post on Instagram."*

**Do not implement social automation in this sprint.** Architecture first.

---

## Canon stack

| Document | Role |
|----------|------|
| **HQX™** (this document) | **Communications headquarters** — place, broadcasts, pipeline, archive |
| [THE_LIVING_ORGANIZATION.md](./THE_LIVING_ORGANIZATION.md) | Employees who appear on HQX stage · workforce registry |
| [THE_SPATIAL_COMPUTING_PHILOSOPHY.md](./THE_SPATIAL_COMPUTING_PHILOSOPHY.md) | HQX is a place — not a page or scheduler |
| [GENESIS_CORE_ARCHITECTURE.md](../docs/studio-os/genesis-core/GENESIS_CORE_ARCHITECTURE.md) | Genesis Briefing coordination · runtime health |
| [STUDIO_WORLD_BIBLE.md](../docs/studio-os/STUDIO_WORLD_BIBLE.md) | Experience constitution — arrival, presence |
| [STUDIO_WORLD_CIVILIZATION_BIBLE.md](../docs/studio-world/STUDIO_WORLD_CIVILIZATION_BIBLE.md) | Traditions · Chronicles · public ceremonies |
| [STUDIO_WORLD_MASTER_PLAN.md](../docs/studio-world/STUDIO_WORLD_MASTER_PLAN.md) | District placement · city architecture |

**Hierarchy:** Living Organization = **who speaks** · HQX = **where and how Studio broadcasts** · Civilization Bible = **what becomes history**.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Mission & Core Philosophy](#mission--core-philosophy)
3. [Headquarters Architecture](#headquarters-architecture)
4. [Communications Department Structure](#communications-department-structure)
5. [Broadcast Philosophy](#broadcast-philosophy)
6. [Social Content Framework](#social-content-framework)
7. [Broadcast Engine — Recurring Formats](#broadcast-engine--recurring-formats)
8. [Executive Presentation Standards](#executive-presentation-standards)
9. [Founder Broadcast Workflow](#founder-broadcast-workflow)
10. [Genesis Broadcast Workflow](#genesis-broadcast-workflow)
11. [Content Pipeline](#content-pipeline)
12. [Historical Archive Strategy](#historical-archive-strategy)
13. [Employee & Founder Experience](#employee--founder-experience)
14. [Long-Term HQX Roadmap](#long-term-hqx-roadmap)
15. [Anti-Patterns](#anti-patterns)
16. [Implementation Boundaries](#implementation-boundaries)

---

## Executive Summary

**HQX™** is the **official communications headquarters** of Studio World — a recognizable physical location from which every public-facing transmission originates.

| Forbidden end state | Canonical end state |
|---------------------|---------------------|
| "We posted on Instagram" | **"HQX Transmission #047"** |
| Static graphic templates | **Moments captured inside Headquarters** |
| Marketing content calendar | **Broadcast schedule from Communications** |
| Anonymous brand voice | **Genesis Briefing · Founder's Address · named presenters** |
| Ephemeral social posts | **Archived broadcasts in Studio Chronicles** |

HQX transforms social media from marketing into **world-building** — the public hears from a real organization with a real broadcast division.

---

## Mission & Core Philosophy

### Mission

Establish HQX as the place where **everything the public sees originates** — before it reaches any external platform.

### Core philosophy

```
STUDIO WORLD (private — full organization)
        ↓
HQX (communications headquarters — broadcast preparation)
        ↓
TRANSMISSION (canonical broadcast artifact)
        ↓
PUBLIC CHANNELS (Instagram · X · YouTube · newsletter · etc.)
        ↓
STUDIO ARCHIVE (permanent history)
```

**Laws:**

1. **Nothing is posted — everything is broadcast.** Language, workflow, and archive reflect transmission—not "content."
2. **HQX is a place.** Every public artifact must trace to a physical origin inside Studio World.
3. **Headquarters before hashtags.** Broadcasts are conceived, reviewed, and approved inside HQX before external publish.
4. **People, not features.** Employee introductions, Genesis briefings, and department updates follow [Living Organization](./THE_LIVING_ORGANIZATION.md) immersion rules.
5. **History is permanent.** Every transmission receives a broadcast number and enters the archive.
6. **Recognizable before repetitive.** HQX visual language should be identifiable even when cropped or muted.

### What this sprint is NOT

| Not this | Because |
|----------|---------|
| Social media sprint | Architecture defines broadcast *system* — not posts |
| Content calendar sprint | Recurring formats are immersion scaffolding — not scheduling software |
| Marketing sprint | HQX is world-building — not campaign planning |
| Automation sprint | No auto-publish, no channel bots in this phase |

**Note:** Frontal Slayer **Distribution Network** (`/admin/studio/distribution`) routes *customer* content packs — separate from **Studio platform HQX** communications. HQX speaks for **Studio the company**; Distribution speaks for **founder companies**.

---

## Headquarters Architecture

### Location thesis

HQX is one of the **most recognizable locations** in Studio World — immediately communicating: *"This is where the world hears from Studio."*

### Sensory references (atmosphere only — no logo copying)

| Reference | Borrow |
|-----------|--------|
| **Apple Park** | Panoramic calm · executive restraint · keynote gravity |
| **NASA Mission Control** | Operational clarity · status walls · mission numbering |
| **Westworld Operations** | Holographic intelligence · controlled spectacle |
| **Xbox Design Lab** | Premium broadcast craft · stage lighting discipline |
| **Luxury executive studio** | Materials · camera language · presentation dignity |

**Forbidden:** Copying any trademark silhouette, brand color system, or logo composition from references.

### Containment address

```
STUDIO WORLD™
└── STUDIO PLATFORM COMPANY™
    └── HEADQUARTERS™
        └── INTELLIGENCE / MEDIA CAMPUS
            └── HQX™ — Headquarters Communications Center
                ├── GENESIS COMMAND PODIUM
                ├── MAIN BROADCAST STAGE
                ├── PRESS BRIEFING AREA
                ├── MEDIA WALL (status · schedules · live feeds)
                ├── HOLOGRAPHIC DISPLAY GALLERY
                ├── EXECUTIVE PRESENTATION SUITE
                ├── COMMUNICATIONS DEPARTMENT OFFICES
                ├── BROADCAST CONTROL (mission-control tier)
                ├── ARCHIVE VAULT (transmission history)
                └── FOUNDER GREEN ROOM (pre-broadcast)
```

**Atlas layer:** `hqx-broadcast-center` — pin visible from Studio World map at zoom ≥ District.

### Spatial zones

| Zone | Purpose | Visual signature |
|------|---------|------------------|
| **Genesis Command Podium** | Genesis Briefings · World Status · coordinated intelligence | Genesis Orb presence · warm ivory light spill |
| **Main Broadcast Stage** | Keynotes · product reveals · Founder's Address | Wide stage · soft key light · depth of field |
| **Press Briefing Area** | Department updates · employee spotlights · Q&A framing | Briefing lectern · backdrop media wall |
| **Media Wall** | Live schedule · transmission numbers · department feeds | Mission-control density · restrained motion |
| **Holographic Gallery** | Roadmaps · innovation demos · Institute graduations | Floating panels · parallax depth |
| **Executive Presentation Suite** | Internal review before public broadcast | Founder approval · communications prep |
| **Broadcast Control** | Technical orchestration · channel routing (future) | Dark glass · monitor arrays · no hacker aesthetic |
| **Archive Vault** | Historical transmission library | Chronicle integration · timeline scrub |

### Environmental law

Every zone must answer:

1. Who stands here?
2. What transmission type originates here?
3. What evidence remains after broadcast?
4. How does a founder arrive?

---

## Communications Department Structure

HQX is staffed by a **Communications Division** — permanent employees from the Living Organization registry.

### Department org chart

```
CHIEF COMMUNICATIONS OFFICER (CCO)
        │
        ├── Director of Broadcast Operations
        │       ├── Broadcast Producer
        │       ├── Stage Director
        │       └── Archive Curator
        │
        ├── Director of Public Affairs
        │       ├── Press Liaison
        │       ├── Employee Spotlight Editor
        │       └── Culture Correspondent
        │
        ├── Director of Visual Communications
        │       ├── Holographic Display Designer
        │       ├── Camera & Lighting Lead
        │       └── Brand Continuity Reviewer
        │
        └── Genesis Liaison (coordinates — does not replace Genesis)
```

### Role boundaries

| Role | Owns | Never owns |
|------|------|------------|
| **CCO** | Transmission calendar · approval routing · archive policy | Product canon · founder decisions |
| **Broadcast Producer** | Run-of-show · asset assembly · transmission packaging | External auto-publish |
| **Genesis Liaison** | Genesis Briefing prep · intelligence summary | Genesis runtime state |
| **Archive Curator** | Broadcast numbering · Chronicle entry · transcript | Editorial rewrite of history |
| **Founder** | Final approval · keynote delivery · Founder's Address | Anonymous ghost posts |

### Relationship to Genesis

**Genesis coordinates intelligence.** **HQX coordinates public expression.**

```
Genesis prepares substance → HQX shapes transmission → Founder approves → Archive records
```

Genesis does not "post to Instagram." Genesis delivers **Genesis Briefing** content to HQX stage.

---

## Broadcast Philosophy

### Vocabulary law

| Forbidden | Canonical |
|-----------|-----------|
| Post | **Transmission** · **Broadcast** · **Dispatch** |
| Content | **Briefing** · **Address** · **Report** · **Reveal** |
| Upload | **Stage** · **Prepare** · **Transmit** |
| Schedule | **Broadcast slate** · **Transmission queue** |
| Caption | **Transmission summary** · **Archive abstract** |

### Transmission types

| Type | Presenter | Typical zone | Example |
|------|-----------|--------------|---------|
| **HQX Transmission** | CCO or designated host | Main stage | General company update |
| **Genesis Briefing** | Genesis (coordinated) | Command Podium | Intelligence · roadmap synthesis |
| **Founder's Address** | Founder | Main stage | Annual vision · major announcement |
| **Executive Memo** | Executive leadership | Press briefing | Department strategy |
| **Department Update** | Department director | Holographic gallery | Creative Studios milestone |
| **Innovation Report** | Labs director | Holographic gallery | Prototype demonstration |
| **Studio Dispatch** | Communications | Media wall | Weekly pulse |
| **Launch Broadcast** | Launch Architect + CCO | Main stage | Product reveal |
| **Weekly Intelligence Report** | Observatory analyst | Command Podium | Metrics · world status |
| **World Status** | Genesis Liaison | Media wall | Runtime · compiler · health |
| **Studio Pulse** | Culture correspondent | Press briefing | Culture · traditions |
| **Product Reveal** | Product lead + Founder | Main stage | Ship moment |

### Transmission numbering

Every broadcast receives an immutable ID:

```
HQX-YYYY-NNNN
```

Example: `HQX-2026-0047` — 47th transmission of 2026.

Numbers never reused. Retired or corrected transmissions remain in archive with amendment note — history is not deleted.

---

## Social Content Framework

### World-building law

> Every social artifact should appear as though it was **created inside HQX** — never as static graphics detached from place.

### Content origin matrix

| Public surface | Must show | Forbidden |
|----------------|-----------|-----------|
| Instagram / Reels | Stage · podium · holographic moment · named presenter | Faceless gradient cards |
| X / threads | Transmission number · HQX attribution | "New feature alert" |
| YouTube | Keynote framing · chapter markers as broadcast segments | Screen recording of dashboard |
| Newsletter | Executive Memo format · archive link | Bullet feature list |
| LinkedIn | Employee spotlight from Press Briefing Area | Stock photography |

### Visual composition standards

1. **Establishing shot** — recognizable HQX architecture (windows · media wall · podium)
2. **Presenter anchor** — Genesis · Founder · or named employee (registry ID required)
3. **Holographic content** — roadmaps and data float in-world — not pasted UI screenshots
4. **Transmission badge** — subtle `HQX-YYYY-NNNN` or "HQX Transmission" lower-third
5. **No orphan graphics** — if it cannot be staged in HQX, it is not canonical public communications

### Story types (aligned with Living Organization)

| Story | HQX staging |
|-------|-------------|
| Employee Spotlight | Press Briefing Area · headshot on media wall |
| Meet the Team | Gallery walk · department roster |
| Promotion Announcement | Stage · director + employee |
| Department Spotlight | Holographic department feed |
| Behind the Scenes | Broadcast Control or green room (tasteful) |
| Institute Graduation | Holographic Gallery ceremony |
| Innovation Demo | Labs feed → HQX stage relay |
| Roadmap Presentation | Genesis Command Podium + holographic timeline |

---

## Broadcast Engine — Recurring Formats

Recurring formats strengthen immersion — they are **broadcast rituals**, not a content calendar product.

### Weekly slate (canonical rhythm)

| Day | Format | Owner | Purpose |
|-----|--------|-------|---------|
| **Monday** | **HQX Weekly Briefing** | CCO + Genesis Liaison | Week ahead · priorities · world status |
| **Tuesday** | **Employee Spotlight** | Public Affairs | Introduce one registry employee |
| **Wednesday** | **Studio Institute Session** | Institute correspondent | Learning · graduation · professor feature |
| **Thursday** | **Behind the Build** | Broadcast Ops | Product craft · department evidence |
| **Friday** | **Genesis Briefing** | Genesis → HQX stage | Intelligence synthesis · executive summary |
| **Saturday** | **Studio Culture** | Culture correspondent | Traditions · events · belonging |
| **Sunday** | **Founder's Reflection** | Founder (or approved delegate) | Quiet weekly close · optional |

### Format rules

1. Skipping a day is allowed — **never** fill with generic filler graphics.
2. Each format maps to a **zone** and **presenter role**.
3. Recurring formats still pass full **content pipeline** (no auto-publish).
4. Formats may compress into single **HQX Transmission** during low-activity weeks — archive notes merged broadcast.

### Seasonal & event broadcasts

| Event | Format override |
|-------|-----------------|
| Annual Summit | Multi-hour Launch Broadcast series |
| Innovation Week | Daily Innovation Report |
| Product launch | Launch Broadcast + Product Reveal |
| Studio World Anniversary | Founder's Address + Chronicle special |

---

## Executive Presentation Standards

### Keynote gravity

HQX keynotes follow **executive presentation law** — calm authority, not hype.

| Dimension | Standard |
|-----------|----------|
| **Pacing** | Deliberate · pauses · no rapid-cut anxiety |
| **Lighting** | Warm key · soft fill · Genesis ivory accent allowed |
| **Typography** | Sparse · large · holographic — never dense slides |
| **Camera** | Stable · slow push · one hero angle per segment |
| **Audio** | Restrained · room tone · no explosive stingers |
| **Duration** | Respect founder time — briefings &lt; 12 min default · keynotes flexible |

### Lower-third taxonomy

| Label | Use |
|-------|-----|
| `HQX TRANSMISSION` | General |
| `GENESIS BRIEFING` | Intelligence |
| `FOUNDER'S ADDRESS` | Founder keynote |
| `EXECUTIVE MEMO` | Leadership |
| `STUDIO INSTITUTE` | Education |
| `DEPARTMENT UPDATE` | Division news |

### Approval tiers

| Tier | Content | Approver |
|------|---------|----------|
| **T1 — Routine** | Employee spotlight · culture · institute session | CCO |
| **T2 — Departmental** | Department update · innovation report | CCO + department director |
| **T3 — Executive** | Genesis Briefing · executive memo | CCO + Genesis Liaison + founder |
| **T4 — Canonical** | Founder's Address · product reveal · roadmap | Founder required |

---

## Founder Broadcast Workflow

### Founder in HQX (future immersive)

The founder walks into HQX inside Studio World:

```
ARRIVE AT HQX (Executive Atrium transit)
        ↓
GREEN ROOM — review upcoming slate
        ↓
EXECUTIVE SUITE — approve queued transmissions (T3/T4)
        ↓
STAGE — deliver keynote or Founder's Address
        ↓
ARCHIVE VAULT — transmission auto-registered
        ↓
(Optional) CHANNEL ROUTING — communications publishes externally
```

### Founder actions (proposed UI — not implemented)

| Action | Location |
|--------|----------|
| Review broadcast slate | Media Wall · Executive Suite |
| Approve transmission | Approval queue with tier badge |
| Rehearse keynote | Main stage (private mode) |
| Host executive meeting | Presentation suite |
| Launch product | Main stage · Launch Broadcast ceremony |
| Record Founder's Reflection | Press briefing or intimate stage |

### Founder laws

1. High-impact transmissions always require founder approval (T4).
2. Founder may delegate T1/T2 — never T4.
3. Founder's Reflection may be asynchronous — still staged in HQX archive.

---

## Genesis Broadcast Workflow

### Genesis role at HQX

Genesis is **not** the communications department. Genesis is the **intelligence source** for coordinated briefings.

```
GENESIS CORE™ (runtime · compiler · organizational state)
        ↓
Genesis Liaison + Observatory inputs
        ↓
GENESIS BRIEFING DRAFT (substance — evidence-linked)
        ↓
HQX staging (podium · holographics · lower-thirds)
        ↓
CCO review → Founder approval (T3)
        ↓
HQX TRANSMISSION published + archived
```

### Genesis Briefing content rules

1. Every claim cites internal evidence (Chronicle · project · department artifact).
2. Genesis voice is warm executive — not chatbot casual.
3. Briefings summarize **what the organization accomplished** — not feature lists.
4. World Status segments may include compiler/runtime health — framed as operations, not debug logs.

### Genesis Briefing vs. Morning Executive Briefing

| Briefing | Audience | Location |
|----------|----------|----------|
| **Morning Executive Briefing** | Founder (private) | Mission Control / Genesis Orb |
| **Genesis Briefing (HQX)** | Public / broad Studio audience | HQX Command Podium |

Substance may overlap — presentation and approval paths differ.

---

## Content Pipeline

### Canonical workflow (future)

```
1. GENESIS / DEPARTMENT prepares announcement substance
        ↓
2. COMMUNICATIONS DEPARTMENT reviews (brand · place · presenter · tier)
        ↓
3. FOUNDER approves (per tier)
        ↓
4. HQX BROADCAST generated (staged asset package)
        ↓
5. PUBLISHED to social platforms (manual or governed automation — later sprint)
        ↓
6. ARCHIVED inside Studio World (HQX Vault + Chronicles)
```

### Pipeline artifacts

| Artifact | Contents |
|----------|----------|
| **Transmission brief** | Type · tier · presenter IDs · zones · topics |
| **Run-of-show** | Segments · timing · camera notes |
| **Staged media package** | Video · stills · holographic frames · lower-thirds |
| **Transmission summary** | Public abstract · channel-specific variants |
| **Archive record** | Full metadata + transcript |

### State model (proposed)

```typescript
// Implementation deferred
interface HqxTransmission {
  transmissionId: string;           // HQX-2026-0047
  type: TransmissionType;
  tier: 1 | 2 | 3 | 4;
  status: 'draft' | 'in-review' | 'approved' | 'staged' | 'transmitted' | 'archived';
  presenterEmployeeIds: string[];   // workforce-registry refs
  genesisBriefingRef?: string;
  zones: HqxZoneId[];
  topics: string[];
  scheduledAt?: string;
  transmittedAt?: string;
  archive: TransmissionArchiveRecord;
  channelVariants?: ChannelVariant[];
}
```

**Single authority:** `hqx-transmission-registry` (proposed `src/studio-os-core/hqx/`) — one writer; channels read published projections only.

---

## Historical Archive Strategy

### Archive thesis

Every broadcast becomes **Studio history** — explorable by future founders, employees, and the public.

### Archive record schema

| Field | Requirement |
|-------|-------------|
| **Broadcast Number** | `HQX-YYYY-NNNN` immutable |
| **Date** | Transmission timestamp |
| **Department** | Originating division |
| **Presenter(s)** | Employee registry IDs + Founder flag |
| **Transmission Type** | From taxonomy |
| **Topics** | Tagged themes |
| **Media Assets** | Canonical staged package URLs |
| **Transcript** | Full text · optional captions |
| **Announcements** | Structured bullet canon (what changed) |
| **Chronicle Link** | Studio Chronicles™ entry ID |
| **Approval chain** | Who approved · when |

### Archive surfaces (future)

| Surface | Experience |
|---------|------------|
| **HQX Archive Vault** | In-world timeline scrub · mission numbering |
| **Studio Chronicles** | Narrative history integration |
| **Public archive page** | External explore (optional) |
| **Institute case studies** | Communications craft curriculum |

### Retention law

- Transmissions are **never deleted** — only amended with successor note.
- Pre-release drafts remain internal — not public archive.
- Media assets versioned — original transmission package preserved.

---

## Employee & Founder Experience

### Employee connection

Employees appear at HQX per [Living Organization](./THE_LIVING_ORGANIZATION.md) — public-facing members of Studio.

| Appearance type | HQX zone |
|-----------------|----------|
| Promotion | Main stage |
| Award | Press briefing |
| Interview | Press briefing or gallery |
| New hire | Employee Spotlight (Tuesday format) |
| Project showcase | Holographic gallery |
| Roundtable | Presentation suite |

**Law:** Presenter must exist in `workforce-registry` with `canonStatus: canonical` (or explicit guest with expiry).

### Immersion principle for HQX

If the public meets a presenter in an HQX Transmission, the same person must exist in Creative Studios, Directory, and Institute with consistent identity.

### Founder north star

Founders eventually **host** from HQX — product launches and executive addresses happen in Headquarters before the world sees them.

---

## Long-Term HQX Roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **0** | HQX Bible (this document) | ✅ Docs sprint |
| **1** | Founder review · zone naming · tier policy approval | Pending |
| **2** | `hqx-transmission-registry` schema + Chronicle edge types | Not started |
| **3** | HQX district/set blueprint (Experience Lab presence proof) | Not started |
| **4** | Communications roster seed (5–8 employees) — manual | Not started |
| **5** | Founder approval queue UI (no external publish) | Not started |
| **6** | Archive Vault UI + transmission explorer | Not started |
| **7** | Staged media package templates (video/still spec) | Not started |
| **8** | Governed channel routing (manual publish assist) | Not started |
| **9** | Immersive founder walk-in HQX (Studio World) | Not started |
| **10** | Public HQX archive · recognizable brand mark | Not started |

### Success metrics

- Public materials cite HQX Transmission IDs
- ≥80% of Studio social assets show in-world staging
- Founders describe "going to HQX" not "making posts"
- Archive completeness: every T3/T4 has transcript + Chronicle link

### Proposed module layout

```
src/studio-os-core/hqx/
├── index.ts
├── types.ts
├── transmission-registry.ts
├── broadcast-formats.ts
├── approval-workflow.ts
├── archive-projections.ts
├── selectors.ts
└── bridges/
    ├── workforce-registry-bridge.ts
    ├── genesis-core-bridge.ts
    ├── chronicle-bridge.ts
    └── atlas-bridge.ts
```

### Proposed routes (future)

| Route | Host |
|-------|------|
| `/admin/studio/hqx` | HQX mission control — slate · queue · archive |
| `/admin/studio/hqx/transmission/:id` | Transmission detail + approval |
| Studio World arrival | `hqx-broadcast-center` set |

---

## Anti-Patterns

| Anti-pattern | Why forbidden |
|--------------|---------------|
| "Posted to Instagram" internal language | Breaks broadcast philosophy |
| Static Canva-style graphics | Detached from world |
| Auto-publish without HQX staging | Skips organizational truth |
| Anonymous company voice | Violates Living Organization |
| Feature-list launch posts | Marketing sprint — not HQX |
| Deleting old transmissions | Archive law |
| Genesis posting directly to social | Genesis briefs HQX — does not publish |
| HQX as content calendar SaaS | Tool — not place |
| Confusing with Distribution Network | Customer content ≠ Studio communications |

---

## Implementation Boundaries

**This sprint delivers architecture only.**

| In scope | Out of scope |
|----------|--------------|
| HQX Bible · place architecture · pipelines | Social automation |
| Broadcast taxonomy · weekly slate | Channel API integrations |
| Archive schema · approval tiers | Video generation |
| Module proposal · roadmap | Production HQX 3D set |

### Verification plan (post-approval)

1. **Spatial review** — HQX passes [Spatial Architecture Review](./SPATIAL_ARCHITECTURE_REVIEW.md) (7 questions + score ≥3.0)
2. **Place test** — every transmission type maps to zone + address
3. **Workforce test** — every presenter role maps to org chart
4. **Pipeline test** — draft → archive paper trace for sample Genesis Briefing
5. **Vocabulary audit** — no "post/upload/content" in canonical HQX docs
6. **Build** — `npm run build` (docs-only — no code changes expected)

---

## Manifesto

Social media should no longer feel like marketing.

It should feel like the **public communications department** of a living technology company.

Studio doesn't post. Studio **broadcasts**.

**HQX** is where the world hears from Studio.

---

*End of HQX™ — Studio OS Bible v1.0.0*
