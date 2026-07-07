# Studio Project™ Model

**Studio OS™ — Platform Philosophy & User-Facing Mental Model**

**Type:** Architectural terminology amendment (not a Design Revision · not a new milestone)

**Status:** Canonical user-facing model — technical URLs and registry IDs unchanged

**Applies to:** UX copy · documentation · onboarding · Mission Control · Creative Direction Studio™ · Studio Production Engine™ · [Headquarters Engine™](./headquarters-engine.md) · all future Studio OS products

---

## Position in Headquarters hierarchy

```
Headquarters
    ↓
Buildings
    ↓
Departments          ← Studio Production Engine (ten departments)
    ↓
Workspaces
    ↓
Projects             ← primary user-facing object (this document)
    ↓
Assets · Outputs
```

---

## Executive mandate

Studio OS stops thinking in terms of **pages**.

Pages are implementation details inside the NDXBook registry. Users are not creating pages — they are **directing productions**.

The primary object inside Studio OS is now:

## **Project™**

A **Project** represents the complete creative initiative.

Examples:

- Truth Tuesday Episode
- Product Launch
- Website Launch
- Email Campaign
- Holiday Campaign
- Educational Series
- Podcast Episode
- Brand Refresh
- Recruitment Campaign
- Product Photoshoot

Every Project moves through [Creative Direction Studio™](./creative-direction-studio.md) and [Studio Production Engine™](./studio-production-engine.md). The Project becomes the **single source of truth**.

---

## Project structure

Each Project contains (nothing exists independently):

| Domain | Description |
|--------|-------------|
| Creative Direction | Living branch · north star · intent |
| Creative Brief | Approved opportunity definition |
| Mood Board | Living visual direction |
| Inspiration Library | Analyzed references |
| Storyboard | Narrative structure |
| Scripts | Voice and copy |
| Research | Evidence and sources |
| Brand Notes | Brand alignment |
| Founder Notes | Studio Director direction |
| Concierge Reviews | Department head QA |
| Production Assets | Primary creative files |
| Version History | Permanent audit trail |
| Analytics | Performance observatory |
| AI Learnings | Studio Intelligence capture |
| **Outputs** | Published derivatives |

---

## Outputs

A Project can produce many **Outputs**. Every Output remains linked to its parent Project — complete traceability from idea to publication.

| Output type | Examples |
|-------------|----------|
| Social | Instagram Reel · Carousel · TikTok · Facebook Post · Pinterest Pin · LinkedIn Post · X Thread |
| Long-form | Blog Article · Knowledge Base Article · FAQ · Newsletter · Podcast Episode |
| Video | YouTube Short · YouTube Long-form |
| Web | Website Page · Landing Page · Sales Page |
| Other | Email · Advertisement · Print Material · Presentation |

**Outputs are not Projects.** Outputs are deliverables the Project produces.

---

## Project Dashboard · Mission Control

The **Project Dashboard** replaces page-centric Mission Control views.

Mission Control communicates **Project health**, not a single page:

- Current Department
- Overall Progress
- Creative Direction
- Active Mood Board
- Open Founder Notes
- Concierge Status
- Pending Reviews
- Production Timeline
- Outputs Created / Remaining
- Publishing Schedule
- Performance Summary
- AI Recommendations

**NDXBook pilot:** `ProjectMissionControlDashboard` at Headquarters Mission Control and Production Wing.

---

## Project Timeline

Every Project receives a **living timeline** — permanent history:

```
Project Created
    ↓
Creative Direction Updated
    ↓
Mood Board Expanded
    ↓
Storyboard Approved
    ↓
Production Started
    ↓
Review Requested
    ↓
Production Approved
    ↓
Publishing Complete
    ↓
Performance Review
    ↓
Knowledge Captured
```

Core resolver: **`src/studio-os-core/studio-project/dashboard.ts`** · `resolveProject001Dashboard()`.

---

## Project identity (UX pattern)

Every Project should feel like a **living production**:

```
PROJECT 001

Status:        Production Department
Progress:      64%
Objective:     Complete primary production assets
Pending:       Brand Concierge Review
Next:          Review Department
```

Users should naturally think: *"I'm producing Project 001"* — not *"I'm editing Page 001"*.

---

## Terminology standard

| Prefer | Avoid (user-facing) |
|--------|---------------------|
| Project | Page |
| Production | Post |
| Output | File |
| Creative Direction | Document |
| Production Timeline | Screen |
| Deliverable | Task |
| Department | — |
| Workspace | — |
| Mission Control | — |

**Technical implementation:** Registry keys (`page001`, `ndxbook-page-001`, `PAGE_001_ASSET_KEY`), route paths (`/admin/studio/ndxbook/newsroom`), and internal `pageLabel` fields **may remain unchanged**. This amendment is the **user-facing conceptual model**.

---

## Platform stack (Project-centric view)

```
Creative Direction Studio™     ← Project creative brain
         ↓
Living Creative Headquarters   ← Experience DNA · studio lot
         ↓
Studio Production Engine™      ← Ten department workspaces
         ↓
Outputs                        ← Linked derivatives
         ↓
Mission Control                ← Project Dashboard
```

---

## Implementation (NDXBook pilot)

| Path | Role |
|------|------|
| `src/studio-os-core/studio-project/` | Types · constants · dashboard resolver |
| `src/hooks/useStudioProjectDashboard.ts` | React hook |
| `src/components/admin/studio-os/studio-project/ProjectMissionControlDashboard.tsx` | Mission Control UI |
| `/admin/studio/ndxbook/mission-control` | Headquarters Project Dashboard |
| `/admin/studio/ndxbook/newsroom/:departmentId` | Production Wing + compact dashboard |

---

## Related docs

- [Creative Direction Studio™](./creative-direction-studio.md)
- [Studio Production Engine™](./studio-production-engine.md)
- [Living Creative Headquarters Experience™](./living-creative-headquarters-experience.md)
- [Master Content Pipeline™](./master-content-pipeline.md)
