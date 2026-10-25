# 03 — Customer Account: AS-IS Page Tree

This is the tree as the code implements it today, not the provisional tree from the brief. Each node carries its maturity status (see doc 09) and node type.

Node types: **PAGE** · **CHILD PAGE** · **TAB** · **SECTION** (an in-page panel) · **MODAL** · **INLINE** (expand-in-place) · **EXTERNAL** (outside the account area) · **REDIRECT** · **PARALLEL SHELL** (a duplicate surface in the Mobile/Desktop Mansion).

Maturity tags: `OK*` = FUNCTIONALLY_COMPLETE_VISUALLY_INCONSISTENT · `LOOKS-DONE` = VISUALLY_COMPLETE_FUNCTIONALLY_INCOMPLETE · `PARTIAL` · `SHELL` · `PLACEHOLDER` · `BROKEN` · `DEPRECATED` · `UNREACHABLE`. **No page is COMPLETE_AND_VERIFIED**, because none has functional test evidence.

```
/sign-in  ............................................. PAGE  OK*   (returnTo keeps path+query, drops #hash)
│
/account  "ACCOUNT > PROFILE"  ......................... PAGE  LOOKS-DONE
│   (≥768px viewport → REDIRECT /desktop/account)
├── Profile card ...................................... SECTION
│   ├── CHANGE PHOTO / crop ........................... MODAL   PARTIAL (fallback shows fake "PHOTO SAVED")
│   ├── RESET photo ................................... MODAL   BROKEN  (local only; server photo returns)
│   ├── VOUCHERS: n AVAILABLE ......................... MODAL   BROKEN  (list wiped to [] for every non-founder)
│   ├── SLAY TICKETS .................................. MODAL   PARTIAL (server balance; mint exploit, doc 13)
│   ├── DIGITAL CASH .................................. MODAL   PARTIAL (localStorage balance; mock history for founder)
│   ├── LOAD GIFT CARD → /account/load-card ........... CHILD PAGE BROKEN (codes exist only in admin's browser)
│   ├── VIEW AS CLIENT / ADMIN (founder) .............. INLINE  OK
│   └── ADMIN: FOUNDER → /admin/dashboard ............. EXTERNAL
├── Nav cards (12) .................................... SECTION OK (navigation works)
│   ├── CONCIERGE → /account/concierge (subscribers only) ...... PAGE PARTIAL
│   │   ├── PRIORITY MESSAGES (premium) ............... SECTION PARTIAL (send works; no reply/thread view)
│   │   ├── SPECIAL OFFER (6/12-mo) ................... SECTION PARTIAL (client-priced cart line)
│   │   ├── ORDER TRACKING (9 stages) ................. SECTION PLACEHOLDER-DATA (dates/times synthesized client-side)
│   │   ├── SLAY CHALLENGE (6/12-mo) .................. SECTION SHELL (selection UI only; progress never advances)
│   │   ├── SLAY QUESTS ............................... SECTION PLACEHOLDER (hard-coded progress shown as live)
│   │   ├── FREE GIFT ................................. SECTION PLACEHOLDER (fake "you'll receive…")
│   │   └── BIRTHDAY GIFT ............................. SECTION PLACEHOLDER (fake; eligibility unused)
│   ├── ALERTS → /account/alerts  "ACCOUNT > ALERTS" .. PAGE PARTIAL (archive/delete revert)
│   │   ├── NEW | SEEN ................................ TAB
│   │   └── (/account/notifications) .................. REDIRECT
│   ├── ORDERS → /account/orders  "ACCOUNT > ORDERS" .. PAGE LOOKS-DONE (local orders; server stub overwrites)
│   │   ├── ACTIVE / ARCHIVED ......................... SECTION
│   │   ├── order row ................................. INLINE (summary, shipping, timeline, tracking, payment, rewards)
│   │   ├── SIGN ORDER FORM → /tools/order-form ....... EXTERNAL
│   │   ├── CLICK HERE TO TRACK → /account/concierge#order-tracking .. EXTERNAL (duplicate tracking engine)
│   │   ├── VIEW OFFER (consult) ...................... MODAL OK (ConsultOfferClaimModal)
│   │   ├── LEAVE A REVIEW → /account/orders/:id/review  CHILD PAGE PARTIAL (button UNREACHABLE: needs DELIVERED)
│   │   └── (/orders) ................................. REDIRECT
│   ├── REWARDS → /account/rewards  (membership/page.tsx) ...... PAGE LOOKS-DONE
│   │   ├── Membership status / tier bar .............. SECTION client-computed
│   │   ├── LOYALTY REWARDS chart + REDEEM ×10 ........ MODAL PLACEHOLDER (fake redeem)
│   │   ├── PREMIUM chart 3/6/12 → CONFIRM SUBSCRIPTION → /checkout/upgrade  EXTERNAL PARTIAL
│   │   │       ├── SUBSCRIBE WITH CARD (Stripe) ...... OK (real Stripe subscription)
│   │   │       └── CONFIRM ORDER (non-Stripe) ........ BROKEN (grants PREMIUM locally, no charge)
│   │   ├── CANCEL SUBSCRIPTION ....................... MODAL BROKEN (local flag only; Stripe keeps billing)
│   │   ├── Points history ............................ SECTION client-computed
│   │   └── More ways to earn ......................... SECTION PLACEHOLDER (no points awarded)
│   ├── COLLECTIBLES → /account/collectibles .......... PAGE PARTIAL (education certifications only)
│   ├── SLAY CAM → /slay-cam .......................... EXTERNAL LOOKS-DONE (static, fabricated UGC; "submit" loops back to /account)
│   ├── REVIEWS → /account/reviews  SHOP | TOOLS ....... PAGE PARTIAL (pending hidden; TOOLS always empty)
│   │   └── add supplemental media .................... MODAL OK
│   ├── AFFILIATE → /account/affiliate ................ PAGE LOOKS-DONE (submit reaches server queue; points wrong)
│   ├── REFERRALS → /account/referrals  ACTIVE | PAST . PAGE PARTIAL (localStorage only; not cross-device)
│   ├── PAYMENT METHOD → /account/payment ............. PAGE PLACEHOLDER (raw PAN/CVV inputs, last-4 saved locally)
│   ├── SHIPPING ADDRESS → /account/shipping .......... PAGE LOOKS-DONE (addresses wiped on next sync)
│   └── SETTINGS → /account/settings .................. PAGE OK*
│       ├── Personal info / Socials ................... SECTION OK (PATCH /api/profile)
│       ├── Password .................................. SECTION OK
│       ├── Notifications (4 toggles) ................. SECTION PARTIAL (saved, weakly enforced)
│       ├── Help Center → /brand/faq | /brand/contact | /brand/terms  EXTERNAL
│       └── DELETE ACCOUNT ............................ MODAL OK
├── TAKE / REPLAY THE MANSION TOUR .................... EXTERNAL (Tutorial OS)
└── SIGN OUT .......................................... MODAL OK on hub (4 different sign-out implementations site-wide)

Header heart → /wishlist  "ACCOUNT > WISHLIST" ......... PAGE OK* (server-synced)
├── VIEW LISTS → /wishlist/lists ...................... CHILD PAGE PARTIAL (lists localStorage only)
│   └── /wishlist/lists/:listId ....................... CHILD PAGE PARTIAL
│       └── SHARE → /wishlist/shared/:token ........... PAGE BROKEN (link works only in owner's browser)
└── EDIT IN BUILD-A-WIG → /build-a-wig/<unit>/edit .... EXTERNAL PARTIAL (premium-only gate vs canon "sign-in only")

UNLINKED / LEGACY
/account/consult-offer?id= ............................ PAGE DEPRECATED (no inbound link; ADD TO BAG disconnected)
/tools/hairstyle-analysis ............................. PAGE UNREACHABLE-from-nav · PARTIAL (admin debug harness with
                                                        "KATEENA ARMSTRONG" demo data; consumes a real member credit)
/tools/slay-tickets → /checkout/slay-tickets .......... EXTERNAL PARTIAL (server ledger; no payment proof)

PARALLEL SHELLS (same concepts, different surfaces)
/desktop/account (Penthouse Suite dashboard, ≥768px) .. PARALLEL SHELL PARTIAL (summary tiles; client-computed numbers)
/mobile/profile ....................................... PARALLEL SHELL PLACEHOLDER (slots only; unguarded)
/mobile/concierge ..................................... PARALLEL SHELL PLACEHOLDER
/mobile/rewards ....................................... PARALLEL SHELL PLACEHOLDER
/mobile/analysis ...................................... PARALLEL SHELL PLACEHOLDER

EMBEDDED, NOT ROUTED
PSA "FIND MY BEST LOOKS" (chat widget) ................ INLINE BROKEN (server returns picks; client discards them and promises "within 24 hours")
Booking consult "Style analysis add-on" ($20/$60) ..... INLINE LOOKS-DONE (paid; no fulfilment path)
```

## Navigation model as implemented

- **There is no shared account layout.** About 12 pages each copy a ~150–250-line nav bar (back, breadcrumb, cart, hamburger) plus the full SHOP/TOOLS/BRAND menu panel.
- Movement between pages:
  - hub cards
  - the `ACCOUNT >` breadcrumb word
  - back arrows, with inconsistent targets: `navigate(-1)`, `/account`, or `/build-a-wig` on Wishlist
  - in-page buttons
  - header account and heart icons, visible only while the menu is open
- **Each account route re-runs `syncAllFromApi()`** (its own guard instance), so every hop between account pages shows "Loading…".
- Breadcrumb labels are mostly consistent (`ACCOUNT > X`). The exceptions are `ORDER > REVIEW`, `WISHLIST > LISTS`, `LISTS > <NAME>`, `ACCOUNT > BALANCE` for load-card, `ACCOUNT > PROFILE` for the hub, and none at all on consult-offer.

Full per-page evidence (file:line) is in `appendix/A_customer_account.md` and `appendix/B_membership_rewards.md`.
