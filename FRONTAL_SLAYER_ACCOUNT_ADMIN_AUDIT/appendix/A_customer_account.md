# A — Customer Account Forensic Audit (FRONTAL SLAYER, /home/user/fsbw)

Scope: /account hub, concierge, alerts, consult-offer, orders (+ review), reviews, shipping, payment, settings, load-card, wishlist (+ lists/shared), sign-in returnTo, /mobile/profile + /mobile/concierge. Rewards/membership/collectibles/referrals/affiliate are out of scope (other auditor).
Method: static read only. No builds, no network, no Supabase. All claims cite `file:line`.

Key systemic context (applies to every page below):

- **Auth guard** `src/components/AccountRouteGuard.tsx`: every account route has its own guard instance (`src/App.tsx:3416-3548`), `recoveryDone` starts `false` on every mount (`AccountRouteGuard.tsx:42-43`), so **every navigation between account pages re-runs `syncAllFromApi()`** (profile + orders + cart + wishlist; `AccountRouteGuard.tsx:95`, `src/utils/syncFromApi.ts:260-265`) and shows a "Loading..." screen (`AccountRouteGuard.tsx:132-138`). If Supabase has no session, it falls back to the localStorage `isSignedIn` flag and lets the user in (`AccountRouteGuard.tsx:78-86, 141-143`).
- **Server sync overwrites local state.** `syncOrdersFromApi` replaces `userOrders_${email}` wholesale with `GET /api/orders` (`src/utils/syncFromApi.ts:164-181`). `syncProfileFromApi` spreads server fields over the local `currentUser` (`syncFromApi.ts:95-102`) and preserves only names, birthday, image, socials and tier fields when the server value is empty (`syncFromApi.ts:105-120`). `savedAddresses`, `defaultAddress`, `savedPaymentMethods`, vouchers and similar fields are not in that preserve list.
- **Orders cannot be written by clients.** `PUT /api/orders` returns 403 (`api/orders.ts:20-25`). The only server order writers are the Stripe webhook, which creates a **generic** record (`productName: 'STRIPE CHECKOUT'`, `status: 'PAID'`, no line items; `api/_lib/recordProductOrderFromPaymentIntent.ts:58-73`), and admin form approve/decline (`api/_lib/pendingQueueHandlers.ts:205-259`, which sets CONFIRMED or CANCELED). The rich order that checkout writes to localStorage (`src/pages/checkout/page.tsx:2706-2800`) is never pushed: `pushLocalUserOrdersAfterCheckout` only patches the profile (`src/utils/checkoutOrderServerSync.ts:8-25`). The App-level `putOrders` push (`src/utils/pushCartWishlistToCloud.ts:70-88`, triggered on `ordersUpdated` at `src/App.tsx:1119-1121`) always fails with 403, and the failure is swallowed.
- **Privileged profile fields are stripped server-side** (`api/_lib/profilePrivilegedFields.ts:2-47`): giftCardBalance, voucherList/History, digitalCashHistory, loyaltyPoints, tiers, subscription and role. Client code that "credits" balances or vouchers is therefore local-only.
- **Founder-only mock data.** `isMockDataAccount` is true only for `kateenaarmstrong@gmail.com` (`src/utils/adminAuth.ts:372-375, 492-496`). That account sees seeded or mock orders, wishlist, reviews, voucher and history data unless "VIEW AS CLIENT" is toggled. **When the founder QAs these pages on her own account, most of what she sees is fake.**

---

## 1) Account navigation model (as-is)

There is **no shared account layout, tab bar or nav component**. Every page hand-copies a "NAV BAR CONTAINER" (a translucent bordered bar with back, breadcrumb, cart icon and hamburger) plus a full SHOP/TOOLS/BRAND mobile menu panel (`ShopMobileMenuShopTab`, `ShopMobileMenuToolsTab`, `BrandMenuLinks`, `SocialMenuIcons`). Movement between account pages works only through:

- (a) hub cards on `/account`
- (b) the breadcrumb word `ACCOUNT >`, which links to `/account` on most child pages
- (c) back arrows, which are inconsistent: `navigate(-1)` on some pages, a hardcoded `navigate('/account')` on others, and `/build-a-wig` on Wishlist
- (d) in-page buttons (VIEW ORDERS, GO TO CONCIERGE, LOAD GIFT CARD)
- (e) the header account icon and heart icon, visible only while the hamburger menu is open

```
/sign-in?returnTo=<path+search>  (hash dropped: src/utils/signInReturnTo.ts:28-31)
/account  [ACCOUNT > PROFILE]  (tablet/desktop ≥768px → /desktop/account via AccountHubRedirect; signInReturnTo.ts:21, desktopCommerceRoutes.ts:14-19)
 ├─ profile card: CHANGE PHOTO | RESET, VIEW AS CLIENT/ADMIN (founder), ADMIN: FOUNDER → /admin/dashboard
 │    VOUCHERS: n AVAILABLE (popup) · SLAY TICKETS (popup) · DIGITAL CASH (popup) · LOAD GIFT CARD → /account/load-card [ACCOUNT > BALANCE]
 ├─ CONCIERGE (only if subscriptionTier != null; page.tsx:1147-1155) → /account/concierge [ACCOUNT > CONCIERGE]
 ├─ ALERTS → /account/alerts [ACCOUNT > ALERTS]   (/account/notifications → redirect)
 │     └─ (legacy, no inbound link) /account/consult-offer?id=  [no nav bar]
 ├─ ORDERS → /account/orders [ACCOUNT > ORDERS]   (/orders → redirect)
 │     ├─ LEAVE A REVIEW → /account/orders/:orderId/review [ORDER > REVIEW]
 │     └─ CLICK HERE TO TRACK / GO TO CONCIERGE → /account/concierge?orderId=…#order-tracking
 ├─ REWARDS → /account/rewards (out of scope)
 ├─ COLLECTIBLES → /account/collectibles (out of scope)
 ├─ SLAY CAM → /slay-cam (leaves account area)
 ├─ REVIEWS → /account/reviews [ACCOUNT > REVIEWS]
 ├─ AFFILIATE, REFERRALS (out of scope)
 ├─ PAYMENT METHOD → /account/payment [ACCOUNT > PAYMENT]
 ├─ SHIPPING ADDRESS → /account/shipping [ACCOUNT > SHIPPING]
 ├─ SETTINGS → /account/settings [ACCOUNT > SETTINGS]  (Help Center → /brand/faq, /brand/contact, /brand/terms)
 ├─ TAKE/REPLAY THE MANSION TOUR (TutorialOsAccountEntry)
 └─ SIGN OUT (confirm modal)
Header heart → /wishlist [ACCOUNT > WISHLIST] → VIEW LISTS → /wishlist/lists [WISHLIST > LISTS] → /wishlist/lists/:listId [LISTS > <NAME>]
Public: /wishlist/shared/:token [SHARED WISHLIST]
Parallel shells: /mobile/profile, /mobile/concierge (placeholder pages, MobileBottomNav only)
```

Card labels and subtitles: `src/pages/account/page.tsx:1141-1186`. Breadcrumbs: account/page.tsx:1679-1684, concierge:3352-3357, notifications:914-919, orders:2139-2144, reviews:667-668, shipping:586-587, payment:491-492, settings:716-717, load-card:615-620, wishlist:590-595, wishlist/lists:899-910, leave-review:458-461.

Inconsistencies:
- Back button targets differ: hub uses `navigate(-1)` (account/page.tsx:1637). Alerts, reviews, shipping, payment and settings use `navigate('/account')` (notifications:811-813, reviews:385, shipping:142). Wishlist goes to `/build-a-wig` (wishlist/page.tsx:544).
- Sign-out is implemented four different ways (see §3).

---

## 2) Per-page dossiers

### 2.1 `/account` — Account hub ("ACCOUNT > PROFILE")
- **Files:** `src/pages/account/page.tsx` (2805 lines), `src/components/AccountHubRedirect.tsx`, `components/account/DigitalCashHistoryPopup`, `SlayTicketHistoryPopup`, `ConfirmationModal`, `tutorial-os/components/TutorialOsAccountEntry.tsx`.
- **Shell:** marble fixed bg (1588-1598), bg-white/60 backdrop-blur cards with 1.3px black border (1847-1858, 2172-2185). Canon-compliant.
- **Sections and modals:** profile card, 12 nav cards, tour entry, SIGN OUT, sign-out confirm, photo status popup (2290+), reset confirm (2370+), crop modal (2460+), digital-cash history popup (2605+), voucher history popup (2630+), slay-ticket popup, enlarged photo (2770+).
- **Data:** localStorage `currentUser`, `isSignedIn`, `profileImage`, `registeredUsers`, `cartCount`, `userOrders_${email}`, per-user `selectedCurrency` and animation keys, `FOUNDER_ACCOUNT_VIEW_AS_CLIENT_KEY`, many badge keys (`alertsPageViewed_*`, `lastKnownTier_*`, `conciergeOrderSeen_*`, `shippingAddressAlert_*`, `settingsAlert_*`; 957-1113). APIs: `syncAllFromApi` on mount (147-171), `POST /api/profile-image` (1527), `PATCH /api/profile` via retry queue (1550).
- **Real vs mock:**
  - Founder sees hardcoded `MOCK_DIGITAL_CASH_HISTORY` / `MOCK_VOUCHER_HISTORY` (174-196, used at 2610 and 2687) and seeded vouchers (386-401).
  - **Non-mock users always have their vouchers wiped to 0 on mount**, even ones from the server (403-408: "clear any that came from backend/default").
  - Tier "welcome discount" credits digital cash **client-side into localStorage** (615-674). The server strips `giftCardBalance` (profilePrivilegedFields.ts:21-22), so the displayed balance can be inflated until the next sync.
  - Admin emails get `giftCardBalance` forced to ≥80 locally (539-584).
- **States:**
  - Loading: comes from the guard.
  - Empty: voucher popup shows "NONE" (2721).
  - Error: photo "PHOTO SAVE FAILED." (1563). There is no profile-load error state.
- **Controls:**
  - Nav cards: WORKING (2176-2179).
  - CHANGE PHOTO + crop: PARTIAL. Upload goes to `/api/profile-image`. The fallback path sends base64 through PATCH, which the server nulls (`api/profile.ts:74`), and then shows "PHOTO SAVED." (1550-1553). That is a fake success, and it clears the server image.
  - RESET photo: BROKEN in Supabase mode. It writes localStorage only (733-760). The server image remains and is restored on the next sync (`syncFromApi.ts:139-141`).
  - VIEW AS CLIENT (founder): WORKING (1929-1955).
  - Voucher, slay-ticket and cash popups: PARTIAL, because the data is local or mock.
  - LOAD GIFT CARD link: WORKING navigation (2152).
  - SIGN OUT: WORKING. It flushes the profile queue, swaps cart/wishlist and does a Supabase signOut (705-724).
- **Mobile:** CHANGE/RESET are 9px text spans (1909-1911). Header icon buttons use `'15px !important'` inline style strings, which browsers ignore (1612, 1624, 1639). Crop image is fixed at 300px (2559).
- **Tests:** e2e smoke "loads" only (`e2e/helpers/routes.ts:14-20`, `e2e/standard-user.spec.ts:11-18`), skipped without env creds (`e2e/auth.standard.setup.ts:9-13`).
- **Maturity:** VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE.

### 2.2 `/account/concierge` — Concierge ("ACCOUNT > CONCIERGE")
- **Files:** `src/pages/account/concierge/page.tsx` (6504 lines). Children: `components/account/ConciergeSectionHeader`, `SlayQuestRewardAsset`, `SlayChallengeCollectiblesPreview`, `SlayChallengeRoseBullet`. Utils: `utils/orderTracking.ts`, `utils/digitalOrderFulfillment.ts`, `constants/psaFeatureGates`, `config/slayChallengeTiers`.
- **Access:** the route is open to every signed-in user. The hub card only shows for subscribers (account/page.tsx:1147-1155). Sections self-gate with `memberHasPsaFeature` (1724-1728) and `showSlayAndSpecialOffer` (6/12-month only, 1728).
- **Section map (in render order):**
  1. **PRIORITY MESSAGES** (3519-3747): order-related Y/N, order select, urgent Y/N, textarea, SUBMIT. Calls `POST /api/client/priority-messages` (`utils/api.ts:711-731`, handler 3081-3135). Real. On a "migration" hint it falls back to localStorage `adminPriorityMessages` and still shows SUCCESS (3105-3123). **No replies or thread view for the customer** (no reply rendering; grep finds none). Non-tier users see an UPGRADE SUBSCRIPTION CTA → /account/rewards (3555-3567).
  2. **SPECIAL OFFER** (3749-3880; 6/12-month only, only while `expiresAt > now`): config from `GET /api/special-offer-config` (1464). "Claim" adds a cart line with a **client-set price** (`price: specialOffer.discountedPrice`, 1606-1676). No feedback toast. Silent no-op at max qty (1641).
  3. **ORDER TRACKING** (3882-6002): dropdown of `activeOrders` from **localStorage only** (1748-2238). 9-stage pipeline (3014-3024). Stage progress and **stage dates/times are computed from `order.date` + hardcoded day offsets** (2470-2626). Displayed times are fabricated (`setHours(9 + stageIndex%12 …) // Vary time slightly`, 3003). Offsets are internally inconsistent: stage 2 starts at +7, stage 3 at +33, stages 4 and 5 both at +40 (2590-2608). Tracking number shown when present (2688-2689, 4021). "Sign order form" CTA → /tools/order-form (5602). VIEW ORDERS → /account/orders (5989).
  4. **SLAY CHALLENGE** (6004-6130; 6/12-month): START CHALLENGE writes **global, non-per-user** localStorage keys `slayChallengeSelectedCycle/Tier1Progress/Tier2Progress` (1338-1353). Details are for the rewards auditor.
  5. **SLAY QUESTS** (6132-6154): `SlayQuestsSection` (698+). Progress is hardcoded in `SLAY_QUEST_META` (`progressCurrent: 5`, …; 385-410). Every user sees the same progress, so this is PLACEHOLDER.
  6. **FREE GIFT** (6156-6297): Melt Band / Wig Brush, then SAVE SELECTION. Writes localStorage `selectedFreeGift` + `adminFreeGifts` (3158-3194). **Nothing else reads these keys** (grep finds no consumer). The modal claims "YOU'LL RECEIVE A … WITH YOUR NEXT PURCHASE." That is a fake success.
  7. **BIRTHDAY GIFT** (6299-6446): $20 gift card / 200 points, then SAVE SELECTION. Writes localStorage `selectedBirthdayGift`, `adminBirthdayGifts`, `birthdayGiftClaimed` (3196-3249). No consumer. **Eligibility is computed but unused** (`_eligibleForBirthdayGift`, 1703-1707), so it is shown to everyone. Fake success.
- **Modals:** SUCCESS, SELECTION SAVED ×2, UPGRADE YOUR SUBSCRIPTION (6451-6497).
- **Mock:** founder gets seeded `test-order-*` orders with fake tracking numbers `1Z888AA…`, `1Z999AA…` (1761-2010).
- **States:**
  - Empty: "NO ACTIVE ORDERS TO TRACK." (5978-5986).
  - Loading/error: none, apart from console.error.
- **Mobile:** 22 occurrences of 8–9px font sizes. Deeply nested expanded stage content.
- **Menu sign-out:** `clearAppAuth()` with no Supabase signOut and no confirm (3069-3075).
- **Tests:** e2e smoke load only.
- **Maturity:** PARTIALLY_IMPLEMENTED.

### 2.3 `/account/alerts` (+ `/account/notifications` redirect) — Alerts ("ACCOUNT > ALERTS")
- **Files:** `src/pages/account/notifications/page.tsx` (1372). Also exports `getAccountNotifications` / `mergeAccountNotifications`, which the hub and `utils/orderTracking.ts:15` use.
- **Shell:** marble + glass card, minHeight 560 (1069).
- **Tabs:** NEW / SEEN (1072-1108).
- **Data:**
  - System alerts are synthesized client-side from `currentUser` + `userOrders_*` (214-520).
  - Stored list lives in localStorage (key from `getNotificationsStorageKeyForUserEmail`).
  - Admin-sent alerts come from `GET /api/notifications` (read-only endpoint; `api/notifications.ts:12`) and are merged (570-583).
  - The founder gets 12 mock voucher-expiring alerts plus a fake "$50.00 USD HAS BEEN ADDED" deposit (356-391).
- **Controls:**
  - Row click / action link: WORKING navigation (816-826, 1259-1266).
  - **Archive (eye icon): BROKEN for system alerts.** It sets `isRead` locally (1319-1323), but `mergeAccountNotifications` forces `isRead:false` on every `acc_*` / `order_received_*` id (557-567) and runs on every focus/storage event (737-744). The alert returns to NEW.
  - **Delete (X): BROKEN.** It filters locally (1347-1348). Managed alerts are re-added on the next merge, and admin alerts are re-added from the API.
  - Read state never goes to the server (the API is GET only).
- **States:** empty "NO NEW/SEEN NOTIFICATIONS" (1112-1124). No loading or error state.
- **Mobile:** single-line `nowrap` + ellipsis truncates messages (1248). Nested scroll at maxHeight 467 (1110).
- **Tests:** none.
- **Maturity:** PARTIALLY_IMPLEMENTED.

### 2.4 `/account/consult-offer?id=` — Consult offer (no nav bar or breadcrumb)
- **Files:** `src/pages/account/consult-offer/page.tsx` (175).
- **Data:** `GET /api/consult-quote?id=` (`utils/api.ts:1889-1894`).
- **States:** loading "LOADING…" (93-99); error "MISSING OFFER ID" / "OFFER NOT FOUND" plus BACK TO ALERTS (101-109).
- **Shell:** off-canon. Bare marble without size/repeat, `bg-white/90`, `max-w-md`, no nav bar (113-117).
- **Controls:**
  - COPY CODE: PARTIAL. Clipboard write with no feedback; errors swallowed (82-88).
  - **"ADD TO BAG (START BUILD)": DISCONNECTED.** It does not add to the bag. It stores `sessionStorage.bawConsultQuoteId` (75-79), **which nothing reads** (grep finds only this file), and navigates to the PDP.
  - LIVE TRY-ON: UNVERIFIED.
  - CLOSE → /account/alerts: WORKING.
- **Reachability:** no code links to `/account/consult-offer` (grep finds only `App.tsx:3494` and a legacy parser at `utils/consultOfferFromQuote.ts:87`). Orders now uses `ConsultOfferClaimModal` (orders/page.tsx:4127-4135).
- **Tests:** none.
- **Maturity:** DEPRECATED (reachable only by stale URL).

### 2.5 `/account/orders` (+ `/orders` redirect) — Orders ("ACCOUNT > ORDERS")
- **Files:** `src/pages/orders/page.tsx` (4140). Uses `utils/orderTracking.ts`, `digitalOrderFulfillment.ts`, `consultOrderLifecycle.ts`, `userOrdersBuckets.ts`, `ConsultOfferClaimModal`.
- **Shell:** marble + glass card (2308). Sections: ACTIVE ORDERS (2341) and ARCHIVED ORDERS (3284). The two render blocks are near-duplicates (~2330-3260 vs 3280-4030).
- **Expanded order shows:** ORDER SUMMARY (date, number, total), SHIPPING, COMPLETION TIMELINE, TRACKING NUMBER + CARRIER with carrier URL (2579-2610, 3027), ORDER STATUS (digital 3-stage, 2630-2712), PAYMENT, REWARDS (2871), product thumbnails/options lines (BAW config lines built from `options`, ~374).
- **PAYMENT block:** falls back to the user's **current default card** when the order has no payment method recorded, and to `****` otherwise (2727-2745). It can show the wrong card. There is no payment history or receipt.
- **Data:** **localStorage `userOrders_${email}` only** (920-985, 1288-1381). No direct API call. Overwritten by the guard's server sync (see systemic notes).
- **Mock:** founder gets `kateenaMock*` orders (990-1230, 1237-1241). The founder demo consult order is merged into **real** storage (531-560, 937-944). Legacy mock arrays are kept "for reference" (619-917).
- **Client-side lifecycle mutations (never persisted):**
  - consult PLACED→PROCESSING after 2h, COMPLETE after 72h (1638-1647; `consultOrderLifecycle.ts:47-79`)
  - **auto-CANCEL of PLACED orders after 24h if the auth form is unsigned** (1649-1703). This is a paid order canceled in the UI only, with no refund and no server effect.
  - auto-archive DELIVERED/COMPLETE after 24h (1708-1770)
- **Controls:**
  - Expand/collapse: WORKING.
  - Product link: WORKING (2430).
  - CLICK HERE TO SIGN ORDER FORM → /tools/order-form: WORKING navigation (2983-3012).
  - CLICK HERE TO TRACK: PARTIAL. It gates on `membershipType === 'PREMIUM'` (3053-3062), unlike the hub, which uses `getEffectiveSubscriptionTier`.
  - "TRACKING LOADING": a static label shown for any non-PLACED/CANCELED/COMPLETE status, including server `PAID` (3085-3088). It is a permanent fake loading state.
  - VIEW OFFER modal: WORKING via `getConsultQuote` (1950-1970).
  - **LEAVE A REVIEW: UNREACHABLE for real customers.** It requires `status==='DELIVERED'` and `deliveredAt` ≥3 days (4064-4084), and no server path ever sets DELIVERED or `deliveredAt`.
  - GO TO CONCIERGE: WORKING (4096-4106).
  - SIGN OUT: confirm modal (4117-4125).
- **States:** empty "YOU DON'T HAVE ANY ACTIVE ORDERS. LET'S GO SHOPPING!" (2902-2910). No loading or error.
- **Mobile:** 50ms auto-scroll ticker intervals (1541-1610), 1s re-render tick (1629-1636), nested scroll maxHeight 265 (2913), 15 occurrences of 8–9px fonts, "CLICK HERE" 10px spans.
- **Tests:** e2e smoke load only.
- **Maturity:** VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE.

### 2.6 `/account/orders/:orderId/review` — Leave review ("ORDER > REVIEW")
- **Files:** `src/pages/account/reviews/leave-review-order/page.tsx` (961).
- **Data:** order from `location.state` or localStorage `userOrders_*` (68, 108-122). Submit → `POST /api/client/submissions` (kind review; 263-275), then `syncProfileFromApi`.
- **Controls:** stars, subject, text, photo/video upload, SUBMIT, prev/next item (652-921).
- **Problems:**
  - SUBMIT marks the item submitted **before** the API call (222).
  - On API failure it silently falls back to a local "pending" review (276-290). That review is never sent and is hidden on /account/reviews because pending rows are filtered.
  - **Subject is required (212) but not sent to the API** (263-272).
  - Photo/video are sent as base64 data URLs.
  - Sets `reviewsNewApproved` = true on submit (306), so a "new approved review" badge fires for a pending review. Fake.
  - The route does not re-check eligibility (DELIVERED + 3 days), so any stored order can be reviewed by URL.
- **States:** "no order" shell (352+).
- **Tests:** none.
- **Maturity:** PARTIALLY_IMPLEMENTED.

### 2.7 `/account/reviews` — My Reviews ("ACCOUNT > REVIEWS")
- **Files:** `src/pages/account/reviews/page.tsx` (922), `components/account/ReviewSupplementalContentModal` (uses `postClientSubmission`; 139).
- **Tabs:** SHOP / TOOLS (755-790). Load more / show less (830-891).
- **Data:** localStorage `userSubmittedReviews_${email}`, which is hydrated from the server profile (`clientPendingServerSync.ts:16-19`). Pending rows are filtered out (325-329).
- **Mock:** founder sees hardcoded shop/tool reviews (42-200, 261-270, 386-387).
- **TOOLS tab is always empty for real users** (`toolReviewsList = showMockReviews ? mockToolReviews : []`, 387).
- **Controls:**
  - Product link: WORKING (495).
  - Add/edit supplemental media: WORKING via the API (454; modal 134-182).
  - Tabs: WORKING.
- **States:** empty for both tabs (~796-830).
- **Menu sign-out:** `clearAppAuth` only (377).
- **Tests:** none.
- **Maturity:** PARTIALLY_IMPLEMENTED.

### 2.8 `/account/shipping` — Shipping ("ACCOUNT > SHIPPING")
- **Files:** `src/pages/account/shipping/page.tsx` (1066, imported eagerly at `App.tsx:690`).
- **Form:** first/last name, address, apt, city, state, zip, country (US/CA/GB/AU/OTHER), phone, email, save-as-default (714-1000).
- **Data:** **localStorage only** (`currentUser.savedAddresses/defaultAddress`, `registeredUsers`; 144-310). No `patchProfile` import. `api/profile.ts:152-154` supports `saved_addresses`, but **nothing sends it** (grep finds no patch of savedAddresses anywhere in src).
- **Consequence:** in Supabase mode `syncProfileFromApi` spreads server `savedAddresses: null` over local (`syncFromApi.ts:95-102`, `profileMapping.ts:29-31`). **Saved addresses vanish on the next account-route mount.**
- **Controls:**
  - ADD ADDRESS / SAVE / CANCEL / SET DEFAULT / REMOVE (with confirm): PARTIAL to BROKEN (local only, wiped by sync).
  - No address validation or verification service.
- **States:** empty → shows the add form (198-206).
- **Menu sign-out:** `clearAppAuth` only (136).
- **Tests:** none.
- **Maturity:** VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE.

### 2.9 `/account/payment` — Payment ("ACCOUNT > PAYMENT")
- **Files:** `src/pages/account/payment/page.tsx` (817).
- **Form:** CARDHOLDER, CARD NUMBER, EXPIRATION, CVV, BILLING ZIP (607-670), set default, SAVE/CANCEL, remove with confirm.
- **Data:** localStorage only (`currentUser.savedPaymentMethods/defaultPaymentMethod`, `savedCards_${email}`; 116-275).
- **Behavior:**
  - **Collects raw PAN and CVV in plain React inputs**, outside Stripe Elements.
  - Stores last4/brand only (245-256). There is no tokenization, no Stripe SetupIntent and no Luhn or expiry validation (only presence checks at 218-241).
  - The "saved card" cannot be charged. It is cosmetic.
  - Expiring-card badge logic on the hub (1115-1138) depends on this local data.
- **Controls:** all PLACEHOLDER (fake save).
- **Tests:** none.
- **Maturity:** PLACEHOLDER (functionally), with a PCI-scope risk.

### 2.10 `/account/settings` — Settings ("ACCOUNT > SETTINGS")
- **Files:** `src/pages/account/settings/page.tsx` (1244).
- **Sections:** PERSONAL INFORMATION (first, last, birthday, phone, email read-only), PASSWORD (reset form), SOCIALS (5 platforms), NOTIFICATIONS (Newsletter, Alerts, Order Tracking, Animations), HELP CENTER (FAQ, Contact, Terms), DELETE ACCOUNT (805-1240).
- **Data:** `PATCH /api/profile` via `patchProfileWithRetryQueue` (186-245); Supabase auth for password (369-377); `DELETE /api/delete-account` (410).
- **Controls:**
  - Names and socials: WORKING. They persist through PATCH with a status message (318-327).
  - Phone: WORKING, but it PATCHes **on every keystroke** (863-866).
  - **Birthday: read-only for everyone except the founder** (851-853). Customers cannot set or fix it, and the birthday gift depends on it.
  - Email: read-only. No change-email or verification flow (875-882).
  - Password: WORKING for email/password accounts. Re-auth uses `signInWithPassword` (369). On success the form just closes silently (381-385). OAuth-only users: UNVERIFIED (likely "Current password is incorrect").
  - Notification toggles: PARTIAL. They persist through PATCH, but enforcement is weak. Alerts only suppresses the hub badge (account/page.tsx:1207-1213). Order Tracking is not checked by `api/admin/transactional-notify.ts` (grep finds no notification fields). Newsletter is not filtered server-side in `api/admin/newsletter-send.ts` (recipients come from the admin client).
  - Animations: WORKING, local per-user.
  - Help links: WORKING navigation.
  - **DELETE ACCOUNT: WORKING.** API deletes the auth user (`api/delete-account.ts:81`), with network-error copy and local cleanup (395-460).
- **Risk:** a mount-time background PATCH pushes the whole local form to the cloud 1.2s after load (250-259). Stale local values can overwrite the server.
- **Missing:** avatar (lives on the hub), hair preferences, privacy controls, data export.
- **Tests:** none.
- **Maturity:** FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT. The core edit, password and delete flows work, but there are gaps listed in §5.

### 2.11 `/account/load-card` — Load gift card ("ACCOUNT > BALANCE")
- **Files:** `src/pages/account/load-card/page.tsx` (1038). Reached from hub "LOAD GIFT CARD" (account/page.tsx:2152).
- **Form:** two barcode inputs XXXX-XXXX-XXXX, ADD TO BALANCE (989).
- **Behavior:**
  - **Codes are validated against `loadBrandPromoCodes()`, which reads localStorage** (`utils/adminBrandCodes.ts:22-31, 79-82`). The codes exist only on the admin's browser, so **real customers always get "INVALID CODE"**.
  - On "success", the balance is written to localStorage and PATCHed (403-406), but the **server strips `giftCardBalance`** (`profilePrivilegedFields.ts:21-22`).
  - The "repair" logic keeps `max(local, server)` (270-300), so a locally minted balance persists.
  - Use count is incremented in local storage only (`updateBrandPromoCode`, 73).
  - Processing is faked with `setTimeout` delays (459-486; constants 44-48).
- **Mock:** admin test balance ≥80 (45, 103-110).
- **Maturity:** BROKEN for customers, and an exploitable local-balance path. Server validation must be checked by the checkout auditor.

### 2.12 `/wishlist` — Wishlist ("ACCOUNT > WISHLIST")
- **Files:** `src/pages/wishlist/page.tsx` (1196), `AddToListModal`, `components/wishlist/*`, `WigLineStockPrice`.
- **Data:** localStorage `wishlistItems`. Pushed to `PUT /api/wishlist` by the App-level debounced push (`App.tsx:1109-1121`, `pushCartWishlistToCloud.ts:43`) and pulled by the guard sync.
- **Mock:** founder seeded with NOIR/BLANCO samples (151-195). These are then pushed to the cloud.
- **Controls:**
  - item link: WORKING (889)
  - EDIT IN BUILD-A-WIG: WORKING, UNVERIFIED round-trip (905)
  - qty ±: WORKING (975, 1018)
  - add / remove bag: WORKING (1044, 1077)
  - VIEW LISTS: WORKING (1113)
  - EMPTY WISHLIST with confirm: WORKING (1130)
  - stock banner: present (783)
  - back arrow goes to `/build-a-wig` (544), which is odd.
- **Tests:** e2e smoke load only.
- **Maturity:** FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT.

### 2.13 `/wishlist/lists`, `/wishlist/lists/:listId` — Lists ("WISHLIST > LISTS" / "LISTS > <NAME>")
- **Files:** `src/pages/wishlist/lists/page.tsx` (1552), `CreateNewListModal`, `RenameListModal`, `ShareListLinkModal`, `utils/wishlistListShare.ts`.
- **Data:** localStorage `userLists_${email}` only (`wishlistListShare.ts:38-56`). **Not synced to the server.**
- **Controls:**
  - create / rename / delete / expand / add-to-bag: WORKING locally.
  - SHARE: BROKEN for recipients (see 2.14).
  - A hardcoded Supabase storage image URL is present (69).
- **Maturity:** PARTIALLY_IMPLEMENTED.

### 2.14 `/wishlist/shared/:token` — Shared wishlist (public)
- **Files:** `src/pages/wishlist/shared/page.tsx` (584).
- **Data:** `resolveSharedListForViewer` reads a **localStorage registry** (`wishlistListShare.ts:21-35, 153-175`). The share link works only in the owner's own browser. Any other device shows "THIS SHARED LIST LINK IS INVALID OR HAS EXPIRED." (shared/page.tsx:345-357).
- **Maturity:** BROKEN (as a sharing feature).

### 2.15 `/sign-in` (account entry only)
- `signInHrefWithReturnTo` keeps pathname + search but **drops the hash** (`signInReturnTo.ts:28-31`), so `#order-tracking` and `#priority-messages` deep links are lost.
- Return path: `resolveReturnToAfterSignIn` (sign-in/page.tsx:189-190, 235-236, 251-252, 311-312). `/account` is rewritten to `/desktop/account` on ≥768px (signInReturnTo.ts:50-52).
- The sign-in header account and heart buttons go to `/sign-in` itself (477, 489).
- **Maturity (for account entry):** FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT. Not tested beyond the guest smoke load.

### 2.16 `/mobile/profile`, `/mobile/concierge`
- `src/pages/mobile/profile/page.tsx` (39) and `src/pages/mobile/concierge/page.tsx` (44) contain only `PlaceholderSlot` boxes ("PROFILE SLOT", "GLASS PANEL SLOT", "PRODUCT SHOWCASE SLOT"…). The settings icon button has no onClick (profile:18-20, concierge:19-21).
- No `AccountRouteGuard` (`src/routes/MobileMansionRoutes.tsx:48-55, 112-119`).
- Linked only from `MobileBottomNav` (`components/mobile-mansion/navigation/MobileBottomNav.tsx:37, 57`).
- Duplicates the account/concierge concept with no data.
- **Maturity:** PLACEHOLDER.

---

## 3) Dead / broken / fake controls

| Page | Control | Expected | Actual | Class | Evidence |
|---|---|---|---|---|---|
| /account | Photo upload fallback | Save photo to cloud | Base64 PATCH is nulled by the server, yet "PHOTO SAVED." is shown and the server image is cleared | BROKEN (fake success) | account/page.tsx:1548-1553; api/profile.ts:74 |
| /account | RESET photo | Reset avatar | localStorage only; server image comes back on next sync | BROKEN | account/page.tsx:733-760; syncFromApi.ts:139-141 |
| /account | VOUCHERS: n AVAILABLE | Show earned vouchers | Non-founder voucherList forced to [] on every mount | BROKEN | account/page.tsx:403-408 |
| /account | Tier welcome credit (auto) | Server-credited digital cash | Credited to localStorage; server strips the field | PARTIAL / fake | account/page.tsx:615-674; profilePrivilegedFields.ts:21-22 |
| /account | Digital cash / voucher history popups (founder) | Real history | Hardcoded MOCK arrays | PLACEHOLDER (founder) | account/page.tsx:174-196, 2610, 2687 |
| /account/concierge | FREE GIFT SAVE SELECTION | Gift fulfilled with next order | Writes `selectedFreeGift`/`adminFreeGifts` to localStorage; no consumer anywhere | DISCONNECTED (fake success) | concierge:3158-3194; grep finds no consumers |
| /account/concierge | BIRTHDAY GIFT SAVE SELECTION | Eligible-only claim, fulfilled | localStorage only, no consumer; eligibility unused; shown to all | DISCONNECTED (fake success) | concierge:3196-3249, 1703-1707 |
| /account/concierge | SLAY QUESTS progress | Per-user progress | Hardcoded `progressCurrent` | PLACEHOLDER | concierge:385-410 |
| /account/concierge | Order tracking stage dates/times | Real event timestamps | Synthesized from order date + offsets; times fabricated | PLACEHOLDER (fake data) | concierge:2908-3010, 3003, 2590-2608 |
| /account/concierge | SUBMIT MESSAGE (migration fallback) | Message reaches admin | Saved to the client's own localStorage `adminPriorityMessages` and shown as SUCCESS | PARTIAL (fake success in fallback) | concierge:3105-3123 |
| /account/concierge | Priority message replies | See the concierge reply | No reply or thread UI | MISSING | concierge (no reply rendering) |
| /account/concierge | Special offer claim | Add to bag with feedback | Adds a client-priced line; no feedback; silent at max qty | PARTIAL | concierge:1606-1676, 1641 |
| /account/concierge | Menu SIGN OUT | Sign out | `clearAppAuth()` only; Supabase session survives and the guard re-signs in; no confirm | BROKEN | concierge:3069-3075; adminAuth.ts:234-245 |
| /account/shipping, /payment, /reviews, /load-card | Menu SIGN OUT | Sign out | Same `clearAppAuth()`-only path | BROKEN | shipping:136; payment:141; reviews:377; load-card:368 |
| /account/alerts | Archive (eye) | Move to SEEN permanently | System alerts forced back to unread on next merge | BROKEN | notifications:1319-1323, 557-567, 737-744 |
| /account/alerts | Delete (X) | Remove alert | Re-added by account merge or API fetch | BROKEN | notifications:1347-1348, 570-583 |
| /account/consult-offer | ADD TO BAG (START BUILD) | Add offer unit to bag | Navigates to PDP; sets a sessionStorage key nobody reads | DISCONNECTED | consult-offer:72-80 |
| /account/consult-offer | COPY CODE | Copy with confirmation | Copies silently; errors swallowed | PARTIAL | consult-offer:82-88 |
| /account/orders | Auto-cancel unsigned PLACED after 24h | Server cancel + refund | UI-only status flip | BROKEN (dangerous) | orders:1649-1703 |
| /account/orders | "TRACKING LOADING" | Tracking appears | Static text for any unknown status (e.g. server PAID) | PLACEHOLDER | orders:3085-3088 |
| /account/orders | CLICK HERE TO TRACK | Premium → concierge | Gate uses `membershipType==='PREMIUM'`, unlike the hub | PARTIAL | orders:3053-3062 vs account/page.tsx:1143-1148 |
| /account/orders | LEAVE A REVIEW | Review delivered orders | Needs DELIVERED + `deliveredAt`, which the server never sets | UNREACHABLE | orders:4064-4084; api/_lib/pendingQueueHandlers.ts:205-259 |
| /account/orders | PAYMENT "ENDING IN" | Card used on the order | Falls back to the current default card or `****` | PARTIAL / misleading | orders:2727-2745 |
| /account/orders/:id/review | SUBMIT | Persist review | Optimistic; silent local fallback; subject dropped; "approved" badge set on submit | PARTIAL | leave-review:212, 222, 263-306 |
| /account/reviews | TOOLS tab | Tool reviews | Always empty for real users | PLACEHOLDER | reviews:387 |
| /account/shipping | SAVE / SET DEFAULT / REMOVE | Persist addresses | localStorage only; overwritten by server null on sync | BROKEN | shipping:144-310; syncFromApi.ts:95-102 |
| /account/payment | SAVE CARD | Tokenized saved card | Raw PAN/CVV inputs, last4 to localStorage, not chargeable | PLACEHOLDER (PCI risk) | payment:215-283, 607-670 |
| /account/settings | Birthday | Customer can set it | Read-only unless founder | PARTIAL | settings:851-853 |
| /account/settings | Order Tracking / Newsletter toggles | Suppress emails | Saved, but not enforced by transactional-notify or newsletter-send | PARTIAL | settings:1101-1110; api/admin/transactional-notify.ts; api/admin/newsletter-send.ts:71-90 |
| /account/settings | Password reset success | Confirmation | Form closes silently | PARTIAL | settings:381-385 |
| /account/load-card | ADD TO BALANCE | Redeem a real gift card | Codes come from admin localStorage, so customers get INVALID CODE; balance is local; setTimeout-faked progress | BROKEN | load-card:54-75, 459-486; adminBrandCodes.ts:22-31 |
| /wishlist/lists | SHARE | Shareable link | Registry is localStorage, so only the owner's browser resolves it | BROKEN | wishlistListShare.ts:21-35, 153-175 |
| /wishlist/shared/:token | View list | Recipient sees list | "INVALID OR HAS EXPIRED" on any other device | BROKEN | shared/page.tsx:345-357 |
| /mobile/profile, /mobile/concierge | Settings icon | Open settings | No onClick | PLACEHOLDER | mobile/profile/page.tsx:18-20; mobile/concierge/page.tsx:19-21 |
| All headers | `'15px !important'` inline styles | Size icon buttons | Invalid in React inline style, so ignored | (style bug) | account/page.tsx:1612,1624,1639; shipping:566-575 |

No `alert()` calls, no literal `onClick={() => {}}`, no "COMING SOON" strings and no TODOs were found in the in-scope account pages (grep).

---

## 4) Order lifecycle truth table

Status vocabularies found:

- **Physical pipeline statuses** (`utils/orderTracking.ts:177-188`, concierge:1741-1744): PLACED, CONFIRMED, PREPARING, SHIPPED_TO_HUB, IN_TRANSIT, PROCESSING, CUSTOMIZING, FINALIZING, SHIPPED, DELIVERED.
- **Stage labels** (`orderTracking.ts:37-47`): ORDER CONFIRMED, SOURCING + COLLECTING, CONSTRUCTING UNIT, MATERIALS SHIPPED, ARRIVED AT HUB, CLEANSING, CUSTOMIZING, FINALIZING, PACKAGE SHIPPED (+ DELIVERED row).
- **Digital** (`digitalOrderFulfillment.ts:17`): PLACED → PROCESSING → COMPLETE.
- **Others:** CANCELED/CANCELLED, COMPLETE, and server-only **PAID**.

| Status / stage | Who sets it | Server-persisted? | Customer sees it on their device? | Evidence |
|---|---|---|---|---|
| PAID | Stripe webhook | Yes | Yes after guard sync, but **unmapped**: stage 0, "TRACKING LOADING", product "STRIPE CHECKOUT" | recordProductOrderFromPaymentIntent.ts:58-73; orderTracking.ts:200-215; orders:3085 |
| PLACED / PREPARING (physical) | Checkout, client localStorage | No | Until the next guard sync replaces local orders with server orders | checkout/page.tsx:2800-2832; syncFromApi.ts:164-181 |
| CONFIRMED (from PLACED) | Admin form approval (server) | Yes | Yes | pendingQueueHandlers.ts:205-232 |
| CANCELED (form declined) | Admin decline (server) | Yes | Yes | pendingQueueHandlers.ts:234-259 |
| CANCELED (24h unsigned) | Orders page timer (client) | No | Local only; reverts on sync | orders:1649-1703 |
| Stage 0–8 progress % and dates | Computed from `order.date` + fixed day offsets | n/a | Fabricated | concierge:2470-2626, 2908-3010 |
| adminTrackingStageOverride, trackingNumber, carrier, stage notes, SHIPPED | Admin revenue page → `patchOrderInUserOrders` (**admin's localStorage**) | **No** | **No** (only the shipping email reaches the customer) | admin/revenue/page.tsx:705-740; orderTracking.ts:89-115 |
| DELIVERED / deliveredAt | No server writer | No | Never (except founder mock) | grep finds only mock/demo writers |
| Consult PLACED→PROCESSING (2h) → COMPLETE (72h) | Client timer | No | Local only | consultOrderLifecycle.ts:47-79; orders:1638-1647 |
| Consult COMPLETE on quote sent | Admin's browser localStorage | No | No | consultOrderLifecycle.ts:118-164; AdminMeetingsHub.tsx:1354 |
| Order tracking client alerts | `appendOrderTrackingClientNotification` (admin's localStorage) | No | No | orderTracking.ts:118-174 |

**Verdict.** Statuses are mostly **computed or mutated client-side** from timestamps and localStorage. The only server-driven transitions are PAID (webhook), CONFIRMED and CANCELED (admin form review).

What a customer on their own device can see:
- **Tracking number:** only if it exists in local storage, which the admin flow never delivers cross-device.
- **Order details:** the generic server record after sync.
- **Purchased BAW configuration:** only from the local checkout snapshot, until sync wipes it.
- **Payment history:** none; the per-order card is a fallback guess.
- **Contact support:** premium priority messages (one-way) and Settings → /brand/contact. There is no order-level "contact support".

---

## 5) Profile / settings capability matrix

| Capability | UI location | Persisted to server? | Status | Evidence |
|---|---|---|---|---|
| First/last name | Settings | Yes (PATCH /api/profile) | WORKING | settings:186-245, 285-327 |
| Phone | Settings | Yes (PATCH per keystroke) | WORKING (chatty) | settings:863-866 |
| Phone verification | — | — | MISSING | (none) |
| Email change / verification | Settings (read-only) | — | MISSING (confirm-email enforced at sign-in only) | settings:875-882; AccountRouteGuard.tsx:89 |
| Birthday | Settings (read-only for clients) | Yes for founder only | PARTIAL | settings:851-853 |
| Socials (5) | Settings | Yes | WORKING | settings:262-283 |
| Password change | Settings | Supabase auth | WORKING (email/password); OAuth UNVERIFIED | settings:350-389 |
| Avatar upload | Hub | Yes (/api/profile-image), with broken fallback | PARTIAL | account/page.tsx:1525-1556; api/profile-image.ts |
| Avatar reset | Hub | No | BROKEN | account/page.tsx:733-760 |
| Addresses | Shipping | **No** (API supports it, client never sends) | BROKEN | shipping:144-310; api/profile.ts:152-154 |
| Payment methods | Payment | No (no Stripe) | PLACEHOLDER | payment:215-283 |
| Notification prefs | Settings | Yes | PARTIAL (weak enforcement) | settings:1076-1125 |
| Hair preferences | **No account UI** | Only via PSA chat tool → Supabase `psa_member_context.hairProfile/slayArchetype` | MISSING in account | api/_lib/psaMemberMemories.ts:42,84; api/_lib/psaTools.ts:790-805 |
| Privacy / data export | — | — | MISSING | (none) |
| Delete account | Settings | Yes (DELETE /api/delete-account, service role deleteUser) | WORKING | settings:395-460; api/delete-account.ts:18,81 |
| Currency preference | Hub/menu | localStorage per user | WORKING (local) | account/page.tsx:208-219, 305-325 |

---

## 6) Duplications / unused routes

- **`/account/consult-offer`:** no inbound links. Superseded by `ConsultOfferClaimModal` on Orders. DEPRECATED (§2.4).
- **`/mobile/profile`, `/mobile/concierge`:** placeholder duplicates of the account hub and concierge, unguarded (§2.16).
- **`/account` vs `/desktop/account`:** ≥768px redirects to the Penthouse hub (`AccountHubRedirect.tsx:9-15`) despite MOBILE-ONLY (`motherboard/CORE.md:39`).
- **`/orders` → `/account/orders`; `/account/notifications` → `/account/alerts`:** redirects (`App.tsx:3493, 3563`).
- **Legacy mock arrays** kept "for reference" in orders/page.tsx:619-917 (`void mockActiveOrders`).
- **Duplicated code:**
  - The nav bar plus the full mobile menu is copy-pasted into ~12 pages (each about 150–250 lines).
  - Order-card rendering is duplicated for active vs archived (orders ~2330-3260 vs 3280-4030).
  - Tracking-stage arrays are duplicated (concierge:2333, 2413, 3014; orderTracking.ts:37).
  - Sign-out has four variants: hub confirm + full; orders/alerts/wishlist confirm; settings full; concierge/shipping/payment/reviews/load-card `clearAppAuth` only.
- **`/account/concierge` route** is open to non-subscribers, even though the hub hides the card (account/page.tsx:1147).

---

## 7) Mobile concerns (code evidence)

- **Guard re-sync and "Loading..." on every account sub-page hop.** Each route has its own guard and `syncAllFromApi()` runs every time (AccountRouteGuard.tsx:42-43, 95; App.tsx:3416-3548).
- **Tiny tap targets:**
  - 9px CHANGE/RESET (account/page.tsx:1909-1911)
  - 9px LOAD GIFT CARD (2152-2166)
  - 10px "CLICK HERE" spans (orders:3044-3083)
  - header icon buttons with ignored `!important` sizes (account/page.tsx:1612-1640)
  - 22 occurrences of 8–9px font sizes in concierge and 15 in orders (grep)
- **Nested fixed-height scroll areas:**
  - alerts card minHeight 560 + list maxHeight 467 (notifications:1069, 1110)
  - orders active list maxHeight 265 (orders:2913)
  - stage lists maxHeight 200 (orders:2656, 2834)
- **Truncation:** notification body is single-line `nowrap` (notifications:1248).
- **CPU and battery:**
  - orders 50ms auto-scroll intervals (orders:1541-1610) and 1s re-render tick (1629-1636)
  - consult-offer 1s tick (consult-offer:52-55)
  - concierge 60s tick (1738-1741)
- **Fixed 300px crop image** (account/page.tsx:2559).
- **consult-offer** has no nav or back chrome, so the user is stranded except for CLOSE (consult-offer:112-172).

---

## 8) Test coverage

- **Unit tests:** none for any in-scope page or util. Out of 112 `*.test.*` files under src/api, none reference account, orders, wishlist, orderTracking, consultOrderLifecycle, digitalOrderFulfillment, wishlistListShare, signInReturnTo or syncFromApi.
- **E2E (Playwright):**
  - `e2e/standard-user.spec.ts:11-18` loops over `SIGNED_IN_ACCOUNT_ROUTES` (`/account`, `/account/concierge`, `/account/rewards`, `/account/orders`, `/wishlist`; `e2e/helpers/routes.ts:14-20`). It asserts only HTTP <500, no "COMPONENT FAILED TO LOAD" and no redirect to /sign-in.
  - `e2e/guest.spec.ts` covers the `/sign-in` load.
  - The auth setup **skips** unless `E2E_STANDARD_EMAIL/PASSWORD` are set (`e2e/auth.standard.setup.ts:9-13`).
  - **No test exercises any control, form, persistence, order status or alert behavior.**
- Nothing in scope qualifies as COMPLETE_AND_VERIFIED.

### Maturity summary

| Route | Maturity |
|---|---|
| /account | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE |
| /account/concierge | PARTIALLY_IMPLEMENTED |
| /account/alerts | PARTIALLY_IMPLEMENTED |
| /account/consult-offer | DEPRECATED |
| /account/orders | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE |
| /account/orders/:id/review | PARTIALLY_IMPLEMENTED (and practically UNREACHABLE from Orders) |
| /account/reviews | PARTIALLY_IMPLEMENTED |
| /account/shipping | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE (addresses wiped by sync) |
| /account/payment | PLACEHOLDER |
| /account/settings | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT |
| /account/load-card | BROKEN |
| /wishlist | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT |
| /wishlist/lists(/:listId) | PARTIALLY_IMPLEMENTED |
| /wishlist/shared/:token | BROKEN |
| /sign-in (account entry) | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT |
| /mobile/profile, /mobile/concierge | PLACEHOLDER |
