# AIO IFTA — three-mode live visual authority reconstruction

**Sprint:** P0.AIO.IFTA.THREE-MODE-LIVE-VISUAL-AUTHORITY-RECONSTRUCTION1, plus the pixel-faithful pass (founder: "replicate these screens exactly, pixel perfect, including the shell").
**Rule:** KEEP THE FUNCTION. REBUILD THE LOOK. The approved authority images are the design authority. Earlier live screenshots are functional evidence only.

**Scope.** Only the four mounted proof surfaces were rebuilt. No other IFTA child states were added, nothing was generated, and OpenArt was not used.

## 1 · How the live pages reproduce the authority

**Authority units.** Each surface is laid out in authority pixels: 1rem = 10 px of the approved screen it reproduces.
- `iftaScale.ts` puts the document on that scale while the surface is mounted.
- The root font-size per band is in `ifta-ui.css`:
  - Desktop (≥ 1200 px) uses the 1440 screens.
  - Tablet (700–1199 px) uses the 834 client and public screens, and the 1024 staff screen.
  - Phone (< 700 px) uses the 402 screens.
- Inside a band, the page is the authority composition at any width.
- On phone, text keeps a legibility floor where the drawn type is smaller.

**Geometry.** Every card edge, row, column split and text baseline was measured on the authority screens. Each screen was cropped from its board and scaled to its CSS width (`scratchpad` grid overlays). Each band has its own grid areas, which reproduce the drawn compositions:
- Client desktop: three rows of three cards. Client tablet: two plus two plus two. Client phone: the parent's pairs.
- Staff desktop: three plus three plus three. Staff tablet: two plus two plus three. Staff phone: the drawn derivation.
- Public: nav, hero, rail, clear path (desktop), process, one return and promises, footer.

**Shell.** The client and staff top bars are exactly as drawn: the simple mark on the left; search, notifications (with a dot when something is open) and the avatar chip (name, role, chevron) on the right.
- Nothing from the old chrome was lost; it moved into the avatar menu:
  - workspace switching (NOT_APPLICABLE stays hidden)
  - client switching (staff)
  - Messages, My Office and Office home
- Search filters the case record the page registers. Notifications list its open items. Selecting either opens the tab that holds the item.
- The public nav is as drawn: mark; IFTA FILING ROOM, HOW IT WORKS, FEATURES, JURISDICTIONS, RESOURCES; search; GET STARTED. RESOURCES and search open 09 RUN FAQS. Tablet and phone add the drawn menu.

**Photography.** Each hero, the road panel, the jurisdiction map card and the footer band are **plates**: the photographic region of the authority screen itself, with the baked UI inpainted out (`scripts/ifta/derive-ifta-authority-plates.py`, OpenCV Telea).
- The baked UI includes the headline, pill, panels and rail.
- The live text, pills, panels and rails sit over the plate at the drawn coordinates.
- Nothing interactive is a picture, and no screenshot is used as a background.

**Components drawn as on the screens:**
- filled metric glyphs; workflow steps with status rings; checkbox tasks with assignee initials and dates
- bar chart with axis or values; legend tables; the US map; the donut
- file-type badges; activity tables and timelines
- CLIENT HEALTH glass panel; CTA rail; footer lockup and tagline

## 2 · What each surface binds (function kept)

| Surface | Route | Live data | Kept functions |
|---|---|---|---|
| PUBLIC | `/services/ifta-filing` | static labelled SAMPLE quarter (D-PUBLIC-SAMPLE-DATA) | GET STARTED → `getStartedForService('ifta-filing')`; IFTA account assistance, services and log in links (RESOURCES / menu); 09 RUN FAQS; truthful copy (D-PUBLIC-COPY-TRUTH) |
| CLIENT | `/portal/workspaces/ifta/:quarterKey` | canonical case (Pioneer Fleet, `ifta-client-c-2026-q3`) | guards; default-quarter redirect; six tabs with no NOTES; quarter selector; quarter tasks, quick actions and CTA rail open the tab holding the item; no staff-only content (D-CLIENT-DESKTOP-STAFF-MODULES: the drawn account card slot carries the client's due date and NEXT STEP) |
| STAFF QUEUE | `/office/workspaces/ifta` | every enrolled client quarter | derived from the staff case authority (D-STAFF-QUEUE-AUTHORITY): QUEUE HEALTH panel, metrics rail, filter tabs, case rows → case, deadlines, risks, team activity, OPEN NEXT CASE |
| STAFF CASE | `/office/workspaces/ifta/:clientId/:quarterKey` | same canonical case | CLIENT HEALTH (risk chip from the record); deltas against the prior quarter's record; seven tabs (NOTES secondary); EXPORT REPORT downloads the case CSV (miles and fuel by jurisdiction); NOTES keeps the client ⇄ AIO mirror, open client filing room, case record, 09 RUN FAQS and the audit trail; staff CTA unbound as in the baseline |

Data is unchanged. The view model only projects existing derivations: no tax engine, no new business action.

## 3 · Known deviations (not hidden)

- **Live data differs from the drawn sample.** The record has 3 trucks and 6 states, the tax is PENDING until the staff return summary (D-TAX-FIGURES), and the state is NEEDS YOU or AWAITING CLIENT. Card contents therefore differ in values and row counts; geometry, styling and hierarchy match.
- **Display face.** INTER TIGHT is used (D-TYPOGRAPHY; MONUMENT EXTENDED is unlicensed). The authority's display lettering is narrower, so Q3 2026 and some labels render about 15–30% wider at the same cap height.
- **Avatars.** The avatars are initials, because no person photos exist.
- **Staff hero line.** The staff hero shows CLIENT: <contact> and the IFTA account, as drawn. The company name is on hover and in the avatar menu.
- **Phone legibility floor.** Drawn phone type below about 6.5–7.5 px is raised to that floor.
- **Staff queue.** The queue has no authority of its own; it is derived from the case screens.
- **Inpainted plates.** Plates are reconstructed where the baked UI was. The texture behind the old headline and panels is softer than the untouched photograph.

## 4 · Functional preservation

- **Unit tests:** full AIO suite, 61 files, 406 tests pass. `src/ifta` passes, including `iftaViewModel.test.ts`, which checks that every plate is in the manifest with an approved source.
- **Type-check and build:** `tsc --noEmit` is clean, and `npm run build` passes.
- **Live interaction pass:** 43/43 checks with 0 page errors, covering:
  - shell search, notifications and avatar menu (workspace, client switching, Messages, My Office)
  - tabs, quarter tasks and quick actions → tab; the CTA rail; the quarter selector
  - every queue case, the filter tabs and OPEN NEXT CASE
  - EXPORT REPORT, NOTES, mirror, case identity, 09 RUN FAQS and the audit trail
  - legacy redirects
  - no staff-only content and no preview harness on the client page
  - public nav, RESOURCES and search FAQs, GET STARTED, the phone menu
  - no horizontal scroll at 393 / 834 / 1440

## 5 · Captures and boards

- `boards/IFTA_AUTHORITY_VS_LIVE_{PUBLIC,CLIENT,STAFF_CASE,STAFF_QUEUE}.jpg`: the approved screen beside the live page at the same width, for desktop, tablet and phone.
- `boards/IFTA_BEFORE_AFTER_*.jpg`: reference | functional baseline | live page.
- `captures/after/*`: live pages at 393, 834 and 1440. `captures/before/*`: the functional baseline.

**Reproduce:** run `AIO_CLOUD_MOBILE_PREVIEW=1 npm run dev`, then `node scripts/ifta-capture-screenshots.mjs`.
