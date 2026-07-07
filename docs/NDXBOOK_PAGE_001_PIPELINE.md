# NDXBOOK — Page 001 Master Content Asset Pipeline

Operational runbook for the first authentic NDXBook Instagram post inside **AI Media / NDXBook Operating Center**.

**Canonical model:** [Master Content Pipeline™](./studio-os/master-content-pipeline.md) — Page 001 is a **Master Content Asset™** (lifecycle stage 7), not a standalone publishing unit.

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
4. The **Master Content Lifecycle Strip** shows where Page 001 sits in the 17-stage pipeline.

## Lifecycle mapping (Page 001 pilot)

| Pipeline stage | Page 001 behavior |
|----------------|-------------------|
| 7 · Master Content Creation™ | `createNdxbookPage()` — registry + newsroom sync |
| 8 · Internal Editing | Draft content pre-filled; founder may edit in Newsroom Editor |
| 9 · Concierge Review Board™ | Studio Intelligence review (clarity, accuracy, tone, brand, authenticity) |
| 10 · Founder Approval | Explicit **APPROVE PRODUCTION** after review PASS |
| 13 · Scheduling | Datetime picker + schedule Instagram |
| 14 · Publishing | Publish Now or scheduled publish |
| 17 · Knowledge Library™ | On publish → `knowledgeOutputs` + institutional-knowledge stage |

Stages 1–6 (concept through production planning) are implicit in the pilot seed; full UI for research, storyboard, and talent comes online as Campaign Engine and Newsroom expand.

## 15-Step Runbook

| Step | Action | System behavior |
|------|--------|-----------------|
| 1 | Confirm Instagram connection | Pipeline panel shows OAuth status; link to Social Accounts |
| 2 | Open NDXBook HQ | `ai-media` workspace only |
| 3 | Enter Newsroom | Production Floor tab |
| 4 | Create Master Content Asset · Page 001 | `createNdxbookPage()` → registry + newsroom sync |
| 5 | Category | Money / Credit — Instagram only |
| 6 | Draft content | Pre-filled educational post (debt payoff & credit score) |
| 7 | Generate visual | SVG thumbnail with NDXBook identity |
| 8 | Studio Intelligence | Concierge Review Board pilot — clarity, accuracy, tone, brand, authenticity scores |
| 9 | Approve production | Requires review PASS; records `first-approval` milestone |
| 10 | Schedule Instagram only | No TikTok, YouTube, Facebook, newsletter |
| 11 | Publish or schedule | Publish Now or pick datetime |
| 12 | Confirm status | `scheduled` or `published`; page count = 001 |
| 13 | Monitor | Activity wall, publish errors, Labs experiment link |
| 14 | Knowledge Library | On publish → `knowledgeOutputs` + institutional-knowledge stage |
| 15 | Page 002 | Only after Page 001 master asset pipeline is reliable |

## Code Entry Points

| Module | Path |
|--------|------|
| Content pipeline (canonical lifecycle) | `src/studio-os-core/content-pipeline/` |
| Lifecycle strip UI | `src/components/admin/studio/content-pipeline/MasterContentLifecycleStrip.tsx` |
| Pipeline orchestration | `src/studio-os-core/ndxbook/pagePipeline.ts` |
| Registry ↔ Newsroom sync | `src/studio-os-core/ndxbook/newsroom/pageSync.ts` |
| Distribution pack bridge | `src/studio-os-core/ndxbook/distributionBridge.ts` |
| Mission Control sync | `src/studio-os-core/ndxbook/mission-control/sync.ts` |
| UI panel | `src/components/admin/studio-os/ndxbook-newsroom/NdxbookPagePipelinePanel.tsx` |
| React hook | `src/hooks/useNdxbookPagePipeline.ts` |

## Status Model

**Registry (`NdxbookPage.status`):** `draft` → `review` → `scheduled` → `published`

**Approval gate:** `pipeline.approvedAt` must be set before schedule/publish.

**Newsroom stages:** Synced from registry; publish moves to `published` → `institutional-knowledge`.

**Lifecycle mapping:** `mapNdxbookPageToLifecycle()` in `src/studio-os-core/content-pipeline/mapping.ts`.

## Pilot Fallback

When Instagram OAuth is not configured, Founder Pilot Mode allows **local schedule/publish** so the pipeline can be tested end-to-end. Live Instagram requires OAuth + API success.

## Milestones Recorded

- `first-page-written` — on Master Content Asset · Page 001 creation
- `first-approval` — on explicit production approval
- `first-publish` — on publish (local or live)

## Manual Verification Checklist

- [ ] Instagram status shows in pipeline panel
- [ ] Create Master Content Asset · Page 001 → production board shows single page
- [ ] Lifecycle strip reflects current stage
- [ ] No fake historical pages (028–042)
- [ ] Studio Intelligence review passes
- [ ] Approve before schedule buttons appear
- [ ] Schedule sets status `scheduled`
- [ ] Publish sets status `published` + Knowledge Library entry
- [ ] `nextPageNumber` = 2 after Page 001

## Related docs

- [Master Content Pipeline™](./studio-os/master-content-pipeline.md) — canonical 17-stage operating model
- [Studio Social Publishing](./STUDIO_SOCIAL_PUBLISHING.md) — OAuth setup
