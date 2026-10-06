# AIO IFTA — three-mode live visual authority reconstruction

**Sprint:** P0.AIO.IFTA.THREE-MODE-LIVE-VISUAL-AUTHORITY-RECONSTRUCTION1
**Rule:** KEEP THE FUNCTION. REBUILD THE LOOK. The approved authority images are the design authority; the previous live screenshots are functional evidence only.

**Scope.** Only the four mounted proof surfaces were rebuilt. No further IFTA child states were added, nothing was generated, and OpenArt was not used.

## 1 · Forensic of the live implementation (base `faeb7503`, the IFTA proof as merged from PR #43)

| Surface | Route | Kept (function) | Rebuilt (look) | Removed |
|---|---|---|---|---|
| PUBLIC | `/services/ifta-filing` | layout route outside the legacy public layout; REQUEST FILING → `getStartedForService('ifta-filing')`; IFTA account assistance link; Services / Log in links; RUN FAQS answers; truthful copy | header, hero, metrics, sections, process, map, footer | text-block section stack; placeholder "AIO" square |
| CLIENT | `/portal/workspaces/ifta/:quarterKey` | `CustomerRouteGuard` + `ClientPortalLifecycleGuard`; default-quarter redirect; `resolvePortalContext`; six tabs (no NOTES); demo "switch to Pioneer Fleet"; every derivation in `iftaDerive` | shell, hero, metrics rail, tab bar, every module, CTA rail, footer | plain header + text panels; DISPATCH · N/A chip (NOT_APPLICABLE is never surfaced to the client) |
| STAFF QUEUE | `/office/workspaces/ifta` | `OfficeRouteGuard`; `sortStaffQueue` order; bucket model; client / workspace switchers; case links | queue → status lanes + case rows; metrics rail; queue health; dates; flags; next-case rail | the spreadsheet table |
| STAFF CASE | `/office/workspaces/ifta/:clientId/:quarterKey` | canonical case lookup (`findOrgQuarter`); client ⇄ staff mirror; seven tabs incl. secondary NOTES; 09 RUN FAQS; audit trail; primary staff CTA (unbound, as before); open-client-room link | hero + CLIENT HEALTH panel, metrics, workflow, tasks, dates, charts, activity split, flags, FAQ tool, audit timeline, CTA rail | raw case-ID box as the primary object (now a secondary CASE RECORD strip) |

Data is unchanged: the same demo store, the same `iftaDerive` functions and no new actions. The new `src/ifta/ui/iftaViewModel.ts` only projects existing derivations for the modules; it is read-only and computes no tax.

Bug fixed on the way: `useMemo` ran after early returns on the client page and the case page (a rules-of-hooks violation). The pages now render through child components.

## 2 · Authority manifest

| Actor / view | Reference (SITE00 `docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE/…`) | Status |
|---|---|---|
| PUBLIC tablet + desktop | `04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg` | approved |
| PUBLIC mobile | `01_TERRITORY_SELECTION/AIO_IFTA_3_ACTOR_MODES_MOBILE.jpeg` (public column) | approved |
| CLIENT mobile (parent) | `02_CLIENT_MODE/AIO_IFTA_CLIENT_MOBILE_PARENT_AUTHORITY.jpeg` | approved parent |
| CLIENT tablet + desktop | `02_CLIENT_MODE/AIO_IFTA_CLIENT_TABLET_DESKTOP.jpeg` | approved (with D-CLIENT-DESKTOP-STAFF-MODULES) |
| STAFF tablet + desktop | `03_FOUNDER_STAFF_MODE/AIO_IFTA_FOUNDER_STAFF_TABLET_DESKTOP.jpeg` | approved |
| STAFF mobile | `01_TERRITORY_SELECTION/AIO_IFTA_3_ACTOR_MODES_MOBILE.jpeg` (staff column) | approved (D-STAFF-MOBILE-SCOPE) |
| STAFF QUEUE | derived from the staff case authority | D-STAFF-QUEUE-AUTHORITY (derivation authorised) |
| BRAND | `00_BRAND/AIO_BRAND_DNA_BOARD.jpeg` · `AIO_SIMPLE_NAV_MARK.jpeg` · `AIO_FULL_LOGO_LOCKUP.jpeg` | approved |
| COMPONENTS / ICONS | `06_CONTRACTS/AIO_IFTA_ICON_ASSET_SHEET.png` · `AIO_IFTA_PAGE_COMPONENT_INTERACTION_CONTRACT.png` | approved |

Founder decisions applied: D-BRAND-TOKENS, D-TYPOGRAPHY, D-INTERACTION-09, D-NOTES-TAB, D-CLIENT-DESKTOP-STAFF-MODULES, D-TAX-FIGURES, D-PUBLIC-COPY-TRUTH, D-PUBLIC-SAMPLE-DATA, D-PROGRESS-PHASES, D-CTA-GET-STARTED and D-STAFF-QUEUE-AUTHORITY.

**Runtime assets.** The single source is `src/ifta/ui/iftaAssetManifest.ts` (also exported to `docs/aio/ifta/AIO_IFTA_LIVE_PROOF_ASSET_MANIFEST.json`). Every file is an approved asset or a crop / alpha extraction of one. `scripts/ifta/derive-ifta-brand-assets.py` reproduces each derived file byte for byte.

| Asset | Source |
|---|---|
| `public/brand/ifta/aio-mark-on-dark.png` | metallic emblem from the approved simple nav mark |
| `public/brand/ifta/aio-mark-on-light.png` | approved lockup emblem; white strokes recoloured to CHARCOAL |
| `public/brand/ifta/aio-lockup-on-dark.png` / `-on-light.png` | approved lockup, alpha-extracted (light: charcoal wordmark) |
| `public/brand/ifta/ifta-filing-room-hero.jpg` | photographic region of the approved client parent hero (no baked UI) |
| `public/brand/aio-login-hero.png` | approved AIO hero (black truck, range, gold dusk), mounted as-is |
| `public/brand/all-in-one-hero-truck.png` | approved AIO truck on the road, mounted as-is |
| `public/brand/ifta/ifta-public-range.jpg` | mountain band of the approved AIO hero |

**Type.** Inter Tight (headings) and Inter (body) are self-hosted under SIL OFL in `public/fonts/ifta/`, so there is no runtime font dependency.

**Icons.** 44 glyphs are vendored from lucide-static (ISC) into `src/ifta/ui/IftaIcon.tsx`.

**Map.** State outlines are pre-generated from us-atlas (ISC) into `src/ifta/ui/usStatePaths.ts`.

None of these adds a package dependency.

## 3 · Visual fidelity scorecard (0–10, honest)

| Criterion | PUBLIC | CLIENT | STAFF QUEUE | STAFF CASE |
|---|---|---|---|---|
| Composition | 8 | 9 | 8 | 9 |
| Hierarchy | 8 | 9 | 8 | 9 |
| Media | 8 | 8 | 7 | 8 |
| Typography | 7 | 8 | 8 | 8 |
| Materials | 8 | 8 | 8 | 8 |
| Spacing | 8 | 8 | 8 | 8 |
| Brand expression | 9 | 9 | 8 | 9 |
| Actor differentiation | 9 | 9 | 9 | 9 |
| Responsive behaviour | 8 | 8 | 9 | 8 |
| Functional clarity | 9 | 9 | 9 | 9 |

**Known deviations (not hidden):**
- **Display face.** MONUMENT EXTENDED is not used: it is unlicensed, so INTER TIGHT is used per D-TYPOGRAPHY.
- **Client hero resolution.** The client hero photograph is the 686 × 417 region of the approved parent, upscaled 2×. It is soft at 1440 because no higher-resolution source exists in the repository.
- **Avatars.** Identity uses initials discs; no client or staff photo assets exist.
- **Omitted controls.** Search, bell and EXPORT REPORT are omitted because they have no backing function. Staff get OPEN CLIENT FILING ROOM instead.
- **Map coverage.** The client and staff maps colour only the states with recorded miles, which is truthful but fewer than in the reference.
- **Mobile client layout.** Modules stack in one column on mobile rather than the parent's two-column pairs (the sprint asks for no cramped card wall).
- **Unbound actions.** The primary business actions (client CTA, NUDGE CLIENT) are still unbound, exactly as in the baseline. The client rail navigates to the tab that holds the next item. Domain actions such as `nudgeClient` exist; binding them is the next functional step.
- **Public copy.** Public copy is the truthful rewrite (D-PUBLIC-COPY-TRUTH), and the figures are a labelled SAMPLE quarter.

## 4 · Functional preservation

- **Unit tests:** `src/ifta/` 3 files · 21 tests pass, including the new `iftaViewModel.test.ts`.
- **Full AIO suite:** 61 files · 406 tests pass on the master-based tree.
- **Type-check:** `tsc --noEmit` is clean.
- **Build:** `npm run build` passes.
- **Live interaction pass:** 27/27 checks with 0 page errors, covering:
  - tabs and the CTA rail
  - mobile checklist → tab
  - every queue case and the queue → case link
  - client switcher both ways
  - canonical case ID, 09 RUN FAQS and the client ⇄ staff mirror
  - client room link and staff NOTES
  - legacy redirects
  - no staff-only content on the client page; no harness inside the product
  - public SAMPLE label and REQUEST FILING CTA

## 5 · Captures

- `boards/IFTA_BEFORE_AFTER_{PUBLIC,CLIENT,STAFF_QUEUE,STAFF_CASE}.jpg` — reference | before | after, at 1440 and 393.
- `captures/before/*` — the functional baseline.
- `captures/after/*` — the reconstruction.

Required captures: PUBLIC at 393 and 1440; CLIENT, STAFF QUEUE and STAFF CASE at 393, 834 and 1440. The preview harness is absent: master removed `AIODebugBanner` from every shell.

**Reproduce:** run `AIO_CLOUD_MOBILE_PREVIEW=1 npm run dev`, then `node scripts/ifta-capture-screenshots.mjs`.
