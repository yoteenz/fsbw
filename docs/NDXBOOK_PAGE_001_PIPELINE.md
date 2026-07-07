# NDXBOOK — Page 001 First Post Pipeline

Operational runbook for the first authentic NDXBook Instagram post inside **AI Media / NDXBook Operating Center**.

## Prerequisites

1. **Stay in NDXBook workspace** (`ai-media`) — not Frontal Slayer.
2. **Founder Pilot Mode** — page count starts at **0**; no demo pages 028–042.
3. **Instagram OAuth** (for live publish):
   - Supabase migration for `studio_social_accounts` / `studio_social_posts`
   - Meta env vars on Vercel (see `docs/STUDIO_SOCIAL_PUBLISHING.md`)
4. **Pilot distribution pack** — `dist-ndx-page-001` (Instagram-only routing).

## UI Path

1. Open **NDXBook Headquarters** → Mission Control or workspace dashboard.
2. **Enter Newsroom / Production Floor** (`/admin/studio-os/workspace/ai-media/newsroom`).
3. Use **PAGE 001 PIPELINE** panel at top of Production Floor tab.

## 15-Step Runbook

| Step | Action | System behavior |
|------|--------|-----------------|
| 1 | Confirm Instagram connection | Pipeline panel shows OAuth status; link to Social Accounts |
| 2 | Open NDXBook HQ | `ai-media` workspace only |
| 3 | Enter Newsroom | Production Floor tab |
| 4 | Create Page 001 | `createNdxbookPage()` → registry + newsroom sync |
| 5 | Category | Money / Credit — Instagram only |
| 6 | Draft content | Pre-filled educational post (debt payoff & credit score) |
| 7 | Generate visual | SVG thumbnail with NDXBook identity |
| 8 | Studio Intelligence | Clarity, accuracy, tone, brand, authenticity scores |
| 9 | Approve production | Requires review PASS; records `first-approval` milestone |
| 10 | Schedule Instagram only | No TikTok, YouTube, Facebook, newsletter |
| 11 | Publish or schedule | Publish Now or pick datetime |
| 12 | Confirm status | `scheduled` or `published`; page count = 001 |
| 13 | Monitor | Activity wall, publish errors, Labs experiment link |
| 14 | Knowledge Library | On publish → `knowledgeOutputs` + institutional-knowledge stage |
| 15 | Page 002 | Only after Page 001 pipeline is reliable |

## Code Entry Points

| Module | Path |
|--------|------|
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

## Pilot Fallback

When Instagram OAuth is not configured, Founder Pilot Mode allows **local schedule/publish** so the pipeline can be tested end-to-end. Live Instagram requires OAuth + API success.

## Milestones Recorded

- `first-page-written` — on Page 001 creation
- `first-approval` — on explicit production approval
- `first-publish` — on publish (local or live)

## Manual Verification Checklist

- [ ] Instagram status shows in pipeline panel
- [ ] Create Page 001 → production board shows single page
- [ ] No fake historical pages (028–042)
- [ ] Studio Intelligence review passes
- [ ] Approve before schedule buttons appear
- [ ] Schedule sets status `scheduled`
- [ ] Publish sets status `published` + Knowledge Library entry
- [ ] `nextPageNumber` = 2 after Page 001
