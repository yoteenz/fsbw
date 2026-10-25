# 18 — Existing Asset and Component Reuse Map

**Conclusion: the account and admin can be finished with assets that already exist.** The only genuinely missing art is the final certification collectible, which today is a CSS placeholder. Full inventory with paths, users, file checks and transparency results: `evidence/V2_assets_components.md`. **No new media was generated, and nothing should be regenerated.**

## 1. Assets to reuse (by surface)

| Surface (new or completed) | Reuse | Notes |
|---|---|---|
| Every account and admin page | `/assets/marble-half.png` (4320×3192, RGBA) | Already the token value in the design system |
| Overview, order detail, admin lists | Existing unit fronts (NOIR, BLANCO, wavy, curly) | Make **list-size derivatives** of the 10–13 MB originals: an optimisation copy, not new art |
| Rewards › Points, admin Rewards console | `loyalty-points-rewards.png` (unused today, transparent), existing loyalty medallion | — |
| Rewards › Slay Challenge, Collectibles | **30 existing phase images** (10 reward types × 3 phases, Supabase `live-preview/Collectibles/`) via `SlayQuestRewardAsset` | **Never regenerate.** Transparency not verifiable offline (doc 17 U-03) |
| Concierge, PSA, My Hair analyses | 24 PSA avatar expressions (local, transparent) | — |
| Section headers and icons (customer) | Red concierge icon set in `src/assets/concierge/`; `special-offer.svg`, `slay-challenge.svg`, `Free Gift.svg` | — |
| Command Center tiles and admin menu | **Existing admin icon set in `public/assets`** (revenue, clients, reviews, pending, meetings, marketing, backend, hub…), currently unused | Strong fit, with no new art needed |
| Desktop Penthouse / Rewards room (desktop phase) | Existing Supabase room scenes | Unchanged |

## 2. Asset defects to fix (repair, not redesign)

| Defect | Evidence | Fix |
|---|---|---|
| `/assets/new-background.jpg` is a 2 KB text stub | Mobile Mansion background never renders | Only matters if decision B6 keeps the Mobile Mansion |
| Missing files: `2D NOIR FRONT.png` (lounge), `thigh length-icon.svg`, `butt length-icon.png` (BAW) | Referenced but absent | Point the references at the existing equivalents, or restore the originals from the founder's source files (founder action) |
| Placeholders `picsum.photos`, `gallery-mock.png`, `mock-image.png` | Admin reviews, pending, clients | Removed with mock quarantine (S0B-2) |
| `natural front.png` used for all five special-offer units | Concierge | Use the matching unit front (assets exist) |
| Oversized files: `lace-icon.svg` 21 MB, `wig-brush.png` 27 MB, `points-loyalty.png` 23 MB, unit fronts 10–13 MB | `public/assets` | Optimised derivatives (same image) |
| Certification collectible is a CSS placeholder | `CertificationCollectibleAsset` | **Missing asset.** Founder decision G6: commission it, or keep the placeholder |

## 3. Components

| Component | Disposition | Use in |
|---|---|---|
| `MarblePageShell`, `PageActionsBelowCard`, `menuToggleHeights`, `PAGE_LAYOUT.md` | **Reuse as-is** | Base of `AccountShell` |
| `AdminHubPageShell`, `AdminHubTabBar`, `AdminHubSortDropdown`, `AdminHeader` | **Reuse / generalise** (`wide` prop) | Every admin family |
| `AdminOverviewAnalyticsCard` (unused) | Reuse | Command Center metrics |
| `ConfirmationModal` (62 users), `ImageViewerModal`, `ConsultOfferClaimModal`, `AddToListModal` | **Reuse as-is** | Confirmations, media, offers |
| `SlayQuestRewardAsset` (has an admin `phase` override), `CollectiblesGallery`, `ConciergeSectionHeader`, PSA components, desktop perspective panels | **Reuse as-is** | Rewards, collectibles, concierge |
| Order stage timeline (inside the 6,504-line concierge page) | **Extract** → `StatusTimeline`. Pick **one** stage vocabulary: today concierge and `ORDER_TRACKING_STAGE_LABELS` differ (decision C4). | Customer and admin order detail |
| Alert row (notifications page) | **Extract** → `AlertRow`, `EmptyState`, `ErrorState` | Everywhere |
| Order row markup (`src/pages/orders/page.tsx`) | **Extract** → `OrderRow` | Orders list, overview, admin |
| `StatsCard` | **Generalise** (queue tile variant) | Command Center |
| `AccountingSpreadsheetCard` | **Generalise** → admin table | Orders, inventory, ledgers |
| Digital cash / slay ticket / voucher history popups (3 near-duplicates) | **Generalise** → one `LedgerHistory` list | Rewards › Wallet |
| `premiumChartTable` rows | Generalise | Membership benefits list |
| `src/design-system/*` | **Do not use** for existing pages (would be a redesign); allowed only for brand-new internals if they match | — |
| `src/components/mobile-mansion/*` | **Do not use** (prototype only: broken background, Playfair Display, placeholder slots) | — |
| `src/motion` (FSMS) | Selective: reward-unlock and reveal moments only | Slay Challenge phase change |

## 4. Typography and tokens (verified)

- Futura PT Book/Medium/Demi and `Bohemy.otf`: `@font-face` in `src/index.css`, files in `public/assets/`.
- Covered By Your Grace: Google Fonts, plus a preload face. A local `.ttf` exists only in `api/_lib/fonts` for PDF and email.
- Design-system tokens: red `#EB1C24` and gray `#808080` match the brand.
- Mismatches to note, not to propagate:
  - Design-system black is `#1A1A1A`, but pages use `#000`. **Keep `#000`.**
  - The "chrome" token is translucent white, not silver.
  - There is no Bohemy token.
  - The mobile-mansion tokens specify Playfair Display, which is **off-brand**.
