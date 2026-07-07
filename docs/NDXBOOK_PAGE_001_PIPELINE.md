# NDXBOOK — Page 001 Master Content Asset Pipeline

Operational runbook for the first authentic NDXBook Instagram post inside **AI Media / NDXBook Operating Center**.

**Canonical model:** [Master Content Pipeline™](./studio-os/master-content-pipeline.md) · [Studio Production Engine™](./studio-os/studio-production-engine.md)

Page 001 is a **living Master Content Asset** — not a static preview card. It travels through **department workspaces** (Production · Review · Approval · Publishing · Learning).

### Prototype vs target UX

| State | Behavior |
|-------|----------|
| **Current prototype** | Single Newsroom panel stacks create · review · approve · schedule · publish — persistence pilot only |
| **Target (Studio Production Engine)** | Separate department rooms · ceremonial **Continue** handoffs · asset passport follows user |

Do not treat the stacked panel as the canonical UX. See [studio-production-engine-departments.md](./studio-os/studio-production-engine-departments.md).

## Prerequisites

1. **Stay in NDXBook workspace** (`ai-media`) — not Frontal Slayer.
2. **Founder Pilot Mode** — page count starts at **0**; no demo pages 028–042.
3. **Instagram OAuth** (for live publish):
   - Supabase migration for `studio_social_accounts` / `studio_social_posts`
   - Meta env vars on Vercel (see `docs/STUDIO_SOCIAL_PUBLISHING.md`)
4. **Pilot distribution pack** — `dist-ndx-page-001` (Instagram-only routing).

## UI Path

1. Open **NDXBook Headquarters** → Mission Control or workspace dashboard.
2. **Enter Newsroom / Production Floor** (`/admin/studio/ndxbook/newsroom` or `/admin/studio-os/workspace/ai-media/newsroom`).
3. Use **MASTER CONTENT ASSET · PAGE 001 PIPELINE** panel at top of Production Floor tab.
4. Status reflects active **department** — e.g. *"Page 001 · REVIEW DEPARTMENT"* (prototype maps gates on one panel until department workspaces ship).

## Department mapping (Page 001 pilot)

| Department | Gate | Page 001 behavior |
|------------|------|-------------------|
| DISCOVER · DEVELOPMENT · ASSEMBLY | (upstream) | Implicit in pilot seed |
| **PRODUCTION DEPARTMENT** | PRODUCTION GATE™ | `createNdxbookPage()` — master asset registered |
| **REVIEW DEPARTMENT** | REVIEW GATE™ | Studio Intelligence + **APPROVE PRODUCTION** |
| **APPROVAL DEPARTMENT** | APPROVAL GATE™ | Instagram readiness · schedule validation |
| **PUBLISHING DEPARTMENT** | PUBLISH GATE™ | Publish Now / scheduled Instagram |
| **LEARNING DEPARTMENT** | LEARNING GATE™ | `knowledgeOutputs` archive |

**Example status copy:** *"Page 001 is currently in Review Department."* · *"I'm waiting on Marketing Concierge approval."*

## Gate mapping (legacy reference)

## 15-Step Runbook

| Step | Action | Gate | System behavior |
|------|--------|------|-----------------|
| 1 | Confirm Instagram connection | APPROVAL (prep) | Pipeline panel shows OAuth status; link to Social Accounts |
| 2 | Open NDXBook HQ | — | `ai-media` workspace only |
| 3 | Enter Newsroom | — | Production Floor tab |
| 4 | Create Master Content Asset · Page 001 | PRODUCTION | `createNdxbookPage()` → registry + newsroom sync |
| 5 | Category | PRODUCTION | Money / Credit — Instagram only |
| 6 | Draft content | PRODUCTION | Pre-filled educational post (debt payoff & credit score) |
| 7 | Generate visual | PRODUCTION | SVG thumbnail with NDXBook identity |
| 8 | Studio Intelligence | REVIEW | Concierge review pilot — clarity, accuracy, tone, brand, authenticity |
| 9 | Approve production | REVIEW | Requires review PASS; records `first-approval` milestone |
| 10 | Schedule Instagram only | APPROVAL | No TikTok, YouTube, Facebook, newsletter |
| 11 | Publish or schedule | PUBLISH | Publish Now or pick datetime |
| 12 | Confirm status | PUBLISH | `scheduled` or `published`; page count = 001 |
| 13 | Monitor | MEASURE (light) | Activity wall, publish errors, Labs experiment link |
| 14 | Knowledge Library | LEARNING | `knowledgeOutputs` + institutional-knowledge stage |
| 15 | Page 002 | — | Only after Page 001 master asset pipeline is reliable |

## Code Entry Points

| Module | Path |
|--------|------|
| Content pipeline (canonical gates) | `docs/studio-os/master-content-pipeline-gates.md` |
| Legacy lifecycle bridge | `src/studio-os-core/content-pipeline/` |
| Lifecycle strip UI | `src/components/admin/studio/content-pipeline/MasterContentLifecycleStrip.tsx` |
| Pipeline orchestration | `src/studio-os-core/ndxbook/pagePipeline.ts` |
| Registry ↔ Newsroom sync | `src/studio-os-core/ndxbook/newsroom/pageSync.ts` |
| Distribution pack bridge | `src/studio-os-core/ndxbook/distributionBridge.ts` |
| Mission Control sync | `src/studio-os-core/ndxbook/mission-control/sync.ts` |
| UI panel | `src/components/admin/studio-os/ndxbook-newsroom/NdxbookPagePipelinePanel.tsx` |
| React hook | `src/hooks/useNdxbookPagePipeline.ts` |

## Status Model

**Registry (`NdxbookPage.status`):** `draft` → `review` → `scheduled` → `published`

**Gate mapping:** `draft` ≈ Production Gate · `review` ≈ Review Gate · `scheduled` ≈ Approval Gate · `published` ≈ Publish Gate → Learning Gate

**Approval gate:** `pipeline.approvedAt` must be set before schedule/publish.

**Newsroom stages:** Synced from registry; publish moves to `published` → institutional-knowledge (Learning Gate).

**Legacy mapping:** `mapNdxbookPageToLifecycle()` in `src/studio-os-core/content-pipeline/mapping.ts` (17-stage bridge — see gate mapping table in master spec).

## Pilot Fallback

When Instagram OAuth is not configured, Founder Pilot Mode allows **local schedule/publish** so the pipeline can be tested end-to-end. Live Instagram requires OAuth + API success.

## Milestones Recorded

- `first-page-written` — on Master Content Asset · Page 001 creation (Production Gate)
- `first-approval` — on explicit production approval (Review Gate)
- `first-publish` — on publish (Publish Gate)

## Manual Verification Checklist

- [ ] Instagram status shows in pipeline panel
- [ ] Create Master Content Asset · Page 001 → production board shows single page
- [ ] Gate status understandable (Production / Review / Approval / Publish)
- [ ] No fake historical pages (028–042)
- [ ] Studio Intelligence review passes (Review Gate)
- [ ] Approve before schedule buttons appear
- [ ] Schedule sets status `scheduled` (Approval Gate)
- [ ] Publish sets status `published` + Knowledge Library entry (Publish → Learning Gate)
- [ ] `nextPageNumber` = 2 after Page 001

## Related docs

- [Studio Production Engine™](./studio-os/studio-production-engine.md) — target department UX
- [Master Content Pipeline™](./studio-os/master-content-pipeline.md) — canonical operating model
- [Lifecycle Gates Reference](./studio-os/master-content-pipeline-gates.md) — full gate specifications
- [Studio Social Publishing](./STUDIO_SOCIAL_PUBLISHING.md) — OAuth setup
