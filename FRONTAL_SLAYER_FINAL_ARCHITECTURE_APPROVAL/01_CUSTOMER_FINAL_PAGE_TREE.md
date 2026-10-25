# 01 — Customer Account: Final Page Tree (for approval)

**Status: RECOMMENDED. Not approved.** Founder decisions B1–B8 (doc 16) gate this tree.
**Traceability:** refines audit docs 05 and 07 (audit commit `4863456`). Every route below was re-checked against `src/App.tsx` at that commit.

## Condition codes (brief §02)

| Code | Meaning |
|---|---|
| **A** | Visually approved / functionally incomplete |
| **B** | Functionally present / visually incomplete |
| **C** | Partially implemented |
| **D** | Missing entirely |
| **E** | Duplicated functionality |
| **F** | Obsolete / superseded |
| **G** | Complete but unverified |
| **H** | Verified complete. **No page qualifies today**, because no page has passed a signed-in backend test. |

## Changes from the audit proposal

1. **One new detail route:** `/account/hair/analyses/:analysisId`. Analysis results (and PSA "best looks") arrive *later* than the request, so the "your results are ready" notification and email need a permanent deep link. That makes **21 routed account pages (3 new)** instead of 20.
2. **Appointments become a tab of ORDERS.** Consultation and installation bookings are already checkout orders (`bookingFlowType`) plus `meetings` rows. Customers think of them as "things I bought and booked", so they stay out of a separate family.
3. **Addresses and Payment keep their current URLs** (`/account/shipping`, `/account/payment`). Only the breadcrumb and parent change (`SETTINGS > …`), so there is no redirect churn.
4. **Customer support is not a separate family.** Premium members have Concierge › Priority Messages. Everyone gets SETTINGS › MY REQUESTS plus a "Need help?" link on order detail and the overview footer.

## The tree

```
MY ACCOUNT
01 OVERVIEW ............ /account                                   KEEP+REPAIR   A
02 ORDERS .............. /account/orders                            KEEP+REPAIR   A
   ├ tab ORDERS (active · archived)
   ├ tab APPOINTMENTS (consultations · installs)                     NEW TAB       D
   ├ ORDER DETAIL ...... /account/orders/:orderId                   NEW           D
   │   └ LEAVE A REVIEW  /account/orders/:orderId/review             REPAIR        C
   ├ modal  VIEW CONSULT OFFER (ConsultOfferClaimModal)              KEEP          G
   └ exit   SIGN ORDER FORM → /tools/order-form?orderId=             KEEP          C
03 CONCIERGE (premium) . /account/concierge                         KEEP+REPAIR   C/E
   ├ section PRIORITY MESSAGES (+ reply thread)                      REPAIR        C
   ├ section SPECIAL OFFER                                           REPAIR        C
   ├ section ORDERS IN PROGRESS → order detail                       CONSOLIDATE   E (replaces duplicate tracking engine)
   └ section GIFTS (free gift · birthday gift)                       REPAIR        C
04 REWARDS ............. /account/rewards                           KEEP+REPAIR   A
   ├ tab MEMBERSHIP (plan · benefits · billing history · change/cancel → Stripe)
   ├ tab POINTS (balance · activity · redeem)
   ├ tab WALLET (vouchers · digital cash · Slay Tickets)
   │   ├ LOAD GIFT CARD  /account/load-card                         NEST+REPAIR   C (broken)
   │   └ exit BUY SLAY TICKETS → /tools/slay-tickets                 KEEP          C
   ├ tab SLAY CHALLENGE (moved from Concierge)                       MOVE          C
   ├ COLLECTIBLES ...... /account/collectibles                      NEST+REPAIR   B/C
   └ exit CHANGE PLAN → /checkout/upgrade (Stripe only)              REPAIR        C
05 MY HAIR ............. /account/hair                              NEW           D
   ├ tab PROFILE (hair profile · units I own · care lessons)
   ├ tab ANALYSES (credits · history · NEW ANALYSIS drawer)
   │   └ ANALYSIS DETAIL /account/hair/analyses/:analysisId          NEW           D
   └ tab BUILDS (saved Build-A-Wig designs → open in Atelier · duplicate · add to bag)
06 WISHLIST ............ /wishlist                                  KEEP          G
   └ LISTS ............. /wishlist/lists → /wishlist/lists/:listId   REPAIR        C
       └ SHARED LIST ... /wishlist/shared/:token (public)            REPAIR        C (broken)
07 REVIEWS & CONTENT ... /account/reviews                           KEEP+REPAIR   C
   ├ tab REVIEWS (published · pending · declined with reason)
   └ tab SUBMISSIONS (affiliate · Slay Cam · review media status)
08 EARN & SHARE (nav group, not a page)
   ├ AFFILIATE ......... /account/affiliate                         KEEP+REPAIR   A
   └ REFERRALS ......... /account/referrals                         KEEP+REPAIR   C
09 ALERTS .............. /account/alerts                            KEEP+REPAIR   C
10 SETTINGS ............ /account/settings                          KEEP+REPAIR   G/B
   ├ ADDRESSES ......... /account/shipping                          NEST+REPAIR   A
   ├ PAYMENT METHODS ... /account/payment                           NEST+REBUILD  A (placeholder)
   ├ section MY REQUESTS (support history)                           NEW SECTION   D
   ├ section PRIVACY & DATA                                          NEW SECTION   D
   └ modal  DELETE ACCOUNT                                           KEEP          G

ADJACENT (not account pages; linked from the tree)
/sign-in · /checkout/upgrade · /tools/slay-tickets · /tools/order-form · /build-a-wig/* (Atelier) · /lounge (Care, PSA)
/desktop/account (Desktop Penthouse, desktop phase)

RETIRED / RESTRICTED
/account/consult-offer → redirect /account/orders                     F
/tools/hairstyle-analysis → admin-only; customers redirect to /account/hair?tab=analyses   F (decision E2)
/mobile/profile · /mobile/concierge · /mobile/rewards · /mobile/analysis → unlinked placeholders (decision B6)
```

## Placement answers (brief §03 investigation list)

| Item | Where it lives | Type | Why |
|---|---|---|---|
| My Hair | Its own family `/account/hair` | Page + tabs | Holds three things customers return to (profile, analyses, builds) that currently have no home. One level deep. |
| Hair Analysis (the experience) | MY HAIR › ANALYSES › "NEW ANALYSIS" drawer. The PSA chat chip and the consult add-on stay as entry points. | Drawer + detail route | The generator already exists (`HairstyleAnalysisPreview`); it needs the customer's own inputs and persistence, not a new page |
| Hairstyle Analysis history | MY HAIR › ANALYSES list → ANALYSIS DETAIL | Tab + detail route | Results arrive asynchronously and need a deep link |
| Hairstyle Analysis credits | MY HAIR › ANALYSES header ("1 this month · 2 purchased") + OVERVIEW one-liner | Inline | Credits only matter at the moment of use |
| Membership entitlements | REWARDS › MEMBERSHIP (benefit list from `premiumBenefitsByTier`, with live status per benefit) | Tab | Membership and benefits are one decision for the customer |
| Build-A-Wig configurations / saved custom wigs | MY HAIR › BUILDS | Tab | "My designs" belong with "my hair", not with the wishlist (which holds catalog products) |
| Submitted custom wig orders | ORDERS › ORDER DETAIL (items show the configuration snapshot) | Detail | Once paid, a build is an order |
| Consultation bookings / history | ORDERS › APPOINTMENTS tab (upcoming · past · request change) | Tab | Bookings are purchases with a date |
| Product ownership | MY HAIR › PROFILE "Units I own" (from delivered orders) | Section | Drives care lessons and future recommendations |
| Care recommendations | ORDER DETAIL "Care for your unit" + MY HAIR › PROFILE → Lounge Care lessons (`/api/care/access`, already server-gated by ownership) | Cross-link | Existing Care entitlement system; reuse it |
| PSA education | Lounge (exit). Linked from MY HAIR › PROFILE care cards and from Alerts. No account page. | Exit | Education is an immersive Lounge experience, deliberately not an account list |
| Rewards history | REWARDS › POINTS (activity ledger) and WALLET (cash and voucher history) | Tabs | One ledger, two views |
| Slay Challenge progression | REWARDS › SLAY CHALLENGE (moved from Concierge; decision B4) | Tab | It is a rewards mechanic |
| Slay Cam contributions | REVIEWS & CONTENT › SUBMISSIONS | Tab | All the customer's submitted content, with status, in one place |
| Affiliate submissions | Submitted from AFFILIATE; status in REVIEWS & CONTENT › SUBMISSIONS | Page + tab | Program rules and submit stay together; status is unified |
| Referral history | EARN & SHARE › REFERRALS | Page | Exists |
| Customer support | Concierge › Priority Messages (premium) · SETTINGS › MY REQUESTS · "Need help?" on order detail · /brand/contact | Sections | No help-desk page needed |

## Family specifications

Shared rules for every family:
- **Auth:** signed-in customer. One account layout guard (doc 12) re-validates the Supabase session; APIs scope by the JWT user id.
- **States:** loading uses a glass-card skeleton on marble. Empty uses the alert-row typography canon (Covered By Your Grace title, gray Futura Demi body, red action). Error uses the same canon with RETRY. **No mock fallback in production.**
- **Responsive:** doc 12. Phone is the authority. Tablet and desktop use a centred column (max 720px; 960px for the list-heavy families: Orders, Rewards, My Hair). Ultra-wide is the same column on marble; it never stretches edge to edge.

### 01 OVERVIEW `/account`
| Field | Spec |
|---|---|
| Purpose | Who I am, what is in motion, what I hold, what to do next |
| Experience | The existing identity card and nav grid, with up to 5 status panels above them (audit doc 21) |
| Children / tabs | None. Panels link out. |
| Modals | Photo crop (keep); voucher, cash and ticket history become links to REWARDS › WALLET |
| Entry | Header account icon; sign-in return; email footer "My account" |
| Exit | Every family; Lounge tour |
| Server data | `GET /api/account/overview` (new aggregate): profile, active orders, ledger balances, analysis usage, action-needed items |
| Permissions | Owner only |
| Mobile | Single column; panels stack; tap targets ≥44px (today 9px CHANGE/RESET) |
| Tablet / desktop / ultra-wide | 720px column. The Desktop Penthouse redirect is decision B5. |
| Assets | Existing marble, card styles, FS monogram avatar; **no new assets** |
| Status | A |

### 02 ORDERS `/account/orders`
| Field | Spec |
|---|---|
| Purpose | Every purchase and booking, with its true status |
| Experience | The existing active/archived list keeps its visual. A row opens ORDER DETAIL instead of a 2,000-line inline expansion. |
| Tabs | ORDERS · APPOINTMENTS |
| Detail | `/account/orders/:orderId`: status timeline (server events), tracking link, items with the BAW configuration snapshot, payment method used, receipt, signed form, care resources, "Need help?" modal, LEAVE A REVIEW when eligible on the server |
| Modals / drawers | Consult offer (keep); Need help (new, creates a support request) |
| Entry | Overview "Orders in motion"; order emails (permanent deep links, doc 05 CSV); Concierge |
| Exit | Order form; Lounge Care; review |
| Server data | `customer_orders`, `customer_order_items`, `order_status_events`, `meetings` (appointments), `consult_quotes` |
| States | Empty: "No orders yet → Explore the Atelier" |
| Status | A (list) / D (detail, appointments) |

### 03 CONCIERGE `/account/concierge` (premium)
| Field | Spec |
|---|---|
| Purpose | The white-glove channel for members |
| Sections | Priority messages with a reply thread · special offer · orders in progress (summary cards linking to ORDER DETAIL) · gifts |
| Removed from page | The duplicate 9-stage tracking engine (moves to order detail); Slay Challenge (moves to REWARDS); Slay Quests (hidden until real, decision D-series) |
| Permissions | **Server-gated premium** (today only the hub card is gated; the route is open) |
| Server data | `priority_messages` + replies (`support_requests`), `app_config.special_offer`, gift claims (ledger events) |
| Assets | PSA concierge avatar and Concierge section headers (existing) |
| Status | C / E |

### 04 REWARDS `/account/rewards`
| Field | Spec |
|---|---|
| Purpose | Membership plan and everything the customer has earned or holds |
| Tabs | MEMBERSHIP · POINTS · WALLET · SLAY CHALLENGE |
| Child pages | LOAD GIFT CARD (`/account/load-card`), COLLECTIBLES (`/account/collectibles`) |
| Exits | `/checkout/upgrade` (Stripe only); Stripe customer portal (decision A4); `/tools/slay-tickets` |
| Server data | `profiles` membership mirror, `membership_payments`, `loyalty_ledger`, `wallet_ledger`, `customer_vouchers`, `slay_ticket_transactions`, `slay_challenge_progress`, `user_collectibles` |
| Assets | Loyalty medallion, premium chart, 10 × 3 collectible phase art (**must not be regenerated**) |
| Status | A |

### 05 MY HAIR `/account/hair` (NEW)
| Field | Spec |
|---|---|
| Purpose | One place for the customer's hair: profile, analyses, designs |
| Tabs | PROFILE · ANALYSES · BUILDS |
| Detail | `/account/hair/analyses/:analysisId`: result image, looks, recommended units → open in Atelier |
| Drawers | NEW ANALYSIS (consumes a credit on the server, with consent text) · EDIT HAIR PROFILE |
| Cross-links | Atelier (`/build-a-wig/<unit>/customize?build=`), Lounge Care, consult booking |
| Server data | `hair_profile`, `hairstyle_analysis_results`, `hairstyle_analysis_usage`, `saved_configurations`, delivered `customer_order_items` (ownership) |
| Assets | Existing analysis card templates and BAW preview images. Missing: a profile/empty-state illustration is optional, and the existing medallion style suffices. |
| Status | D (gated by decision B2) |

### 06 WISHLIST `/wishlist`
Keep as it is: server-synced. Lists and share tokens move to the server (`wishlist_lists`). Fix the back target (currently `/build-a-wig`). Status: G (wishlist), C (lists, shared).

### 07 REVIEWS & CONTENT `/account/reviews`
Tabs REVIEWS (status with reason; delete own) and SUBMISSIONS (affiliate, Slay Cam and review media with state). Data: `reviews`, `content_submissions`. Status: C.

### 08 EARN & SHARE (group)
AFFILIATE: program rules and submission; points from the ledger, with caps enforced on the server. REFERRALS: code, invite, history from `referral_earnings`/`wallet_ledger`. Amounts are founder decisions (D-series). Status: A / C.

### 09 ALERTS `/account/alerts`
NEW/SEEN backed by `customer_notifications` with server read-state; archive and delete persist. Status: C.

### 10 SETTINGS `/account/settings`
Personal info, password and security, notifications (enforced by senders), privacy and data (new: export, consent withdrawal, selfie deletion), MY REQUESTS (new), ADDRESSES and PAYMENT METHODS as children, DELETE ACCOUNT. Status: G (core) / D (new sections).

## Navigation (recommended labels; final wording is decision B8)

`OVERVIEW · ORDERS · CONCIERGE · REWARDS · MY HAIR · WISHLIST · REVIEWS & CONTENT · EARN & SHARE · ALERTS · SETTINGS`

- **Depth:** at most two levels below MY ACCOUNT (family → child page or detail). Tabs don't count as depth.
- **Breadcrumbs:** `ACCOUNT > FAMILY` and `FAMILY > CHILD` (e.g. `ORDERS > #014`, `REWARDS > GIFT CARD`, `MY HAIR > ANALYSIS`).
- **Phone:** the existing hamburger menu-toggle card gains an ACCOUNT tab listing the 10 families. **Desktop:** the same menu. A persistent account side rail at ≥1024px is optional (decision G1).
