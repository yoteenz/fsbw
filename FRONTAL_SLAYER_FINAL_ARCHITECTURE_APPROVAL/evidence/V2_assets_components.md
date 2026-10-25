# V2 — Asset & Component Reuse Map (Account + Admin completion, no redesign)

Read-only audit of `/home/user/fsbw` (2026-10-25). Paths in "ASSET" are served from `public/` unless they are Supabase URLs.
`SB:` = `https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/`. PNG transparency was read from the IHDR color-type byte: ct=6 RGBA (transparent), ct=2 RGB (opaque), ct=0 grayscale. Remote Supabase files could not be checked offline.

---

## 1. Visual assets actually referenced

### 1a. Backgrounds / surfaces
| ASSET | TYPE | USED BY | NOTES |
|---|---|---|---|
| `/assets/marble-half.png` | background | Every account page (`account/page`, affiliate, concierge, consult-offer, load-card, membership, notifications, payment, referrals, reviews/*, settings, shipping), orders, wishlist (+lists/shared), admin dashboard, `AdminHubPageShell`, all admin hub pages, BAW (`BAW_MARBLE_BACKGROUND_SRC` in `src/utils/pageLoadReadiness.ts`, 20+ refs), FDS token `--fds-brand-luxury-marble` | Exists. 4320x3192 RGBA, 3.5 MB. **The canonical marble.** Use it for every new surface. |
| `/assets/popup-marble.png` | background (modal) | `src/pages/account/page.tsx` (3 popups) | Exists. 1364x968 RGBA. Reuse for new account/admin modals. |
| `/assets/marble-popup.png`, `/assets/mini-marble.png` | background | none in src | Exist (2000x1000 RGB / 618x980 RGBA). Unused spares. |
| `/assets/marble-container.png`, `/assets/marble-tc.png`, `/assets/marble bg.png`, `/assets/marble-unit.png` | background | shop/products/checkout only | Exist, RGBA. Not used in account or admin. |
| `/assets/NOIR/menu-marble.png` | background | (shop menu) | Exists. |
| `DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL` = `SB:Desktop/NO TEXT BG/97EC97C2-….png` | scene | `DesktopPenthouseSuiteScene.tsx` (`src/constants/desktopPenthouseSuite.ts`, 1835x857, 12 panel rects) | Remote. Desktop account "penthouse" room. |
| `DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['rewards-gallery']` = `SB:Desktop/NO TEXT BG/JP5Klzh6….jpeg` | scene | `DesktopFloorZonePage` + `RewardsRoomCertificationWall` (`src/constants/desktopNoTextBackgrounds.ts`) | Remote JPEG. Desktop rewards room. Same map also holds `psa-suite`, `members-lounge`, `founder-suite`, `reception`, `lounge`, `build-a-wig-atelier`. |
| `DESKTOP_NOTIFICATIONS_BACKGROUND_URL` `SB:Desktop/NO TEXT BG/CD7F20DB-….png` | scene | desktop alerts (`src/constants/desktopNotifications.ts`) | Remote. |
| `/assets/new-background.jpg` | background | `mansionPlaceholderBackgrounds` in `src/constants/mobileMansionTokens.ts`, used by all 11 `/mobile/*` pages | **Broken.** The file is 2000 bytes of truncated base64 text, not a JPEG, so it never renders. The `MansionBackground` gradient fallback is what shows instead. |

### 1b. Brand marks / logos
| ASSET | TYPE | USED BY | NOTES |
|---|---|---|---|
| `/assets/neon-logo.png`, `/assets/neon2-logo.png` | brand mark | lobby scene constants only | 912x1092 RGBA. **No logo appears on any account or admin page.** Headers use text breadcrumbs. |
| `/assets/brand-icon.svg` | icon | none | Despite the name, this is a line-chart glyph, not the brand logo. |
| `CrystalLogo` (src/motion) | brand mark (code) | cinematic only | CSS/SVG crystal logo treatment. |
| `/assets/favicon.png` | brand | index.html | — |

### 1c. Icons (chrome, nav, section headers)
| ASSET | TYPE | USED BY | NOTES |
|---|---|---|---|
| `/assets/back-button.svg`, `/assets/NOIR/account-icon.svg`, `/assets/wishlist-heart.svg` | nav icon | Every account page header, `AdminHeader` | Exist. |
| `/assets/search-icon.svg` | icon | `AdminHeader`, wishlist | Exists. |
| `/assets/messages-active/inactive.svg`, `/assets/notifications-active/inactive.svg` | icon | `AdminHeader` | Exist. |
| `/assets/points-history.svg` | icon | `DigitalCashHistoryPopup`, `SlayTicketHistoryPopup`, `VoucherHistoryPopup`, `account/page`, `admin/clients` | Exists. A second copy lives at `src/assets/icons/points-history.svg` (membership page). |
| `/assets/rose-alert.svg` (+ unused `rose-alert2.svg`) | bullet icon | `SlayChallengeRoseBullet`, `SlayChallengeTierPhaseDetail`, `PremiumSubscriptionUpgradeChart`, membership, account | Exists. The brand rose bullet. |
| `/assets/premium-check.svg`, `/assets/premium-x.svg` | icon | `PremiumSubscriptionUpgradeChart`, `premiumChartTable`, membership, affiliate, concierge | Exist. |
| `/assets/order-tracking.svg`, `/assets/payment-icon.svg`, `/assets/ship-icon.svg`, `/assets/rewards-icon.svg` | section icon | orders, `admin/clients`, payment, shipping | Exist. |
| `src/assets/icons/summary-icon.svg`, `payment-icon-orders.svg` | section icon | orders, `admin/clients` | Bundled with `?url`. |
| `src/assets/icons/membership-icon.svg`, `more-ways.svg`, `additional-features.svg`, `affiliate-icon.svg` | section icon | membership, affiliate | Bundled. |
| `src/assets/concierge/*-red.svg` (priority, order-tracking, challenge, free-gift, birthday) + `src/assets/special-offer2.svg` | section icon (native #EB1C24) | `conciergeSectionIcons.ts` → `ConciergeSectionHeader` → concierge | **Preferred red icon set.** Native red, no CSS filter needed. |
| `/assets/special-offer.svg`, `/assets/slay-challenge.svg`, `/assets/Free Gift.svg`, `/assets/special-offer-icon.svg`, `/assets/priority1/2.svg`, `/assets/birthday1.svg`, `/assets/challenge-icon.svg` | icon | **none in scope** (`challenge-icon` is used by `receptionDashboardData`) | Exist. These are 24px black-stroke originals, superseded by the `src/assets/concierge` red set. |
| `/assets/check.svg`, `/assets/checkbox.svg`, `/assets/dropdown.svg`, `/assets/seen-notif.svg` | form/UI icon | load-card, payment, shipping, concierge, notifications, wishlist, AdminMeetingsHub | Exist. |
| `/assets/close-icon.svg` → `BrandRedCloseIcon` | icon | modals, lounge | Native red. |
| `/assets/order-form.svg`, `/assets/Shampoo.svg`, `/assets/Arrived Plane.svg`, `/assets/Shipped Plane.svg` | stage icon | concierge order-tracking stage rows (`renderIconBox`) | Exist. Reusable for order detail and admin order timelines. |
| BAW option icons: `Bangs/Bleach/Crimps/Flat iron/Layers/Pluck/Texture/lace/clip ends/cap size/back length/none/Natural, Lagos, Peak Hairline-icon.svg`, `blanco texture.svg` | option icon | concierge (special offer and order summary), BAW | Exist. **Very large:** `lace-icon.svg` is 21 MB, `back length-icon.svg` 8.8 MB, `cap size-icon.svg` 2.8 MB, the hairline icons about 2.3 MB each. These are embedded rasters and are slow on admin lists. |
| Admin role icons: `revenue-icon(2)`, `clients-icon`, `reviews-icon`, `pending-icon(2)`, `referrals-icon`, `meetings-icon`, `marketing-icon`, `backend-icon(2)`, `hub-icon`, `points-icon`, `shipping-icon`, `member-status.svg` | nav icon | **none in admin src** (`hub-icon` only in reception data) | Exist in `public/assets`. **Ready-made icon set for the Command Center / admin console tiles.** |

### 1d. Loyalty / rewards medallions & reward art
| ASSET | TYPE | USED BY | NOTES |
|---|---|---|---|
| `/assets/points-loyalty.png` | medallion | concierge (free-gift/points picker) | 3077x2577 **RGB opaque**, 23 MB. Needs an optimized derivative. |
| `/assets/loyalty-points-rewards.png` | medallion | none | 1024x1024 RGBA. **Unused, transparent, good candidate** for the rewards console and points chips. |
| `/assets/loyalty-points.png` | medallion | none | 5504x3072 RGB, 15 MB. |
| `/assets/premium-rewards.png` | medallion | membership (x2) | 2048x2048 RGBA, 16 MB. |
| `/assets/premium-membership-upgrade.png` | medallion | `PremiumSubscriptionUpgradeChart`, membership | 1080 RGBA. |
| `/assets/3-/6-/12-months-premium.png` | medallion | `checkoutOrderStripDisplay` | RGBA. Reusable for admin membership rows. |
| `/assets/gift-card asset.png` | product | concierge, wishlist, `accountReviewThumbnailFromProductTitle` | 604x628 RGBA. |
| `/assets/melt-band.png`, `/assets/wig-brush.png` | product (free gift) | concierge | **RGB opaque.** `wig-brush.png` is 27 MB. |
| `/assets/final-package2.png` | product/scene | concierge (shipped stage) | 3282x2346 RGB, 7.5 MB. |
| `SLAY_TICKET_*` (`SB:Slay Ticket/…`), `GIFT_CARD_PREVIEW_IMAGES` (`SB:Stock Content/…`) | product | `src/constants/slayTicketAssets.ts`, `giftCardAssets.ts` | Remote. Reusable for the ticket and digital-cash history rows. |

### 1e. Collectible phase art (10 reward types × 3 phases), `src/config/slayQuestRewardAssets.ts`
All entries are `SB:Collectibles/<file>.png`. Transparency was not verified because the files are remote.
| Reward type | phase1 | phase2 | phase3 | fallbackIcon |
|---|---|---|---|---|
| loyalty_points | image (62) | image (63) | image (64) | diamond |
| free_voucher | IMG_3335 | IMG_3336 | IMG_3337 | voucher |
| free_gift | IMG_3338 | IMG_3339 | IMG_3340 | gift |
| double_points | IMG_3237 | IMG_3235 | IMG_3236 | double_points |
| exclusive_digital_wallpaper | IMG_3326 | IMG_3322 | IMG_3321 | wallpaper |
| mystery_reward | image (66) | IMG_3282 | image (67) | mystery |
| free_expedited_shipping | IMG_3353 | IMG_3354 | IMG_3264 | shipping |
| free_expedited_processing | IMG_3349 | IMG_3350 | IMG_3351 | processing |
| bonus_hairstyle_analysis | IMG_3312 | IMG_3364 | IMG_3316 | analysis |
| digital_cash | IMG_3360 | IMG_3361 | IMG_3362 | cash |

Used by `SlayQuestRewardAsset` (which accepts a forced `phase` prop for admin preview), `SlayChallengeCollectiblesPreview`, and concierge. The fallback is a CSS glass circle with a red ring and a Futura label. **The set is complete: all 30 URLs are filled.**
Education certification collectibles: `CertificationCollectibleAsset` is a **CSS-only placeholder** ("final 3D asset TBD"). It is used by `CollectiblesGallery`, `CollectibleCard`, `RewardsRoomCertificationWall`, and lounge education.

### 1f. PSA / concierge character assets (`src/constants/psaConfig.ts`)
| ASSET | TYPE | USED BY | NOTES |
|---|---|---|---|
| `/assets/psa-avatar-{neutral, neutral-smiling, waving, listening, thinking, thinking-smiling, delighted, sorry, pointing, talking, presenting, remembering, remembering-ask, memory-locked, curator, honest-pushback, archetype-quiz, archetype-reveal, red-carpet, blueprint, slay-forecast, celebrating, reassuring, spotlight}.png` (24) | character | `PSA_AVATAR_SRC` → `PsaAvatarImageCrossfade` → `PsaAvatarTrigger`, `PsaStandingHologram`, `PsaAssistantWidget`, `PsaChatPanel` | **All exist, all RGBA**, 1024 to 1360 px, 1.1 to 2.6 MB each. |
| `/assets/psa-avatar-dna-nod.png` | character | not in `PSA_AVATAR_SRC` | Exists, RGBA. A spare expression. |
| `/assets/psa-nudge-thought-bubble.png`, `/assets/psa-nudge-holo-glow.png` | hologram FX | PSA nudges | RGBA. |
| `/assets/profile-thumb.png` | avatar fallback | `PsaAvatarImageCrossfade` onError, account, notifications, `admin/clients`, pending, reviews, `BrandCopyEditorPanel` | 320 RGBA. The generic user avatar. |
| `SB:Desktop/NO TEXT BG/Ustsscdn8….jpeg` (`psa-suite`) | scene | desktop PSA suite | Remote. |

### 1g. Product / unit imagery used in account + admin lists
| ASSET | TYPE | USED BY | NOTES |
|---|---|---|---|
| `/assets/2D BLANCO FRONT.png`, `2D WAVY FRONT.png`, `2D CURLY FRONT.png` | product | `accountReviewProductThumbnail.ts` (`ordersPageUnitThumbnailSrcFromUnitKey`) → orders, reviews, affiliate, admin clients/revenue/fulfilled-orders/special-offer, concierge | 3240x4050 RGBA, **10–13 MB each**. These are used as list thumbnails and need smaller derivatives. |
| `/assets/natural front.png` | product (NOIR / straight) + **generic fallback** | same resolver (default branch); concierge `SPECIAL_OFFER_UNITS` uses it for **NOIR, SOFT WAVE, BEACH WAVE, SOFT CURL, OCEAN CURL** and for 9 mock orders; admin pending | 11.5 MB RGBA. It acts as a stand-in for units that already have their own art (see section 2). |
| `/assets/NOIR/{noir,blanco,wave,curl}-thumb.png` | product thumb | affiliate, orders, wishlist, consult-offer, lounge (70+ refs), BAW | 632x580 RGBA, about 350 KB. **The right size for list rows.** Prefer these for admin order and customer rows. |
| `/assets/noir-lagos-thumb.png`, `noir-peak-thumb.png` | product thumb | wishlist | RGBA. |
| `/assets/NOIR/filled-star.png`, `star-symbol.png` | rating icon | reviews, admin pending/reviews, wishlist lists | RGBA. |
| `/assets/b length thumb.png`, `thigh length thumb.png`, `density.png`, `density-blanco.png`, `lace-blanco.png` | option art | concierge, BAW | RGBA. |
| `/assets/gallery-mock.png`, `/assets/mock-image.png` | **mock** | orders mock data (productImage, booking inspo), `admin/clients` `MOCK_PHOTO/VIDEO_PLACEHOLDERS`, affiliate | RGBA. **Placeholders.** |
| `/assets/leaf-brick-resize.png`, `SB:3D images/6KLNd….jpeg` | product | wishlist lists | — |
| `SB:refs-noir/consult inspo2.JPG` | photo | AdminMeetingsHub | — |
| `ORDER_FORM_HERO_IMAGE_SRC/VIDEO_SRC` (`SB:3D Stock/IMG_2975.png`, `.mp4`), `AFFILIATE_PROGRAM_HERO_IMAGE_SRC`, `BRAND_MEMBER_HERO_IMAGE_SRC` | hero | order form, affiliate, brand member | Remote 3D stock heroes. Reusable for the order-detail hero. |

### 1h. Chrome / silver / acrylic elements (all code-drawn, no bitmap)
| ELEMENT | TYPE | USED BY | NOTES |
|---|---|---|---|
| `src/components/desktop-shared/acrylicGlass.css` (`.acrylic-glass-surface`) | glass FX | penthouse, transformation suite, curator suite, notifications, floor-zone pages | Crystal edge, light bend, rose tint. |
| `src/components/lounge/acrylicGlyphDefs.tsx` + `Acrylic{Heart,Bookmark,Mute,MediaPlayPause}Glyph/Control` | dimensional icon | lounge TV | SVG gradient "sculptural acrylic". Can be generalized into account/admin action glyphs. |
| `FDS_GLASS_*` / `--fds-glass-chrome` | token | design-system only | "chrome" is defined as `rgba(255,255,255,.65)`. There is **no actual silver gradient token or asset.** |

### 1i. Lounge assets (`src/constants/loungeSceneAssets.ts`, `src/components/lounge/loungeTvAssets.ts`)
`/assets/landing2-background.png`, `/assets/salon-chairs.png`, `lounge-curtain-left/right.jpeg`, `lounge-tv-remote-hand.png` (RGBA), `lounge-tv-content-frame.png`, `lounge-tv-design.png`, `lounge-tv-acrylic-lock.svg`, `tv-screen.png`, `TV content.mp4`, `lounge-tv-animation.mp4`, `straight-frontal/closure-video.mp4`, play/pause/mute/bookmark/heart icons on SB `live-preview`, `LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC`. **Missing:** `/assets/2D NOIR FRONT.png` (referenced in lounge, not present).

### 1j. Build-A-Wig shell/background (listed only, not evaluated)
Shell background is `BAW_MARBLE_BACKGROUND_SRC` = `/assets/marble-half.png`. Option art: `NOIR/*-thumb.png`, `hairline-blanco.png`, `density(-blanco).png`, `lace-blanco.png`, `b/thigh length thumb.png`, angle icons (`front/left/right angle-icon.svg`), and the option icons in 1c. Desktop atelier scene: `DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['build-a-wig-atelier']`. **Missing:** `/assets/thigh length-icon.svg` (4 refs) and `/assets/butt length-icon.png` (4 refs).

---

## 2. Missing assets / placeholders

### 2a. Current placeholders
| Where | Placeholder | Fix with existing asset? |
|---|---|---|
| `src/pages/admin/reviews/page.tsx:355`, `src/pages/admin/pending/page.tsx:83` | `picsum.photos` review/pending photos | Yes. Show a frosted empty-state frame (marble plus glass) when there are no real uploads; for demo data use `gallery-mock.png` or the `NOIR/*-thumb.png` set. No external URLs. |
| `src/pages/admin/clients/page.tsx:1580-81` | `MOCK_PHOTO/VIDEO_PLACEHOLDERS` = `gallery-mock.png` ×N | Yes. Same treatment as the row above. |
| `src/pages/orders/page.tsx` mock orders | `gallery-mock.png`, `mock-image.png` | Mock data only. Real orders should resolve through `ordersPageUnitThumbnailSrcFromUnitKey`. |
| concierge `SPECIAL_OFFER_UNITS` (lines 1359–1364), mock orders, `admin/special-offer` (5), `account/reviews` (6) | `natural front.png` used for every unit | **Yes.** WAVY, CURLY, and BLANCO 2D fronts exist (plus `SOFT-WAVE FRONT.png`, `BLANCO-FRONT.png`, `lagos/peak front.png`, `NOIR/*-thumb.png`). Route everything through the `accountReviewProductThumbnail.ts` resolvers and the thumb set. |
| `src/components/mobile-mansion/placeholders/PlaceholderSlot.tsx` | `[LABEL]` boxes on all 11 `/mobile/*` pages (3–5 each) | The mobile-mansion track is a parallel prototype that renders a broken background. Out of scope; do not build on it. |
| `CertificationCollectibleAsset` | CSS crystal placeholder, "final 3D asset TBD" | **Genuinely missing:** final certification collectible art. The CSS version is acceptable for v2. |
| `SlayQuestRewardFallback` | CSS ring with a text label when a URL is empty or `REPLACE_WITH_SUPABASE_URL_` | Not triggered today because all 30 URLs are set. |
| `/assets/new-background.jpg` | Corrupt (text stub) | Replace the mansion background constant with `marble-half.png` or a desktop room URL. |
| Missing files | `2D NOIR FRONT.png` (lounge), `thigh length-icon.svg` and `butt length-icon.png` (BAW) | Map to `natural front.png` / `noir front.png`, and to `back length-icon.svg` or the length thumbs. No new art is needed. |

### 2b. Proposed new surfaces
| Surface | Existing assets that suffice | Genuinely missing |
|---|---|---|
| **Customer order detail** | marble-half, popup-marble, `order-tracking.svg` / `CONCIERGE_ORDER_TRACKING_ICON`, stage icons (order-form, Shampoo, Arrived/Shipped Plane, final-package2), unit thumbs via resolver, `ORDER_FORM_HERO_*`, `payment-icon`, `ship-icon`, `summary-icon` | Optional per-stage icons for SOURCING, CONSTRUCTING, CUSTOMIZING, FINALIZING. The current set covers about 4 of 9 stages; reuse BAW option icons (e.g. Flat iron or Bleach for CUSTOMIZING). Nothing blocking. |
| **My Hair** (owned units, care, analysis) | `NOIR/*-thumb.png`, 2D fronts, BAW option icons as spec chips, PSA avatars (`curator`, `blueprint`, `presenting`), lounge care content, `bonus_hairstyle_analysis` collectible | A per-user unit photo is user-generated content. Optional: a "hair passport" hero, which can reuse `SB:3D Stock`. |
| **Admin orders / order detail** | `AdminHeader` icons, unit thumbs, stage icons, `ORDER_TRACKING_STAGE_LABELS`, `ship-icon`, `payment-icon-orders` | None. Do create thumbnail-size derivatives of the 2D fronts (10–13 MB each). |
| **Admin customer detail** | `profile-thumb.png`, `rewards-icon`, `points-history`, `member-status.svg`, the 3/6/12-month premium medallions, collectible phase art | None. |
| **Admin rewards console** | `slayQuestRewardAssets` (30 phase images plus a forced `phase` prop), `loyalty-points-rewards.png` (unused, RGBA), `premium-rewards.png`, `points-loyalty.png`, `gift-card asset.png`, slay-ticket and gift-card SB images, `rose-alert.svg` | None. `points-loyalty.png` (23 MB RGB) and `premium-rewards.png` (16 MB) need web derivatives. |
| **Admin inventory** (exists as `admin/revenue/edit-inventory`) | 6-SKU thumbs: `NOIR/noir,blanco,wave,curl-thumb.png` plus `noir-lagos/peak-thumb`. BEACH WAVE and OCEAN CURL have `beach wave thumbnail.png` and `ocean curl thumbnail.png`; SOFT CURL has `soft curl thumbnail.png`. Bundle/closure/frontal PNGs also exist. | None. |
| **Command Center** (admin hub) | **Unused admin role icon set** in `public/assets` (revenue, clients, reviews, pending, referrals, meetings, marketing, backend, hub, points, shipping), marble-half, `AdminRevenueLiveGlobe`, PSA `slay-forecast` / `spotlight` avatars, desktop `founder-suite` / `reception` room URLs | A brand logo lockup for the header is missing: only the neon lobby logo exists, with no clean white/chrome wordmark. Optional. |

---

## 3. Reusable components

Verdict key: **REUSE** = reuse as-is · **EXTRACT** = pull inline code out into a component · **GENERALISE** = widen props or API · **DO NOT USE**

### 3a. Layouts (`src/layouts/`)
| Component | Path | What it is | Current users | Verdict |
|---|---|---|---|---|
| `MarblePageShell` | `src/layouts/MarblePageShell.tsx` | Marble wrapper; `viewportLocked` option; PSA-safe | brand, slay-cam **only**. Account/admin pages inline their own marble divs. | **REUSE** for all new pages. Retrofitting old pages is optional. |
| `PageActionsBelowCard` (+`.Spacer`, `adminHub`) | `src/layouts/PageActionsBelowCard.tsx` | Canonical below-card red action buttons (2px or 10px spacing) | 21 files (admin revenue/*, referrals, studio, wishlist…) | **REUSE**. Mandatory under `PAGE_LAYOUT.md`. |
| `menuToggleHeights` | `src/layouts/menuToggleHeights.ts` | `MENU_TOGGLE_PANEL_HEIGHT`, `ACCOUNT_MAIN_COLUMN_MIN_HEIGHT`, `menu-toggle-card` class | 15 / 6 files (account pages, orders, BookingFlowLayout) | **REUSE**. |
| `PAGE_LAYOUT.md` | `src/layouts/PAGE_LAYOUT.md` | Layout contract: marble → nav bar → single bordered blurred card (1.3px black border, white/60) → actions below the card | — | **Follow** as the spec. |

### 3b. Admin shell
| Component | Path | What it is | Users | Verdict |
|---|---|---|---|---|
| `AdminHubPageShell` | `src/components/admin/AdminHubPageShell.tsx` | Marble, `AdminHeader`, summary panels, tabs, body | messages, alerts | **REUSE** for admin orders, customers, rewards console, and inventory list pages. |
| `AdminHubTabBar` | `src/components/admin/AdminHubTabBar.tsx` | Futura Medium tabs, red active underline, gray inactive | 5 (studio) | **REUSE**. |
| `AdminHubSortDropdown` | `src/components/admin/AdminHubSortDropdown.tsx` | Sort select | messages, alerts | **REUSE**. |
| `AdminOverviewAnalyticsCard` / `AdminOverviewMetricRows` | `src/components/admin/AdminOverviewAnalyticsCard.tsx` | Titled card plus label/value rows (red value option) | **0 users** | **REUSE**. Good for order detail and customer detail summaries. |
| `AdminRevenueLiveGlobe` | `src/components/admin/AdminRevenueLiveGlobe.tsx` | Live orders globe | revenue | **REUSE** in the Command Center. |
| `AdminReviewStyleCard` | `src/components/admin/AdminReviewStyleCard.tsx` | Review/BAW style card | pending | **REUSE** for an order-detail style spec. |
| `AdminHeader` | `src/pages/admin/components/AdminHeader.tsx` (899 lines) | Breadcrumb header with search, messages, and notifications icons plus a priority message drawer | 31 files | **REUSE**. Do not fork it. |
| `StatsCard` | `src/pages/admin/components/StatsCard.tsx` | Dashboard stat tile (count, items, tiers, highlight parts) | dashboard | **GENERALISE**. Move to `components/admin` for Command Center KPIs. |
| `ActivityFeed`, `RecentActivity` | `src/pages/admin/components/` | Dashboard feeds; data hard-wired; uses Tailwind `shadow-lg` | dashboard | **EXTRACT** the row markup only. RecentActivity is 1,096 lines with inline mock data. |
| `AccountingSpreadsheetCard` | `src/pages/admin/components/AccountingSpreadsheetCard.tsx` | Futura spreadsheet table styles (8px gray headers, black rules) | accounting-report | **GENERALISE** into an `AdminDataTable` for order and inventory tables. |
| `BrandAlertsPanel` | `src/pages/admin/components/BrandAlertsPanel.tsx` | Composes and sends client alerts (ORDER, TIER, MEMBERSHIP, SALE, BOOKING, REWARDS) | brand | **REUSE** from order detail and customer detail ("send alert"). |
| `AdminPsaReviewPanel`, `PsaChatCopyEditorPanel`, `BrandCopyEditorPanel`, `AdminLoungeTvContentPanel`, `AdminLiveTryOnBatchPanel` | `src/pages/admin/components/` | Domain panels | various | **REUSE** in place; not general-purpose. |

### 3c. Shared modals (`src/components/`)
| Component | What | Users | Verdict |
|---|---|---|---|
| `ConfirmationModal.tsx` | Title, body, CONFIRM (left) / CANCEL (right) | 62 files | **REUSE** for every confirm (refund, cancel, status change). |
| `ImageViewerModal.tsx` | Gallery viewer with strip, drag, and footer downloads | admin clients, affiliate, PDPs | **REUSE** for order photos and customer uploads. |
| `ConsultOfferClaimModal.tsx` | Consult offer claim (thumb, breakdown, 72h timer) | orders | **REUSE** in place. |
| `AddToListModal`, `CreateNewListModal`, `RenameListModal`, `ShareListLinkModal` | Wishlist list modals | wishlist, bag | **REUSE** within wishlist only. |
| `SignedOrderFormPdfPanel.tsx` | Signed order-form PDF viewer | order form | **REUSE** in admin order detail. |
| `BrandRedCloseIcon` | Native red close icon | modals | **REUSE**. |

### 3d. Account components (`src/components/account/`)
| Component | What | Users | Verdict |
|---|---|---|---|
| `ConciergeSectionHeader` | Red-icon section header (special-offer2 treatment) | concierge | **REUSE** as the section header for order detail, My Hair, and rewards. |
| `DigitalCashHistoryPopup`, `SlayTicketHistoryPopup`, `VoucherHistoryPopup` | Marble ledger popups (points-history icon) | account, notifications (Voucher is lazy-referenced in account) | **GENERALISE** into one `LedgerHistoryPopup`. The three are near-duplicates. The admin customer detail can reuse it. |
| `ReviewSupplementalContentModal` | Review media add-on | reviews | REUSE in place. |
| `SlayQuestRewardAsset` | Phase-aware collectible with glass fallback; forced `phase` prop for admin | concierge, preview | **REUSE** in the admin rewards console. |
| `SlayChallengeCollectiblesPreview`, `SlayChallengeTierPhaseDetail` | Tier/phase gallery | concierge | **REUSE** in the rewards console preview. |
| `SlayChallengeRoseBullet`, `SlayChallengeBohemySubhead` | Rose bullet list item and **Bohemy subhead** | concierge, tier detail | **REUSE**. This is the only Bohemy component. |
| `collectibles/CollectiblesGallery`, `CollectibleCard`, `CertificationCollectibleAsset`, `useUserCollectibles` | Collectibles grid, filter, and data hook | `/account/collectibles` (white background, not marble), desktop rewards wall, lounge education | **REUSE**. Wrap the page in `MarblePageShell` for consistency. |

### 3e. Membership (`src/components/membership/`)
| Component | What | Users | Verdict |
|---|---|---|---|
| `PremiumSubscriptionUpgradeChart` | Full premium comparison chart (rose bullets, check/x) | BAW subscription card, brand | REUSE. |
| `premiumChartTable` (`PremiumChartBenefitRow`, `BRAND_GRAY`, `CHART_BORDER`) | Row primitives | upgrade chart | **GENERALISE**. Good basis for an included/excluded benefits grid in the rewards console. |
| `PremiumRewardsMarketingList` | Marketing list | membership, brand member | REUSE. |

### 3f. PSA (`src/components/psa/`)
`PsaAssistantWidget` (global), `PsaAvatarTrigger`, `PsaStandingHologram`, `PsaAvatarImageCrossfade`, `PsaChatPanel`, `resolvePsaAvatarExpression`, `usePsaIdleExpressionCycle`. **REUSE.** For empty states, use `PsaAvatarImageCrossfade` with a specific expression (e.g. `sorry`, `curator`) instead of new art. Do not fork the chat.

### 3g. Desktop perspective panels
| Component | Path | Verdict |
|---|---|---|
| `DesktopPenthouseSuiteScene` + `PenthouseSuiteDashboard` | `src/components/desktop-account/` | **REUSE**. It already has 12 panel slots, including myOrders, rewardsCollection, and accountSettings. New pages link from these panels. |
| `DesktopPerspectivePanelAnchor` | `src/components/desktop-shared/` | **REUSE** (4 users). |
| `PerspectivePanel*` | `src/components/perspective-panel/` | REUSE through the anchor. The debug overlays are dev-only. |
| `RewardsRoomCertificationWall` | `src/components/desktop-rewards/` | REUSE. |
| `acrylicGlass.css` | `src/components/desktop-shared/` | **REUSE** for frosted/acrylic surfaces on new cards. |

### 3h. Mobile mansion (`src/components/mobile-mansion/`)
`MobileMansionLayout`, `MansionBackground`, `MobilePageHeader`, `MobileBottomNav`, `GlassPanel`, `GlassSection`, `GlassCard`, `GlassButton`, `GlassListItem`, `GlassModal`, `PlaceholderSlot`. Used only by the parallel `/mobile/*` prototype routes (`src/routes/MobileMansionRoutes.tsx`), which run on a broken background with Playfair Display serif typography and PlaceholderSlots. **DO NOT USE.** The visual grammar differs from the production account pages (1.3px black border, white/60 card). At most, borrow `GlassListItem` styling ideas.

### 3i. Design system (`src/design-system/`, FDS)
Exports: `GlassSurface, GlassCard, GlassPanel, GlassWindow, GlassDrawer, GlassNavigation, GlassModal, GlassSidebar, GlassTooltip, GlassBadge, GlassChip`; buttons `FdsButton, PrimaryButton, SecondaryButton, GhostButton, GlassButton, LuxuryButton, IconButton, FloatingButton, LoadingButton, DisabledButton`; cards `FdsCard, StandardCard, LuxuryCard, GlassStyleCard, ProductCard, CampaignCard, AnalyticsCard, FeatureCard, DashboardCard`; panels `FdsPanel, FloatingAcrylicPanel, DesktopPanel, LobbyPanel, DashboardPanel, LuxuryModalPanel, DrawerPanel, InfoPanel, NotificationPanel, ContentPanel`; forms `FdsField, FdsLabel, FdsInput, FdsTextarea, FdsSelect`; `FdsIcon`; layouts `FdsLayout, DesktopLayout, MobileLayout, FullScreenLayout, SplitLayout, DashboardLayout, MarketingLayout, LandingLayout, ImmersiveLayout`; `FdsText`.
**No account, orders, wishlist, or admin (non-studio) page imports FDS.** The only importers are `src/cinematic` and `src/studio-os-core`. **DO NOT USE for v2 pages.** Adopting it would visibly redesign them. Using its **tokens** (CSS variables) is fine; see section 4.

### 3j. Motion (`src/motion`, FSMS)
`CrystalTitle, CrystalSubtitle, CrystalLogo, LightSweep, SparkleSystem, RevealMask, FadeSequence, GlassOverlay, TransitionLayer, SceneIntro/Outro, SectionDivider, LogoReveal, CampaignTitle, ChapterTitle, FloatingGlassPanel`, plus `useReducedMotion`. Used only by `src/cinematic`. **Selective REUSE:** `LightSweep` or `SparkleSystem` on a reward unlock or collectible phase3 moment, and `useReducedMotion` everywhere. Not for page chrome.

### 3k. Stage lists / timelines
| Source | What | Verdict |
|---|---|---|
| `src/utils/orderTracking.ts` | `ORDER_TRACKING_STAGE_LABELS` (9 stages), `getOrderTrackingStageFromOrder`, `orderTrackingStageRowIsCurrent`, `orderTrackingDeliveredRowIsCurrent`, carriers, `getCarrierTrackingUrl`, `appendOrderTrackingClientNotification`, pulsate keyframes | **REUSE** as the logic layer. It is already used by orders and admin revenue. |
| concierge `trackingStages` (line 3014; name plus description) and the expandable stage rows (around lines 4627 and 5640, using `renderIconBox`) | Visual timeline, inline in a 6,504-line page | **EXTRACT** into `OrderStageTimeline` (stage rows, progress, icon boxes). It duplicates the labels in `ORDER_TRACKING_STAGE_LABELS` with different wording (CONFIRMED vs ORDER CONFIRMED), so pick one source. Use it for customer order detail and admin order detail. |
| `src/pages/orders/page.tsx` (4,140 lines) | Order list rows, thumbnails, payment and ship icons | **EXTRACT** `OrderRow` and `OrderSummaryBlock` for admin reuse. |

### 3l. Alert row typography (CORE.md canon, `motherboard/CORE.md:26`)
Three stacked lines: (1) title in **black, Covered By Your Grace, about 14px, uppercase**; (2) body in **#808080, Futura PT Demi, about 10px, uppercase**; (3) action link in **#EB1C24, Futura PT Medium, about 10px, uppercase**. Implemented inline in `src/pages/account/notifications/page.tsx` (around line 1170). There is no shared component. **EXTRACT** an `AlertRow` and reuse it in customer alerts, admin customer detail ("alerts sent"), and `BrandAlertsPanel` previews.

---

## 4. Typography & tokens

| Font | Defined where | File present? |
|---|---|---|
| Futura PT Book | `src/index.css:6` `@font-face` → `/assets/Futura%20PT%20Book.ttf` | Yes: `public/assets/Futura PT Book.ttf` |
| Futura PT Medium | `src/index.css:107` → `/assets/Futura%20PT%20Medium.ttf` | Yes: `public/assets/Futura PT Medium.ttf` (also `api/_lib/fonts/FuturaPTMedium.ttf` for the server) |
| Futura PT Demi | `src/index.css:150` → `/assets/fonnts.com-Futura_PT_Demi.otf` | Yes |
| Bohemy | `src/index.css:159` → `/assets/Bohemy.otf` | Yes: `public/assets/Bohemy.otf` and `Bohemy.ttf`. Used by the BAW calendar month labels and `SlayChallengeBohemySubhead`. |
| Covered By Your Grace | Google Fonts: `src/index.css:3` `@import` (display=block), `index.html:10` `<link>` (display=swap), and a `Covered By Your Grace Preload` `@font-face` pointing at a gstatic woff2 (`index.css:677`) | No local web copy. A local `api/_lib/fonts/CoveredByYourGrace.ttf` exists for server PDF and email only. |

There is **no `public/fonts/` directory**; all web fonts live in `public/assets/`. Copies also exist under `dist/`, `canonical-backup/`, and `site00-standalone/`.

**FDS tokens** (`src/design-system/colors/brand.ts`, `styles/fds.css:9-36,79-82`):
| Token | Value | Matches brand? |
|---|---|---|
| `primaryRed` / `--fds-brand-primary-red` | `#EB1C24` | **Yes** |
| `softGray` / `--fds-brand-soft-gray` | `#808080` | **Yes** |
| `pureWhite` | `#FFFFFF` | Yes |
| `black` / `--fds-color-secondary`, `--fds-color-text-primary` | `#1A1A1A` | Close, but production pages use pure `#000` (1.3px black borders). |
| `chromeSilver` | `rgba(255,255,255,0.65)` | A translucent white, not a real chrome or silver gradient. |
| `crystalGlass` | `rgba(255,255,255,0.72)` | Frosted glass, OK. |
| `luxuryMarble` | `url('/assets/marble-half.png')` | Yes, the canonical marble. |
| `grayLight` / `grayMuted` | `#B0B0B0` / `#C8C8C8` | Supporting neutrals. |
| hover / pressed / focus | `#C91820` / `#A8141A` / `rgba(235,28,36,.35)` | Red derivatives. |
| `--fds-font-book/medium/demi/accent` | Futura PT Book, Medium, Demi; Covered By Your Grace | **Bohemy has no token.** |

`src/constants/mobileMansionTokens.ts` repeats the same palette (`#EB1C24`, `#808080`) but sets `serif: "Playfair Display"`. That is **off-brand**, and Playfair is not loaded.

**Recommendation:** New v2 pages should keep the production inline conventions: Futura PT Medium 11px uppercase red actions, `#808080` labels, 1.3px black border, `rgba(255,255,255,0.6)` plus blur card, marble-half background. Where a constant is needed, reference the `--fds-brand-*` CSS variables. Do not import FDS components.
