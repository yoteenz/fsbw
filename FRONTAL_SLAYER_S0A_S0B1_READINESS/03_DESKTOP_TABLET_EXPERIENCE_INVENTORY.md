# 03 — Customer Desktop/Tablet Experience Inventory

Source: `evidence/E_experience_authority.md` §1, §3, §5 (file:line throughout). This is an inventory. **No redesign, no relocation, no renaming** of any established immersive feature.

## Authority summary

| Field | Desktop/Tablet |
|---|---|
| **Who gets it** | ≥1024px landing; ≥768px account hub, sign-in default, Tower routes at native layout. Phones viewing a `/desktop/*` URL get a width-fit scaled 1920×1080 artboard (dev/QA aid, `desktopPreview.ts:49-86`) |
| **Entry routes** | `/` → `/desktop/penthouse?room=showroom` (≥1024); sign-in → `/desktop/concierge?zone=reception` (≥768); `/account` → `/desktop/account` (≥768, `AccountHubRedirect.tsx:8-15`); NavBar HOME → `/desktop/account` when signed in, else the Grand Lobby |
| **Canonical route ownership** | All `/desktop/*`: `/desktop/penthouse`, `/desktop/lobby`, `/desktop/gallery`, `/desktop/concierge`, `/desktop/account`, `/desktop/shopping-bag`, `/desktop/acquisition[/bookings|/gift-card|/slay-tickets]`, `/desktop/booking-suite`, `/desktop/alerts` (+ `/desktop/notifications` redirect); legacy redirects `/desktop/lounge`, `/desktop/slay-cam` |
| **Spatial model: "Frontal Slayer Tower"** | `src/constants/desktopFloors.ts:27-72`. **L4 PENTHOUSE** (rooms: `analysis-lab`, `showroom` (default), `boutique`) · **L3 LOBBY** (`build-a-wig-atelier`, `grand-lobby` (default), `members-lounge` comingSoon) · **L2 GALLERY** (`slay-cam-gallery` comingSoon, `lounge` "Cinema Suite" (default), `rewards-gallery` comingSoon) · **L1 CONCIERGE** (`founder-suite`, `reception` (default), `psa-suite`) |
| **Off-tower rooms** | Penthouse Suite (`/desktop/account`), Curator's Tablet (`/desktop/shopping-bag`), Acquisition tablet (`/desktop/acquisition*`), Transformation Suite (`/desktop/booking-suite`), Alerts room (`/desktop/alerts`) |
| **Navigation language** | Fixed 68px `NavBar` (`desktop-lobby/NavBar.tsx`): quick routes HOME / SHOP / BUILD-A-WIG / SHOWROOM / MEMBERSHIP / ANALYSIS / SLAY CAM / REWARDS / PSA; icons search → boutique, bell → alerts, calendar → booking suite, bag → Curator's Tablet; **no account icon** (founder 2026-06-23). **Elevator** (floor directory, MP4 travel video) vs NavBar "express transport"; `DesktopFloatingNav`; page reveal / travel fade |
| **Design authority** | `docs/DESKTOP_TOWER_ROOM_ART_DIRECTION.md` (living spec per floor/zone hero), `CORE.md:148-149` (cover-locked overlays, 1915×821 heroes), MEMORY 2026-06-21 → 2026-06-24 founder directives, `brand-bible/experience/frontal-slayer-experience-bible.md:489` |
| **Layout components** | `DesktopRoutesLayout` + `DesktopRouteShell`; `DesktopFloorZonePage`; `DesktopZoneRoomScene` (crossfade); **perspective panels** (4-corner quads, ids: reception-left/center/right, curator-tablet, shopping-bag-*, checkout-tablet, acquisition-*, signin-tablet, tv-lounge-screen, psa-hologram-screen, extensions-boutique-wall; `perspectivePanelConfig.ts:53-137`, founder cloud sync via `/api/admin/perspective-panel-config`); zone overlays `ReceptionDashboard`, `GrandLobbyPanels`, `PsaAssistantWidget variant="suite"`, `RewardsRoomCertificationWall`, Lounge "Slay Cinema"; `ExtensionsBoutiqueExperience` |
| **Primary assets** | Supabase `live-preview/Desktop/NO TEXT BG/*.png` (14 refs, e.g. Penthouse Suite, shopping bag, alerts, booking backgrounds); `public/assets/desktop-tower-elevator-reverse.mp4`; `CS desktop-background.webp` |
| **Interaction systems** | Elevator travel; room-title placement; Mansion Debug layer, lounge TV frame and PSA frame editors (founder tooling); perspective panel placement profiles per viewport (desktop ≥1024, tablet 768–1023 native) |
| **Founder directives** | iPad gets native desktop, not the artboard (2026-06-22); floating PSA hidden on desktop/tablet (2026-06-22); desktop/tablet sign-in → Reception (2026-06-23); tablet account icon → Penthouse Suite (2026-06-23); Curator's Tablet "not a standard ecommerce cart page"; Acquisition "no white checkout page" (2026-06-23) |

## Functionality per desktop/tablet surface

| Surface | Data | Status | Hand-off |
|---|---|---|---|
| Penthouse Suite `/desktop/account` | Shared localStorage snapshot; re-derives tier/points locally (`penthouseSuiteDashboardData.ts:32-60, 320-330`) | Own visual; numbers may diverge (EC-5) | 12 panels → mobile `/account/*` (EC-3) |
| Reception `/desktop/concierge?zone=reception` | Static content builder (`receptionDashboardData.ts:50-172`) | Static | Links to Tower zones (several comingSoon) |
| PSA Suite | `/api/psa/*` | Working | — |
| Alerts room `/desktop/alerts` | **Hardcoded arrays** | Static (EC-4) | "View all" → mobile `/account/notifications` |
| Transformation Suite `/desktop/booking-suite` | Static layout | Static | Book CTAs → mobile `/booking/*` |
| Curator's Tablet `/desktop/shopping-bag` | Shared cart (local + cloud) | Working | ACQUIRE → `/desktop/acquisition*` |
| Acquisition `/desktop/acquisition*` | **Embeds the shared `CheckoutPage`** (`isDesktopCuratorCheckout` branches) | Same logic and gaps as mobile checkout (R-03, R-05, R-06, R-12) | — |
| Rewards gallery certification wall | `/api/collectibles` | Own visual; zone comingSoon | → mobile `/account/collectibles` |
| Penthouse boutique | `ExtensionsBoutiqueShopPanel` | Working | rewards link → `/account/rewards` |
| Analysis Lab room | — | Room exists; functionality UNVERIFIED this sprint | — |
| Build-A-Wig Atelier zone | — | Zone exists; uses the BAW flow | — |

## Backend dependencies

Identical server APIs to mobile (doc 02). The desktop reads the **same** localStorage snapshot hydrated by `syncAllFromApi`. Containment applied server-side (S0B-1, S0B-2) therefore covers desktop/tablet automatically. Verification must still run in the desktop/tablet experience (Acquisition tablet, Curator's Tablet, Penthouse panels).

## Unfinished workflows (desktop/tablet presentation)

- 9 capabilities hand off to mobile pages and 2 have no desktop presence (order detail, leave a review). This is XD-1.
- Alerts room shows fake data (EC-4). Reception and Transformation Suite are static.
- Three zones are marked comingSoon (members-lounge, slay-cam-gallery, rewards-gallery).
- Desktop E2E coverage: **none** (Playwright runs iPhone 13 only).

## Legacy or conflicting routes

- `src/pages/desktop-lobby/page.tsx` is not routed (orphan).
- 8 orphan desktop components with 0 importers; `ZoneLoungeReveal` links a non-existent `/account/membership` (EC-9).
- MEMORY floor history (2026-06-21) differs from the current floors registry (EC-6 in evidence E): the code is current.
- Tablet threshold split (EC-1 → XD-2). Production gating unknown (EC-2 → XD-3).

## Rules for future desktop/tablet work

- Design in the Tower language (rooms, zones, perspective panels, elevator, NavBar). **Never from mobile screenshots.**
- No standard ecommerce or "white" pages inside the Tower (founder 2026-06-23).
- Any new desktop/tablet presentation for a hand-off capability is a separate founder approval under XD-1.
- Data parity fixes (EC-4, EC-5) are engineering: same server source, no visual change.
