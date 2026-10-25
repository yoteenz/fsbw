# 01 — Experience Authority Correction

## 1. The rule (founder-established, recorded in this sprint's brief, 2026-10-25)

> FRONTAL SLAYER has three distinct experience authorities: **Customer Mobile**, **Customer Desktop/Tablet**, and **Administration**. Mobile and desktop/tablet are **not** responsive layouts of one design. Mobile is not the master layout, and desktop/tablet is not a scaled-up mobile. They share **business records and server logic**, not UI. Administration is a separate operational interface.
> **Shared business logic does not require shared UI.**

This brief is the founder authority for the rule. Repository history supports it but never states it this explicitly (evidence E §7; T §3):

| Date | Source | Statement (short) |
|---|---|---|
| 2026-03-26 | `motherboard/CORE.md:39, 43` | "MOBILE-ONLY RIGHT NOW … Desktop layout/version will be created later as a separate phase" (now stale) |
| 2026-06-21 | MEMORY L30428 | The founder restructured desktop into a "virtual skyscraper", one floor per page |
| 2026-06-22 | MEMORY L30822 | "iPad should not get phone artboard … restore native desktop on iPad" |
| 2026-06-22 | MEMORY L31011 | "Artboard now phones only (≤767px) … tablets (768px+) use native desktop layout like monitors" |
| 2026-06-22 | MEMORY L30798 | Hide the floating PSA on desktop/tablet; "mobile site FAB unchanged" |
| 2026-06-23 | MEMORY L31712, L32042 | Desktop/tablet sign-in → Reception; the tablet account icon → `/desktop/account` (Penthouse Suite) |
| 2026-06-23 | MEMORY L31814, L31840 | Curator's Tablet "not a standard ecommerce cart page"; "no white checkout page" |
| 2026-06-23 | MEMORY L31924 | "all mobile/desktop pages under the same account should be synced" (shared backend, separate pages) |
| 2026-06-24 | MEMORY L32242 | Mobile Mansion `/mobile/*`: a foundation-only shell |

## 2. What was wrong in the prior architecture package (retained, superseded)

The prior documents stay unchanged in `FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL/` for traceability. These parts are **superseded** by this correction:

| Prior location | Prior statement | Why it is wrong | Replacement |
|---|---|---|---|
| `01_CUSTOMER_FINAL_PAGE_TREE.md:111, 125` | "Phone is the authority. Tablet and desktop use a centred column (max 720px…)" | Imposes a responsive scale-up of mobile on widths that the founder routed to the desktop tower | Doc 02 (mobile) and doc 03 (desktop/tablet) |
| `01_…:76` | `/desktop/account` listed as "ADJACENT … desktop phase" | It is the **account root for tablet and desktop today** (`AccountHubRedirect.tsx:8-15`) | Doc 03 §2 |
| `12_VISUAL_PRESERVATION_AND_RESPONSIVE_PLAN.md:24, 39-48` | `AccountShell` with 720/960 columns | A universal responsive customer shell. **Withdrawn**: no shared responsive customer shell is proposed | Each experience keeps its own shell |
| Decision **B5** options | "Pause redirect … centred 720px" | Contradicts the established routing (MEMORY 2026-06-23) | B5 → Category 3 (established); doc 06 |
| Decision **G1** | Account desktop column widths | Moot: ≥768px is the Penthouse Suite, not a widened mobile page | G1 → Category 3 (superseded); the residual question moves to XD-1 |
| Counts "10 families / 21 routed pages" | Presented as the customer architecture | They describe the **mobile** account tree only | Doc 05 parity matrix; counts restated below |
| `14_DEPENDENCY_GRAPH` "shared components" (`AccountShell`, `StatusTimeline` for both) | Assumes shared UI components across experiences | Shared **data contracts** are fine. Shared **visual components** across mobile and desktop are not assumed | Superseded: shared data contracts only (doc 05) |

Still valid from the prior package: the backend architecture (docs 06–10), the risk register (reconciled in doc 08), the workflow matrix (business workflows are experience-neutral), the admin tree (it already treated admin separately) and the decision IDs.

## 3. Experience model (current code, not a proposal)

| Experience | Who sees it today | Entry | Shell | Design authority |
|---|---|---|---|---|
| **Customer Mobile** | ≤767px everywhere; 768–1023px on `/` (landing) and on `/account/*` child pages | `/` → `/lobby` | Per-page marble card + menu-toggle (SHOP/TOOLS/BRAND); PSA FAB | `CORE.md` design section, `src/layouts/PAGE_LAYOUT.md`, `docs/frontal-slayer/design-dna-canon/` |
| **Customer Desktop/Tablet** | ≥1024px landing; ≥768px account hub and sign-in default | `/` → `/desktop/penthouse?room=showroom`; sign-in → `/desktop/concierge?zone=reception`; `/account` → `/desktop/account` | "Frontal Slayer Tower": fixed NavBar (68px), elevator and floors, rooms and zones, perspective panels | `docs/DESKTOP_TOWER_ROOM_ART_DIRECTION.md`, `CORE.md:148-149`, MEMORY 2026-06-21 → 06-24 |
| **Administration** | Admins at any width | `/admin` → `/admin/dashboard` | `max-w-md` (448px) column at every width; AdminHeader | `docs/frontal-slayer/ADMIN_ALIGNMENT_PROTOCOL.md` (founder mandate 2026-07-06) |
| Mobile Mansion `/mobile/*` | Nobody (unlinked) | — | `MobileMansionLayout` + bottom nav | MEMORY 2026-06-24 ("foundation only") |

## 4. Conflicts recorded for the founder (not resolved here)

| ID | Conflict | Evidence | Where decided |
|---|---|---|---|
| EC-1 | **Tablet split:** 768–1023px lands on the mobile `/lobby` (threshold 1024) but is routed to the desktop account hub and Reception (threshold 768); commerce backgrounds switch at 1024 | `HomeLandingRedirect.tsx:8` vs `signInReturnTo.ts:21`, `desktopCommerceRoutes.ts:18`, `CommercePageBackground.tsx:9` | **XD-2** (founder) |
| EC-2 | **Desktop live in production?** MEMORY 2026-06-21 says desktop is "not live yet"; the code has no production host gate | `desktopPreview.ts:19-29`; `HomeLandingRedirect.tsx` | **XD-3** (blocked by evidence: production host) |
| EC-3 | **Desktop/tablet hands off to mobile pages** for orders, rewards, settings, wishlist, referrals, affiliate, collectibles, load-card and booking (12 Penthouse panels deep-link to `/account/*`) | `penthouseSuiteDashboardData.ts:337-386` | **XD-1** (founder) |
| EC-4 | Desktop Alerts room shows **hardcoded** content; mobile alerts read `/api/notifications` | `DesktopNotificationsProductionLayer.tsx:14-40` | Engineering default: wire the desktop room to the same API (data parity, no visual change) |
| EC-5 | Penthouse Suite re-derives tier and points locally; possible divergence from `/account` | `penthouseSuiteDashboardData.ts:32-60, 320-330` | Engineering default: both read the same server fields |
| EC-6 | `CORE.md:39-43` "MOBILE-ONLY" and `founder-intelligence/DESIGN_LANGUAGE.md:33` are stale against the shipped desktop tower | evidence E §6.3 | Documentation correction after the founder confirms this charter (no code impact) |
| EC-7 | CORE.md default route (premium → `/lobby`, others → `/home/shop`) vs the width-only code | `HomeLandingRedirect.tsx:16-27`; MEMORY 2026-06-10 | Recorded; part of XD-2 |
| EC-8 | Mobile Mansion convention ("keep all mobile pages on `MobileMansionLayout`") vs the live mobile pages, which do not use it | MEMORY 2026-06-24 | B6 (established: foundation only, unlinked) |
| EC-9 | Orphan desktop components (`ZonePortals`, `ZoneLoungeReveal` …, 0 importers); `ZoneLoungeReveal` links a non-existent `/account/membership` | evidence E §3.6 | Engineering hygiene; no removal without approval (they may be creative reference) |

## 5. Rules every later sprint follows

1. **No new universal responsive customer shell.** Mobile pages keep `PAGE_LAYOUT.md`. Desktop/tablet keeps the Tower system. Admin keeps its own shell.
2. **Parity means business consistency**: same records, same rules, same states. Presentation can differ (doc 05).
3. **Desktop/tablet layouts are never derived from mobile screenshots**, and mobile compositions are never scaled up.
4. **Shared code is allowed below the UI:** API clients, data hooks, validation, formatting, status vocabularies. Shared visual components across experiences need explicit approval.
5. **Established immersive features are not renamed, relocated or simplified** without evidence and approval: floors, rooms, zones, elevator, perspective panels, Curator's Tablet, Acquisition, Transformation Suite.
6. **Every workflow is verified in each experience that presents it.** A capability shipped on mobile is not "done" for desktop/tablet unless the desktop/tablet path, even a hand-off, is verified.

## 6. Restated counts

| Measure | Value | Note |
|---|---|---|
| Mobile account tree | 10 families, 21 routed URLs (unchanged audit finding) | Mobile only |
| Desktop/tablet customer surfaces | 4 floors with 12 rooms/zones (3 marked comingSoon), plus 5 off-tower rooms (8 routes) | Doc 03; the account root is the Penthouse Suite |
| Shared business capabilities | 25 | Doc 05 |
| How desktop/tablet presents those 25 | 10 OWN · 2 STATIC (own visual, placeholder data) · 2 COMING SOON · 9 HANDOFF (to mobile pages) · 2 NONE | Doc 05; HANDOFF and NONE belong to XD-1 |
| How mobile presents those 25 | 23 OWN; hair analysis and order detail are entry points or sections, not pages | Doc 05 |
| Admin | 15 families, 24 routed pages (unchanged) | One operational interface |
