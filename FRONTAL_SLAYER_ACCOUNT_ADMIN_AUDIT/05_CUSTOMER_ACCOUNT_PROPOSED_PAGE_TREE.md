# 05 — Customer Account: PROPOSED (TO-BE) Page Tree

**Status: a proposal. The founder must approve it (FD-A1 in doc 24).** Nothing here has been implemented.

## Design rules applied

1. **Reuse every working route.** All 18 core customer routes that exist today are kept at their current URLs, so deep links, emails and bookmarks keep working. The only new routes are three where a customer task currently has no home at all.
2. **Tabs, not pages, for siblings that share one data family.** Membership, points and wallet are tabs of `/account/rewards`, which is where the code already lives. Hair profile, analyses and saved builds are tabs of one new page.
3. **The overview is a dashboard, not a second menu.** The hub keeps its card grid as the navigation section and gains status panels above it (doc 21).
4. **Order tracking has one home.** The Concierge tracking engine and the Orders tracking display are two implementations of the same thing. The proposal routes both to one order detail.
5. **No placeholder routes.** Mobile Mansion slot pages stay out of the account tree until they have content.
6. **The visual shell does not change.** Marble, translucent glass cards, `ACCOUNT > X` breadcrumbs and Futura/Covered By Your Grace stay (doc 18).

## How the provisional tree from the brief was evaluated

| Provisional section | Decision | Why |
|---|---|---|
| OVERVIEW | **KEEP** as `/account` (enhanced) | The hub exists. It needs status panels (doc 21). |
| MY PROFILE | **MERGE** into SETTINGS | Personal info, contact and preferences already live in `/account/settings`. A second profile page would duplicate it. Addresses stay as a child page. |
| MY ORDERS | **KEEP** plus **NEW order detail route** | Emails and support need a deep link to one order. Returns and documents become sections of the detail page. |
| MY HAIR | **NEW, one page with tabs** (founder approval) | Analysis results, saved builds and hair preferences have **no home today**, and the data isn't persisted (doc 16). |
| MEMBERSHIP | **TAB** of `/account/rewards` | The code already combines them (`membership/page.tsx`). Splitting them would duplicate the tier logic. |
| REWARDS | **TABS** of `/account/rewards` (POINTS, WALLET, SLAY CHALLENGE) plus `/account/collectibles` child | Shares one ledger family (doc 15). |
| MY COLLECTION | **REUSE** `/wishlist` (+ lists) and `/account/collectibles`; "Saved looks" → MY HAIR › SAVED BUILDS | Wishlist exists and works. A separate "collection" page would duplicate it. |
| COMMUNITY | **DEFER**. Show a "MY SUBMISSIONS" status list inside `/account/reviews` (renamed "MY REVIEWS & CONTENT") | Slay Cam has no submission pipeline yet (doc 17). Do not build a community page with nothing behind it. |
| AFFILIATE | **KEEP** `/account/affiliate`, grouped with Referrals in the nav as "EARN & SHARE" | Both pages exist. Only their data layer is broken. |
| SUPPORT | **SECTION**, not a page: Settings › Help Center + Concierge › Priority Messages (with replies) + a "MY REQUESTS" list (needs `support_requests`, doc 14) | Premium concierge messaging already exists. Standard members need a contact path and a request status, not a full help desk. |
| SETTINGS | **KEEP**; add a Privacy & Data section; Addresses and Payment become its children | Already the most complete account page. |

## Proposed tree

```
MY ACCOUNT  /account  "ACCOUNT > OVERVIEW"                         [ENHANCE — Type A+B]
│   Panels (glass): Signed-in identity + membership badge · Orders in motion ·
│   Rewards wallet (points · digital cash · vouchers · slay tickets) · Hair analysis credit ·
│   Action needed (sign order form · review delivered order · payment failed · unfinished build) ·
│   Next best action.  Then the existing nav-card grid (unchanged visual).
│
├── MY ORDERS  /account/orders  "ACCOUNT > ORDERS"                 [KEEP — Type B]
│   ├── ACTIVE | ARCHIVED ......................................... TAB (existing sections)
│   ├── order row ................................................. INLINE summary (existing)
│   ├── ORDER DETAIL  /account/orders/:orderId  "ORDERS > #NNN"     [NEW ROUTE — Type B]
│   │   ├── Status timeline (server status events) + tracking link
│   │   ├── Items (incl. Build-A-Wig configuration snapshot)
│   │   ├── Payment (method used, receipt) · Documents (signed order form)
│   │   ├── Care resources (existing care entitlements)
│   │   ├── NEED HELP? → creates a support request tied to the order ... MODAL
│   │   └── LEAVE A REVIEW  /account/orders/:orderId/review ........ CHILD PAGE [KEEP — Type B]
│   ├── VIEW OFFER (consult) ...................................... MODAL [KEEP]
│   └── SIGN ORDER FORM → /tools/order-form?orderId=…  ............. EXTERNAL [KEEP]
│
├── CONCIERGE  /account/concierge  (premium)  "ACCOUNT > CONCIERGE" [KEEP — Type B]
│   ├── PRIORITY MESSAGES + reply thread .......................... SECTION (add replies)
│   ├── SPECIAL OFFER ............................................. SECTION
│   ├── MY ORDERS IN PROGRESS → links to ORDER DETAIL ............. SECTION (replaces the duplicate tracking engine*)
│   └── GIFTS (Free Gift · Birthday Gift) ......................... SECTION (needs server fulfilment)
│       * founder decision FD-A3
│
├── REWARDS & MEMBERSHIP  /account/rewards  "ACCOUNT > REWARDS"     [KEEP — Type B]
│   ├── MEMBERSHIP ... plan, benefits, renewal date, billing history (membership_payments),
│   │                  CHANGE PLAN (Stripe), MANAGE / CANCEL (Stripe portal) ... TAB
│   ├── POINTS ....... balance + activity ledger + REDEEM ........ TAB
│   ├── WALLET ....... vouchers · digital cash · slay tickets ..... TAB
│   │   ├── LOAD GIFT CARD  /account/load-card .................... CHILD PAGE [KEEP — Type B]
│   │   └── BUY SLAY TICKETS → /tools/slay-tickets ................ EXTERNAL
│   ├── SLAY CHALLENGE (moved from Concierge*) ................... TAB  * founder decision FD-A4
│   └── COLLECTIBLES  /account/collectibles ....................... CHILD PAGE [KEEP]
│
├── MY HAIR  /account/hair  "ACCOUNT > MY HAIR"                    [NEW PAGE — founder approval FD-A2]
│   ├── HAIR PROFILE (cap size/head measurements, texture, colour, density preferences;
│   │                 reused by Hair Analysis, Build-A-Wig, consult booking) ...... TAB
│   ├── ANALYSES (saved Hairstyle Analysis + PSA picks; credits remaining) ....... TAB
│   └── SAVED BUILDS (named Build-A-Wig configurations → OPEN IN BUILD-A-WIG / ADD TO BAG / DUPLICATE) .. TAB
│
├── WISHLIST  /wishlist  "ACCOUNT > WISHLIST"                     [KEEP — Type A]
│   └── LISTS  /wishlist/lists → /wishlist/lists/:listId ......... CHILD PAGES [KEEP — Type B: server lists]
│       └── SHARED LIST  /wishlist/shared/:token (public) ......... PAGE [KEEP — Type B: server tokens]
│
├── MY REVIEWS & CONTENT  /account/reviews                        [KEEP, relabel — Type B]
│   ├── REVIEWS (published · pending · declined w/ reason) ........ TAB
│   └── SUBMISSIONS (affiliate + future Slay Cam status) .......... TAB
│
├── EARN & SHARE (nav group, not a page)
│   ├── AFFILIATE  /account/affiliate ............................. PAGE [KEEP — Type B]
│   └── REFERRALS  /account/referrals ............................. PAGE [KEEP — Type B]
│
├── ALERTS  /account/alerts  NEW | SEEN                           [KEEP — Type B: server read-state]
│
└── SETTINGS  /account/settings                                   [KEEP — Type A]
    ├── Personal information · Password & security · Notifications · Privacy & data (NEW section) · Help center
    ├── ADDRESSES  /account/shipping  "SETTINGS > ADDRESSES" ...... CHILD PAGE [KEEP — Type B]
    ├── PAYMENT METHODS  /account/payment ......................... CHILD PAGE [REBUILD on Stripe — Type B/C]
    ├── MY REQUESTS (support history) ............................. SECTION [NEW — needs support_requests]
    └── DELETE ACCOUNT ............................................ MODAL [KEEP]

RETIRE / REDIRECT
/account/consult-offer → /account/orders (consult offers are a modal already)
/account/notifications → /account/alerts (exists)       /orders → /account/orders (exists)
/tools/hairstyle-analysis → admin-only (founder decision FD-A6); customer entry = MY HAIR › ANALYSES
/mobile/profile, /mobile/concierge, /mobile/rewards, /mobile/analysis → keep out of the account tree (FD-A7)
```

## Page count

| | AS-IS | TO-BE |
|---|---|---|
| Routed customer account pages | 18 core (+10 adjacent/parallel) | **20** (18 kept, `consult-offer` retired, 3 new: order detail, MY HAIR; MY REQUESTS is a section, not a page) |
| New routes | — | `/account/orders/:orderId`, `/account/hair` |
| Retired routes | — | `/account/consult-offer` (redirect) |

## Recommended navigation hierarchy (labels)

```
ACCOUNT
  OVERVIEW · ORDERS · CONCIERGE (premium) · REWARDS · MY HAIR · WISHLIST ·
  REVIEWS & CONTENT · EARN & SHARE (AFFILIATE, REFERRALS) · ALERTS · SETTINGS
```

Breadcrumbs keep the current `ACCOUNT > X` grammar. Children use `PARENT > CHILD` (e.g. `ORDERS > #014`, `SETTINGS > ADDRESSES`, `REWARDS > GIFT CARD`).

## Mobile navigation behaviour (FRONTAL SLAYER's own rules, not Studio World's)

- Keep the existing hamburger menu-toggle card (`MENU_TOGGLE_PANEL_HEIGHT`, `src/layouts/menuToggleHeights.ts`). Add an **ACCOUNT tab** to it that lists the 10 labels above, so users don't have to bounce back to the hub between child pages.
- **One shared `AccountShell`** (nav bar + menu + marble + main glass card + `PageActionsBelowCard`) replaces the 12 copy-pasted nav bars. It carries the same markup, so there is no visual change.
- **One guard around the whole account subtree**, mounted as a layout route, so navigating between account pages no longer re-runs full sync behind "Loading…".
- Back arrow behaviour: children go to their parent (`ORDERS > #014` → `/account/orders`), and top-level account pages go to `/account`. Wishlist no longer jumps to `/build-a-wig`.
- Page scrolling follows the existing document-scroll pattern. Do **not** import the Studio World no-page-scroll rule. Remove nested fixed-height scroll boxes (doc 19).
- Hash deep links (`#order-tracking`, `#priority-messages`) must survive sign-in (`signInReturnTo.ts` currently drops the hash).
