# 18 — Visual Authority and Component Reuse

**Verdict: the approved FRONTAL SLAYER visual language is intact on almost every scoped page. Keep it, and repair the children rather than the shell.** No marble replacement, glass replacement, palette change or typography change is recommended. The work is consolidation: one shared shell component per area, carrying the same markup it already renders.

## 1. Visual DNA as verified in code (not assumed)

| Element | Canon | Verified usage in scoped pages |
|---|---|---|
| Marble | `/assets/marble-half.png` fixed/repeat layer | Present on **every** customer account page and **every** FS admin page except Trend Desk, PSA Broadcast and Studio health |
| Translucent glass panels | `bg-white/60` / `rgba(255,255,255,0.6)` + `backdrop-blur-sm`, 1.3px black or gray border | Present on every marble page (counts per file in `appendix/visual_usage.txt`) |
| Brand red | `#EB1C24` | **807** literal uses in scope, the most-used colour |
| Gray | `#808080` | **469** uses |
| Black / white | `#000000` / `#FFFFFF` | 371 / 111 |
| Off-palette colours | — | Minor: success green `#166534`/`#16A34A` (admin feedback), orange `#FF8C00` (admin alert badge, RecentActivity icons), Tailwind grays for dividers |
| Futura PT Book / Medium / Demi | `@font-face` in `src/index.css` | Medium 789 · Book 628 · Demi 106 uses |
| Covered By Your Grace | Google Fonts (`index.html:10`, `index.css:3`) | **101** uses (accent numbers, card titles; the alert-row canon in CORE.md) |
| Bohemy | `@font-face` (`index.css:160`) | **19** uses, mainly membership chart and rewards marketing |
| `Inter` | — | Appears only as the last fallback in font stacks; never primary |
| Chrome / polished silver, bright white lighting | Desktop Mansion and lobby art | Not used on mobile account/admin pages (by design: they use marble + glass) |

The local render sweep confirmed the look. `/account` at 390px shows the marble field, translucent bordered cards, the red `ACCOUNT > PROFILE` crumb and Covered By Your Grace card titles. `/account/rewards` at 768px shows the loyalty medallion, red progress bar and script reward labels.

## 2. Shell inventory and classification

| Shell element | Where | Classification |
|---|---|---|
| Marble background layer | Inline in every page (≈50 copies); `MarblePageShell` exists but **no scoped page uses it** | **IMPLEMENTED_BUT_INCONSISTENT** (duplicated) |
| Customer nav bar (back · breadcrumb · cart · hamburger) | Hand-copied into ~12 pages (150–250 lines each) | **DUPLICATED** |
| Mobile menu panel (SHOP / TOOLS / BRAND + socials) | Copied into each page; uses `ShopMobileMenuShopTab`, `ShopMobileMenuToolsTab`, `BrandMenuLinks` | **DUPLICATED** (sub-components reused) |
| Breadcrumb grammar `ACCOUNT > X` / `ADMIN > X` | All pages | **APPROVED_AND_REUSABLE** (minor label errors: deleted accounts, accounting, waitlist) |
| Main glass card | All pages | **APPROVED_AND_REUSABLE** |
| `PageActionsBelowCard` (actions below the card, not inside) | Wishlist, lists, shared list, 9 admin pages | **APPROVED_AND_REUSABLE**. Adopt everywhere (`src/layouts/PAGE_LAYOUT.md` rule) |
| `MENU_TOGGLE_PANEL_HEIGHT` / `ACCOUNT_MAIN_COLUMN_MIN_HEIGHT` | `src/layouts/menuToggleHeights.ts` | **APPROVED_AND_REUSABLE** |
| `AdminHeader` (back, breadcrumb, search, bells) | Every FS admin page | **APPROVED_AND_REUSABLE** chrome. The search, bells and long-press debug behaviour are **FUNCTIONALLY_BROKEN** (doc 11 DA-09…12) |
| `AdminHubPageShell` (marble + header + summary panels + tabs + body) | Messages, Alerts | **APPROVED_AND_REUSABLE**. **The best existing admin shell**; Pending, Revenue, Referrals, Brand and Marketing hand-roll the same layout |
| `AdminHubTabBar`, `AdminHubSortDropdown` | Messages, Alerts | **APPROVED_AND_REUSABLE** |
| `StatsCard` dashboard tile | Dashboard | **APPROVED_AND_REUSABLE** visually. Its content and links are broken |
| `ConfirmationModal` | Account and admin | **APPROVED_AND_REUSABLE** (replace `window.confirm` on `/admin/users`) |
| Concierge section header, alert-row 3-line typography | Account | **APPROVED_AND_REUSABLE** |
| Inline expand rows | Orders, clients, revenue, deleted | **APPROVED_AND_REUSABLE** pattern |
| Drawers | none | **MISSING** (needed for tracking entry, inbox reply, quick edits) |
| Empty states | Most pages have a one-line uppercase empty message | **IMPLEMENTED_BUT_INCONSISTENT** (no next-step CTA; some pages show mock data instead) |
| Loading states | Account: the guard's plain "Loading..." on white/60; admin: "LOADING … DATA..." | **IMPLEMENTED_BUT_INCONSISTENT** |
| Error states | Rare; most failures are silent | **MISSING** |
| Trend Desk / PSA Broadcast shell | `bg-black text-white`, `max-w-6xl`, white/10 borders | **OUTDATED / OFF-CANON** (a dark SaaS look; violates "no opaque dashboard cards") |
| `/admin/studio/health` | Unstyled system-ui | Out of scope (Studio OS) |
| `/account/consult-offer` | `bg-white/90`, no nav | **OUTDATED** (route retired in proposal) |
| `/account/collectibles` (`CollectiblesGallery`) | Plain white page with a "← ACCOUNT" text link; **no marble, no glass card, no standard nav bar** (render sweep 390–2560) | **IMPLEMENTED_BUT_INCONSISTENT**. Wrap in `AccountShell`. API errors also render as the "collection starts here" empty state. |
| Mobile Mansion (`MobileMansionLayout`, `GlassPanel`, `PlaceholderSlot`) | `/mobile/*` | A separate, unfinished design track. Do not merge into account. |
| Frontal Slayer Design System `src/design-system/` (tokens, glass, cards, panels) | **Imported by 0 scoped pages** | **APPROVED_AND_REUSABLE but unused**. Adopt gradually for *new* components only; do not mass-refactor approved pages |

## 3. Component reuse plan (no visual change)

| Build once | From | Replaces | Used by |
|---|---|---|---|
| `AccountShell` (marble + nav bar + menu panel + main glass card + `PageActionsBelowCard` slot + breadcrumb props) | Extract the existing hub/orders nav markup verbatim | ~12 copied nav bars and 4 sign-out variants | Every account page and the 2 new ones |
| `AccountLayoutRoute` (one guard for `/account/*`) | `AccountRouteGuard` | Per-route guard instances (removes the "Loading…" on every hop) | All account routes |
| `AdminPageShell` = generalised `AdminHubPageShell` with an optional `wide` prop | `AdminHubPageShell` | Hand-rolled layouts on Pending, Revenue, Referrals, Brand, Marketing; dark Trend Desk/PSA shells | All admin pages |
| `AdminDetailLayout` (title · entity id · status chip · primary actions · tabs · activity timeline) | New, composed from existing glass card, `AdminHubTabBar` and `ConfirmationModal` | Inline 4,000-line detail toggles | Order detail, customer detail |
| `GlassDrawer` | New. Glass panel sliding over marble, using the existing border and blur tokens | `window.confirm` and inline mega-forms | Tracking entry, inbox reply, points adjust |
| `StatusTimeline` | Extract from concierge stage list | 3 duplicated stage arrays | Customer order detail, admin order detail |
| `EmptyState` (title in Covered By Your Grace, body Futura Demi gray, red action link: the alert-row canon) | CORE.md alert typography | Ad-hoc empty strings and mock fallbacks | Everywhere |
| `ErrorState` / toast | New, same typography | Silent failures | Everywhere |

## 4. Design-authority gates (for later founder review)

Each of these is a visible change and needs a founder visual sign-off before it ships:

1. **Command Center layout** (doc 20): a queue-first grid within the same `StatsCard` glass vocabulary.
2. **Account Overview status panels** (doc 21): new panels above the existing card grid.
3. **Admin width on desktop** (doc 19): widening from the 448px column to a wider glass shell at ≥1024px.
4. **Admin menu drawer:** a new navigation surface in `AdminHeader`.
5. **Re-skinning Trend Desk and PSA Broadcast** onto marble/glass.
6. **MY HAIR page:** a new page in the existing account visual language.

No speculative mockups or new media assets were produced for this audit.
