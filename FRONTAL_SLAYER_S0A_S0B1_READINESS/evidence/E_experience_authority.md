# E — Experience Authority Evidence (FRONTAL SLAYER, repo /home/user/fsbw @ df982a37)

Read-only research. All paths relative to `/home/user/fsbw`. "INFERRED" marks conclusions not directly stated in code/docs.

---

## 1. Detection & routing logic

There is **no single device-detection hook** for the customer storefront. Device choice is made by **four independent `window.innerWidth` checks with two different thresholds (768 and 1024)**, plus explicit `/desktop/*` path prefixes. No user-agent routing exists (UA is only used for deleted-account labels: `src/utils/platformDetection.ts:2-24`). The design-system `useBreakpoint` hook (`src/design-system/hooks/useBreakpoint.ts:5-25`) is not used by any routing component (INFERRED from grep: no consumer in routing files).

### 1.1 The decision points

| # | Where | Rule | Effect |
|---|---|---|---|
| D1 | `src/components/HomeLandingRedirect.tsx:8-31` | `innerWidth >= 1024` → `DESKTOP_ENTRY` (`/desktop/penthouse?room=showroom`, built at :9); else `/lobby` (:10) | `/` and index (`src/App.tsx:1204-1205`). **Tablet 768–1023 lands on the mobile `/lobby`.** |
| D2 | `src/utils/signInReturnTo.ts:18-22` `isDesktopTabletClientSignInViewport()` | artboard active OR `innerWidth >= DESKTOP_ROOM_TITLE_TABLET_MIN_WIDTH` (=768, `src/utils/desktopRoomTitlePlacementDebug.ts:8`) | Post-sign-in default → `/desktop/concierge?zone=reception` (`signInReturnTo.ts:12, 88-92`); phones → `/account` (:92). |
| D3 | `src/utils/desktopCommerceRoutes.ts:14-27` `shouldUseDesktopAccountHub()` | path is `/desktop/*` OR D2 true (≥768) | `resolveAccountHubPath` → `/desktop/account` vs `/account`; `resolveShoppingBagPath` → `/desktop/shopping-bag` vs `/bag`. |
| D4 | `src/components/AccountHubRedirect.tsx:8-15` | on exactly `/account` and D3 true | `<Navigate to="/desktop/account">` (wrapped at `src/App.tsx:3442-3450`). Comment: "Tablet / desktop clients land on Penthouse Suite instead of mobile `/account`." **Only `/account` itself redirects; `/account/*` children do not.** |
| D5 | `src/utils/desktopPreview.ts:49-86` `isMobileDesktopBypassActive()` | on `/desktop/*` and (`innerWidth <= 767` OR staging `?mobileDesktop=1`) | Phone viewing a `/desktop/*` URL gets a width-fit scaled 1920×1080 artboard (`src/components/desktop-preview/DesktopRouteShell.tsx:10-25`, `measureDesktopPreviewScaleBox` `desktopPreview.ts:204-214`). Comment `:50`: "phones only; tablets use native layout like desktop." |
| D6 | `src/utils/desktopPreview.ts:88-91` `shouldShowDesktopViewportGate()` | false on `/desktop/*`; else layout width <1024 | **No consumers** (only defined; grep). Legacy "designed for desktop" gate removed. |
| D7 | `src/components/commerce/CommercePageBackground.tsx:9-25` | CSS ≥1024 | `/sign-in` and `/checkout*` show marble (<1024) or desktop NO-TEXT hero (≥1024); `src/pages/sign-in/page.tsx:461-462`, `src/pages/checkout/page.tsx:3262, 3277-3278`. |
| D8 | `src/components/desktop-lobby/NavBar.tsx:37, 186` | uses D3 | Desktop nav bag icon → `/desktop/shopping-bag`. |
| D9 | `src/pages/shopping-bag/page.tsx:1236`, `src/pages/checkout/page.tsx:3305` | uses D3 | Mobile-page account icon → `/desktop/account` on ≥768. |
| D10 | `src/pages/lobby/page.tsx:99, 111` | none | Mobile lobby session-restore always `navigate('/account')` → then D4 may bounce tablet to `/desktop/account`. |

Not width-routed: `/bag` (no redirect to `/desktop/shopping-bag`), `/wishlist*`, `/account/*` children, `/checkout*`, `/booking/*`, `/mobile/*` (no device gate at all, `src/routes/MobileMansionRoutes.tsx:28-122`).

### 1.2 Which experience wins at which width (customer)

| Width | `/` | after sign-in (no returnTo) | `/account` | `/account/*` children | `/desktop/*` URL | `/mobile/*` URL |
|---|---|---|---|---|---|---|
| ≤767 phone | `/lobby` (mobile) | `/account` | mobile `AccountPage` | mobile pages | scaled 1920 artboard | Mobile Mansion placeholders |
| 768–1023 tablet | **`/lobby` (mobile)** | **`/desktop/concierge?zone=reception`** | **→ `/desktop/account`** | mobile pages (unscaled) | native desktop layout | placeholders |
| ≥1024 desktop | `/desktop/penthouse?room=showroom` | Reception | → `/desktop/account` | mobile pages; `/sign-in`, `/checkout` swap to desktop hero bg | native desktop | placeholders |

**Tablet is split**: mobile landing (D1 @1024) but desktop account hub + Reception (D2/D3 @768); commerce backgrounds use mobile marble until 1024 (D7). INFERRED: no single "tablet authority" exists in code.

### 1.3 Route shells
- Desktop: all `/desktop/*` routes nest under `DesktopRoutesLayout` (`src/App.tsx:738-757, 1211-1295`) which adds `DesktopRouteShell` + debug editor providers. `DesktopTowerNavProvider` wraps the whole app (`src/App.tsx:1193`; elevator `travelTo` vs `quickTravelTo` at `src/components/desktop-tower/DesktopTowerNavProvider.tsx:65-67, 291, 315`).
- Mobile Mansion: `{MobileMansionRoutes()}` at `src/App.tsx:1297`.
- `/desktop-preview/*` → `DesktopPreviewPage` (`src/App.tsx:1206-1210`), staging-only (`desktopPreview.ts:19-29`).
- Shell V2 only for `/v2*` (`src/shell-v2/shellV2Matrix.ts:100-102`) — not relevant to FS customer.

---

## 2. Mobile inventory (Experience A)

Two distinct "mobile" things exist in code; only one is live.

### 2.1 LIVE mobile storefront (the real phone experience)
- **Entry:** `/` → `/lobby` (D1). `/lobby`, `/lobby/lounge` (`src/App.tsx:1298-1300`) = `src/pages/lobby/page.tsx` (595 lines): lobby↔lounge carousel, Seedance transition video, display-case popovers, neon nav to `/home/shop`, `/home/tools` (CORE.md "Lobby (home) nav").
- **Shop/tools:** `/home/shop`, `/home/tools` (`App.tsx:3354, 3364`), `/shop/*`, `/units/*`, `/build-a-wig/*` (`App.tsx:3111-3287`), `/tools/*`, `/booking/*` (`App.tsx:3314-3338`), `/slay-cam`.
- **Account:** `/account` + children (§3). Page family = single-column marble pages per `src/layouts/PAGE_LAYOUT.md` (nav bar + one bordered `bg-white/60` card + actions below card). `/account` uses `ACCOUNT_MAIN_COLUMN_MIN_HEIGHT` / `MENU_TOGGLE_PANEL_HEIGHT` (`src/pages/account/page.tsx:36`), `maxWidth: 'none'` (:1599, 1717, 1729).
- **Navigation shell:** per-page top nav (back / breadcrumb e.g. `ACCOUNT > CONCIERGE` / cart icon / hamburger) + **menu-toggle card with SHOP / TOOLS / BRAND tabs** (`src/pages/account/page.tsx:53-62, 1740-1766`; `ShopMobileMenuShopTab`, `ShopMobileMenuToolsTab` imports :33-34). CORE.md:31 "Layout: Mobile-first; shared nav with back/menu, breadcrumb-style text…". No bottom nav on the live mobile site.
- **Design authority:** `motherboard/CORE.md` (design section lines ~20-35, ACTIVE BUILD TARGET :37-43), `src/layouts/PAGE_LAYOUT.md`, `docs/frontal-slayer/design-dna-canon/`, `src/studio-os-core/design-dna-canon/bootstrap.ts` (canon page reviews, e.g. `/account/concierge` :265-268), `founder-intelligence/DESIGN_LANGUAGE.md:31-35`.
- **Assets:** marble `/assets/marble-half.png` (CORE.md), Supabase `live-preview/LP Images/…`, `live-preview/Final LP` (e.g. `src/constants/lobbyCaseAssets.ts:11,45`, `src/constants/lobbyLoungeTransitionVideo.ts:9`), `public/assets/final-lobby*.png`, `lobby-lounge-transition*.mp4`.
- **Interaction systems:** lobby/lounge carousel + Seedance transition (`src/pages/lobby/page.tsx:375-460`), Tutorial OS "Mansion Tour" (account entry `TutorialOsAccountEntry`, `src/pages/account/page.tsx:41`; MEMORY 2026-07-04 line 35730), PSA FAB widget.
- **QA:** Playwright projects run **iPhone 13 only** (`playwright.config.ts:33`); no `/desktop/` e2e (grep of `e2e/` empty).

### 2.2 Mobile Mansion prototype (`/mobile/*`) — NOT live
- Routes `/mobile`, `/mobile/{home,lobby,concierge,penthouse,showroom,analysis,build-a-wig,rewards,slay-cam,lounge,profile}` (`src/routes/MobileMansionRoutes.tsx:31-118`). Header comment :21-23: "Foundation only — no business logic, no Supabase, no ecommerce."
- Shell: `MobileMansionLayout` (`src/components/mobile-mansion/layout/MobileMansionLayout.tsx:32-60`) + `MobileBottomNav` 5 tabs Home/Lobby/Concierge/Penthouse/Profile (`src/components/mobile-mansion/navigation/MobileBottomNav.tsx:19-61`), glass components, `framer-motion` animations (`animations.ts`).
- Content: every page is `PlaceholderSlot`s (e.g. `src/pages/mobile/profile/page.tsx:24-36`, `rewards/page.tsx:20-28`, `penthouse/page.tsx:27-56`). All backgrounds `/assets/new-background.jpg` (`src/constants/mobileMansionTokens.ts:80-92`). No route guard.
- Reachability: **no customer-facing link** into `/mobile/*` from outside the prototype; only `src/workspaces/frontal-slayer/vision-engine/tourScript.ts:427,445,462,479` (presenter tour) and `src/studio-os-core/design-dna-canon/bootstrap.ts:247` (canon review "needs-refinement").
- Mirrors the desktop tower vocabulary (Lobby / Concierge / Penthouse / Showroom / Analysis / Rewards Gallery / Lounge) — INFERRED: intended as the future mobile counterpart of the desktop tower, not of the current `/account`.

---

## 3. Desktop / Tablet inventory (Experience B)

### 3.1 Spatial model ("Frontal Slayer Tower")
- Floors registry `src/constants/desktopFloors.ts:27-72`: L4 PENTHOUSE `/desktop/penthouse` (rooms via `?room=`), L3 LOBBY `/desktop/lobby`, L2 GALLERY `/desktop/gallery`, L1 CONCIERGE `/desktop/concierge` (zones via `?zone=`).
  - Penthouse rooms: `analysis-lab`, `showroom` (default), `boutique` (`src/constants/desktopPenthouseRooms.ts:17-35`).
  - Lobby zones: `build-a-wig-atelier`, `grand-lobby` (default), `members-lounge` (comingSoon).
  - Gallery zones: `slay-cam-gallery` (comingSoon), `lounge` "Cinema Suite" (default), `rewards-gallery` (comingSoon).
  - Concierge zones: `founder-suite`, `reception` (default), `psa-suite`.
- Off-tower "rooms" (no floor): `/desktop/account` (Penthouse Suite), `/desktop/shopping-bag` (Curator's Tablet), `/desktop/acquisition[/bookings|/gift-card|/slay-tickets]`, `/desktop/booking-suite` (Transformation Suite), `/desktop/alerts` (+ `/desktop/notifications` redirect) — `src/App.tsx:1242-1293`.
- Legacy redirects: `/desktop/lounge`, `/desktop/slay-cam` → gallery default (`src/pages/desktop/lounge/page.tsx`, `slay-cam/page.tsx`). `src/pages/desktop-lobby/page.tsx:6-13` ("Legacy path") is **not routed** in `App.tsx` (no `/desktop-lobby` route; orphan).

### 3.2 Navigation language (own, not mobile's)
- Top `NavBar` fixed 68px (`src/components/desktop-lobby/NavBar.tsx:69-75`): logo+HOME → `resolveDesktopHomeHref` = `/desktop/account` if signed in else Grand Lobby (`src/constants/desktopNavQuickRoutes.ts:53-57`); quick-routes HOME/SHOP/BUILD-A-WIG/SHOWROOM/MEMBERSHIP/ANALYSIS/SLAY CAM/REWARDS/PSA (`desktopNavQuickRoutes.ts:18-28`); icons: search → boutique, bell → `/desktop/alerts`, calendar → `/desktop/booking-suite`, bag → `/desktop/shopping-bag` (`NavBar.tsx:131-217`). **No account icon** (removed, MEMORY 2026-06-23 line 32143).
- Elevator (floor directory, MP4 travel video forward/reverse, `public/assets/desktop-tower-elevator-reverse.mp4`) vs navbar "express transport" (`NavBar.tsx:28-32`; `DesktopTowerNavProvider.tsx:65-67`).
- `DesktopFloatingNav` (elevator/station triggers) on penthouse and floor zones (`src/pages/desktop/penthouse/page.tsx:60`, `_shared/DesktopFloorZonePage.tsx:169`).
- Page reveal / travel fade (`useDesktopTowerPageReveal`, `penthouse/page.tsx:75-77,122-124`).

### 3.3 Layout & interaction systems
- Room pages: fixed-height (`100vh` or 1080 artboard), `paddingTop: 68px`, `overflow:hidden`, full-bleed hero scene (`DesktopZoneRoomScene` crossfade; `_shared/DesktopFloorZonePage.tsx:125-158`; `desktop/account/page.tsx:42-72`).
- **Perspective panels**: 4-corner quads, `<PerspectivePanel id>`; ids reception-left/center/right, curator-tablet, shopping-bag-*, checkout-tablet, acquisition-*, signin-tablet, tv-lounge-screen, psa-hologram-screen, extensions-boutique-wall (`src/constants/perspectivePanelConfig.ts:53-137`); founder cloud sync via `/api/admin/perspective-panel-config` (`src/utils/api.ts:462-477`). CORE.md:148-149 (cover-locked overlays, 1915×821 heroes).
- Zone overlays: `ReceptionDashboard` (reception), `GrandLobbyPanels` (grand-lobby), `PsaAssistantWidget variant="suite"` hologram (psa-suite), `RewardsRoomCertificationWall` (rewards-gallery), Lounge "Slay Cinema" mode (`_shared/DesktopFloorZonePage.tsx:161-213`). Penthouse `ExtensionsBoutiqueExperience` (`penthouse/page.tsx:62-65`).
- Debug tooling: Mansion Debug (`MansionDebugLayer`), room-title placement, lounge TV frame, PSA frame editors (`src/App.tsx:738-757`), registry `src/constants/desktopDebugRegistry.ts:675-683`.
- Design authority: `docs/DESKTOP_TOWER_ROOM_ART_DIRECTION.md` ("Living spec… every floor/zone hero", §1 wiring table, §2 shared DNA), CORE.md:148-149, `brand-bible/experience/frontal-slayer-experience-bible.md:489` ("Desktop Mansion (future) | Full property | Spatial hospitality; same canon"), MEMORY entries 2026-06-21 → 2026-06-24 (lines 30287-32360).
- Assets: Supabase `live-preview/Desktop/NO TEXT BG/*.png` (14 refs across `src/constants/desktop*.ts`), e.g. Penthouse Suite `97EC97C2…png` (`src/constants/desktopPenthouseSuite.ts:4-5`), shopping bag `527324F7…` (`desktopShoppingBag.ts:10-11`), alerts `CD7F20DB…` (`desktopNotifications.ts:7-8`), booking `C8F3EB03…` (`transformationSuite.ts:7-8`); `public/assets/desktop-tower-elevator-reverse.mp4`, `CS desktop-background.webp`.

### 3.4 Tablet
- 768–1023: native (unscaled) desktop layout on `/desktop/*` (`desktopPreview.ts:50, 62-66`; `DesktopRouteShell.tsx:14-17`), account hub + Reception routing (D2-D4), but `/` → mobile `/lobby` (D1) and commerce bg marble (D7). MEMORY 2026-06-23 (line 31300): "Tablets (768px+) and desktops share the same native full-bleed elevator code — only phones ≤767px use the scaled artboard path."

### 3.5 Functionality status per desktop surface
| Route | Real data? | Notes |
|---|---|---|
| `/desktop/account` Penthouse Suite | localStorage (`getCurrentUser()` + `userOrders_*`, `wishlistItems`, `referralEarnings`) via `src/utils/penthouseSuiteDashboardData.ts:32-35,104,195,210,223,305`; populated by shared `syncAllFromApi` | 12 panels **link into mobile `/account/*` pages** (`penthouseSuiteDashboardData.ts:337-386`). Re-implements tier/points math locally (`:51, :320-330`). |
| `/desktop/concierge?zone=reception` | Static content builder `src/utils/receptionDashboardData.ts:50-172` | Links only to tower zones (many comingSoon). |
| `/desktop/alerts` | **Hardcoded** RECENT/priority arrays (`src/components/desktop-notifications/DesktopNotificationsProductionLayer.tsx:14-40`) | "View All" → `/account/notifications` (mobile; redirects to `/account/alerts`) (:111, :136). Does not call `/api/notifications`. |
| `/desktop/booking-suite` | Static layout | Book CTAs → mobile `/booking/consultation`, `/booking/appointment` (`TransformationSuiteProductionLayer.tsx:69,86`). |
| `/desktop/shopping-bag` | Shared cart localStorage + cloud push (`useDesktopShoppingBagCart`) | ACQUIRE → `/desktop/acquisition*` (`src/utils/desktopCheckoutNavigatePath.ts:6-19`). |
| `/desktop/acquisition*` | **Embeds the shared `CheckoutPage`** inside tablet chrome (`src/pages/desktop/acquisition/page.tsx:4, 20-36`); checkout branches on `isDesktopCuratorCheckout` (`src/pages/checkout/page.tsx:278-302, 1076-1081, 2916-2925, 3274-3278`) | Same Stripe/quote APIs as mobile. |
| Rewards gallery cert wall | `/api/collectibles` via `useUserCollectibles` (`src/components/desktop-rewards/RewardsRoomCertificationWall.tsx:8,21`; `useUserCollectibles.ts:43`) | Links → mobile `/account/collectibles` (:79, :130). Zone flagged comingSoon in floors. |
| Penthouse boutique | `ExtensionsBoutiqueShopPanel` (BCF selection) | rewards link → `/account/rewards` (`ExtensionsBoutiqueShopPanel.tsx:214`). |

### 3.6 Orphan desktop components (legacy)
`src/components/desktop-lobby/{ZonePortals,ZoneLoungeReveal,LobbyFeaturesSidebar,BuildAWigPanel,PSAConciergePanel,WigPedestalDisplay,DesktopRoomNavPanel,DesktopFloorElevator}.tsx` have **0 importers** (grep). `ZonePortals.tsx:8` links `/account`; `ZoneLoungeReveal.tsx:390-395` links `/account/membership` — **no such route** in App.tsx (would hit `UnmatchedRouteFallback`, `App.tsx:1026-1050`).

---

## 4. Admin inventory (Experience C) — brief

- **Shell/guard:** `/admin` → `PlatformErrorBoundary` + `AdminGuard` (`src/App.tsx:1302-1310`); `AdminGuard` signed-out → `/sign-in?returnTo`, non-admin → `/account` (`src/components/AdminGuard.tsx:6-22`) — non-admin on ≥768 then bounces to `/desktop/account` via D4. Index → `/admin/dashboard` (`App.tsx:1311`).
- **FS operations routes:** dashboard, brand, clients/{overview,deleted,account→redirect}, meetings[/schedule], pending, messages, alerts, revenue/{accounting-report,fulfilled-orders,fraud-analysis,edit-inventory,view-waitlist}, reviews, referrals, marketing[/offers], workers, backend (`App.tsx:1311-1422`). Studio OS (`/admin/studio*`, `/admin/studio-os*`, `App.tsx:1423-2900+`) is a separate internal product.
- **Responsive behavior:** FS admin pages are a single **`max-w-md` (448px) column at every width**; one `max-w-md` per page in dashboard, clients, revenue, reviews, referrals, marketing, pending, brand, workers, backend, and **zero** `innerWidth`/`@media`/desktop references in those page files (grep), e.g. `src/pages/admin/dashboard/page.tsx:1279`. No separate desktop/mobile admin routes.
- **Rules:** `docs/frontal-slayer/ADMIN_ALIGNMENT_PROTOCOL.md` + CORE.md "Frontal Slayer Admin Alignment Protocol (2026-07-06 — mandatory)" (admin pages protected/finalized unless founder names them). Neither mentions device split (grep of protocol for desktop/tablet/mobile/responsive: no hits).
- Admin-only backend touching desktop: `/api/admin/perspective-panel-config` (panel quad sync), `/api/admin/page-debug-config`, `/api/admin/lounge-tv-config`, `/api/admin/psa-chat-config` (`src/utils/api.ts:422-611`).

---

## 5. Shared backend touchpoints per account capability

All three experiences call the same `/api/*` (Vercel `api/`) through `apiFetch` (`src/utils/api.ts:207`); desktop surfaces mostly read the **same localStorage snapshot** hydrated by `syncAllFromApi` (`src/utils/syncFromApi.ts:58-260`: `/api/profile`, `/api/orders`, `/api/cart`, `/api/wishlist`), triggered globally in `App.tsx` (~1150-1175) and by `AccountCommerceSync`.

| Capability | Mobile surface | Desktop/Tablet surface | Admin surface | API / table |
|---|---|---|---|---|
| Account overview / tier / points | `/account` (`pages/account/page.tsx`) | `/desktop/account` hero + Loyalty panel (local calc) | `/admin/clients/overview` | `GET/PATCH /api/profile` (`api.ts:242-283`) → `profiles` |
| Profile photo | `/account`, `/account/settings` | none (no desktop editor) | clients | `POST /api/profile-image` (`api.ts:410-416`) → Storage `profile-images` |
| Orders | `/account/orders` (`pages/orders/page.tsx`), `/account/orders/:id/review` | Penthouse "My Orders" panel → `/account/orders` (mobile page) | `/admin/revenue/*`, client details | `GET/PUT /api/orders` (`api.ts:669-690`); admin `/api/admin/orders` |
| Rewards / membership | `/account/rewards` (= `account/membership/page.tsx`, `rewards/page.tsx:1-5`) | Penthouse hero/Loyalty/Vouchers → `/account/rewards`; nav REWARDS → `gallery?zone=rewards-gallery` (comingSoon) | `/admin/referrals`, `/api/admin/rewards-notify` | `/api/stripe/create-checkout-session`, `/api/stripe/membership-available` (`api.ts:285-320`), `/api/stripe/webhook` |
| Slay tickets | `/account` popups, `/tools/slay-tickets` | Penthouse Slay Tickets → `/tools/slay-tickets` | — | `/api/slay-tickets`, `/api/slay-tickets/credit-order` (`api.ts:542-568`) |
| Digital cash / load card | `/account/load-card` | Penthouse Digital Cash → `/account/load-card` | — | via profile + checkout |
| Collectibles / certifications | `/account/collectibles` | Rewards-gallery `RewardsRoomCertificationWall` + Penthouse "Rewards Collection" → `/account/collectibles` | — | `GET /api/collectibles` (`useUserCollectibles.ts:43`), `/api/education/certifications` |
| Referrals | `/account/referrals` | Penthouse panel → `/account/referrals` | `/admin/referrals` | `/api/admin/referrals`; local `referralEarnings` |
| Affiliate | `/account/affiliate` | Penthouse panel → `/account/affiliate` | — | profile/sync |
| Alerts / notifications | `/account/alerts` (`/account/notifications` redirect, `App.tsx:3486-3493`) | `/desktop/alerts` (**hardcoded content**) → "View all" `/account/notifications` | `/admin/alerts`, `/admin/notifications` | `GET /api/notifications` (`api.ts:830-836`; `pages/account/notifications/page.tsx`) |
| Concierge / PSA | `/account/concierge` | `/desktop/concierge?zone=reception|psa-suite` (hologram) | `/admin/studio/...psa`, `/api/admin/psa-review` | `/api/psa/*`, `/api/psa-chat-config` |
| Wishlist | `/wishlist`, `/wishlist/lists[/:id]`, `/wishlist/shared/:token` | **none** — Penthouse "Wishlist" panel → mobile `/wishlist` | `/api/admin/wishlist` | `GET/PUT /api/wishlist` (`api.ts:821-842`) |
| Cart / bag | `/bag` | `/desktop/shopping-bag` | `/api/admin/cart` | `GET/PUT /api/cart` (`api.ts:768-798`) |
| Checkout | `/checkout`, `/checkout/{bookings,gift-card,slay-tickets,upgrade,summary}` | `/desktop/acquisition*` embedding same `CheckoutPage` | revenue/fulfilled orders | `/api/checkout/quote`, `/api/stripe/create-product-payment-intent` (`api.ts:357-375`), webhook |
| Shipping / payment / settings / reviews | `/account/{shipping,payment,settings,reviews}` | Penthouse "Account Settings" → `/account/settings`; others **no desktop surface** | clients, reviews | `/api/profile`, `/api/delete-account` (`api.ts:631-640`) |
| Booking | `/booking/consultation`, `/booking/appointment` | `/desktop/booking-suite` → mobile booking pages | `/admin/meetings` | `/api/booking/*` |
| Activity | `/account` | Penthouse "My Activity" → `/account/alerts` | admin Activity tab | `POST /api/activity` |
| Tutorial | `/account` "Take the Mansion Tour" | none | `/admin/studio/tutorial-os` | `GET/PUT /api/tutorial/progress` |

No `/api/account/*` route exists (`ls api/account` → none); the prior package's "`/api/account/overview`" (16_FOUNDER_DECISION_BOARD_V2.md:265) is a proposal.

### 5.1 Surfaces by experience
- **Mobile only:** `/account` (on ≤767), `/account/{shipping,payment,reviews,consult-offer,orders/:id/review}`, `/wishlist*`, `/bag`, `/checkout*` page chrome, `/lobby`, `/home/*`, `/booking/*`, `/mobile/*` prototype.
- **Desktop/tablet only:** `/desktop/account` Penthouse Suite, Reception, Grand Lobby panels, PSA Suite hologram, Cinema Suite, Rewards-gallery certification wall, Curator's Tablet bag, Acquisition tablet, Transformation Suite, Alerts room, elevator.
- **Same component both:** every `/account/*` child (desktop panels deep-link to them; no desktop variants), `/wishlist`, `CheckoutPage` (embedded on desktop with `isDesktopCuratorCheckout` branching), `/sign-in` (bg swap at 1024), booking flows.

---

## 6. Conflicts (listed, not resolved)

1. **Breakpoint split 1024 vs 768.** `HomeLandingRedirect.tsx:8` (1024) vs `signInReturnTo.ts:21` / `desktopCommerceRoutes.ts:18` (768) vs `CommercePageBackground.tsx:9` (1024). Tablet lands on mobile `/lobby` but is routed to desktop account/Reception.
2. **CORE.md default route vs code.** CORE.md "App default route": "premium … → `/lobby`; standard members and guests → `/home/shop`." MEMORY **2026-06-10** (line 27219): "guests + standard → `/home/shop`; premium → `/lobby`." Code `HomeLandingRedirect.tsx:16-27`: width-based only (desktop → penthouse; else `/lobby`); no membership check.
3. **CORE.md "MOBILE-ONLY RIGHT NOW … Desktop layout/version will be created later as a separate phase" (CORE.md:39, 43)** vs extensive shipped `/desktop/*` and ≥768 redirects. Same in `founder-intelligence/DESIGN_LANGUAGE.md:33` ("Mobile-first; desktop is a later phase", Last Updated 2026-07-11), `LONG_TERM_ROADMAP.md:35` ("Mobile-only build target until desktop phase explicitly opened"), `DECISION_HISTORY.md:48-57` (D-003 mobile-first verification).
4. **"Desktop not live" vs no production gate.** MEMORY **2026-06-21** (line 30287): "staging … not production `frontalslayer.com` — desktop is not live yet." Code: `HomeLandingRedirect` sends ≥1024 to `/desktop/penthouse` on any host; only `/desktop-preview` and `?mobileDesktop=1` are host-gated (`desktopPreview.ts:19-29, 73-83`). INFERRED: desktop is reachable in production.
5. **Artboard threshold drift.** MEMORY **2026-06-21** (line 30452): bypass "auto-enables on any `/desktop/*` route when `innerWidth < 1024`." MEMORY **2026-06-22** (line 30785): "`DESKTOP_ARTBOARD_MAX_WIDTH = 1366` — … scaled shell on phones + tablets." MEMORY **2026-06-22** (line 31006): "Artboard now phones only (`≤767px`)… tablets (768px+) use native desktop layout." Code = ≤767 (`desktopPreview.ts:51, 62-66`). Later entry supersedes the earlier two.
6. **Scaling model drift.** MEMORY 2026-06-22 (line 30921) "restore height-fill zoom" vs 2026-06-22 (line 31088) "width-fit … `scale = shell.clientWidth / 1920`". Code = width-fit (`desktopPreview.ts:204-214`).
7. **Desktop account entry.** MEMORY **2026-06-23** (line 31754): "`NavBar` profile icon on `/desktop/*` → `/desktop/account`." MEMORY **2026-06-23** (line 32143): "remove account icon … HOME → Penthouse Suite (`/desktop/account`) when signed in." Code matches the later one (`NavBar.tsx` has no account button; `desktopNavQuickRoutes.ts:53-57`). MEMORY **2026-06-23** (line 32082) still says calendar icon sits "between Notifications and Account."
8. **Desktop notifications path.** MEMORY 2026-06-23 (line 32104) `/desktop/notifications`; later 2026-06-23 (line 32116) renamed `/desktop/alerts`. Code: alerts + redirect (`App.tsx:1261-1266`). Desktop alerts content is hardcoded; mobile alerts reads `/api/notifications` (data divergence).
9. **Penthouse floor history.** MEMORY 2026-06-21 (line 30426): "Flagship penthouse moved `/desktop/lobby` → `/desktop/penthouse` … `/desktop/lobby` is now Level 1 Lobby"; same day (line 30496): 4 floors, "HOME → lobby shop". Code: `/desktop/lobby` is L3 with zones `build-a-wig-atelier/grand-lobby/members-lounge` (`desktopFloors.ts:39-49`) — no `shop` zone; HOME → Grand Lobby or `/desktop/account`.
10. **Mobile Mansion prototype vs live mobile account.** MEMORY **2026-06-24** (line 32240): "premium luxury mobile application shell … foundation only"; convention: "keep all mobile pages on `MobileMansionLayout`." Live mobile pages (`/account/*`, `/lobby`, `/home/shop`) do **not** use `MobileMansionLayout`; `/mobile/*` is unlinked. Tour script (`tourScript.ts:426-437`) presents `/mobile/home` as the mobile product.
11. **Prior architecture package vs code.** `01_CUSTOMER_FINAL_PAGE_TREE.md:111` ("Phone is the authority. Tablet and desktop use a centred column (max 720px…)") and `:125` ("Tablet / desktop / ultra-wide | 720px column"); `12_VISUAL_PRESERVATION_AND_RESPONSIVE_PLAN.md:24, 39-48` (720/960 `AccountShell`); `16_FOUNDER_DECISION_BOARD_V2.md:257-266` (B5 options incl. "Pause redirect… centred 720px"), `:275-285` (B6 "Keep unlinked"). Code: ≥768 `/account` → `/desktop/account` immersive Penthouse Suite; desktop has its own nav, rooms, bag, checkout tablet. `01:76` lists `/desktop/account` as "ADJACENT … desktop phase" — but it is the account root for tablet/desktop today. `12:18, 52` explicitly carve "Desktop Mansion rooms" out of the plan while `01`/`12` still impose the 720 column on the same widths.
12. **Board B5 claim "different numbers".** `16_…:263` says Penthouse shows different numbers; code shows both read the same localStorage snapshot but Penthouse re-derives tier/points (`penthouseSuiteDashboardData.ts:32-60, 320-330`) — INFERRED possible divergence vs `/account` math; not verified at runtime.
13. **Comment vs code on collectibles page.** `src/pages/account/collectibles/page.tsx:4` labels it "Mobile Account → Collectibles" yet it is the desktop rewards-wall destination (`RewardsRoomCertificationWall.tsx:79,130`) and back button goes to `/account` (→ desktop hub on ≥768).
14. **Experience bible "future".** `brand-bible/experience/frontal-slayer-experience-bible.md:488-489`: "Mobile app | Daily host" and "Desktop Mansion (future) | Full property" — desktop already partially shipped; "Mobile app" not the current web mobile.
15. **Mobile Mansion tokens off-canon.** `17_CONFLICTS_AND_UNVERIFIED_ASSUMPTIONS.md:26` (K-18) notes Playfair Display in mobile-mansion tokens vs Futura canon.

---

## 7. Founder statements found (mobile vs desktop separation)

**No explicit founder statement in the repo says that customer mobile and customer desktop/tablet are independently designed, separate experiences (i.e., "desktop is not a responsive scale-up of mobile").** Searched MEMORY.md, CORE.md, founder-intelligence/, brand-bible/, docs/, the prior architecture package, and src/ for phrasings ("not a responsive", "separate … experience", "independently designed", "own navigation", "two presentations").

Closest in-repo statements (all recorded by agents from user requests, or agent-authored copy):
- CORE.md:43 — "Desktop layout/version will be created later as a **separate phase**." (separate *phase*, not explicitly separate *product*).
- MEMORY **2026-06-21** (line 30291): "Mobile-first project; desktop flagship in progress; need dev QA of desktop layouts on phone **without treating mobile routes as desktop**."
- MEMORY **2026-06-21** (line 30428): "user restructured the desktop experience into a **virtual skyscraper** — one floor per page, penthouse as full-screen luxury destination…"
- MEMORY **2026-06-23** (line 31712): "User asked that clients who sign in on desktop/tablet be automatically routed to Reception in the desktop tower (not default `/account`)."
- MEMORY **2026-06-23** (line 32040): user reported "account profile icon on tablet routes to mobile `/account` instead of `/desktop/account`" → tablet treated as desktop authority for account.
- MEMORY **2026-06-23** (line 31814): Curator's Tablet "**not a standard ecommerce cart page**"; (line 31840) acquisition "no new room, **no white checkout page**".
- MEMORY **2026-06-23** (line 31924): "all mobile/desktop pages under the same account should be synced" (shared backend, separate pages).
- MEMORY **2026-06-24** (line 32240): user requested "premium luxury **mobile application shell**" (Mobile Mansion).
- `brand-bible/experience/frontal-slayer-experience-bible.md:488-489` — separate rows for "Mobile app" and "Desktop Mansion (future)".
- `src/workspaces/frontal-slayer/vision-engine/tourScript.ts:432` (presenter voiceover, author not attributed — INFERRED agent-written): "Mobile is **not a responsive afterthought** — it is the same universe in your pocket… every room reimagined for intimacy"; `:437` "Parallel paths to desktop rooms."; `:470` "One engine, two presentations."

---

## 8. Unknowns

- Whether desktop `/desktop/*` is intended to be public on `frontalslayer.com` today (no host gate; MEMORY says not live as of 2026-06-21).
- Intended tablet authority: code mixes 768 and 1024; no doc defines tablet as mobile or desktop for landing/commerce.
- Whether Mobile Mansion (`/mobile/*`) is the intended future mobile product or abandoned; no later MEMORY entry after 2026-06-24 found referencing it (grep of headings).
- Whether desktop variants of `/account/*` children (orders, settings, rewards, wishlist, shipping, payment, reviews) are planned; currently desktop deep-links to mobile pages.
- Runtime numeric parity between `/account` and Penthouse Suite (not executed).
- Whether desktop Alerts / Reception / Booking Suite static content is placeholder (INFERRED yes) and what data they should read.
- Admin device rules: none documented; 448px single column everywhere is de facto.
- Git history is shallow (NavBar has a single commit `596dc269`), so code-change dates cannot be cross-checked against MEMORY dates.
