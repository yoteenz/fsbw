# S — S0B-2 application containment inputs and privileged-secret map

This is read-only research of `/home/user/fsbw` (FS) and `/home/user/SITE00` (S00). I made no edits, no builds, no DB or network calls, and printed no env values. Line numbers are against the working trees as of 2026-10-25.

The research reuses `evidence/X2_crossproject_stripe_routes.md`, `11_SECURITY_AND_MONEY_RISK_REGISTER.md` and `07_ORDER_PAYMENT_AND_STRIPE_AUTHORITY.md`. Where the code disagrees with those documents, the entry is marked **CORRECTION**. Anything not proven by reading code is marked **INFERRED**.

---

## Corrections to prior evidence (read first)

1. **R-03 is wrong about Build-A-Wig being blocked: BAW lines are charged, at the wrong price.** BAW cart lines are named `NOIR`, `BLANCO`, `SOFT WAVE`, `BEACH WAVE`, `SOFT CURL` or `OCEAN CURL` (`src/pages/build-a-wig/page.tsx:4734-4778`). Every one of those names is in the server map `UNIT_BASE_USD_BY_NAME` (`api/_lib/pricing/resolveQuote.ts:77-85`). As a result:
   - `resolveUnitLike` (`resolveQuote.ts:181-204`) prices each BAW line as **base price + cap surcharge only**, and the line counts as resolved.
   - The client never sends length, density, color, lace, hairline, styling or add-ons to the server (`src/utils/checkoutQuote.ts:40-55`), so the server cannot see them at all.
   - The PaymentIntent is created, so card checkout goes through and **undercharges every customised BAW line**. The block message "CANNOT BE PAID BY CARD YET" (`src/pages/checkout/page.tsx:6566-6575`) does not fire.
   - That block only fires for BCF bundles, the `gift-card`/`membership`/`subscription` types, unknown names, or a failed quote.
   - The same undercharge applies to consult-offer lines (`src/utils/consultOfferFromQuote.ts:300-330`, `name: unitKey`) and to any PDP line whose options are not the defaults.
2. **Concierge test-order injection reaches every signed-in customer, normally on their first visit.**
   - For non-founder accounts, the first load writes an empty `userOrders_<email>` key (`src/pages/account/concierge/page.tsx:1762-1768`).
   - Any later run of `getActiveOrders` enters the unguarded upsert block (`:1913-2203`), which adds `test-order-1` through `test-order-5`.
   - `getActiveOrders` re-runs on `focus`, `storage` and `signInStateChanged` (`:2242-2251`). So in practice the injection happens on the customer's first visit, or immediately if they already have local orders.
3. **There is a second hair-analysis grant defect besides the 4-pack one.** The webhook passes counts `[1,4]` to the grant RPC (`api/stripe/webhook.ts:280-289`). The SQL keeps only the 1 and **still records the PaymentIntent as granted** (`20260610140000_hairstyle_analysis_paid_credits.sql:183-215`). A mixed 1-pack + 4-pack cart therefore loses the 4-pack permanently: a replay is treated as a duplicate.
4. **A client can set its own `profiles.stripe_customer_id` through a server endpoint, which the privileged-column trigger does not stop.** `create-product-payment-intent.ts` accepts `body.stripeCustomerId` (`:137`) and attaches it to the PaymentIntent (`:175`). With `savePaymentMethodForFuture:true` it also writes that id to `profiles` using the admin client (`:160-167`). The admin client is service-role, so it bypasses `profiles_preserve_privileged_columns`. No shipped client sends either field, but any signed-in user can call the endpoint directly.

---

# PART 1 — S0B-2 application containment spec inputs (fsbw)

## a. Build-A-Wig checkout and the custom-quote path

### Current behaviour
| Piece | Location | Behaviour |
|---|---|---|
| BAW line built (new item) | `src/pages/build-a-wig/page.tsx:4722-4780` (`handleAddToBag`, "Create new cart item" branch). Pushed to `localStorage.cartItems` at `:4826-4848` | id `build-a-wig-<ts>-<rand>`. `name`/`productName` is the unit name. `price: totalPrice` is computed on the client. Options are stored on the line: capSize, length, density, color, texture, lace, hairline, styling, partSelection, addOns. There is **no `type` field**. |
| BAW line edited | `page.tsx:4500-4600` (edit-mode save). Writes back to wishlist, saved-for-later or cart | Same shape. `price` is recomputed on the client. |
| Client option pricing | `src/pages/checkout/page.tsx:171-212` (`VOUCHER_TYPE_CONFIG`, `getVoucherAddOnPriceForItem`: colour +$120, hairline PEAK +40 / LAGOS +60, styling via `computeBawStylingPriceUsd`). The BAW sub-pages hold the other option prices (e.g. add-ons `BLEACH:100, PLUCK:120, 'BLUNT CUT':40` in the debug payload at `build-a-wig/page.tsx:4799`) | Client only. The server has no copy. |
| Quote payload | `src/utils/checkoutQuote.ts:40-55` (`cartItemsToQuoteLines`) | Sends id, name, quantity, type, the booking fields, the bcf fields, capSize and the analysis counts. **No BAW option fields.** |
| Server quote | `api/_lib/pricing/resolveQuote.ts:210-283` (`resolveCheckoutQuoteLines`). Unit lines go to `resolveUnitLike` `:181-204`. BCF `:227-238`. gift/membership `:255-266` | Name lookup, then `base + capSizeSurchargeUsd` (`:91-96`). BAW and consult-offer lines resolve at list price. `id` is ignored. |
| PaymentIntent | `api/stripe/create-product-payment-intent.ts:107-121` (refuses if `!fullyResolved`), then `:170-192` | Charges the server total. **No line items** in the metadata. |
| "CANNOT BE PAID BY CARD YET" | `src/pages/checkout/page.tsx:6564-6575`, inside the CONFIRM ORDER handler (`:6423`, button `:7181`) | Shown when `!quoteResult.ok \|\| !quote.fullyResolved`. **BAW lines do not trigger it** (see Correction 1). |
| Server-amount line | `checkout/page.tsx:797-820` (preview quote effect), `:5057-5083` ("YOUR CARD WILL BE CHARGED …") | Shows the server amount, which is lower than the displayed BAW subtotal. This is the only place the customer could notice. |
| Order of record | Local `order-N` (`checkout/page.tsx` ~`:2795-2832`). Webhook writes a generic order (`api/_lib/recordProductOrderFromPaymentIntent.ts:35-62`) | The BAW spec exists **only in the customer's browser**. |

### Existing consult-quote / consult-offer flow (a possible carrier for "request my custom quote")
| Step | Location | What it does |
|---|---|---|
| Admin composes the offer | `src/pages/admin/meetings/AdminMeetingsHub.tsx:1316` (`postAdminConsultQuote`). `BAW_CUSTOM_SEND_OFFER_OPTION_ID='CUSTOM'` (`src/utils/bawCustomSendOfferOption.ts:2`, used at `AdminMeetingsHub.tsx:235,313,412,1050-1055`) | Admin picks unit and options (including "CUSTOM") and sends. |
| Server creates the offer | `api/admin/consult-quotes.ts:18-155` (`requireAdmin` `:24`; insert `consult_quotes` `:67-82`; notification append `:110-131`; audit `:133`; email `consult_offer_sent` `:142`) | Stores `unit_key`, `selections` (jsonb), `price_breakdown` (an admin-supplied **array of `{label,value}` strings**, not a number), `discount_code` `CONSULT-XX###`, `discount_amount_usd: 40`, and a 72h `expires_at`. **No authoritative total amount is stored.** |
| Table | `supabase/migrations/20260402210000_meetings_category_consult_quotes.sql:20-44` (select-own RLS only); `20260403140000_consult_quotes_redeemed_at.sql` (adds `redeemed_at`) | No insert or update policy for users. Writes happen through the admin client only. |
| Customer fetches the offer | `api/consult-quote.ts:6-35` (GET `?id=`, owner-scoped). Client `src/utils/api.ts:1889` | |
| Claim | `src/components/ConsultOfferClaimModal.tsx` (cart write `:202-296`), mounted at `src/pages/orders/page.tsx:4127`; route `/account/consult-offer` (`src/App.tsx:687,3494`) | Builds a cart line with `buildConsultOfferCartItemFromQuote` (`src/utils/consultOfferFromQuote.ts:229-330`). **The client recomputes the price** from `calculateSpecialOfferPriceBreakdown(unitId, selections)` minus `discount_amount_usd`. The line's `name` is the unit key, and it carries `consultOfferQuoteId` and `consultOfferDiscountCode`. |
| Validate code | `api/checkout/validate-consult-code.ts:81-128`; caller `checkout/page.tsx:2273` | Owner, not expired, not redeemed. Returns `amountUsd`. |
| Redeem | `api/checkout/redeem-consult-code.ts:20-61`; callers `checkout/page.tsx:3116-3121, 7065-7070` | Sets `redeemed_at` **after the client-side "paid" order**. There is no payment proof. |
| Server price of a claimed offer | none | The server prices it by name at list price; it ignores `consultOfferQuoteId` and the $40 credit. |

### Minimal containment (described, not implemented)
1. **Client classification.** In `cartItemsToQuoteLines` (`checkoutQuote.ts:40-55`), tag lines whose id starts with `build-a-wig-` or `consult-offer-`, or that carry non-default option fields, with `type:'baw-custom'`. Also send the option fields. In `resolveCheckoutQuoteLines`, add a `t === 'baw-custom'` branch next to `:240-253` that returns `resolved:false` with the note "custom build — request a quote".
2. **Server must not rely on the tag.** Because a client can omit `type`, `create-product-payment-intent.ts:78-105` should also treat a line as unresolved when it carries any option field (length, density, color, lace, hairline, styling, addOns) that differs from the PDP defaults, or an id with those prefixes. Interim stricter variant: resolve unit names **only** when `id` matches the PDP prefixes (`noir-`, etc., `src/pages/straight/noir/page.tsx:1695`). (INFERRED: the PDP id prefixes need a sweep over every unit page listed by `grep "localStorage.setItem('cartItems'"`.)
3. **Checkout UI.** When the cart has a `baw-custom` line, replace the card section and CONFIRM ORDER for that line with **"REQUEST MY CUSTOM QUOTE"**.
   - The button posts the line spec (unit, selections, visual snapshot, client-displayed estimate labelled "ESTIMATE") to a new customer endpoint `POST /api/consult-quote-request`.
   - That endpoint writes a request row, or a `meetings` row with category consult (the existing pipeline), and raises an admin alert.
   - Other cart lines stay payable on their own; the BAW line moves to "Saved for quote".
4. **Admin turns the request into an offer.** Admin uses the existing AdminMeetingsHub "Send offer" (`:1316`) → `/api/admin/consult-quotes`. **Required addition:** the admin enters a numeric `amount_usd_cents`, stored server-side. That needs a new column on `consult_quotes` (additive migration, FS-owned table; SITE00 does not use it, per X2 §1a).
5. **Payment of the server-held amount.** Add a quote line type `consult-offer` with `consultOfferQuoteId`. `resolveQuote` looks up the row with the service client: owner = auth user, not expired, not redeemed; it charges `amount_usd_cents`. Redemption moves into the webhook (PaymentIntent metadata `consult_quote_id`) instead of the client calls at `checkout/page.tsx:3116,7065`.
6. **Atelier stays fully usable.** Do not touch `src/pages/build-a-wig/**`: add-to-bag, edit, wishlist and saved-for-later all keep working. Only the checkout treatment changes. The client price is still shown as "ESTIMATED PRICE", and the customer sees that the final price comes in the offer.

**Data dependencies:** `consult_quotes` (+ `amount_usd_cents`, optionally `source_cart_line jsonb`), `notifications.items` JSON, `meetings` (if requests go there), `profiles` (email → id, already used), and the service-role key.

**UI after containment.** The BAW bag line shows "CUSTOM BUILD — PRICE CONFIRMED BY QUOTE". Checkout shows "REQUEST MY CUSTOM QUOTE" in place of card entry. After submit: "REQUEST SENT — WE'LL SEND YOUR OFFER WITHIN 24H". The offer arrives via the existing alert and email (`/account/orders?orderNumber=…&consultOffer=1`). CLAIM OFFER puts a `consult-offer` line in the bag, which pays the server-held amount by card.

---

## b. Stripe session on `/checkout/upgrade?stripe=success&session_id=…`

- **Return URL built:** `api/stripe/create-checkout-session.ts:143-149`. **Handled:** `src/pages/checkout/page.tsx:1183-1234` (`useEffect` on `location.pathname === '/checkout/upgrade'`).
- **The client does not trust the query param to grant premium.**
  - `session_id` is only a `sessionStorage` dedupe key (`baw_stripe_membership_return_<id>`, `:1192-1210`).
  - On `stripe=success` the client calls `syncProfileFromApi()` (`:1214`; `src/utils/syncFromApi.ts:58+`), which copies server profile fields (membershipType, tier) into `localStorage.currentUser`.
  - Premium comes only from the webhook-written `profiles` columns (`api/stripe/webhook.ts` `checkout.session.completed` `:23-65`).
- **Gap: no server verification of the session.** There is no `checkout.sessions.retrieve` anywhere in `api/`. If the webhook is late, the customer lands on `/account/rewards` still STANDARD and gets no "processing" state.
- **Gap: admin overrides.** `syncFromApi.ts` (~`:124-133` relative) re-applies founder/admin tier overrides from localStorage. Those are founder-only and not a customer risk.
- **Minimal containment:** optional `GET /api/stripe/checkout-session-status?session_id=` (server `sessions.retrieve`, check `client_reference_id === user.id`), so the page can show "ACTIVATING YOUR MEMBERSHIP…" until the webhook lands. Not required for safety.
- **Data dependencies:** `profiles` subscription columns, `STRIPE_SECRET_KEY`.
- **UI after containment:** unchanged, plus a pending banner.

---

## c. Membership cancellation

| Piece | Location | Behaviour |
|---|---|---|
| Button | `src/pages/account/membership/page.tsx:3103-3118` (CANCEL SUBSCRIPTION) → `handleCancelSubscription` `:1145-1148` | Opens the modal. |
| Modal | `:3160-3170` ("YOUR … SUBSCRIPTION WILL END ON …") | |
| Confirm handler | `confirmCancelSubscription` `:1150-1177` | Sets `autoRenewMembership:false` in `localStorage.currentUser` and `registeredUsers` only. **No API call.** |
| Server column | `profiles.auto_renew_membership` is privileged: the trigger reverts user writes (`supabase/migrations/20260620120000_slay_tickets.sql:59-109`, `:89`). `api/profile.ts:149-150` maps it but uses the anon key + user JWT (`:48-51`), so the trigger keeps the old value | INFERRED: the next `syncProfileFromApi` restores `true` locally, so the UI "un-cancels". |
| Stripe pieces present | Webhook mirrors `cancel_at_period_end` → `auto_renew_membership` (`webhook.ts:53,124,227`). `customer.subscription.deleted` → STANDARD (`:299+`). `create-checkout-session.ts:309` sets `cancel_at_period_end:false` on upgrade | Read-only mirroring is ready. |
| Missing | No `billingPortal`, no `cancel_at_period_end:true`, no `subscriptions.cancel` (grep of `api/` and `src/`, zero hits) | |

- **Minimal containment (A4 option 1):**
  - New `POST /api/stripe/create-portal-session`: auth user → `profiles.stripe_customer_id` (service client) → `stripe.billingPortal.sessions.create({customer, return_url: SITE_URL + '/account/membership'})`.
  - Replace `confirmCancelSubscription` with a redirect to the portal.
  - Configure the Stripe portal (dashboard) for "cancel at period end".
  - The webhook already updates `auto_renew_membership`.
  - If the user has no `stripe_customer_id`, show "CONTACT CONCIERGE TO CANCEL".
- **Data dependencies:** `profiles.stripe_customer_id`, `STRIPE_SECRET_KEY`, `SITE_URL`.
- **UI after containment:** "MANAGE OR CANCEL SUBSCRIPTION" opens Stripe. On return, the page shows "RENEWAL OFF — ACTIVE UNTIL {period_end}" from the server columns.

---

## d. Paid entitlement fulfilment

### Hairstyle-analysis packs
| Layer | Location | Sizes |
|---|---|---|
| Client tiers | `src/utils/consultStyleAnalysisAddon.ts:18-33` (`CONSULT_STYLE_ANALYSIS_TIERS` 1→$20, 4→$60), `src/utils/hairstyleAnalysisPurchase.ts:4-31`, `src/types/styleAnalysis.ts:5` (`1 \| 4`), UI `src/components/hairstyle-analysis/HairstyleAnalysisPreview.tsx:387` | **1, 4** |
| Server price | `api/_lib/hairstyleAnalysisPricing.ts:4-26`; quote `resolveQuote.ts:141-162`; grants `api/_lib/hairstyleAnalysisCheckoutGrants.ts:1-15` | **1, 4** |
| Webhook | `api/stripe/webhook.ts:280-295` (filters 1 or 4, calls `grantHairstyleAnalysisPurchaseCredits`, `api/_lib/hairstyleAnalysisUsage.ts:151-161`, `getSupabaseAdminServiceRole`) | 1, 4 |
| SQL grant | `supabase/migrations/20260610140000_hairstyle_analysis_paid_credits.sql:153-215` (`c IN (1, 3, 6)` at `:185`) | **1, 3, 6** |
| SQL refund | same file `:131` (`NOT IN (1, 3, 6)`) | 1, 3, 6 |

- **Defects:** a 4-pack alone gets `invalid_counts` and is logged only. A mixed cart is marked granted with the 4 dropped (Correction 3).
- **Containment:** an S0B-1 SQL change to accept `(1,4)` (keep 3/6 for legacy), plus an A8 list.
- **S0B-2 app side:** make the webhook raise an alert or email when `grant.ok === false` (currently `console.error` only). The client stays unchanged.

### Consult style-analysis add-on ($20/$60)
- **Sold:** picker `src/components/booking/ConsultStyleAnalysisAddonPicker.tsx:124`, mounted at `src/pages/booking/consultation/page.tsx:35,939`; copy promises "DELIVERED WITH YOUR CONSULT QUOTE" (`consultStyleAnalysisAddon.ts:22-31`).
- **Charged:** the bookings route never runs Stripe (`src/utils/productCheckoutPolicy.ts:77-84`), so **the add-on is not collected either**. The server quote supports it (`resolveQuote.ts:164-179`) but it is not used.
- **Persisted:** local order only (`checkout/page.tsx:2821-2829`, `consultStyleAnalysisComparisonCount`).
- **Fulfilment:** `src/utils/consultStyleAnalysisInputs.ts` has no importers. The only caller of `postConsultStyleAnalysisGenerate` (`src/utils/api.ts:2456-2480`) is `HairstyleAnalysisPreview.tsx:430` (admin/demo tools, `src/pages/HairstyleAnalysisDemo.tsx`). The endpoint `api/consult-style-analysis-generate.ts:87-90` only requires sign-in (M9).
- **Containment:** hide the picker, or relabel it "PRESENTED AT YOUR CONSULTATION" with no charge (E6). Add an admin-or-entitlement check to `consult-style-analysis-generate.ts` after `:87`.
- **UI after containment:** the consult booking shows only the $40 deposit line.

### PSA "FIND MY BEST LOOKS" picks
- **Endpoint:** `api/psa/selfie-style-analysis.ts:133-175`. It is premium-gated (`:139-147`), calls OpenAI vision (`:46`, `OPENAI_API_KEY`) and **returns the picks in the response without persisting them**.
- **Client:** `src/components/psa/PsaSelfieStyleAnalysisPanel.tsx:52-70` discards `result` and shows `PSA_HAIR_ANALYSIS_SUBMITTED_MESSAGE` ("…READY WITHIN 24 HOURS", `src/utils/psaHairAnalysisDelivery.ts:4-5`). Nothing ever delivers.
- **Containment (smallest):** render `result.picks` immediately in the panel and change the copy to "YOUR TOP LOOKS". Or hide the chip until S5.
- **Data dependencies:** none for the immediate render. S5 adds a picks table.

---

## e. Slay Tickets

| Piece | Location | Behaviour |
|---|---|---|
| Packs | `src/utils/slayTicketPacks.ts:48-90` (4/8/12/24/48/60) | Client catalogue. |
| Checkout route | `/checkout/slay-tickets` (`checkout/page.tsx:277, 881-903, 1010-1026`) | Policy `run:false` (`productCheckoutPolicy.ts:77-84`), so the legacy client card form is used (Luhn-valid PAN, `src/utils/checkoutCardValidation.ts`). |
| Client credit call | `checkout/page.tsx:2879-2895` (`creditSlayTicketsForOrder({orderId:'order-'+n, lineItems: cartItems})`, `src/utils/api.ts`), run on **every** non-upgrade checkout | |
| Endpoint | `api/slay-tickets/credit-order.ts:40-95` (auth `:55-59`; service client `:30-35`, 503 if no key; premium check only when purchased > 0 `:75-82`) | No payment proof. |
| Ledger | `api/_lib/slayTickets.ts:150-215` (`creditSlayTicketsForOrder`); purchased count from client lines `:68-87` (name `SLAY TICKET`, `slayTicketPackCount`, or regex on the name); dedupe on `(user_id, related_order_id, type)` `:191-198` | Any new `orderId` credits again. Read-modify-write balance (`readBalance`/`writeBalance`) is not atomic. |
| Earned path | `slayTicketsEarnedForLineItems` `:53-66`; disabled for orders after `DEFAULT_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO` 2026-08-09 (`src/content/education/commerce/slayTicketEconomyPolicy.ts:10-36`). `credit-order` never passes `orderPlacedAt`, so earning is effectively off unless `FSBW_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO` is moved later | |

- **Minimal containment (A6):**
  - `credit-order.ts` returns 410 for any line where `slayTicketsPurchasedForLineItems > 0`. Simplest is to return 410 unconditionally while earning is off.
  - Remove the client call at `checkout/page.tsx:2879-2895`, or guard it to hair-earning only.
  - `/tools/slay-tickets` pack buttons become "COMING SOON".
  - The `/checkout/slay-tickets` route redirects to `/tools/slay-tickets`.
  - Balance display (`api/slay-tickets/index.ts`) and spending stay.
- **Data dependencies:** `profiles.slay_ticket_balance`, `slay_ticket_transactions` (read-only after containment).
- **UI after containment:** balance and history visible. Purchase reads "TICKET PACKS RETURN SOON".

---

## f. Client-supplied Stripe identifiers

| Path | Location | Current behaviour | Minimal containment |
|---|---|---|---|
| Product PaymentIntent `stripeCustomerId` | `api/stripe/create-product-payment-intent.ts:137-168,175` | Body id is sanitised and then **trusted**. It is attached as the PI `customer`. With `savePaymentMethodForFuture` the server writes it to `profiles` via service role, bypassing the privileged trigger (Correction 4). The shipped client sends neither field (`src/utils/api.ts:358-392`). | Ignore `body.stripeCustomerId`. Always read `profiles.stripe_customer_id`. Reject `savePaymentMethodForFuture` until A7. |
| Booking autopay metadata (write) | `api/booking/appointment-meeting.ts:106-138` (client amounts, `bookingFinalDueUsd` `:129-132`, customer and PM ids `:136-137`); persisted `:195-210` | Stored verbatim in `meetings.metadata`. The client supplies the ids from `localStorage.currentUser` (`checkout/page.tsx:462-490`) or `/api/profile` (`:1136-1165`), sent at `:570-580` and `:7137`. | Drop the client ids and amounts. Server-side: ids from `profiles`, amount from the server quote (`booking-appointment` line). |
| Autopay charge | `api/booking/autopay-final-payment.ts:81-91` (POST only; Bearer `BOOKING_AUTOPAY_CRON_SECRET`), `:143-150` (reads metadata), `:203-215` (`paymentIntents.create` off-session, confirm, **no idempotency key**) | Charges client-written data. | Keep off (A7). When re-enabled: verify `pm.customer === profiles.stripe_customer_id`, use the server amount, and set the idempotency key `meeting:<id>:final`. |
| Webhook enrolment | `api/stripe/webhook.ts:241-257` | Writes the PI customer and PM to `profiles` when `booking_autopay_enroll==='true'` (never set by the client today). | Fine once the PI endpoint ignores body ids. |
| Cron mismatch | `vercel.json` `crons[0]` (`/api/booking/autopay-final-payment`, `0 * * * *`) | Vercel cron sends **GET** with `Authorization: Bearer $CRON_SECRET`. The endpoint needs **POST** and `BOOKING_AUTOPAY_CRON_SECRET`, so it returns 405 and is dormant. | Leave it dormant. Remove the cron entry, or keep it and fix after the inputs (ENG-08). Do **not** "fix" the method first. |

**UI after containment:** the autopay consent checkbox at checkout (`checkout/page.tsx:5333, 6666-6673`) is hidden, and booking deposits are labelled "PAY AT CONSULTATION" or charged through a Stripe PaymentIntent (A7).

---

## g. Fake customer order and reward data

### Concierge test-order injection (exact code)
- `src/pages/account/concierge/page.tsx`
  - `:1709-1710` `isMockOrdersAccount = () => isMockDataAccount(getCurrentUser())`
  - `:1750-1768` no key: founder gets the seed; everyone else gets an empty `{activeOrders:[],pastOrders:[]}`.
  - `:1769-1911` founder seed (`test-order-1..5`, ORDER #888/#999/#777/#666/#555).
  - **`:1913-2203` UNGUARDED.** For any existing `userOrders_<email>` it finds or creates `test-order-1` (CONSTRUCTING, `:1943`), `test-order-2` (DELIVERED with signature, `:1989`), `test-order-3` (multi-unit, `:2039`), `test-order-4` (`:2111`, check `:2137`), `test-order-5` (`:2161`, check `:2186`). It pushes them into `active` and saves at `:2204-2213`.
  - Triggers `:2242-2251` (mount, `storage`, `signInStateChanged`, `focus`).
- **Ids are already enumerated:** `BAW_FOUNDER_SEED_MOCK_ORDER_IDS` (`src/utils/adminAuth.ts:422-428`).
- **Existing one-off cleaner:** `src/utils/clearTestDataForNonAdmin.ts:60-80`, called at `src/App.tsx:1062`. It removes whole `userOrders_<email>` keys once per email (flag `_clearedTestData_v1_`). It has already run for most users, so it will not remove later injections.
- **Containment:**
  - Wrap `:1913-2203` in `if (isMockOrdersAccount())`.
  - Add a v2 cleaner that **filters** `BAW_FOUNDER_SEED_MOCK_ORDER_IDS` out of `userOrders_*`, plus the related `conciergeOrderSeen_*` keys, for non-founders. Do not delete the whole key, because real local orders live there.
  - Data dependency: localStorage only.
- **UI after containment:** a customer with no orders sees "NO ACTIVE ORDERS". Real local orders stay.

### Other mock and seed sources and their guards
Every guard below is a **founder email check against `localStorage.currentUser`**. None is an env flag, and all of this code ships in the production bundle.

| Source | Location | Guard |
|---|---|---|
| Founder seed orders (orders page) | `src/pages/orders/page.tsx:490-510, 622-660, 788-805, 992-1012, 1070-1090, 1138, 1200-1217`; gate `:238`, `:1237` | `isMockProfileChromeActive` (founder email, not view-as-client) |
| Mock digital-cash / voucher history | `src/pages/account/page.tsx:175-200` (`MOCK_DIGITAL_CASH_HISTORY`, `MOCK_VOUCHER_HISTORY`), used `:2610, 2687` | `profileUsesMockChrome` `:245-248` |
| Seeded vouchers | `src/pages/account/page.tsx:380-410` | `isMockDataAccount`. **Non-founders get `voucherList=[]` written every load (`:402-407`)**, which wipes real vouchers (R-16). |
| Mock reviews | `src/pages/account/reviews/page.tsx:261,358-360`; counts `src/constants/reviews.ts:2-4` | `isMockDataAccount` |
| Affiliate mock content | `src/pages/account/affiliate/page.tsx:330, 644` | `isMockDataAccount` |
| Membership mock tier | `src/pages/account/membership/page.tsx:341, 1032, 1133, 1182, 1206, 3100` | `isMockDataAccount` |
| Slay Cam posts and stats | `src/pages/slay-cam/page.tsx:75-209` (`SLAY_CAM_POSTS`, named clients), `:211-215` (`SLAY_CAM_STATS` 128 / 42K / 18), rendered `:294-300, 511-517` | **Unguarded. Public.** |
| Shopping-bag mock cart | `src/utils/shoppingBagMockCart.ts:98-126` (enabled when DEV, **any `isPreviewEnvironment()` host including `*.vercel.app`** (`src/utils/adminAuth.ts:515-531`), or `?shoppingBagMock=1`); seeding `:150+`, called for guests at `src/App.tsx:1063` | Env or host plus **a query param that works in production**. INFERRED: if production is served on `fsbw.vercel.app` (the email default, `api/_lib/email/brandAssets.ts:5-11`), every guest gets mock cart lines. |
| Admin mock clients and orders | `src/pages/admin/clients/page.tsx:330` (`getMockClientsForAyoteenz`), `:436` (`getMockOrdersForClient`), merged `:909-986` | `isAyoteenzAdminAccount` (founder): mock clients are **merged into the live API list**. |
| Admin mock meetings | `src/utils/adminMeetingsMock.ts:225-365` (`generateMockMeetingsForDay/Range`), `:367-466` (founder demo consults #331/#340/#341, `mock-image.png` `:116`); merged in `src/pages/admin/meetings/AdminMeetingsHub.tsx:891-916` and `src/pages/admin/dashboard/page.tsx:735-760` | **Unguarded** for generated mocks (any admin). Founder demos: `isAdminEmail`. |
| picsum placeholders | `src/pages/admin/reviews/page.tsx:355`, `src/pages/admin/pending/page.tsx:83`, `src/components/admin/AdminReviewStyleCard.tsx:24` | Unguarded (admin pages). |
| Admin globe mock | `src/utils/adminGlobeMockPresence.ts:5,372-380`; `src/pages/admin/revenue/page.tsx:50-58, 853-1002, 1290-1330` | **Env flag `VITE_ADMIN_GLOBE_MOCK_DATA`** or a session toggle (the only env-gated mock). |
| Creative preview demo session | `src/utils/creativePreviewMode.ts:3-60, 113-170` | `VITE_CREATIVE_PREVIEW_TOKEN` and `isPreviewEnvironment()`. Checkout is blocked in this mode (`isCreativePreviewCheckoutBlocked`). |
| "points_earned" email with no points credited | `api/_lib/recordProductOrderFromPaymentIntent.ts` (X2 §3b) | Unguarded. |

---

## h. Admin financial reporting that is fabricated or local-only

| Metric | Location | Source today |
|---|---|---|
| Whole dashboard fallback | `src/pages/admin/dashboard/page.tsx:94-263` (`buildMockDashboardData`, `mockAPI`), used `:412-437` when the API errors or the user is not an admin email | **Fabricated** (mock clients). |
| Live dashboard merge | `dashboard/page.tsx:347-357` | Merges mock clients into API clients for the founder. |
| Quarterly / current-year revenue | `dashboard/page.tsx:544-557` | `revenue[]` from `/api/admin/dashboard`, or mock. |
| "Taxes paid" | `dashboard/page.tsx:559-562` (`amount * 0.15`) | **Fabricated 15% rate.** |
| Net income | `dashboard/page.tsx:564-567` (`currentYearRevenue * 0.35` expenses) | **Fabricated 35%.** |
| Revenue card: inventory and orders | `dashboard/page.tsx:569-575` → `src/utils/adminRevenueStats.ts:130-167` (`buildRevenueOrdersList` reads **every `userOrders_*` key in the admin's own browser**). The catch-path mock is at `:151-166` (rev-1..4: $899 / $749 / $649 / $899) | **localStorage** of the admin device (includes the injected test orders). |
| Starting inventory | `adminRevenueStats.ts:38-60` (10 per product, packaging counts), override `adminInventoryOverride` `:176-196` | **Hardcoded or local.** |
| Revenue page orders and gross sales | `src/pages/admin/revenue/page.tsx:586, 619-623, 1027-1029` | localStorage (`buildRevenueOrdersList`). |
| Revenue page totals | `revenue/page.tsx:1006-1022` → `api/admin/revenue.ts:25-53` (sums `orders.active_orders/past_orders` JSON) | Server, but `orders` JSON is customer-writable today through the legacy policies (R-04) and is generic from the webhook. |
| Membership payments | `revenue/page.tsx:607-623`. Local list `src/utils/membershipPayments.ts:6,38,51-69` (`adminMembershipPayments`), written by the non-Stripe CONFIRM ORDER (`checkout/page.tsx:6883-6900`). Remote: `/api/admin/membership-payments` | Mixed local (fabricated by the non-Stripe path) and server. |
| Refund requests | `api/admin/pending.ts:99` (hardcoded 0) | Fabricated. |
| Analytics | `src/pages/admin/analytics/page.tsx:52-64` from `getAdminAnalytics()` | Server (`site_analytics_events`). Not fabricated. |

- **An accurate empty state would read from:**
  - `membership_payments` (webhook `invoice.paid`) for membership revenue.
  - Stripe-backed `orders` rows written by the webhook (`order-pi-*`, X2 §3b) for product revenue, until S1's `customer_orders`.
  - `meetings` (API) without the mock generators.
  - `profiles` count for clients.
- **Tax and net income:** "—" with "NOT TRACKED". **Inventory:** "NOT TRACKED". **Refunds:** "—".
- **Containment:** delete the mock fallbacks (`dashboard:412-437` → error state; `adminRevenueStats.ts:151-166` → `[]`), remove the 15% and 35% lines, and stop merging mock clients and meetings unless an explicit dev flag is set.

---

## i. Non-Stripe CONFIRM ORDER membership path

- **Buttons on `/checkout/upgrade`:**
  - "SUBSCRIBE WITH CARD (STRIPE)" `checkout/page.tsx:6399-6420`, shown only when `stripeMembershipAvailable && hasSupabaseSession`.
  - The generic **CONFIRM ORDER** (`:6423-…`, label `:7181`) is also rendered on the upgrade route.
- **Flow:**
  - `shouldRunStripeProductPayment` returns `run:false` for `isSubscriptionUpgrade` (`productCheckoutPolicy.ts:77-84`), so the client card form (Luhn-valid PAN or the founder dummy PAN constant `src/utils/checkoutCardValidation.ts:4`, value not reproduced) is used.
  - Then `:6818-6905`: sets `membershipType:'PREMIUM'`, the tier, end date, a **welcome gift-card credit of $10/$20/$40** and `digitalCashHistory` in `localStorage.currentUser` and `registeredUsers`.
  - It also calls `recordMembershipPayment(...)` into the admin local ledger (`:6883-6900`).
  - The server profile is unchanged (privileged trigger), so server gates still say STANDARD.
- **Minimal containment (A3):** when `isSubscriptionUpgrade`, do not render CONFIRM ORDER (or make it call `handleStripeMembershipSubscribe`). Delete or guard `:6818-6905` behind a dev-only flag. When Stripe is unavailable, show "MEMBERSHIP CHECKOUT IS TEMPORARILY UNAVAILABLE".
- **Data dependencies:** none server-side.
- **UI after containment:** one button only, "SUBSCRIBE WITH CARD".

---

## j. Existing feature-flag mechanisms containment can use

| Flag / mechanism | Where read | Notes |
|---|---|---|
| `ALLOW_LEGACY_CHECKOUT` (server) | `api/stripe/product-checkout-available.ts:29` → `legacyCheckoutAllowed`, `requiresStripeWhenAvailable` `:31-35` | Server-authoritative. |
| `VITE_ALLOW_LEGACY_CHECKOUT` (client) | `src/utils/productCheckoutPolicy.ts:50-59` | Used only when the availability fetch **fails**. That catch sets `available:false`, which gives `run:false, blockLegacy:false`, so **the cart falls through to client-only checkout (fail-open)**. Containment: on fetch error, block. |
| Stripe key presence | `product-checkout-available.ts:26-28`; `api/stripe/membership-available.ts:9` | Implicit flag. |
| `import.meta.env.PROD/DEV/MODE`, `VITE_VERCEL_ENV` | 29+5 uses in `src/`; `src/utils/adminAuth.ts:515-531` (`isPreviewEnvironment`, host-based: localhost, private IPs, `*.vercel.app`, `*.fsbw-dev.com`, `*.trycloudflare.com`) | Host-based. **Unsafe if production runs on `*.vercel.app`** (INFERRED). |
| `VITE_CREATIVE_PREVIEW_TOKEN` + `isCreativePreviewCheckoutBlocked()` | `src/utils/creativePreviewMode.ts:18-60` | A ready-made "payments disabled" message pattern (`checkout/page.tsx:6428-6432`). |
| `VITE_ADMIN_GLOBE_MOCK_DATA` | `src/utils/adminGlobeMockPresence.ts:372-380` | Model for "mocks only behind a flag". |
| `FSBW_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO` / `VITE_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO` | `slayTicketEconomyPolicy.ts:16-23` | Date flag shared by client and server. |
| Server behaviour flags | `IMMUNE_SYSTEM_AUTO_REPAIR` (`api/_lib/immuneSystem/production-target.ts:26-29`), `ASYNC_GOVERNED_GENERATION_*`, `EXPERIENCE_LAB_V2_LIVE_ACTIONS` | Pattern: `process.env.X === '1' \|\| 'true'`. |
| Runtime DB config | `app_config` table (`api/admin/special-offer-config.ts`, `lounge-tv-config.ts`, `page-debug-config.ts`, …) | Admin-editable key/value. Could host runtime kill switches without a redeploy (INFERRED). |

There is no general feature-flag module (the `featureFlag` grep hits only `src/studio-os*` diagnostics).

**Recommendation.** Add server env `COMMERCE_CONTAINMENT=1`, read by the money endpoints: credit-order, the PI endpoint `stripeCustomerId`, consult add-on generate and appointment-meeting ids. Expose it through `/api/stripe/product-checkout-available` (new field `containment:true`). The client hides CONFIRM ORDER for membership, ticket packs and the add-on picker when that field is true, or when the fetch fails (fail-closed).

---

# PART 2 — Service-role and privileged secret map

Variable **names** and code locations only. No values were read from any env store. Repo files hold only placeholders (checked).

## 2.1 FRONTAL SLAYER (fsbw)

### Supabase helpers and fallback behaviour
| Helper | Location | Fallback |
|---|---|---|
| `getSupabaseAdmin()` | `api/_lib/supabase.ts:27-35` | **`SUPABASE_SERVICE_ROLE_KEY \|\| SUPABASE_ANON_KEY`** (`:30`), so it **silently runs as anon**. |
| `getSupabaseAdminServiceRole()` | `api/_lib/supabase.ts:17-25` | Throws (fail-closed). |
| `hasSupabaseServiceRole()` | `:10-12` | Boolean check. |
| `getSupabaseUser(token)` | `:38-45` | Anon key + user JWT (RLS). |
| Inline `serviceSupabase()` (returns null, then 503) | `api/psa-today/{entitlements:16,watch-session:29,redeem:25}`, `api/education/{episode-completion:12,certifications/index:17,certifications/reveal-seen:12,season-pass/entitlements:12,season-pass/sync:12,season-pass/redeem:25,season-access:12}`, `api/care/access.ts:12`, `api/collectibles/index.ts:19`, `api/slay-tickets/{index:12,credit-order:30}`, `api/lounge-tv/{unlock:25,engagement/helpful:25,qualified-view:25,comment-action:26,summaries:16,comments:30}` | Fail-closed. |
| `getServiceSupabase()` | `api/stripe/webhook.ts:15-20` | Throws (fail-closed). |
| Local `getSupabaseAdminServiceRole` | `api/wig-preview/live-noir-color.ts:82-85` | Fail-closed. |
| **Inline anon fallback** | `api/lounge-tv-config.ts:41`, `api/special-offer-config.ts:44` (`SERVICE_ROLE_KEY \|\| ANON_KEY`) | Silent anon. |
| Anon-only (by design) | `api/_lib/auth.ts:13-17` (token verification), `api/profile.ts:48-51` (anon + JWT; subject to the privileged trigger) | — |

- **Importance of anon fallback:** the privileged-column trigger bypass checks `auth.jwt()->>'role' = 'service_role'` (`20260620120000_slay_tickets.sql:66-68`). If `getSupabaseAdmin()` falls back to anon, every privileged write it makes (e.g. `create-checkout-session.ts:181` writing `stripe_customer_id`, the membership columns at `:276,353`, admin user and client edits) is **silently reverted or blocked by RLS** instead of erroring.

**Endpoints depending on `getSupabaseAdmin()` (78 files; all silently degrade to anon):**
- **Money and customer:** `api/stripe/create-checkout-session.ts`, `api/stripe/create-product-payment-intent.ts`, `api/booking/{appointment-meeting,consult-meeting,autopay-final-payment}.ts`, `api/checkout/{redeem,validate}-consult-code.ts`, `api/consult-quote.ts`, `api/client/{submissions,back-in-stock-notify}.ts`, `api/delete-account.ts`, `api/cron/expiring-rewards-emails.ts`, `api/psa-chat-config.ts`, `api/trend-intelligence/public.ts`, `api/slay-forecast-broadcast/public.ts`, `api/studio-world/v1/campaigns.ts`.
- **Admin:** `api/admin/*` — activity, audit-log, booking-autopay-attempts, brand, cart, consult-quotes, context-capsule, dashboard, email-layout-config, export/clients, founder-render-generate, lounge-tv-config, meeting-client-alert, meetings, notifications, orders, page-debug-config, pending-queue, pending, perspective-panel-config, psa-chat-config, referrals, revenue, reviews, rewards-notify, site00-assts, site00-production, slay-forecast-broadcast, social-accounts, social-posts, social-publish-log, special-offer-config, studio-* (several), sync-profile, transactional-notify, trend-desk, users, wishlist.
- **Libraries:** `api/_lib/{auditLog,socialAccountsDb,creativeProduction/generation-gateway (→ studio_world_atomic_reserve_budget RPC),email/emailLayoutConfigStore,productAssetFactory/supabaseStorage,site00Assts/*,site00DesignBridge/bridge,site00Production/*}.ts`.

**Fail-closed service-role users** (`getSupabaseAdminServiceRole`, about 20): `api/_lib/hairstyleAnalysisUsage.ts` (grant/consume/refund RPCs), `api/delete-account.ts`, `api/_lib/{psaThreadStore,psaMemberContext,psaMemberMemories,psaToolAnalytics,expertCapturePersistence,liveTryOnStudio,liveTryOnBatchGenerate,founderRenderJobs,canonicalDepartmentQueue,studioAssetGeneration,studioBuilderGeneration,studioInstituteOwnerAuth,virtualProduction/reference-pack-upload,creativeProduction/async-governed-generation,environmentPackage/*}.ts`.

### Privileged env names → readers (file:line)
| Name | Readers |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `api/_lib/supabase.ts:11,20,30`; webhook `:18`; the 20 inline `serviceSupabase` files above; `api/lounge-tv-config.ts:41`; `api/special-offer-config.ts:44`; `api/_lib/{studioAssetGeneration:210,studioBuilderGeneration:381,virtualProduction/reference-pack-upload:26,email/generateHeroAsset:145,environmentPackage/config:35,psaToolAnalytics:8}`; **`api/_lib/creativeProduction/authorization-signing.ts:12`** (re-uses a 64-character prefix of the service key as the HMAC secret when `CREATIVE_PRODUCTION_AUTH_SECRET` is unset; after that it falls back to a **hardcoded dev string** at `:14`, value masked) |
| `SUPABASE_ANON_KEY` | `api/_lib/supabase.ts:30,40`; `api/_lib/auth.ts:14`; `api/profile.ts:49`; the two inline fallbacks |
| `SUPABASE_DB_URL` / `DATABASE_URL`, `SUPABASE_MANAGEMENT_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `IMMUNE_ALLOWED_PROJECT_REFS` | `api/_lib/immuneSystem/repair-executor.ts:11,35` (runs **raw SQL / DDL** on the shared DB through pg or the Management API), `production-target.ts:4,18`. Called from `schema-drift-orchestrator.ts:186`, which is reached from `creativeProduction/async-governed-generation.ts:15`. Gated by repair authorisation and `IMMUNE_SYSTEM_AUTO_REPAIR` (INFERRED from `production-target.ts:26-29`). **Relevant to shared-DB risk R-17.** |
| `STRIPE_SECRET_KEY` | `api/stripe/{create-checkout-session:119,create-product-payment-intent:40,129,webhook:11,membership-available:9,product-checkout-available:26}`, `api/booking/autopay-final-payment.ts:12`, `api/_lib/stripeMembership.ts:56` |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe/webhook.ts:323` (500 if unset) |
| `STRIPE_PUBLISHABLE_KEY` / `VITE_STRIPE_PUBLISHABLE_KEY` (public) | `product-checkout-available.ts:28`; client `src/utils/productCheckoutStripe.ts:9-10` |
| `STRIPE_PRICE_ID_3MONTHS/6MONTHS/12MONTHS` | `api/_lib/stripeMembership.ts` |
| `CRON_SECRET` | `api/cron/expiring-rewards-emails.ts:6` (falls back to `EMAIL_SEND_SECRET`) |
| `BOOKING_AUTOPAY_CRON_SECRET` | `api/booking/autopay-final-payment.ts:86` |
| `EMAIL_SEND_SECRET` | `api/email/send.ts:24`, `api/admin/generate-email-hero.ts:26`, cron fallback |
| `RESEND_API_KEY` | `api/_lib/email/sendEmail.ts:10`, `api/_lib/contactNotifyEmail.ts:35,84`, `api/admin/newsletter-send.ts:48` |
| `FAL_KEY` | ~42 reads, e.g. `api/_lib/hairstyleAnalysisFal.ts:300`, `api/build-a-wig-unit-image.ts:135,242,268`, `api/wig-preview/live-noir-color.ts:555`, `api/live-wig-after-color-styling.ts:357`, `api/_lib/{liveTryOnStudio:471,659,764,studioBuilderGeneration:198-415,site00Assts/generation:70,88,…}` |
| `OPENAI_API_KEY` | `api/psa/{chat:436,health:39,selfie-style-analysis:46}`, `api/_lib/{consultStyleAnalysisInspoColor:25,consultStyleAnalysisInspoSpecs:281,expertCaptureAi:44}` |
| `MINIMAX_API_KEY`, `REPLICATE_API_TOKEN` | `api/_lib/slayForecastBroadcast/providers/registry.ts:111,256,268`; scripts |
| `SESSION_COOKIE_SECRET` | `api/_lib/sessionCookie.ts:16`, `api/session-cookie.ts:70`, `api/session-restore.ts:103`; also the fallback for `SOCIAL_TOKEN_ENCRYPTION_SECRET` (`api/_lib/socialTokenCrypto.ts:18`) |
| `CREATIVE_PRODUCTION_AUTH_SECRET` | `authorization-signing.ts:10` (see fallback above) |
| `STUDIO_GENERATION_WORKER_SECRET` | `api/_lib/creativeProduction/async-governed-generation.ts:260,687` |
| `STUDIO_WORLD_EXTERNAL_API_SECRET` | `api/_lib/virtualProduction/external-auth.ts:15` |
| `STUDIO_INSTITUTE_OWNER_KEY`, `STUDIO_INSTITUTE_OWNER_RECOVERY_SECRET` | `api/_lib/studioInstituteOwnerAuth.ts:26` (also accepts the **stored password hash itself** as the header key, `:27-28`); `api/studio-institute/invites.ts:143,192,201,244` |
| `META_APP_SECRET`, `TIKTOK_CLIENT_SECRET`, `PINTEREST_APP_SECRET`, `X_CLIENT_SECRET` | `api/_lib/socialPlatforms.ts:49-55,136,179,203,232` |
| `ADMIN_EMAILS` | `api/_lib/adminAuth.ts:17` (falls back to 3 hardcoded default admin emails, `:10-21`) |

### Client exposure check (fsbw)
- **`vite.config.ts`:** `loadEnv(mode, cwd, '')` (`:51`) is used only inside the config. `define` (`:135-139`) inlines only build-id strings. **No `envPrefix` override**, so only `VITE_*` is exposed. `process.env.*` in `src/` is **not** defined by Vite, so it is `undefined` in the browser. This covers `src/utils/paymentHandlers.ts:59,178,342` (`REACT_APP_PAYPAL_CLIENT_ID`, `REACT_APP_SHOP_PAY_API_KEY`), `src/utils/routeProtection.ts:8,61`, and the `OPENAI_API_KEY`/`FAL_KEY`/`CODEX_API_KEY` reads in `src/studio-os-core/world-fabrication-engine/execution/codex-discovery.ts` (node-only tooling inside `src/`).
- **`VITE_*` names that are sensitive-ish:**
  - `VITE_CREATIVE_PREVIEW_TOKEN` (`src/utils/creativePreviewMode.ts:18`): a shared token compiled into the bundle, so effectively public. It only unlocks a demo session on preview hosts.
  - `VITE_ADMIN_EMAILS` (`src/utils/adminAuth.ts:322-324`, `src/utils/api.ts:192`): exposes the admin allow-list.
  - `VITE_PORTFOLIO_OWNER_EMAILS` (`src/shared/auth/studioOsAuthBridge.ts:14`, `src/studio-os-core/{auth/membership.ts:11,application/portfolio-access.ts:13}`).
  - `VITE_PREVIEW_ADMIN_ALLOWED_IP` (`adminAuth.ts:507-511`).
  - `VITE_SUPABASE_ANON_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` are public by design.
  - **No `VITE_*` service-role, Stripe secret or provider key was found.**
- **`src/` imports of `api/` code:** only `src/site00DesignBridge/clientRuntimeBindings.ts:5,10` → `api/_lib/site00DesignBridge/{types,runtimeBindings}.ts`. Those modules import only `./types.js` and hold no env or client code (pure).
- **Hardcoded keys or JWTs in `src/` and `public/`:**
  - No JWT-shaped (`eyJ…`) strings.
  - No `sk_`/`pk_`/`rk_`/`whsec_`/`re_`/`ghp_`/`xox` tokens.
  - Two `AIza…` regex hits are inside base64 image data in `public/assets/back length-icon.svg:19` and `public/assets/hairline-icon.svg:27` (false positives).
  - `SERVICE_ROLE` appears in `src/` only as help-text strings (`src/utils/api.ts:844`, `src/pages/admin/marketing/NewsletterPanel.tsx:107`, `src/pages/admin/clients/page.tsx:1830`).
  - Hardcoded secret-like defaults are server-side only: `authorization-signing.ts:14` (masked); `FOUNDER_CHECKOUT_DUMMY_PAN` (`src/utils/checkoutCardValidation.ts:4`, a test PAN in the client bundle, masked).

### Project, env templates and deployment (fsbw)
- **Supabase project:** `hyycomvcaqxxvyrfupes` only. Hardcoded storage URLs in `api/_lib/{bawNoirFalMannequinUrls:9,bawNoirNaturalMannequinUrls:8-14,bawSalonPartPlacementRefs:7,hairstyleAnalysisBawStylingRefs:21,hairstyleAnalysisTemplates:3}.ts`, `api/build-a-wig-unit-image.ts:193`, `api/wig-preview/live-noir-color.ts:38-42`, `scripts/desktop/desktop-room-background-manifest.json`, `.env.example:49-51`. Immune-system allow-list constant `src/studio-os-core/immune-system/constants.ts:2`. No `supabase/config.toml` for FS (only `all-in-one-enterprises/supabase/config.toml`, `project_id="aio-local-dev"`, a separate product).
- **Env templates:** `.env.example` (names listed with placeholders: VITE_SUPABASE_*, SUPABASE_URL/ANON/SERVICE_ROLE, FAL, SESSION_COOKIE_SECRET, ADMIN_EMAILS, STRIPE_SECRET/PUBLISHABLE/WEBHOOK/PRICE_ID_*, ALLOW_LEGACY_CHECKOUT, RESEND, EMAIL_SEND_SECRET, OPENAI, social app ids and secrets), `.env.e2e.example` (E2E user email/password names), `.env.wig-preview.example.txt`.
- **Missing from `.env.example`:** `CRON_SECRET`, `BOOKING_AUTOPAY_CRON_SECRET`, `CREATIVE_PRODUCTION_AUTH_SECRET`, `STUDIO_GENERATION_WORKER_SECRET`, `STUDIO_WORLD_EXTERNAL_API_SECRET`, `SUPABASE_DB_URL`, `SUPABASE_MANAGEMENT_ACCESS_TOKEN`, `MINIMAX_API_KEY`, `REPLICATE_API_TOKEN`, `STUDIO_INSTITUTE_OWNER_KEY`/`_RECOVERY_SECRET`.
- **There is no staging Supabase project or staging env template.** "Staging" appears only under `all-in-one-enterprises/**`.
- **`vercel.json`:**
  - `ignoreCommand: bash scripts/vercel-should-build.sh`.
  - `functions`: ~45 per-file `maxDuration` and `includeFiles` overrides (e.g. `api/hairstyle-analysis-generate.ts` 300s, `api/admin/consult-quotes.ts` 60s). The runtime is the Vercel Node default (the webhook exports `config={maxDuration:60}`).
  - `crons`: `0 * * * *` → `/api/booking/autopay-final-payment` (dormant: GET vs POST, secret-name mismatch); `0 14 * * *` → `/api/cron/expiring-rewards-emails`.
  - Rewrites: SPA fallback plus capsule downloads.
  - **No separate staging Vercel project is referenced.** Previews are `*.vercel.app`, and `isPreviewEnvironment()` treats them as preview (`src/utils/adminAuth.ts:522`).
- **CI:** `.github/workflows/aio-*.yml` cover the AIO product only; their secrets are `AIO_SUPABASE_*` and `SUPABASE_ACCESS_TOKEN`/`PROJECT_ID`/`DB_PASSWORD`. There is no FS CI deploy. Deploys go through `scripts/agent-commit.sh` (AGENTS.md).

## 2.2 SITE00 (read-only)

### Supabase helpers and fallback behaviour
- `api/_lib/supabase.ts` is the same pattern as FS:
  - `getSupabaseAdmin()` `:28-36` falls back to **`SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY`** (`:31`).
  - `getSupabaseAdminServiceRole()` `:18-26` throws without the key.
  - `getSupabaseUser` `:39-44`.
  - The clients are built through `api/_lib/serverSupabase.ts:27-39` (no session persistence, ws transport).
- **99** server files use `getSupabaseAdmin()` and would silently run as anon. By area: `api/_lib/site00Evolve` 33, `site00Projects` 12, `site00Assts` 8, `site00Production` 5, `site00Orchestration` 4, `site00ExpressionEngine` 4, `marketingEngagements` 4, `site00BrandLore` 3, `site00Intakes` 2, `site00ExperienceEngine` 2, `site00ClientReviews` 2, `api/admin/site00-{production,assts}.ts`, and about 15 single-file areas. This includes `site00AccessCredentials/service.ts:219`, the RPC caller per X2.
- Only `api/_lib/studioBuilderGeneration.ts:401` requires the real key.
- **Store adapters fail closed in production** through `shared/site00-studio-world-execution/persistencePolicy.ts:8-49`. They refuse memory fallback when `NODE_ENV=production` or `SITE00_DURABLE_REQUIRED=1`, unless `SITE00_ALLOW_MEMORY_FALLBACK=1`. Examples: `api/_lib/site00Intakes/storeAdapter.ts:41`, `site00BrandLore/storeAdapter.ts:32`, `site00Evolve/storeAdapter.ts:44`, `…/formationStore/storeAdapter.ts:32`. Those checks look at whether the key is present, but their data calls still go through `getSupabaseAdmin()` (INFERRED).
- `api/profile.ts:50` uses the anon key + user JWT. Its upserts of FS commerce columns are filtered by the FS privileged trigger.

### Privileged env names → readers
| Name | Readers |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `api/_lib/supabase.ts:12,21,31`; `server/index.ts:26` (Railway boot env check); `shared/site00-studio-world-execution/persistencePolicy.ts:8`; `api/_lib/studioBuilderGeneration.ts:401`; `api/_lib/site00AstralWorld/generationService.ts:48`; scripts (`scripts/jurnl/run-live-rls-and-sync-proof.ts:40`, `scripts/studioos/apply-creative-director-migration.mjs:10`, `scripts/vite-site00-*-local-api.mjs:19,79`, …) |
| `STRIPE_SECRET_KEY` / `SITE00_STRIPE_SECRET_KEY` | `api/_lib/digitalFoundation/payment/stripeHostedCheckout.ts:4` (adapter **fails closed in production** `:86-100` unless `SITE00_DIGITAL_FOUNDATION_STRIPE_SIM=1`), `founderReadiness.ts:116`, `runtimeDiagnostics.ts:39` |
| `STRIPE_WEBHOOK_SECRET` / `SITE00_STRIPE_WEBHOOK_SECRET` | `api/_lib/digitalFoundation/payment/webhookHandler.ts:5` ← `api/site00/digital-foundation-stripe-webhook.ts` |
| `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` / `SITE00_RESEND_WEBHOOK_SECRET` | `api/_lib/digitalFoundation/communications/{resendAdapter:20,24,resendWebhookHandler:6}` |
| `ANTHROPIC_API_KEY` | many under `api/_lib/site00Evolve/**`, `site00ExpressionEngine/**`, `site00PageConcept/generatePageCreativeInjection.ts:103,203`, `site00OpusNative/config.ts:32`, `api/jurnl/ask-context.ts:35` |
| `OPENAI_API_KEY`, `XAI_API_KEY`, `FAL_KEY`, `IDEOGRAM_API_KEY`, `PIXELCUT_API_KEY` | provider modules (e.g. `api/_lib/experienceCompilerCreativeDirector/creativeModelGateway.ts:106`, `site00Assts/generation.ts:76,94`, `shared/site00-visual-generation/*`) |
| `SESSION_COOKIE_SECRET` | `api/session-cookie.ts:54`, `api/session-restore.ts:103`, `api/_lib/site00VisualReference/captureAuthBootstrapService.ts:56` |
| `EVOLVE_PROVIDER_SECRET_KEY` | `api/_lib/site00Evolve/providers/providerSecretStore.ts:21,25` |
| `META_APP_SECRET` | `api/_lib/site00Evolve/providers/{oauthCallbackHandler:42,oauthService:36}` |
| `SITE00_GITHUB_TOKEN` / `GITHUB_TOKEN` | `api/_lib/site00Orchestration/githubClient.ts:24`, `site00Projects/githubProjectConnector.ts:47` |
| `STUDIO_WORLD_API_KEY`, `STUDIO_WORLD_WEBHOOK_SECRET` | `api/_lib/studioWorld/contract.ts:35` |
| `SITE00_ASSTS_LOADER_GEOMETRY_SECRET` | `server/index.ts:38` |

### Client exposure check (SITE00)
- **`vite.config.ts`:** `loadEnv` `:12`, no `envPrefix` override, and `define` `:223-237` inlines only build or preview flags.
- **Client `import.meta.env` names:** VITE_API_BASE, VITE_SUPABASE_URL, VITE_SITE00_* flags, VITE_APP_BUILD_ID. None is privileged.
- **`src/` → `api/_lib` imports:** `src/site00/components/evolve/creative-direction/{CreativeDirectionBoardView,FormedCoreDirectionReview}.tsx`, `src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts:58`, `src/site00/services/pageConceptViewportFamilyClient.ts:3`. Mostly `import type`. The value imports (`MARKED_UP_COPY_DIRECTION_NAME`, `buildFounderDirectionPresentationFields`) come from modules that import only types and `shared/site00-visual-generation/falImageModels.ts` (constants; no env, no imports). No secret exposure.
- **Hardcoded secrets:** no JWT or key patterns in `src`/`public`/`shared`/`api`/`server`. The project ref appears only in generated asset URLs (`shared/site00-email/production/intake-access-asset-urls.generated.ts:10-28`).

### Project, env templates and deployment (SITE00)
- **Supabase:** same project `hyycomvcaqxxvyrfupes`. No `supabase/config.toml` (only `supabase/migrations`).
- **`.env.example`:** names only, all empty. Lists VITE_SUPABASE_*, VITE_API_BASE, VITE_ADMIN_EMAILS, SUPABASE_URL/ANON/SERVICE_ROLE, SESSION_COOKIE_*, ADMIN_EMAILS, FAL, OPENAI, XAI, buckets, SITE00_ASSTS_LOADER_GEOMETRY_SECRET, STUDIO_WORLD_*, NEWS_API_KEY. **Missing:** STRIPE_*, RESEND_*, ANTHROPIC_API_KEY, EVOLVE_PROVIDER_SECRET_KEY, STUDIO_WORLD_WEBHOOK_SECRET, SITE00_GITHUB_TOKEN, META_APP_SECRET, IDEOGRAM/PIXELCUT keys.
- **Deployment:**
  - **No `vercel.json`.**
  - API on Railway (`railway.toml`: `npm run start:api`, health `/api/health`; `nixpacks.toml` Node 22 + Playwright). The prod API base is `https://api.site00.com` (`.github/workflows/site00-production-deploy.yml:30`).
  - Static site on GoDaddy cPanel (`.cpanel.yml`, `deploy-godaddy.yml`) with GitHub secrets `GODADDY_FTP_*`/`GODADDY_SSH_*` and build-time `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`/`VITE_API_BASE`.
  - **No crons.**
- **CI touches production with the service key:** `site00-production-deploy.yml` job `test` (`:116-127`) and `jurnl-live-production-sync-proof.yml:33-40` pass `SUPABASE_SERVICE_ROLE_KEY` and QA user credentials, so tests run against the shared production project. There is **no staging project**.

---

## Key takeaways for S0B-2
1. BAW is undercharged, not blocked (Correction 1). The interim needs server-side detection, not only a client tag.
2. The consult-offer pipeline exists end to end. It needs only a numeric server-held amount (an additive column), a `consult-offer` quote type, and redemption moved into the webhook.
3. Fail-closed gaps:
   - The `productCheckoutPolicy` fetch error makes checkout client-only.
   - `getSupabaseAdmin` anon fallback in both repos.
   - The inline anon fallbacks at `lounge-tv-config.ts:41` and `special-offer-config.ts:44`.
   - `authorization-signing.ts` reuses the service-key prefix and then a hardcoded default.
4. Concierge injection hits every user. The cleaner must filter by id, not delete keys.
5. There is no staging Supabase project for FS or SITE00. SITE00 CI runs against production with the service key.
