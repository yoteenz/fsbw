# 19 — Responsive Completeness Report

**Method:** a rendered sweep of 51 scoped routes (22 customer, 29 admin) at **390×844, 768×1024, 1440×900 and 2560×1440**, for **204 renders**. It ran on a local **production build** (`vite build` + `vite preview`). `/api` was proxied to a dead port, all non-localhost requests were blocked, and synthetic identities lived in local browser storage only. No production systems were touched (doc 25 §4). It was combined with code evidence from `appendix/A`–`F`.

Because no backend was reachable, pages show their offline or empty states. That is useful evidence about failure handling, but **data-dependent layouts (long order lists, full tables) are UNVERIFIED** until an authenticated run on a staging backend (Phase 7).

FRONTAL SLAYER's own rule applies: **document scroll is normal**. Studio World's no-page-scroll rule was not used as a criterion.

## 1. Headline results

| Check | Result |
|---|---|
| Horizontal page overflow | **0 of 204 renders.** Nothing scrolls sideways at any width. |
| Page errors (uncaught JS) | **0 of 204** |
| Marble + glass present | All account and admin pages **except** Collectibles, Consult offer, the `/mobile/*` placeholders, Trend Desk, PSA Broadcast, Studio health, Hairstyle Analysis and Slay Cam (their own tool or editorial layouts) |
| Interactive targets under 24px at 390px | **243 of 812 (30%)** across scoped pages. Worst: `/admin/meetings` 57/155, `/admin/meetings/schedule` 45/58, `/account/alerts` 13/15. 24px is a lenient bar; the recommended minimum is 44px. |
| Keyboard reachability | **135 clickable `div`/`span`/`img`/`li` elements**, of which only 12 have a `role` or `tabIndex`. The account hub's 12 nav cards are clickable `div`s, so they **can't be reached with Tab or announced by a screen reader**. |
| Redirects by width | `/account` → `/desktop/account` at **768, 1440 and 2560** (confirmed). `/admin/headquarters` → Studio OS grand atrium at every width. |
| Silent mock data with no backend | **`/admin/dashboard` rendered a full set of fabricated numbers** ("$69K" revenue, 25 clients, 80 meetings with customer names, 27 pending, 4.2 rating) for a non-founder admin with **no API available**. This confirms the silent `buildMockDashboardData()` fallback. |
| Injected test orders visible | After Concierge had loaded in the same session, `/account/orders` showed `ORDER #555 / #888 / #777 / #999 / #666` for the synthetic customer (BW-25) |

## 2. Per-family findings

### Customer account

| Width | Behaviour | Verdict |
|---|---|---|
| **390 (primary target)** | The single glass column reads well; marble, breadcrumb and Covered By Your Grace titles render as designed. Problems: 9–10px CHANGE PHOTO / RESET / LOAD GIFT CARD / "CLICK HERE" links; header icon sizes set with an invalid `!important` string; nested fixed-height scroll boxes (alerts 467px, orders 265px, stage lists 200px); single-line truncated alert bodies; the 50ms auto-scroll ticker on Orders. | **Mostly good**; tap targets and nested scroll need Phase 7 work |
| **768 (tablet)** | `/account` jumps to the Desktop Penthouse; every other account page renders the mobile layout stretched to the card width | Inconsistent (FD-A9) |
| **1440** | Account pages stretch the nav bar and main card **edge to edge** (no max-width), so content hugs the left edge of a wide card | Needs a centred max-width column (e.g. 560–720px) |
| **2560** | The same edge-to-edge stretch over ~2,500px: an order card is 2,000+ px wide with ~200px of content | **Poor**. Same fix |
| Off-canon | `/account/collectibles` is plain white with no marble, glass or nav; `/account/consult-offer` has no nav | Wrap in `AccountShell` |

### Admin

| Width | Behaviour | Verdict |
|---|---|---|
| **390** | Every page is a 448px-max column (fits). The dashboard's 2-column grid makes ~175px cards: `HEADQUARTER_`, meeting rows and highlight lines **truncate**. Tab strips on Brand, Revenue, Pending and Marketing scroll sideways inside their own containers (allowed). | Usable but cramped; truncation hides data |
| **768–2560** | **Still a 448px column**, centred in an expanse of marble (confirmed at 1440 and 2560). Tables are never wider than ~400px, which drives the truncation and nested scroll. | Wastes the screen; FD-B4 proposes a wider glass shell at ≥1024px |
| Off-canon | Trend Desk and PSA Broadcast render **black SaaS screens** (`bg-black`, white/10 borders) under the light AdminHeader; Studio health is unstyled | Re-skin (Phase 6) |
| Tables | Clients invites table (25% columns, 10px type) and the audit/deleted `<pre>` blocks have no horizontal-scroll wrapper except where `overflow-x-auto` is set | Add internal scroll wrappers; stacked row cards on phone |

### Sticky elements, drawers, modals, uploads

- **Sticky:** the nav bars are in normal flow, not sticky, so long pages lose the breadcrumb. Recommend a sticky nav bar with a `env(safe-area-inset-top)` offset.
- **Modals:** `ConfirmationModal` and the Pending review modal fit at 390 (code evidence). The meetings quote builder is a portal modal; UNVERIFIED with long content.
- **Drawers:** none exist (proposed `GlassDrawer`).
- **Upload controls:** affiliate and review file pickers are hidden inputs behind styled labels. Data-URL previews can exhaust memory on phones with videos (code evidence).
- **Keyboard / focus:** no visible focus style on the clickable `div`s. The custom dropdowns use `fixed inset-0` click-catchers with no `Escape` handling (code evidence).

## 3. Recommendations (Phase 7, plus shared shells in Phases 1–3)

1. `AccountShell` gets a **centred max-width column** at ≥768px. If the founder keeps `/account` → Desktop Penthouse (FD-A9), the other account pages should still not stretch edge to edge.
2. `AdminPageShell` gets a `wide` mode at ≥1024px (FD-B4): queue grid on the Command Center; real tables with sticky headers and internal horizontal scroll for list pages; keep the 448px column below 768px.
3. **Tap targets ≥ 44×44** for every action. Convert clickable `div`s to `<button>`/`<a>` (or add `role` + `tabIndex` + key handlers). Add a visible focus ring in brand red.
4. Remove nested fixed-height scroll boxes on phone; let the document scroll.
5. Make the nav bar sticky, with a safe-area offset.
6. Stop single-line truncation of alert bodies and dashboard rows; wrap to 2 lines with a "more" affordance.
7. An authenticated Playwright run on a staging Supabase branch at the same four widths, plus an `@axe-core/playwright` pass, as the Phase 7 exit gate.

Raw data: `appendix/responsive_sweep_results.jsonl` (one record per route × width: landing URL, overflow, interactive and small-target counts, marble/glass presence, page errors).
