# Master Content Pipeline™

**Studio OS™ — Canonical Content Operating System**

**Type:** Product logic + UX architecture (not a Design Revision · not a new milestone)

**Status:** Permanent operating philosophy for all Studio OS content products

---

## Executive summary

Studio OS no longer treats **pages** or **posts** as the product unit.

Every campaign is a **production pipeline**, not a publishing pipeline.

The **Master Content Asset™** is the single source of truth. All platform-specific outputs are **derivatives** linked to that master asset and reviewed on their own merit.

This document is the canonical reference for:

- Campaign Engine™
- Newsroom™
- Publishing Studio™
- Knowledge Library™
- Studio Intelligence™
- NDXBook Page 001 pipeline (Master Content Asset pilot)
- All future Studio OS content products

**Code registry:** `src/studio-os-core/content-pipeline/`

---

## Philosophy shift

| Before (publishing pipeline) | After (content operating system) |
|-----------------------------|----------------------------------|
| Create a page → publish | Identify opportunity → produce master asset → expand → review → schedule → publish → learn |
| Page is the product | Master Content Asset™ is the product |
| One approval covers everything | Concierge Review Board™ + per-derivative review |
| Campaign = calendar of posts | Campaign = coordinated production pipeline |
| Success = published | Success = archived in Knowledge Library™ with performance + lessons |

---

## Canonical 17-stage lifecycle

```
1.  Concept / Opportunity
2.  Campaign Assignment
3.  Research & Knowledge Gathering
4.  Storyboard + Script
5.  Talent Selection & Availability
6.  Production Planning
7.  Master Content Creation™
8.  Internal Editing
9.  Concierge Review Board™
10. Founder Approval (when required)
11. Content Expansion Engine™
12. Multi-Platform Asset Review
13. Scheduling
14. Publishing
15. Performance Evaluation
16. Studio Intelligence™ Learning
17. Knowledge Library™
```

Each stage is defined in `src/studio-os-core/content-pipeline/lifecycle.ts` as `MASTER_CONTENT_LIFECYCLE`.

---

## Stage reference

### 1. Concept / Opportunity

Every campaign begins with an **opportunity** — not content.

Examples: Truth Tuesday · Product Launch · New Collection · Customer Question · Educational Topic · Seasonal Event · Industry Trend · Company Announcement · Viral Trend · Internal Initiative.

**Rule:** No content is created in this phase.

**Surfaces:** Strategy Engine™ · Innovation Lab™ · Mission Control priority cards.

---

### 2. Campaign Assignment

Attach the opportunity to a **campaign** so Studio OS understands **WHY** before **WHAT**.

Examples: Truth Tuesday™ · Luxury Without Limits™ · Holiday Campaign · Education Series · Launch Campaign · Brand Awareness · Referral Program.

**Surfaces:** Campaign Engine™ · Campaign Workspace.

---

### 3. Research & Knowledge Gathering

Before AI writes anything, collect:

- Sources · statistics · references
- Existing Knowledge Assets
- Company knowledge · customer questions
- Competitive insights · internal documentation

**Mandatory** for educational brands (e.g. NDXBOOK) before script generation.

**Surfaces:** Campaign Workspace · Research tab · Knowledge Hub · Profession Brain™.

---

### 4. Storyboard + Script

Develop before Master Content exists:

- Outline · storyboard · hook · sections
- Talking points · visual direction · CTA
- Supporting graphics · B-roll ideas · scene transitions · script

**Rule:** Nothing enters production until this is approved.

**Surfaces:** Newsroom Editor · Campaign Deliverables Manager™ · Production Builder.

---

### 5. Talent Selection & Availability

Determine who appears: Founder · team · UGC · voice actor · photographer · AI avatar · virtual host · guest.

Studio OS manages availability · scheduling · location · wardrobe · hair · equipment · dependencies · confirmations.

**Rule:** Production cannot begin until dependencies are satisfied.

**Surfaces:** Talent Network · Casting · Newsroom talent routing.

---

### 6. Production Planning

Producer workspace: timeline · equipment · locations · products · assets · props · dependencies · deadlines · checklist · approvals.

**Surfaces:** Work Orchestration Engine · Production Studio · Campaign Engine timeline.

---

### 7. Master Content Creation™

**Replaces “Page Creation.”**

The page is no longer the product. The **Master Content Asset™** is the product — single source of truth.

Examples: Page 001 · Episode 014 · Article · Video · Interview · Tutorial · Guide · Lesson · Case Study.

Everything else derives from this.

**NDXBook mapping:** `createNdxbookPage()` creates a Master Content Asset (`page` kind) in the registry.

**Surfaces:** Newsroom™ Production Floor · NDXBook Page 001 Pipeline · Campaign deliverables (type `page`).

---

### 8. Internal Editing

Review: grammar · readability · brand voice · accessibility · SEO · legal · formatting · fact accuracy · visual quality.

**Surfaces:** Newsroom Editor · Campaign Deliverables Manager™.

---

### 9. Concierge Review Board™

Replace single-review approval with a **multidisciplinary review board**.

Reviewers (each returns PASS · WARNING · FAIL · recommendations · score):

- Creative Director Concierge™
- Brand Concierge™
- Editorial Concierge™
- SEO Concierge™
- Accessibility Concierge™
- Legal Concierge™
- Marketing Concierge™
- Social Media Concierge™
- Visual Design Concierge™
- Studio Intelligence™

**Overall readiness score** aggregates board results.

**NDXBook mapping:** Studio Intelligence review on Page 001 ≈ partial board (brand · editorial · intelligence dimensions).

**Surfaces:** Concierge Approval Flow · Studio Intelligence gate on NDXBook pipeline.

---

### 10. Founder Approval

Configurable per campaign policy. High-impact or regulated content always requires founder sign-off.

**Surfaces:** Concierge Approval Flow · Mission Control approval center.

---

### 11. Content Expansion Engine™

Flagship capability: from **one** Master Content Asset™, generate platform-specific derivatives.

Examples: Instagram carousel · caption · story · reel · Facebook post · TikTok script · Pinterest pin · LinkedIn article · X thread · newsletter · email · push · SMS · podcast outline · YouTube short/long · website article · FAQ · knowledge base · landing page · ad copy · press release.

**Rule:** Every derivative remains **linked** to the master asset ID.

**Surfaces:** Content Expansion Engine™ (architecture) · Distribution Engine · Campaign deliverables generation (future).

---

### 12. Multi-Platform Asset Review

Each derivative receives **its own review**.

**Rule:** Master Content approval does **not** auto-approve derivatives.

**Surfaces:** Campaign Deliverables Manager™ · Publishing Studio™ review queue.

---

### 13. Scheduling

Approved assets enter Campaign Engine scheduling.

Support: single publish · multi-platform · sequenced campaigns · time zones · approval windows · blackout periods · recurring schedules.

**Surfaces:** Campaign Engine calendar · Publishing Queue · Distribution Network.

---

### 14. Publishing

Only **approved** assets may publish.

Modes: immediate · scheduled · staged · platform-specific · campaign-specific.

**Surfaces:** Social Publishing · Distribution Network · NDXBook Instagram schedule/publish.

---

### 15. Performance Evaluation

**Performance Concierge™** evaluates: CTR · reach · watch time · completion · conversions · engagement · comments · shares · retention · sentiment · platform/campaign performance.

**Surfaces:** Analytics · Mission Control · Campaign Engine analytics tab.

---

### 16. Studio Intelligence™ Learning

Every campaign teaches Studio Intelligence™.

Updates: Knowledge Graph™ · Audience Memory™ · Topic Performance™ · Content Performance™ · Brand Memory™ · Recommendation Engine™ · Future Campaign Suggestions™.

**Surfaces:** Studio Intelligence™ · Memory Engine™ · Campaign deliverable **Learn** action.

---

### 17. Knowledge Library™

Archive after publishing:

- Original Master Content™
- Platform variants · performance · lessons learned
- Related campaigns · source materials · research · associated assets

Future AI retrieves from this library before generating similar content.

**Surfaces:** Knowledge Library™ · Memory Bible · NDXBook `knowledgeOutputs` · deliverable `knowledgeAssetId`.

---

## UX principles

The Campaign Workspace and Newsroom must answer at all times:

1. **What stage** is this content in?
2. **What approvals** remain?
3. **Which concierges** have reviewed it?
4. **Which derivatives** exist vs. still needed?
5. **Which assets** are scheduled vs. published?
6. **How did the campaign perform?**
7. **What did Studio Intelligence™ learn?**

The experience should feel like managing a **professional media production studio** — not creating social posts in isolation.

**UI component:** `MasterContentLifecycleStrip` — compact stage indicator shared across Campaign Engine and Newsroom.

---

## Product inheritance map

| Product | Role in pipeline |
|---------|------------------|
| **Campaign Engine™** | Stages 2–3, 6, 13–15 — campaign assignment, research, planning, scheduling, performance |
| **Newsroom™** | Stages 4–9, 7 — storyboard, master asset creation, editing, review board |
| **Publishing Studio™** | Stages 12–14 — derivative review, scheduling, publishing |
| **Knowledge Library™** | Stage 17 — archival and retrieval |
| **Studio Intelligence™** | Stages 9, 15–16 — review, performance, learning |
| **Distribution Engine** | Stages 11–14 — expansion routing and publish |
| **Concierge Approval Flow** | Stages 9–10 — review board + founder approval |
| **NDXBook Page 001** | Stage 7 pilot — Master Content Asset (`page 001`) |

---

## Migration from legacy “page” model

| Legacy term | Master Content Pipeline term |
|-------------|------------------------------|
| Page | Master Content Asset™ (kind: `page`) |
| Create Page 001 | Create Master Content Asset · Page 001 |
| Deliverable | Derivative asset (or master, if type is page/episode/article) |
| `workflowStatus: review` | Lifecycle stage: Concierge Review Board™ |
| `workflowStatus: published` | Stages 14–17 (publish → performance → learning → library) |
| Studio Intelligence review (NDXBook) | Partial Concierge Review Board™ |

Bridge functions: `src/studio-os-core/content-pipeline/mapping.ts`

---

## Implementation status (2026-07-07)

| Layer | Status |
|-------|--------|
| Canonical lifecycle registry | ✅ `content-pipeline/lifecycle.ts` |
| Types + concierge board model | ✅ `content-pipeline/types.ts` |
| Legacy mapping (Campaign · NDXBook) | ✅ `content-pipeline/mapping.ts` |
| UX lifecycle strip component | ✅ `MasterContentLifecycleStrip.tsx` |
| Full Content Expansion Engine automation | 🔜 Architecture defined; generation TBD |
| Full Concierge Review Board UI | 🔜 Partial via Concierge Approval Flow + SI review |
| Publishing Studio™ unified queue | 🔜 Inherits this model |

---

## Related documentation

- [Studio OS Architecture](./architecture.md)
- [Campaign Engine deliverables workflow](../NDXBOOK_PAGE_001_PIPELINE.md) (NDXBook runbook)
- [Concierge Approval Flow](./concierge-approval-flow.md) (when present)
- [Founder Pilot Mode](./founder-pilot-mode.md)
- [Studio Intelligence Architecture](./studio-intelligence-architecture.md)

---

## Governance

- This is **product logic**, not a Design Revision (DR).
- Do **not** create a new milestone number for this architecture.
- New content features **must** declare which lifecycle stage(s) they own.
- Do **not** introduce parallel page-centric workflows without mapping to Master Content Asset™.

**Permanent philosophy:** *Campaigns are production pipelines. The Master Content Asset™ is the single source of truth.*
