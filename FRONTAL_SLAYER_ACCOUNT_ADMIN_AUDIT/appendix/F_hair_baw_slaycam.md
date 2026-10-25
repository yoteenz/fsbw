# F — Hair Analysis / Build-A-Wig / Slay Cam + UGC: Customer-Account & Admin Integration Audit

Read-only forensic audit, repo `/home/user/fsbw`, 2026-10-25. Nothing was built, run or called. Evidence is cited as file:line (paths are relative to the repo root). Canon is `motherboard/CORE.md` (lines 15, 50, 54, 60, 64-65, 69, 72, 75).

Legend: WORKING / PARTIAL / PLACEHOLDER / BROKEN / UNREACHABLE / DISCONNECTED / UNVERIFIED.

---

## 1) Hair Analysis (Hairstyle Analysis)

### 1.1 Surfaces and routes
| Surface | Route / entry | Source | Reality |
|---|---|---|---|
| Template card generator | `/tools/hairstyle-analysis` (no guard; `src/App.tsx:3399-3403`) | `src/pages/HairstyleAnalysisDemo.tsx` (60 lines) → `src/components/hairstyle-analysis/HairstyleAnalysisPreview.tsx` (1159 lines) | **A demo/debug harness that customers can reach.** The page always builds `buildKateenaDemoAnalysis(tier, clientPreviewUrl)` (`HairstyleAnalysisDemo.tsx:7-14`). That produces `clientName: 'KATEENA ARMSTRONG'` and hardcoded KATEENA looks (`src/data/hairstyleAnalysisDemo.ts:10-24, ~88`). Its copy says "Admins can test all tiers… The React overlay composer is under Advanced for dev comparison only" (`HairstyleAnalysisDemo.tsx:29-33`). The route is listed as a test tool in `src/constants/psaConfig.ts:200-203`, and CORE.md:69 calls it "Admin debug". |
| Navigation entry | none | `src/components/ShopMobileMenuToolsTab.tsx:8-10` (only GIFT CARD / SLAY TICKETS / ORDER FORM). `src/pages/tools/page.tsx` has no link either. | UNREACHABLE except by typing the URL |
| PSA "FIND MY BEST LOOKS" | PSA chat chip (`src/components/psa/PsaAssistantWidget.tsx:559-564`) → `PsaSelfieStyleAnalysisPanel` | `api/psa/selfie-style-analysis.ts:127-174` | Premium-gated on the server. The result is computed synchronously and then thrown away (see 1.4). |
| Consult style-analysis add-on | `/booking/consultation` → selfie + inspo, priced $20 / $60 | `src/components/booking/ConsultStyleAnalysisSelfiePicker.tsx`, `src/pages/booking/consultation/page.tsx:472`, `src/pages/checkout/page.tsx:2787-2830` | Payment and the selfie are captured. **Nothing fulfils the order** (see 1.5). |
| Mobile | `/mobile/analysis` | `src/pages/mobile/analysis/page.tsx:1-36` | PLACEHOLDER: only `PlaceholderSlot` blocks and a dead "View Your Match" button |
| Desktop | "Hair Analysis Lab" zone labels (`src/constants/desktopGrandLobby.ts:61`, `ReceptionDashboard.tsx:27`) | immersive shell | Labels only; no analysis UI is wired in (out of scope; the shell is not judged here) |

### 1.2 Credit consumption (server)
- `GET /api/hairstyle-analysis-usage` (`api/hairstyle-analysis-usage.ts:27-80`) requires sign-in and returns eligibility and usage.
- `POST /api/hairstyle-analysis-generate` (`api/hairstyle-analysis-generate.ts:171-249`):
  - Sign-in is required (171-175).
  - The entitlement comes from Supabase `profiles.subscription_tier` via `getPsaPremiumProfile` (186-196). Only `3months`, `6months` and `12months` are eligible (`api/_lib/hairstyleAnalysisEntitlement.ts:16-20`). BLACK spend tier does not qualify.
  - The credit is consumed before the Fal call (209-225) and refunded if the call fails (242-245).
  - **Server-side enforcement exists. WORKING, with caveats.**
- Table: `public.hairstyle_analysis_usage(user_id PK, month_key, month_count, paid_credit_queue int[])`. It is created in `supabase/migrations/20260610120000_hairstyle_analysis_usage.sql:3-13` and extended in `20260610140000_hairstyle_analysis_paid_credits.sql:4`. Purchases are recorded idempotently in `hairstyle_analysis_purchase_grants` (`…paid_credits.sql:9-18`). The RPCs are `hairstyle_analysis_try_consume`, `_refund_consume` and `_grant_purchase_credits`.
- **Caveat A, soft fail-open:** if the consume RPC errors, `consumeViaSupabase` returns `null` and the code falls back to an in-memory, per-instance rate limit (`api/_lib/hairstyleAnalysisUsage.ts:70-73, 106-129`). On serverless, each cold instance resets that counter, so the cap is not enforced when the database path fails.
- **Caveat B, BROKEN paid 4-comparison credits:**
  - The TS tiers are `1 | 4` (`api/_lib/hairstyleAnalysisPricing.ts:2-16`), and the webhook filters to `1 | 4` (`api/stripe/webhook.ts:280-296`).
  - The SQL grant only accepts `c IN (1, 3, 6)` (`…paid_credits.sql:185-188`), and refund only accepts `(1, 3, 6)` (`:131`).
  - Result: a $60 "4 COMPARISONS" purchase grants no credit (`invalid_counts`), and the webhook only logs `console.error` (`webhook.ts:289-291`). The customer pays and gets nothing. No admin surface shows the failure.
- **Caveat C:** `POST /api/consult-style-analysis-generate` (`api/consult-style-analysis-generate.ts:87-140`) only checks sign-in. It has no premium check, no paid-order check, no credit consumption and no rate limit. Any signed-in user can call paid Fal generations directly. The client hides consult tiers from non-admins (`HairstyleAnalysisPreview.tsx:361-363`), but the server does not enforce that.
- The PSA selfie endpoint is premium-gated (`api/psa/selfie-style-analysis.ts:139-147`), but it has no per-user quota or rate limit; every call is an OpenAI vision request.

### 1.3 Membership entitlement checks
- Server: `resolveHairstyleAnalysisEntitlement` (`api/_lib/hairstyleAnalysisEntitlement.ts:43-81`). Admins and the founder bypass are unlimited (31-34). A cancelled subscription nulls `subscription_tier` (`api/stripe/webhook.ts:298-313`), so the entitlement lapses correctly. WORKING.
- Client: `isAdmin` is read from the localStorage `currentUser` email (`HairstyleAnalysisPreview.tsx:180-183`). That only affects the UI; the server re-checks `isAdminEmail`. WORKING.

### 1.4 Result storage, history, saved selections
- The generated image URL is held in React state only (`setGeneratedUrl`, `HairstyleAnalysisPreview.tsx:140, 438-441, 474-476`). The only way to keep it is the "Download" button (`DownloadAnalysisButton.tsx`).
- No Supabase table stores analysis results; a grep for `analysis_results` / `hairstyle_analysis_result` / `psa_selfie` found nothing. The Fal output URL is temporary third-party storage (`api/_lib/hairstyleAnalysisFal.ts:103-114, 424`). **There is no recommendation history and no saved selection. DISCONNECTED.**
- PSA FIND MY BEST LOOKS:
  - The server returns `result.picks` (`api/psa/selfie-style-analysis.ts:174`).
  - The client ignores the payload and only posts "YOUR HAIR ANALYSIS IS SUBMITTED… READY WITHIN 24 HOURS" (`PsaSelfieStyleAnalysisPanel.tsx:56-70`; `src/utils/psaHairAnalysisDelivery.ts:4-5`; PSA instructions `api/_lib/psaInstructions.ts:167`).
  - No delivery job, notification or storage exists. `docs/STYLE_ANALYSIS.md:86-90` lists "Persist PSA analysis runs" and "wire PSA selfie results" as Phase 2.
  - **BROKEN customer promise:** the customer is told results arrive within 24 hours and they never do.
- `buildPsaSelfieFallbackPicks` (`src/utils/psaSelfieStyleAnalysis.ts:71-95`) is a client smoke-test fallback.

### 1.5 Consult add-on fulfilment
- The selfie data URL (compressed) and inspo URLs are persisted on the cart line and then on the locally built order (`checkout/page.tsx:2787-2830`). The `consultStyleAnalysisInputsFromLine` helper (`src/utils/consultStyleAnalysisInputs.ts:17-41`) has **no callers**. No admin page references `consultStyleAnalysisSelfieUrl` or style analysis at all (grep of `src/pages/admin`, `src/components/admin` is empty).
- `docs/STYLE_ANALYSIS.md:89` lists "Admin Send offer attaches generated StyleAnalysisChart" as Phase 2. Customers pay $20 or $60 (`api/_lib/pricing/resolveQuote.ts:163-178`) for a deliverable that has no fulfilment path. **DISCONNECTED.**
- Client-built orders cannot reach the server: `PUT /api/orders` returns 403 (`api/orders.ts:20-25`). The webhook order record does not carry the selfie or inspo (`api/_lib/recordProductOrderFromPaymentIntent.ts:59-73`). So the admin cannot see the selfie on another device either.

### 1.6 Error and retry
- UI: the generate error is shown upper-case and progress resets (`HairstyleAnalysisPreview.tsx:504-507`). A 402 PURCHASE_REQUIRED shows purchase options and an "ask PSA" button (`:404-410, 590-620`), and `appendHairstyleAnalysisToLocalCart` adds a `hairstyle-analysis` line (`src/utils/hairstyleAnalysisPurchase.ts:4-32`).
- Server: the credit is refunded on a Fal error (`api/hairstyle-analysis-generate.ts:242-245`). WORKING for the template path.
- PSA selfie: 503 or 502 errors are surfaced (`api/psa/selfie-style-analysis.ts:160-172`). WORKING. There is no automatic retry anywhere.

### 1.7 Admin visibility
- No admin page shows `hairstyle_analysis_usage`, purchase grants, failed grants, or consult add-on deliverables. The only status view is the PSA tool `buildHairstyleAnalysisMemberStatus` (`api/_lib/hairstyleAnalysisStatus.ts:13-77`), which is member-facing through PSA. **MISSING.**

### 1.8 Privacy
- Selfies:
  - Uploaded as base64 to Fal storage, a third-party CDN with no Frontal Slayer retention control (`api/_lib/hairstyleAnalysisFal.ts:56-62, 103-114, 148-153`).
  - Sent as data URLs to OpenAI vision for PSA (`api/psa/selfie-style-analysis.ts:150-159`).
  - Stored as data URLs inside the cart line in localStorage (`cartItems`) and inside the local order JSON for the consult add-on (`checkout/page.tsx:2787-2821`).
- No consent checkbox, retention statement or deletion path exists. Account deletion (`api/delete-account.ts:66-83`) cannot purge Fal-hosted images.
- `hairstyle_analysis_usage` uses ON DELETE CASCADE (good).

### 1.9 Concierge and Slay Quest hooks
- The "HAIRSTYLE ANALYSIS" quest progress is hardcoded `progressCurrent: 1` (`src/pages/account/concierge/page.tsx:410-417`, levels `:561-567`).
- The "BONUS HAIRSTYLE ANALYSIS CREDIT" reward asset exists (`src/config/slayQuestRewardAssets.ts:152-163`), but `grantHairstyleAnalysisPurchaseCredits` is only called from the Stripe webhook (`api/stripe/webhook.ts:288`). Claiming the reward does not grant a server credit. **DISCONNECTED.**

---

## 2) Build-A-Wig account integration

### 2.1 Routes and files
- `/build-a-wig/view/:unitSlug[/step]` (guest view), legacy `/build-a-wig/try/*` → view, and the per-unit hub, `/customize[/step]` and `/edit[/step]` routes for noir, blanco, soft-wave, beach-wave, soft-curl and ocean-curl, plus the bare `/build-a-wig/<step>` routes (`src/App.tsx:3109-3287`). Legacy `/build-a-wig` redirects to NOIR for signed-in users and to the tutorial for guests (`App.tsx:1010-1013`).
- Pages: `src/pages/build-a-wig/page.tsx` (5934 lines), plus 9 step pages of 637-1745 lines each (`color`, `styling`, `density`, `addons`, `length`, `cap-size`, `lace`, `hairline`, `texture`).
- Gates:
  - `BuildWigCustomizeEditAccessGate` (`src/components/buildWig/BuildWigCustomizeEditAccessGate.tsx:23-55`): guests may browse customize; **edit paths require premium** (`:49-52`). CORE.md:50 says sign-in only, so signed-in standard members who added a BAW line cannot "EDIT IN BUILD-A-WIG". **PARTIAL / canon conflict.**
  - Premium option steps use `useBuildWigPremiumMembershipStepGate` (CORE.md:65). This is client-only.
- `/mobile/build-a-wig` is a PLACEHOLDER (`src/pages/mobile/build-a-wig/page.tsx`).

### 2.2 Capability matrix (customer)
| Capability | Verdict | Evidence |
|---|---|---|
| Configure options (9 steps) | WORKING (client) | step pages; selections in **global, un-namespaced** localStorage keys such as `selectedColor`, `selectedLength`, `selectedAddOns`, `*Price`, `customizeSelected*` and `editSelected*` (`build-a-wig/page.tsx` has more than 300 get/set calls). The keys are not scoped per unit or per user. |
| Save a configuration (named or saved build) | MISSING | No "save design" entity in `src`, `api` or `supabase`. Concierge quests "SAVE 5/10/25 CONFIGURATIONS" (`concierge/page.tsx:402-409, 553-558`) use hardcoded progress 5/10. |
| Workaround: bag → "+ LIST" (wishlist) / SAVE FOR LATER | PARTIAL | `shopping-bag/page.tsx:1846, 1962`; the wishlist is persisted to Supabase `wishlist` (`api/wishlist.ts:20-77`) through `schedulePushCartWishlistToCloud` (`App.tsx:1109-1123`). |
| Resume a configuration | PARTIAL | The in-progress build lives in global localStorage and survives on the same device only. There is no cross-device resume and no per-unit draft. A wishlist item cannot be edited in BAW; it must go back to the bag first (`wishlist/page.tsx:326-345`). |
| Duplicate a configuration | MISSING | The bag qty stepper increments the quantity of the same line; there is no fork or copy. |
| View selected options | WORKING | Cart and bag details (`src/utils/unitCartViewDetails.ts`); order lines persist `options` (`src/utils/orderLineItemsPersist.ts:70-83`). |
| Understand pricing | PARTIAL | Prices come from client constants: base by pathname (`build-a-wig/page.tsx:446-453`), the option table in `calculatePricesFromSelections` (`:469-~600`) and step-page tables (e.g. `length/page.tsx:222-278`, `density/page.tsx:387-569`). The line `price` is frozen at add time (`page.tsx:4762-4766`), and wishlist re-add keeps the stale price (`wishlist/page.tsx:326-345`). |
| Server price authority | **BROKEN** | `cartItemsToQuoteLines` sends only identity fields plus `capSize` (`src/utils/checkoutQuote.ts` `cartItemsToQuoteLines`). A BAW line has `name: 'NOIR'` and no `type` (`build-a-wig/page.tsx:4762-4781`), so `resolveCheckoutQuoteLines` treats it as a simple unit, `base + cap surcharge`, with `resolved: true` (`api/_lib/pricing/resolveQuote.ts:77-85, 182-205, 268-272`). The Stripe product PaymentIntent therefore charges base price and ignores color (+$120), length (up to +$400), lace, styling, add-ons and density discounts (`api/stripe/create-product-payment-intent.ts`, via `resolveCheckoutQuoteLines`). `docs/CHECKOUT_SERVER_QUOTE.md:13-15` claims BAW lines "return resolved:false", but the code does the opposite. |
| Add to cart | WORKING (client) | `build-a-wig/page.tsx:4762-4835` (with visual snapshot `attachVisualSnapshotToCartLine`) |
| Edit from cart (`editingCartItem`) | WORKING for premium, BLOCKED for standard | Entry points are `CartDropdown.tsx:1122`, `shopping-bag/page.tsx:1008`, `cartEditFromBag.ts:26` and the PDPs (e.g. `straight/noir/page.tsx:3003`). The update path is `build-a-wig/page.tsx:4589-4623`. The premium gate is in `BuildWigCustomizeEditAccessGate.tsx:49-52`. |
| Find previous builds in account | PARTIAL | Only through wishlist lists (`/wishlist`, `/wishlist/lists`) or local order history. Server orders from the webhook have `productName: 'STRIPE CHECKOUT'` and no line items (`recordProductOrderFromPaymentIntent.ts:59-73`), and client order writes are disabled (`api/orders.ts:20-25`). **The BAW configuration of a paid order exists only in the purchasing browser's localStorage (`userOrders_*`).** |
| PSA → BAW prefill | WORKING (client) | `src/utils/psaBawPrefill.ts:36-70`; `PsaAssistantWidget.tsx:580-585` |

---

## 3) Build-A-Wig admin integration

| Admin capability | Verdict | Evidence |
|---|---|---|
| Manage option catalogue | MISSING (code-only) | Catalogue constants are in `src/utils/productOptions.ts:6-61` (LENGTH, DENSITY, TEXTURE, LACE, HAIRLINE, STYLING, ADDON, ADDON_COMBO, COLOR). They are imported only by admin special-offer, admin meetings, concierge, education registry and `styleAnalysis` types. The customer BAW pages hold **their own** option and price tables (above). No admin UI edits options. |
| Manage pricing rules | MISSING | At least 6 hand-synced price tables: `build-a-wig/page.tsx:469-600`, step pages, `src/utils/unitCartViewDetails.ts:~294`, `src/utils/specialOfferPrice.ts:200-212` ("Match build-a-wig…" comment), `straight/noir/page.tsx`, and the server `resolveQuote.ts:77-85` / `api/_lib/psaCatalogPricing.ts` ("keep in sync"). No admin editor exists. |
| Manage availability | DISCONNECTED | `/admin/revenue/edit-inventory` (`src/pages/admin/revenue/edit-inventory/page.tsx:1-91`) writes `adminInventoryOverride` to **the admin's own localStorage** (`src/utils/adminRevenueStats.ts:176-201`). Depletion is computed from `userOrders_*` localStorage on the same device (`:130-140`). Shopper sold-out state (CORE.md:64) therefore never reflects admin edits on other devices. Availability is unit-level only; there is no per-option availability (e.g. a 40" length or a colour out of stock). |
| Review custom configurations (consult offers) | PARTIAL / WORKING | Admin Meetings → Send offer builds BAW selections with `productOptions` + `specialOfferPrice`, writes `consult_quotes.selections` + `price_breakdown`, and is audit-logged (`api/admin/consult-quotes.ts:34, 68-81, 137`). Server-side validation of selections or price is UNVERIFIED and likely absent (the body is accepted as an object, `:34`). |
| Inspect submitted orders with BAW config | BROKEN / DISCONNECTED | Server orders carry no line items (`recordProductOrderFromPaymentIntent.ts:59-73`). `src/pages/admin/clients/page.tsx` formats options (`:300-315`) but falls back to `localStorage userOrders_*` (`:117, 1118`) and mock orders (`:434-490`). Real customers' BAW specs never reach the admin. |
| Order authorization form (`/tools/order-form` → `pending_order_forms`) | PARTIAL | The payload is `orderId`, `orderNumber`, form fields, ID photo, card-last-four photo and signature (`src/pages/shop/order-form/page.tsx:733-751`). **It has no BAW configuration.** Admin approve/decline is in `api/admin/pending-queue.ts:100-133` (audit-logged). |
| Special offer (BAW options) | WORKING with no validation | `/admin/marketing` + `/admin/special-offer` use `productOptions`. `PUT /api/admin/special-offer-config` upserts **any JSON** to `app_config.special_offer_admin` with no option or price validation (`api/admin/special-offer-config.ts:25-35`). |
| Resolve invalid selections | MISSING | No validator exists for BAW combos (e.g. BLANCO colours only GOLDEN, PLATINUM or ASH, curly styling set, premium-only options for non-premium buyers) in the client cart, the quote or admin. The premium-option gate is client-only (CORE.md:65). The server quote ignores options entirely. |
| BAW activity telemetry | WORKING | `bawTrackActivity` → `user_activity` insert (`src/utils/activity.ts:175`, `api/activity.ts:24`) → admin Activity tab |

---

## 4) Slay Cam / community / reviews UGC moderation

### 4.1 What Slay Cam actually is
- `/slay-cam` (`src/pages/slay-cam/page.tsx`, 760 lines) is **a static, hardcoded marketing gallery**. It is not a camera or try-on tool, and it is not a live UGC gallery.
  - The 8 posts in `SLAY_CAM_POSTS` (`:75-~208`) have fabricated names ("MAYA R.", "JANELLE K.", "ARI S."), save counts and points.
  - The stats are fabricated: "128 FEATURED SLAYS / 42K LOOK SAVES / 18 MVP WINNERS" (`:210-214`).
  - The Slay MVP is simply `SLAY_CAM_POSTS[0]` (`:296`), with the categories filter at `:63-73, 293-295`.
  - The "SUBMIT YOUR LOOK" CTA navigates to `/account` (`:745-752`). `/account` has a SLAY CAM card that routes back to `/slay-cam` (`src/pages/account/page.tsx:1167`). This is a **circular dead end**.
  - No `slay_cam` table, API or storage exists (grep across `api`, `supabase` and `src` is empty).
  - Verdict: VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE. The submission flow is PLACEHOLDER. The UGC presented as real could mislead (fabricated testimonials and engagement).
- `/mobile/slay-cam` is a PLACEHOLDER ("CAMERA VIEW SLOT") (`src/pages/mobile/slay-cam/page.tsx`).
- `/desktop/slay-cam` is DEPRECATED and redirects to the Gallery floor (`src/pages/desktop/slay-cam/page.tsx:8-11`).
- Lounge TV Explore "SLAY CAM" franchise (`src/components/lounge/explore/ExploreSlayCamSection.tsx:80-94`) shows admin-curated Lounge content packs, not UGC.
- The Concierge "SLAY CAM STAR" quest has hardcoded progress 5/10 (`concierge/page.tsx:498-505`).
- The PDP REVIEWS tab is a "coming soon" placeholder. It promises that reviews "AUTOMATICALLY BECOME ELIGIBLE FOR LOYALTY POINTS… SLAY CAM FEATURES… SLAY MVP" (`src/components/shop/ProductReviewsComingSoonTab.tsx:31-36, 50-53`). None of that is implemented.

### 4.2 Lounge TV / PSA content
- `AdminLoungeTvContentPanel` (`src/pages/admin/components/AdminLoungeTvContentPanel.tsx`, 832 lines) is **admin-authored editorial content**, saved to `app_config` through `PUT /api/admin/lounge-tv-config` (`api/admin/lounge-tv-config.ts:18-35`, requireAdmin). The media file reader is at `:103, 136`. This is not UGC. WORKING as a CMS.
- **Real UGC: Lounge discussion comments** (`lounge_engagement_comments`, migration `20260810180000_lounge_content_engagement.sql:86-94`):
  - Posted as `status: 'visible'` immediately; there is no pre-moderation (`api/_lib/loungeEngagement.ts:257-320`).
  - Length is limited to 1-2000 characters (`:272`).
  - The rate limit is an in-memory Map per instance (`:276-279`).
  - Report only increments `report_count`, with no per-user dedupe, no auto-hide threshold and no admin notification (`:363-386`).
  - Admin pin, official and hide work only inline while browsing the content (`api/lounge-tv/engagement/comment-action.ts:86-97`; `LoungeDiscussionPanel.tsx:145, 218-233`).
  - **No admin queue lists reported comments** (no admin page references `lounge_engagement` or `report_count`), and there is no audit log for moderation.
  - Owner or admin delete performs a soft delete (`loungeEngagement.ts:331-360`).

### 4.3 Customer reviews (with photos)
**Submission:** `/account/orders/:orderId/review` (`src/pages/account/reviews/leave-review-order/page.tsx:206-325`) posts `kind:'review'` to `POST /api/client/submissions` (`api/client/submissions.ts:191-244`).
- **Media storage:** photos and videos become **base64 data URLs** (`leave-review-order/page.tsx:233-246`) stored in the `reviews.photos` / `video_urls` jsonb columns. There is **no Supabase storage bucket** for UGC; the only storage uploads in the repo are live-preview, studio and slay-forecast. Videos as data URLs will often exceed request body limits. The failure is caught silently and the review falls back to localStorage only (`:274-289`). The UI has already marked the review submitted (`:222`), so the review never reaches admin.
- **Ownership and verification:**
  - The server hardcodes `verified_purchase: true` (`api/client/submissions.ts:213`).
  - The `orderId` is never sent (`leave-review-order/page.tsx:263-271`); the only check is the client finding the order in its own localStorage (`:110-117`).
  - Any signed-in user can post unlimited reviews for any product string. The "SUBJECT" field is collected and then dropped (it is not in the payload).
- **`kind:'profile_reviews'`:** the client can overwrite `profiles.user_submitted_reviews` wholesale, including `moderationStatus` (`api/client/submissions.ts:246-255`).
- **Supplemental media** (`kind:'review_supplemental'`, `ReviewSupplementalContentModal.tsx:125-139`) goes to `pending_review_supplemental` (`api/client/submissions.ts:120-189`). Data URLs are used here too.

**Moderation queue:** `/admin/pending?tab=reviews` (`src/pages/admin/pending/page.tsx`).
- `GET /api/admin/pending-queue` lists the pending rows (`api/admin/pending-queue.ts:59-86`).
- `PATCH` with `db_review` sets `reviews.status` to published or rejected and rewrites the profile JSON (`:229-300`). It is audit-logged (`:288-295`).
- The client calls use `void patch(...).then(refresh)` with **no `.catch`**, and the modal closes regardless (`admin/pending/page.tsx:948-995, 1046-1062`). A failure is silent to the admin.

**`/admin/reviews`** (`src/pages/admin/reviews/page.tsx`):
- It is a read-only list. It seeds `DEFAULT_REVIEWS` mock rows (`:75-~160`) and keeps them if the API returns nothing (`:540-549`). It also enriches real rows with mock regions and default media (`withDefaultReviewMedia`, `enrichReviewsWithMockClientRegion`).
- `patchAdminReview` / `postAdminReview` (`src/utils/api.ts:1732, 1748`) are **never called by any UI**. The server supports unpublish, re-pend and toggling `verifiedPurchase` (`api/admin/reviews.ts:171-209`), but that is UNREACHABLE.
- Rejected reviews are filtered out of the admin list (`page.tsx:554`).

**Customer-visible status:**
- Pending reviews are **hidden** from `/account/reviews` (`account/reviews/page.tsx:323-330`).
- Declined reviews are deleted from the profile list (`pending-queue.ts:241-255`) with no reason shown, no email and no notification.
- Approval sends no notification, points or reward.
- A "new review approved" alert is set at **submit** time, not on approval (`leave-review-order/page.tsx:306`; `src/constants/reviews.ts:8-10`).
- Mock reviews are mixed in for mock accounts (`account/reviews/page.tsx:43-160, 386-387`).

**Publication:** there is no public reviews API or reader. `/brand/reviews` renders `BrandReviewsEmptyState` (`src/pages/brand/page.tsx:360-361`), and PDPs render the coming-soon tab. **Published reviews go nowhere public. DISCONNECTED.**

**Consent:** no consent or usage-rights checkbox exists for review or affiliate media (a grep for consent / usage rights in account and affiliate surfaces is empty).

**Removal and privacy:** `reviews.user_id … on delete set null` (`supabase/migrations/002_admin_gaps.sql:7`), so email, name, photos and videos survive account deletion. There is no customer "delete my review" control.

**Reporting / flagging:** none for reviews or Slay Cam.

### 4.4 Affiliate content submissions (UGC-moderation angle only)
- `kind:'affiliate'` inserts into `pending_affiliate_submissions` (`api/client/submissions.ts:79-117`).
- Admin approve/decline is audit-logged and sends a transactional email with `pointsAmount` (`api/admin/pending-queue.ts:135-186`). Points are **not credited** in this handler; only the email mentions them (UNVERIFIED elsewhere).
- No link exists from an approved affiliate item to a Slay Cam feature or Slay MVP.

---

## 5) Shared customer context

| Data | Hair Analysis | BAW | Booking / checkout | Account | Shared? |
|---|---|---|---|---|---|
| Cap size / head measurements | not captured | cap-size step (global localStorage `selectedCapSize`) | consult head measurements in per-user localStorage (`src/utils/bookingConsultHeadMeasurementsPersist.ts:1-30`), shown to admin through meetings panels | not shown | **No.** Measurements never prefill the BAW cap size. |
| Texture / colour / length preferences | manifest picker (admin) and demo looks | BAW steps | cart line fields | none ("Your Hair Profile" slot is a placeholder on `/mobile/analysis`) | **No.** Only PSA → BAW prefill (`psaBawPrefill.ts`), and PSA selfie picks are discarded. |
| Selfie | Fal upload per call | n/a (live try-on separate) | consult selfie in cart and order JSON | none | **No.** It is re-uploaded every time. |
| Analysis results → BAW | not persisted; PSA picks carry a `buildAWigPath` (`psaSelfieStyleAnalysis.ts:59-69, 90`) but are discarded | — | — | — | **Disconnected** |
| Premium status | server `profiles.subscription_tier` | client `isPremiumMemberForGatedFeatures` (localStorage) | client and server (quote does not check premium options) | Rewards | Partially shared; client and server can disagree |

No single "hair profile" entity exists. Every flow re-collects its inputs.

---

## 6) Mirror matrix rows
Columns: customer action | admin counterpart | shared data source | state transitions | authorization | notifications | audit history | verdict

1. Generate hairstyle analysis card | none | `hairstyle_analysis_usage` | month_count++ / refund | Bearer + subscription_tier (server) | none | none | PARTIAL (customer side works; admin side MISSING)
2. Buy extra analysis (1 or 4) | none | Stripe PI metadata `hairstyle_analysis_grants` → `paid_credit_queue`, `hairstyle_analysis_purchase_grants` | grant → consume | webhook service role | none | console.error only | **BROKEN for 4-comparison** (SQL `IN (1,3,6)`)
3. PSA FIND MY BEST LOOKS | none | none (response discarded) | submitted → nothing | Bearer + premium | promises 24h; nothing sent | none | **BROKEN**
4. Consult + style analysis add-on ($20/$60) | Admin Meetings (no style-analysis UI) | local order JSON (selfie data URL) | paid → never fulfilled | — | none | none | **DISCONNECTED**
5. Build and add BAW wig to bag | none (activity telemetry only) | localStorage `cartItems` → Supabase `cart` | — | client sign-in gate | none | `user_activity` | PARTIAL
6. Pay for BAW wig (Stripe product PI) | Admin Clients / Revenue | server quote (base + cap only); webhook order `STRIPE CHECKOUT` | PAID | Bearer | order email (Stripe confirm per CORE.md:60) | none for config | **BROKEN pricing and config capture**
7. Edit BAW line from cart | none | `editingCartItem` localStorage | — | premium (client) | none | none | PARTIAL (standard members blocked)
8. Save build (wishlist "+ LIST") | Admin wishlist API exists (`api/admin/wishlist.ts`), UI UNVERIFIED | Supabase `wishlist` | — | Bearer | none | none | PARTIAL
9. Sign order authorization form | `/admin/pending` order forms approve/decline | `pending_order_forms` + `profiles.signed_order_forms` | pending → approved / declined | Bearer / requireAdmin | none to customer (UNVERIFIED) | `writeAuditLog` | WORKING (no BAW config attached)
10. Admin edits inventory | shopper sold-out UI | admin localStorage `adminInventoryOverride` | — | admin page only | back-in-stock (local) | none | **DISCONNECTED**
11. Admin sets special offer (BAW options) | Concierge Special Offer card | `app_config.special_offer_admin` | — | requireAdmin | none | none (UNVERIFIED) | WORKING, unvalidated
12. Admin sends consult offer (custom BAW) | Account → Orders VIEW OFFER | `consult_quotes.selections`, `price_breakdown` | sent → redeemed (`redeemed_at`) | requireAdmin / owner | client notification (CORE.md:69) | audit log (`consult-quotes.ts:137`) | WORKING / PARTIAL (no server price validation)
13. Submit product review (+ media) | `/admin/pending?tab=reviews` approve/decline | `reviews` + `profiles.user_submitted_reviews` | pending → published / rejected (rejected = deleted from profile) | Bearer (no purchase check) / requireAdmin | none | `reviews.publish` / `reviews.reject` audit | PARTIAL (publish target missing; silent decline)
14. Add supplemental review media | `/admin/pending` | `pending_review_supplemental` + `profiles.review_supplemental_overlay` | pending → approved / declined (reason stored) | Bearer / requireAdmin | none | audit | PARTIAL (reason not shown to customer)
15. Unpublish or edit a published review | none in UI | `reviews.status`, `verified_purchase` | published → pending / rejected | requireAdmin (API only) | none | audit | **UNREACHABLE**
16. Submit Slay Cam look | none | none | — | — | — | — | **PLACEHOLDER / MISSING**
17. Slay MVP selection | none | hardcoded `SLAY_CAM_POSTS[0]` | — | — | — | — | **MISSING**
18. Post Lounge comment | inline admin pin / official / hide | `lounge_engagement_comments` | visible → hidden / removed | Bearer / admin email | none | none | PARTIAL
19. Report Lounge comment | none (no queue) | `report_count` | count++ | Bearer | none | none | **DISCONNECTED**
20. Submit affiliate content | `/admin/pending` affiliate | `pending_affiliate_submissions` | pending → approved / declined | Bearer / requireAdmin | email (approve or deny) | audit | WORKING (points crediting UNVERIFIED; not linked to Slay Cam)

---

## 7) Controls classification

**Hair Analysis**
- Usage fetch: WORKING. Template generate: WORKING (credit-consuming, but it generates for "KATEENA ARMSTRONG" demo looks, so the content is demo-only).
- Tier picker (admin): WORKING. Manifest test mode, layout and font overrides: WORKING (admin dev).
- Consult debug tiers: WORKING (client admin gate) but **server-unguarded**.
- Purchase another (add to bag): PARTIAL (4-comparison grant BROKEN). Ask PSA to purchase: WORKING.
- Download PNG: WORKING. Result history: MISSING.
- PSA selfie submit: BROKEN (results discarded).
- Mobile "View Your Match": PLACEHOLDER. Nav entry: UNREACHABLE.

**BAW**
- Step selection: WORKING. Hub ADD TO BAG: WORKING. Book-install attach (`page.tsx:4370-4430`): WORKING.
- EDIT IN BUILD-A-WIG: PARTIAL (premium-only).
- Save design: MISSING. Duplicate: MISSING. Resume across devices: MISSING.
- Price display: PARTIAL (client constants). Server quote for BAW: BROKEN.
- Admin edit inventory: DISCONNECTED. Admin option and price management: MISSING.
- Admin special-offer RANDOMIZE / SAVE: WORKING. Admin consult Send offer: WORKING.
- `/mobile/build-a-wig`: PLACEHOLDER.

**Slay Cam / UGC**
- Category filter: WORKING (static). Post cards → PDP: WORKING.
- "PREP YOUR SLAY CAM SUBMISSION": PLACEHOLDER (loops to `/account`).
- Stats and MVP: PLACEHOLDER (fabricated). `/mobile/slay-cam`: PLACEHOLDER. `/desktop/slay-cam`: DEPRECATED redirect.
- Leave review: PARTIAL (media data URLs; silent fallback). Supplemental media: PARTIAL.
- Admin pending approve/decline: WORKING (silent failures). Admin reviews list: PARTIAL (mock-seeded). Admin unpublish: UNREACHABLE.
- Public review display: DISCONNECTED. Lounge comment post / delete: WORKING. Lounge report: DISCONNECTED. Lounge admin hide / pin: WORKING (inline only).
- Lounge TV CMS: WORKING. Consent capture: MISSING. Reporting on reviews: MISSING.

---

## 8) Page maturity
| Route | Status |
|---|---|
| `/tools/hairstyle-analysis` | PARTIALLY_IMPLEMENTED (admin debug harness exposed to members; demo identity; no persistence; UNREACHABLE from nav) |
| `/mobile/analysis` | PLACEHOLDER |
| PSA FIND MY BEST LOOKS panel | BROKEN (promised delivery never happens) |
| `/booking/consultation` style-analysis add-on | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE (paid, no fulfilment) |
| `/build-a-wig/<unit>[/customize|/edit][/step]` | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT for configuration; PARTIALLY_IMPLEMENTED for account integration (no saved builds; server pricing wrong) |
| `/build-a-wig/view/*` | FUNCTIONALLY_COMPLETE (guest browse) — UNVERIFIED visually |
| `/build-a-wig/try/*` | DEPRECATED (redirect) |
| `/mobile/build-a-wig` | PLACEHOLDER |
| `/admin/revenue/edit-inventory` | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE (device-local) |
| `/admin/marketing`, `/admin/special-offer` | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT (no server validation) — UNVERIFIED visually |
| `/tools/order-form` | PARTIALLY_IMPLEMENTED w.r.t. BAW (no config in payload) |
| `/slay-cam` | VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE (static fabricated UGC) |
| `/mobile/slay-cam` | PLACEHOLDER |
| `/desktop/slay-cam` | DEPRECATED |
| `/account/orders/:orderId/review` | PARTIALLY_IMPLEMENTED |
| `/account/reviews` | PARTIALLY_IMPLEMENTED (pending hidden; mock mixing) |
| `/admin/reviews` | PARTIALLY_IMPLEMENTED (read-only, mock-seeded) |
| `/admin/pending` (reviews / forms / affiliate tabs) | FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT (silent PATCH failures) |
| `/brand/reviews` and PDP REVIEWS tab | SHELL_ONLY / PLACEHOLDER |
| Lounge discussion (comments) | PARTIALLY_IMPLEMENTED (no moderation queue) |
| Admin Lounge TV content panel | COMPLETE_AND_VERIFIED? → UNVERIFIED (not executed); code-wise FUNCTIONALLY_COMPLETE |

---

## 9) Missing journeys and governance controls

**Customer journeys missing**
1. Return to a past hairstyle analysis or PSA picks: no "My Analyses" in the account.
2. Receive the PSA 24-hour results (promised, never delivered).
3. Receive the purchased consult style-analysis deliverable.
4. Save, name, duplicate or resume a BAW design across devices; open a saved design in BAW without going through the bag.
5. Standard (non-premium) member editing their own BAW bag line.
6. See the BAW spec of a paid order on another device, or after cache clear.
7. Submit a Slay Cam look; see its status; be selected as Slay MVP; receive points.
8. See pending, approved or declined review status with a reason; delete one's own review; see published reviews on PDP or brand.
9. Consent to the use of review, Slay Cam or affiliate media; withdraw consent.
10. One shared hair profile (cap size and measurements, texture, colour, selfie) reused across Analysis, BAW, consult and account.

**Governance controls missing**
1. Admin view of analysis usage, purchase grants, failed grants and refunds; a manual credit grant/adjust tool. This is also the needed fix path for the 4-comparison bug.
2. Server-side entitlement and quota on `/api/consult-style-analysis-generate` and `/api/psa/selfie-style-analysis`.
3. Fulfilment queue for consult style-analysis orders (selfie + inspo → generate → attach to offer).
4. Single server-side BAW option and price catalogue; admin editor; server quote that prices BAW options; server validation of combos and premium-only options.
5. Server-persisted order line items with BAW config (webhook or PI metadata) for admin fulfilment.
6. Server-backed inventory (and per-option availability) instead of admin-device localStorage.
7. UGC storage bucket with size and type limits, and a retention policy; selfie retention and deletion (Fal, OpenAI); purging review PII on account deletion.
8. Review purchase verification (order binding server-side); rate limits; removing the hardcoded `verified_purchase: true`; locking `profile_reviews` overwrite.
9. Admin unpublish / edit / verified-toggle UI (the API exists); decline-reason delivery and notification; reward issuance on approval.
10. Moderation queue for reported Lounge comments; report dedupe and auto-hide threshold; audit log for comment moderation.
11. Slay Cam submission pipeline, moderation, MVP selection and featured-content consent; removal of fabricated stats and testimonials until it is real.
12. Error handling on admin pending PATCH calls (`.catch` with a visible failure).

---

## 10) Tests
- **Unit tests: none** for hairstyle analysis (usage, entitlement, pricing), `resolveQuote`, BAW pricing, client submissions, pending-queue, reviews or lounge engagement. A grep of `src/**/*.test.*` and `api/**/*.test.*` shows only unrelated studio-os, education and slay-forecast tests (e.g. `api/_lib/slayForecastBroadcast/slayForecastBroadcast.test.ts`, `src/components/lounge/psa-today/psaWatchMetering.test.ts`).
- **E2E** (`e2e/*.spec.ts`, 114 lines total): smoke only.
  - `/build-a-wig` loads without "COMPONENT FAILED TO LOAD" (`e2e/standard-user.spec.ts:38-42`).
  - The route lists include `/build-a-wig`, `/wishlist`, `/account/orders` and `/booking/consultation` (`e2e/helpers/*`).
  - Add NOIR to bag from the PDP (`standard-user.spec.ts:21-30`).
  - No coverage of `/tools/hairstyle-analysis`, `/slay-cam`, reviews, admin pending, BAW edit-from-cart, BAW pricing or server quote.
- The 1|4 vs 1,3,6 mismatch and the BAW-as-base-unit quote would both be caught by trivial unit tests that do not exist today.
