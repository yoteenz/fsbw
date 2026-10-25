# 02 — Customer Mobile Experience Inventory

Source: `evidence/E_experience_authority.md` §1–2 and §5 (file:line throughout). This is an inventory of what exists. **It proposes no redesign.**

## Authority summary

| Field | Mobile |
|---|---|
| **Who gets it** | Phones ≤767px everywhere. Tablets 768–1023px on `/` (landing) and on every `/account/*` child page (conflict EC-1, decision XD-2) |
| **Entry routes** | `/` → `/lobby` (`HomeLandingRedirect.tsx:8-31`); `/lobby`, `/lobby/lounge`; after sign-in on a phone → `/account` (`signInReturnTo.ts:92`) |
| **Canonical route ownership** | `/lobby*`, `/home/shop`, `/home/tools`, `/shop/*`, `/units/*`, `/build-a-wig/*`, `/tools/*`, `/booking/*`, `/slay-cam`, `/account` (≤767) and all `/account/*` children, `/wishlist*`, `/bag`, `/checkout*`, `/sign-in` |
| **Navigation shell** | Per-page top nav (back / breadcrumb e.g. `ACCOUNT > CONCIERGE` / cart / hamburger) + **menu-toggle card with SHOP / TOOLS / BRAND tabs** (`src/pages/account/page.tsx:53-62, 1740-1766`). PSA FAB (mobile only, founder 2026-06-22). No bottom nav on the live site |
| **Design authority** | `motherboard/CORE.md` design section, `src/layouts/PAGE_LAYOUT.md` (nav bar + one bordered `bg-white/60` card + actions below), `docs/frontal-slayer/design-dna-canon/` (canon page reviews), `founder-intelligence/DESIGN_LANGUAGE.md`. Brand: marble, glass, chrome, `#EB1C24`, `#808080`, Futura PT, Covered By Your Grace, Bohemy |
| **Layout components** | `MarblePageShell`, `PageActionsBelowCard`, `menuToggleHeights` (`ACCOUNT_MAIN_COLUMN_MIN_HEIGHT`, `MENU_TOGGLE_PANEL_HEIGHT`), `ConfirmationModal`, `ConciergeSectionHeader`, `ShopMobileMenuShopTab`, `ShopMobileMenuToolsTab` |
| **Primary assets** | `/assets/marble-half.png`; Supabase `live-preview/LP Images/…`, `live-preview/Final LP`; `public/assets/final-lobby*.png`; `lobby-lounge-transition*.mp4`; concierge icon set; 24 PSA avatar expressions; 30 collectible phase images (never regenerate) |
| **Interaction systems** | Lobby ↔ lounge carousel with Seedance transition video (`src/pages/lobby/page.tsx:375-460`); display-case popovers; Tutorial OS "Mansion Tour" (`TutorialOsAccountEntry`); PSA FAB widget; popups on the account hub |
| **QA** | Playwright projects run **iPhone 13 only** (`playwright.config.ts:33`) |

## Mobile account families (unchanged audit finding, now scoped to mobile)

| Family | Routes | Status | Notes |
|---|---|---|---|
| 01 OVERVIEW | `/account` | Visual complete; data partial | Only for ≤767px. Tablet/desktop redirect to the Penthouse Suite (B5, established) |
| 02 ORDERS | `/account/orders`, `/account/orders/:orderId/review` (+ proposed detail `/account/orders/:orderId`, appointments tab) | Visual complete; server order of record missing | `/orders` alias kept (PSA links) |
| 03 CONCIERGE | `/account/concierge` (premium) | Partial; **injects test orders** (R-08) | Holds Slay Challenge + Quests (B4, established) |
| 04 REWARDS | `/account/rewards`, `/account/load-card`, `/account/collectibles`, exit `/checkout/upgrade` | Display; no ledger | |
| 05 MY HAIR | proposed `/account/hair` (+ analysis detail) | Missing | Decision B2 (mobile scope) |
| 06 WISHLIST | `/wishlist`, `/wishlist/lists[/:listId]`, `/wishlist/shared/:token` | Working; share link broken | |
| 07 REVIEWS & CONTENT | `/account/reviews` | Partial | |
| 08 EARN & SHARE | `/account/affiliate`, `/account/referrals` | Partial | |
| 09 ALERTS | `/account/alerts` (+ `/account/notifications` redirect) | Partial (reads `/api/notifications`) | |
| 10 SETTINGS | `/account/settings`, `/account/shipping`, `/account/payment` | Partial (addresses wiped; raw card form) | |

**Count:** 10 families, 21 routed URLs (mobile only).

## Backend dependencies (shared with desktop/tablet and admin)

`GET/PATCH /api/profile`, `/api/profile-image`, `GET /api/orders`, `/api/cart`, `/api/wishlist`, `/api/notifications`, `/api/psa/*`, `/api/checkout/quote`, `/api/stripe/*`, `/api/booking/*`, `/api/slay-tickets/*`, `/api/collectibles`, `/api/hairstyle-analysis-*`, `/api/tutorial/progress`. Global hydration: `syncAllFromApi` (`src/utils/syncFromApi.ts:58-260`) into a localStorage snapshot that **both customer experiences read**.

## Unfinished workflows (mobile presentation)

Order of record (R-11), order detail page, Leave a review reachability (needs DELIVERED), cancellation (R-15), wallet and vouchers (R-16, voucher wipe), Slay Challenge progress, referrals and affiliate ledger, saved addresses, payment methods (R-14), Slay Cam submissions, support replies. Business-side detail: prior package doc 04 (W-01…W-35).

## Legacy or conflicting routes

| Route | Situation |
|---|---|
| `/mobile/*` (Mobile Mansion) | Foundation-only prototype; unlinked; placeholder slots; off-canon Playfair token (B6 established) |
| `/account/consult-offer` | Proposed redirect to `/account/orders?…consultOffer=1` (prior package 05 CSV) |
| `/tools/hairstyle-analysis` | Founder test harness → admin-only (E2, engineering default) |
| `/` landing for 768–1023px | Mobile `/lobby` while the account goes to desktop (EC-1 → XD-2) |
| `CORE.md` default route (premium → `/lobby`, others → `/home/shop`) | Code is width-only (EC-7) |

## Rules for future mobile work

- Keep `PAGE_LAYOUT.md` single-column marble pages. Do not import desktop Tower components into mobile pages.
- Do not adopt `MobileMansionLayout` for live pages without a founder decision (B6).
- Mobile pages remain the hand-off target for desktop/tablet capabilities **only until XD-1 is decided**.
