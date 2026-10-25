# 11 — Dead Controls and Broken Workflows

Every row has an issue ID and a fix phase from doc 22. Classes: **BROKEN**, **PLACEHOLDER**, **DISCONNECTED**, **UNREACHABLE**, **PARTIAL**, **FAKE-SUCCESS** (claims success but nothing durable happened), **FAKE-DATA** (fabricated values shown as live).

A control was never classified as working just because clicking it changes its appearance. Evidence is file:line from the code at audit base `c95c32f0`. The full trail is in `appendix/A`–`F`.

## Part 1 — Broken end-to-end workflows (the 24 that matter most)

| ID | Workflow | What the customer/admin is told | What actually happens | Severity | Phase |
|---|---|---|---|---|---|
| BW-01 | **Order of record** | "Order placed" and full detail on the device used for checkout | The server stores a stub (`STRIPE CHECKOUT`, `items: 1`, no line items). The rich order lives only in one browser's localStorage and is **overwritten by the stub on the next sync** (`recordProductOrderFromPaymentIntent.ts:59-74`; `syncFromApi.ts:164-182`) | CRITICAL | 1 |
| BW-02 | **Admin order fulfilment** | EDIT TRACKING saved; customer notified | Saved to the **admin's localStorage** only. The customer gets the email, but their account never shows tracking (`admin/revenue/page.tsx:689-764`; `orderTracking.ts:88-115`) | CRITICAL | 1/3 |
| BW-03 | **Admin cancel + refund** | "THIS ORDER WILL BE MARKED AS CANCELLED AND REFUNDED" | Rewrites admin localStorage. No Stripe refund, no DB write (`admin/clients/page.tsx:3825-3858`) | CRITICAL | 3 |
| BW-04 | **Build-A-Wig pricing at Stripe** | Customer sees full custom price | The server quote prices a BAW line as base + cap only, so colour, length, lace, styling and add-ons are dropped from the PaymentIntent (`api/_lib/pricing/resolveQuote.ts:181-205`; `src/utils/checkoutQuote.ts:40-55`). The docstring at `resolveQuote.ts:207` claims the opposite. | CRITICAL (revenue) | 0B |
| BW-05 | **Membership via CONFIRM ORDER** | Premium activated | Writes PREMIUM plus a welcome digital-cash credit to localStorage with **no charge** (`checkout/page.tsx:6818-6905`; `productCheckoutPolicy.ts:77-84`). Server gates still say STANDARD. | CRITICAL | 0B |
| BW-06 | **Cancel subscription** | Cancellation confirmed | A local flag only. **Stripe keeps billing** (`membership/page.tsx:1150-1175`) | CRITICAL | 0B |
| BW-07 | **Slay Ticket purchase** | Tickets credited after "payment" | The checkout route skips Stripe, and `/api/slay-tickets/credit-order` credits client-supplied lines with no payment proof (`credit-order.ts:55-89`) | CRITICAL | 0B |
| BW-08 | **4-comparison hair analysis purchase ($60)** | Credits granted | The live SQL accepts only `1,3,6`, so it grants nothing. The webhook logs only (`…paid_credits.sql:185`; live-confirmed) | CRITICAL | 0B |
| BW-09 | **Consult style-analysis add-on ($20/$60)** | Purchased deliverable | No fulfilment path. The selfie stays in the local order; no admin UI exists (`consultStyleAnalysisInputs.ts` has no callers) | HIGH | 5 |
| BW-10 | **PSA "FIND MY BEST LOOKS"** | "Ready within 24 hours" | The server returns picks; the client discards them; nothing is ever delivered (`PsaSelfieStyleAnalysisPanel.tsx:56-70`) | HIGH | 5 |
| BW-11 | **Inventory / sold-out** | Admin sets stock | `adminInventoryOverride` exists only in the admin's localStorage. Each shopper computes stock from their own browser (`adminRevenueStats.ts:174-213`; `productInventoryAvailability.ts:58-74`) | HIGH | 3 |
| BW-12 | **Promo and gift codes** | Admin creates a code; customer loads a gift card | Codes live in the admin's localStorage, so customers always get INVALID CODE (`adminBrandCodes.ts:22-47`; `load-card/page.tsx:54-75`) | HIGH | 4 |
| BW-13 | **Loyalty points** | Balance, earn tasks, REDEEM | There is no ledger and no server writer. REDEEM is a modal with `// Handle redemption logic here` (`membership/page.tsx:1624-1636`) | HIGH | 4 |
| BW-14 | **Vouchers** | "Vouchers: n available" | The list is wiped to `[]` for every non-founder on each hub mount (`account/page.tsx:397-408`) | HIGH | 4 |
| BW-15 | **Referral program** | $20 credit to referrer | Code lookup and credit happen in the buyer's browser. `referral_earnings` is never written (`checkout/page.tsx:2134-2160, 6945-6998`) | HIGH | 6 |
| BW-16 | **Affiliate points** | 400 per photo / 600 per video/social | Approval writes `points ?? 100` to profile JSON and never credits loyalty. Customer cards show purchase points (`pendingQueueHandlers.ts:139-141`; `affiliate/page.tsx:1641-1653`) | HIGH | 6 |
| BW-17 | **Slay Challenge** | Progress, unlock, reward | Progress booleans are never set to true anywhere. State is not user-scoped, and there is no fulfilment (`concierge/page.tsx:1240-1355`) | HIGH | 4 |
| BW-18 | **Saved addresses** | Saved | localStorage only; wiped by the next profile sync (`shipping/page.tsx:144-310`; `syncFromApi.ts:95-102`) | HIGH | 2 |
| BW-19 | **Leave a review** | Button after delivery | It needs DELIVERED + `deliveredAt`, which no server path ever sets, so customers can't reach it (`orders/page.tsx:4064-4084`) | MEDIUM | 1/5 |
| BW-20 | **Review → public display** | Review published | Published reviews appear nowhere public; brand and PDP show "coming soon". Declined reviews vanish with no reason | MEDIUM | 5 |
| BW-21 | **Order form approval → order** | Approving a form confirms the order | The handler matches the order by id inside the JSON. Form ids are `order-N` and server ids are `order-pi-…`, so this is a **silent no-op** (`pendingQueueHandlers.ts:188-232`) | HIGH | 1 |
| BW-22 | **Order numbers** | "Order #014" | Each browser's counter starts at 001, so customers collide (`checkout/page.tsx:2984`) | HIGH | 1 |
| BW-23 | **Support conversation** | Message the concierge | No reply exists anywhere: the admin inbox is read-only and the customer has no thread view | MEDIUM | 6 |
| BW-25 | **Concierge injects test orders into real customers' order history** | — (silent) | **Reproduced in the local sweep.** When `userOrders_<email>` already exists, which sign-in sync always creates, `/account/concierge` **unconditionally** adds test orders `ORDER #888/#999/#777/…` (fake tracking numbers `1Z888AA…`) and writes them back to storage. The founder-only check applies only when the key is missing (`concierge/page.tsx:1760-1772` vs `1913-2211`). A brand-new non-founder customer then saw **3,960 loyalty points** on Rewards and test orders on Concierge, Orders and Affiliate. | **CRITICAL (trust)** | 0B |
| BW-24 | **Slay Cam submissions** | "Prep your Slay Cam submission" | The CTA goes to `/account`, whose SLAY CAM card links back to `/slay-cam`. Gallery stats and testimonials are fabricated | MEDIUM | 5 (copy fix sooner) |

## Part 2 — Dead / broken / fake controls (customer)

| ID | Page | Control | Expected | Actual | Class | Evidence | Fix → |
|---|---|---|---|---|---|---|---|
| DC-01 | /account | Photo upload fallback | Cloud save | Server nulls base64; "PHOTO SAVED." shown | FAKE-SUCCESS | account/page.tsx:1548-1553; api/profile.ts:74 | BW-none · P2 |
| DC-02 | /account | RESET photo | Reset avatar | Local only; returns on sync | BROKEN | account/page.tsx:733-760 | P2 |
| DC-03 | /account | VOUCHERS n AVAILABLE | Real vouchers | Wiped for non-founder | BROKEN | account/page.tsx:403-408 | BW-14 |
| DC-04 | /account | Tier welcome credit | Server credit | localStorage only | FAKE-SUCCESS | account/page.tsx:615-674 | BW-13 |
| DC-05 | /account | Cash/voucher history (founder) | History | Hard-coded MOCK arrays | FAKE-DATA | account/page.tsx:174-196 | P2 |
| DC-06 | /account/concierge | FREE GIFT SAVE SELECTION | Fulfilled gift | localStorage; no consumer | FAKE-SUCCESS | concierge:3158-3194 | P4 |
| DC-07 | /account/concierge | BIRTHDAY GIFT SAVE | Eligible-only claim | Shown to all; no consumer | FAKE-SUCCESS | concierge:3196-3249, 1703-1707 | P4 |
| DC-08 | /account/concierge | SLAY QUESTS progress | Per-user | Hard-coded | FAKE-DATA | concierge:385-530 | BW-17 |
| DC-09 | /account/concierge | Tracking stage dates/times | Real events | Synthesized; "vary time slightly" | FAKE-DATA | concierge:2590-2608, 3003 | BW-02 |
| DC-10 | /account/concierge | SUBMIT MESSAGE (migration fallback) | Reaches admin | Saved to the customer's own localStorage; SUCCESS shown | FAKE-SUCCESS | concierge:3105-3123 | BW-23 |
| DC-11 | /account/concierge | Message replies | See reply | Not present | MISSING | — | BW-23 |
| DC-12 | /account/concierge | Special offer CLAIM | Add with feedback | Client price; silent at max | PARTIAL | concierge:1606-1676 | P6 |
| DC-13 | /account/concierge, shipping, payment, reviews, load-card | Menu SIGN OUT | Sign out | `clearAppAuth` only; Supabase session survives; guard signs back in | BROKEN | concierge:3069-3075 | P2 |
| DC-14 | /account/alerts | Archive (eye) | Persist | Reverts on next merge | BROKEN | notifications:557-567, 1319-1323 | P2 |
| DC-15 | /account/alerts | Delete (X) | Remove | Re-added | BROKEN | notifications:1347-1348 | P2 |
| DC-16 | /account/consult-offer | ADD TO BAG (START BUILD) | Add to bag | Sets a sessionStorage key nobody reads | DISCONNECTED | consult-offer:72-80 | retire |
| DC-17 | /account/consult-offer | COPY CODE | Confirmation | Silent | PARTIAL | consult-offer:82-88 | retire |
| DC-18 | /account/orders | Auto-cancel unsigned after 24h | Server cancel + refund | UI-only flip on a paid order | BROKEN | orders:1649-1703 | BW-01 |
| DC-19 | /account/orders | "TRACKING LOADING" | Tracking | Permanent label (incl. server PAID) | PLACEHOLDER | orders:3085-3088 | BW-01 |
| DC-20 | /account/orders | CLICK HERE TO TRACK | Premium gate | Uses a different gate than the hub | PARTIAL | orders:3053-3062 | P2 |
| DC-21 | /account/orders | LEAVE A REVIEW | Available after delivery | Never reachable | UNREACHABLE | orders:4064-4084 | BW-19 |
| DC-22 | /account/orders | Payment "ENDING IN" | Card used | Current default card or `****` | PARTIAL (misleading) | orders:2727-2745 | BW-01 |
| DC-23 | /account/orders/:id/review | SUBMIT | Persist | Optimistic; silent local fallback; subject dropped; "approved" badge on submit | FAKE-SUCCESS | leave-review:212-306 | P5 |
| DC-24 | /account/reviews | TOOLS tab | Tool reviews | Always empty for real users | PLACEHOLDER | reviews:387 | P5 |
| DC-25 | /account/shipping | SAVE / DEFAULT / REMOVE | Persist | Wiped on sync | BROKEN | shipping:144-310 | BW-18 |
| DC-26 | /account/payment | SAVE CARD | Tokenized card | Raw PAN/CVV inputs; last-4 local | PLACEHOLDER (PCI risk) | payment:215-283, 607-670 | P2 |
| DC-27 | /account/settings | Birthday | Editable | Read-only unless founder | PARTIAL | settings:851-853 | P2 |
| DC-28 | /account/settings | Order tracking / Newsletter toggles | Suppress emails | Not enforced by senders | PARTIAL | transactional-notify.ts; newsletter-send.ts | P6 |
| DC-29 | /account/settings | Password success | Confirmation | Silent close | PARTIAL | settings:381-385 | P2 |
| DC-30 | /account/load-card | ADD TO BALANCE | Redeem | INVALID CODE for everyone but the admin; `setTimeout` progress | BROKEN | load-card:54-75, 459-486 | BW-12 |
| DC-31 | /wishlist/lists | SHARE | Shareable link | Only the owner's browser resolves it | BROKEN | wishlistListShare.ts:21-35 | P5 |
| DC-32 | /wishlist/shared/:token | View | Recipient sees list | "Invalid or has expired" | BROKEN | shared/page.tsx:345-357 | P5 |
| DC-33 | /account/rewards | REDEEM ×10 | Redeem | Modal only | FAKE-SUCCESS | membership:1624-1636, 2509-2521 | BW-13 |
| DC-34 | /account/rewards | CANCEL SUBSCRIPTION | Cancel in Stripe | Local flag | FAKE-SUCCESS | membership:1145-1175 | BW-06 |
| DC-35 | /account/rewards | More ways to earn | Points | Analytics click only | PLACEHOLDER | membership:219-228, 2924 | BW-13 |
| DC-36 | /checkout/upgrade | CONFIRM ORDER (non-Stripe) | Paid membership | Free local premium | FAKE-SUCCESS | checkout:6818-6905 | BW-05 |
| DC-37 | /account/affiliate | SUBMIT CONTENT | Honest result | Always "submitted successfully!" | FAKE-SUCCESS | affiliate:1529-1557 | BW-16 |
| DC-38 | /account/affiliate | Delete submission | Withdraw | Local only; server row stays approvable | PARTIAL | affiliate:4185-4245 | P6 |
| DC-39 | /account/affiliate | Points earned / caps | Content points | Purchase points shown | BROKEN | affiliate:1641-1653, 2394 | BW-16 |
| DC-40 | /account/referrals | Earnings / active badge | Real | Local; SHIPPED counts contrary to copy | PARTIAL | referrals:130-155 | BW-15 |
| DC-41 | /account/collectibles | REWARDS / SLAY / SPECIAL filters | Show items | Hidden; no writers | UNREACHABLE | CollectiblesGallery.tsx:8-31 | P4 |
| DC-42 | /account/concierge | START CHALLENGE | Start | Next-cycle label only | PARTIAL | concierge:1335-1347 | BW-17 |
| DC-43 | /tools/hairstyle-analysis | Generate | Own analysis | Demo "KATEENA ARMSTRONG" output; consumes a real credit | FAKE-DATA | HairstyleAnalysisDemo.tsx:7-14 | P5 |
| DC-44 | /slay-cam | PREP YOUR SLAY CAM SUBMISSION | Submit | Loops to /account and back | PLACEHOLDER | slay-cam:745-752 | BW-24 |
| DC-45 | /slay-cam | Stats / MVP / posts | Real UGC | Fabricated | FAKE-DATA | slay-cam:75-214, 296 | BW-24 |
| DC-46 | /mobile/profile, /mobile/concierge, /mobile/analysis | Settings icon / "View Your Match" | Action | No handler | PLACEHOLDER | mobile/*/page.tsx | FD-A7 |
| DC-47 | BAW edit | EDIT IN BUILD-A-WIG (standard member) | Edit own line | Premium gate blocks it | PARTIAL (canon conflict) | BuildWigCustomizeEditAccessGate.tsx:49-52 | P5 |
| DC-48 | PSA widget | FIND MY BEST LOOKS | Results | Discarded | BROKEN | PsaSelfieStyleAnalysisPanel.tsx:56-70 | BW-10 |
| DC-49 | /account/concierge | (page load) | Show the customer's orders | Injects 5 test orders into any non-empty order store, then Rewards shows inflated points | FAKE-DATA (reproduced) | concierge:1913-2211 | BW-25 |

## Part 3 — Dead / broken / fake controls (admin)

| ID | Page | Control | Actual | Class | Evidence | Fix → |
|---|---|---|---|---|---|---|
| DA-01 | dashboard | CLIENTS → PREFERENCES / SETTINGS | Route does not exist → "Page not found" | BROKEN | StatsCard.tsx:194-203 | P3 |
| DA-02 | dashboard | BRAND 94% / 23% / 78% / +15% | Hard-coded (client and server) | FAKE-DATA | dashboard:1135-1143; api/admin/brand.ts:26-31 | P3 |
| DA-03 | dashboard | REVIEWS PER MONTH "18" | Hard-coded | FAKE-DATA | dashboard:1040 | P3 |
| DA-04 | dashboard | TAX DEDUCTIONS / QUARTERLY SALES | revenue × 15% / × 65% | FAKE-DATA | dashboard:559-567 | P3 |
| DA-05 | dashboard | "ON TRACK TO EXCEED TARGETS" | Static | FAKE-DATA | dashboard:991 | P3 |
| DA-06 | dashboard | RecentActivity buttons (RESEND FORM, REORDER…) | `console.log` | DEAD | RecentActivity.tsx:1080 | P3 |
| DA-07 | dashboard | RecentActivity / ActivityFeed rows | Hard-coded 2025 fiction | FAKE-DATA | RecentActivity.tsx:20, 327; ActivityFeed.tsx | P3 |
| DA-08 | dashboard | Any API error | Silently swaps in a full mock dashboard | FAKE-DATA | dashboard:405-446 | P3 |
| DA-09 | all | Header search icon | Filters only on clients/revenue/meetings | PLACEHOLDER | AdminHeader.tsx:256-269 | P3 |
| DA-10 | all | Notifications bell | Constant list | FAKE-DATA | adminHeaderNotificationsData.ts:11 | P3 |
| DA-11 | all | Messages bell with no data | Falls back to fake "SARAH JOHNSON" | FAKE-DATA | AdminHeader.tsx:43-57 | P3 |
| DA-12 | all | Long-press on bells | Debug toggle shipped to production | UNVERIFIED | AdminHeader.tsx:9-11 | P3 |
| DA-13 | clients | CANCEL ORDER | Local only, claims "refunded" | FAKE-SUCCESS | clients:3825-3858 | BW-03 |
| DA-14 | clients | BLOCK CLIENT | Local only | FAKE-SUCCESS | clients:3801-3818 | P3 |
| DA-15 | clients | Mock clients | 17–20 fake clients merged into the live list and persisted | FAKE-DATA | clients:909-951 | P3 |
| DA-16 | clients | EXPORT CSV | Works; errors swallowed | PARTIAL | clients:3773-3791 | P3 |
| DA-17 | clients/deleted | RESTORE / UNBLOCK | Local only | FAKE-SUCCESS | deleted:202-229 | P3 |
| DA-18 | clients/deleted | Empty list | Seeds mock deleted users | FAKE-DATA | deleted:42-160 | P3 |
| DA-19 | meetings | Edit → CANCEL | PATCH with `status:'scheduled'` | BROKEN | AdminMeetingsHub:1423-1426 | P3 |
| DA-20 | meetings | Edit → RESCHEDULE | Note appended; date unchanged | BROKEN | same | P3 |
| DA-21 | meetings | Edit on mock meeting | "UPDATE RECORDED." with no write | FAKE-SUCCESS | AdminMeetingsHub:1429-1460 | P3 |
| DA-22 | meetings | Mock meetings | Merged for every admin | FAKE-DATA | AdminMeetingsHub:891-919 | P3 |
| DA-23 | meetings/schedule | SAVE | API errors swallowed; page unreachable | PARTIAL + UNREACHABLE | schedule:151-170 | P3 |
| DA-24 | pending | APPROVE / DECLINE | Server works; no `.catch`; modal closes on failure | PARTIAL | pending:944-993 | P3 |
| DA-25 | pending | Seeded test forms | "Riley Chen / Morgan Blake" for any admin | FAKE-DATA | pending:779-781 | P3 |
| DA-26 | pending | Affiliate points tally | Reads the admin's localStorage, so 0 for real clients | BROKEN | pending:278-334 | BW-16 |
| DA-27 | messages | FAQ tab | Reads localStorage, not `brand_faq_questions` | DISCONNECTED | adminMessagesHub.ts:137-138 | BW-23 |
| DA-28 | messages | Reply | Not present | MISSING | priority-messages.ts:57-64 | BW-23 |
| DA-29 | alerts | All rows | Hard-coded constant | FAKE-DATA | alerts:86 | P3 |
| DA-30 | revenue | EDIT TRACKING → SAVE | Admin localStorage plus a real email | DISCONNECTED | revenue:689-764 | BW-02 |
| DA-31 | revenue | ORDERS list | Admin browser `userOrders_*` | DISCONNECTED | adminRevenueStats.ts:130-149 | BW-01 |
| DA-32 | revenue | Q1 $89K / Q2 $95K / Q3 $112K, margin 35%, ROI 18% | Hard-coded | FAKE-DATA | revenue:1396-1421 | P3 |
| DA-33 | revenue | Payment mix 68/22/8/2 | Placeholder | FAKE-DATA | revenue:1593-1598 | P3 |
| DA-34 | edit-inventory | SAVE | localStorage | DISCONNECTED (fake success) | edit-inventory:20-24 | BW-11 |
| DA-35 | view-waitlist | List | Local + mock signups | FAKE-DATA | adminUnitStockNotifyWaitlist.ts:203-224 | BW-11 |
| DA-36 | accounting-report | Receipt upload | Data URL in localStorage (quota) | PARTIAL | accounting:13, 79 | P6 |
| DA-37 | reviews | Empty API | Shows DEFAULT_REVIEWS mock | FAKE-DATA | reviews:76, 524-548 | P5 |
| DA-38 | reviews | Unpublish / verify | API exists; no UI | UNREACHABLE | api/admin/reviews.ts:171-209 | P5 |
| DA-39 | referrals | EXPORT REFERRAL DATA | `onClick={() => {}}` | DEAD | referrals:254 | BW-15 |
| DA-40 | referrals | Data | Never-written table | DISCONNECTED | api/admin/referrals.ts:18 | BW-15 |
| DA-41 | brand | OVERVIEW | Constant server metrics | FAKE-DATA | api/admin/brand.ts:26-31 | P6 |
| DA-42 | brand | CODES create | localStorage | DISCONNECTED | adminBrandCodes.ts:20-35 | BW-12 |
| DA-43 | brand/edit alerts, nudges | Save copy | localStorage | DISCONNECTED | copyDebugResolve.ts:161-192 | P6 |
| DA-44 | marketing | AFFILIATE / CHALLENGES tabs | Paragraph text; 0/0 panels | PLACEHOLDER | marketing:38-41 | P6 |
| DA-45 | marketing/offers | SAVE | "Saved" before the server responds | PARTIAL | special-offer:120-135 | P6 |
| DA-46 | workers | Applicants | localStorage | DISCONNECTED | jobApplicationsStorage.ts:3 | P6 |
| DA-47 | users | DISABLE / ENABLE / RESET | Real but not audited; page unreachable | UNREACHABLE | api/admin/users.ts | P3 |
| DA-48 | (all queues) | Lounge reported comments | No queue exists | MISSING | loungeEngagement.ts:363-386 | P5 |

**Totals:** 25 broken workflows (BW-01…BW-25) · 49 customer control issues (DC-01…DC-49) · 48 admin control issues (DA-01…DA-48).
