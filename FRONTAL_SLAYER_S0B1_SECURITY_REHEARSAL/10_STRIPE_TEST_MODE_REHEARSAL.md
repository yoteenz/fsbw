# 10 — Stripe Test-Mode Rehearsal

**Stripe test-mode execution: BLOCKED.** There is no Stripe access in this session, no staging environment and no recorded approval. No Stripe API call was made: no product, price, subscription, refund or webhook endpoint was created or changed. What follows was rehearsed **offline**: the repository's own code was run locally with synthetic inputs, and the database side ran on the local replica.

## 1. What was rehearsed offline

| Check | How | Result | Evidence |
|---|---|---|---|
| Webhook signature verification | Stripe SDK `constructEvent` with a **synthetic** secret and `generateTestHeaderString` | Valid signature **accepted**; tampered payload **rejected**; wrong secret **rejected** | `evidence/results/app_checks.json` |
| Webhook idempotency (hair-analysis grant) | Replica: the same payment ID granted twice | Second call `duplicate:true`, one credit (REG-04 PASS before and after) | `post.json` |
| R-10 entitlement grant | Replica: service-role grant `[4]`, `[1,4]`, invalid `[1,5]`, refund of a consumed 4 | Baseline: rejected / partial / payment recorded / refund ignored. **After M3: all correct** | REG-01/02/03/06 |
| R-03 Build-A-Wig pricing | `resolveCheckoutQuoteLines([{id:'build-a-wig-…', name:'NOIR'}])` | **fullyResolved: true, 74,000 cents ($740)**: options are not priced. **Unchanged by any migration** | `app_checks.json` |
| R-05 Slay Tickets | `slayTicketsPurchasedForLineItems([{name:'SLAY TICKET PACK', slayTicketPackCount:60, quantity:10}])` | **600 tickets** derived from client-supplied lines. The DB blocks a *customer* insert (SEC-24), but the endpoint writes with the service role. **Unchanged by any migration** | `app_checks.json`, SEC-24 |
| R-15 cancellation | Static scan | 0 × `cancel_at_period_end: true`, 0 × `subscriptions.cancel`, 0 × `billingPortal`. The webhook handles 6 event types, none of them `charge.refunded`. No webhook event-ID dedupe table. The 12 `idempotencyKey` hits are meeting-row dedupe, **not** Stripe idempotency keys | grep (this sprint) |

## 2. Lifecycle readiness (target vs today)

**Product payment.** The test that would prove each step: the doc 06 Track S Stripe CLI scenario.

| Step | Today | After S0B-1 | Remaining dependency |
|---|---|---|---|
| CHECKOUT CREATED | `create-product-payment-intent` (server-priced; BAW mispriced) | unchanged | S0B-2 #1 (A2) |
| PAYMENT PENDING | PI created; no server order row | unchanged | S1 |
| PAYMENT CONFIRMED | Stripe | — | — |
| WEBHOOK VERIFIED | `constructEvent` (verified offline) | unchanged | Staging: real `whsec_` |
| EVENT RECONCILED | No event-ID dedupe; read-modify-write JSON order append | unchanged | S1 (`stripe_webhook_events`) |
| ENTITLEMENT GRANTED | Analysis credits: **fixed by M3** (replica). Slay Tickets: client path (R-05) | M3 | S0B-2 #5 |
| CUSTOMER RECORD UPDATED | Generic order JSON; currency mislabel | Customer can no longer forge it (M2) | S1 |

**Subscriptions (R-15).**

| Step | Today | Remaining dependency |
|---|---|---|
| CANCELLATION REQUESTED | Local flag only | S0B-2 #3 (A4: portal or in-app) |
| STRIPE CANCELLATION CONFIRMED | Never requested | S0B-2 #3 |
| LOCAL SUBSCRIPTION RECONCILED | Webhook mirrors `cancel_at_period_end` and `subscription.deleted` (code present) | Verify in Stripe test mode |
| CUSTOMER STATUS UPDATED | Webhook writes `profiles` via service role (REG-19 shows a service-role profile write works and the guard does not block it) | — |

## 3. Test-mode scenario script (for Track S, once unblocked)

```
# Staging only, test keys only (env_guard must print OK first)
stripe login                          # operator's own test-mode account
stripe listen --forward-to https://<staging host>/api/stripe/webhook
# 1. 4-pack:   buy "Hair analysis ×4" with card 4242…; expect 4 credits; then:
stripe events resend <evt_id>         # expect duplicate, still 4 credits
# 2. Mixed:    1 + 4 in one cart → expect [1,4]
# 3. Cancel:   subscribe 3-month (test clock) → cancel via the S0B-2 path → expect cancel_at_period_end=true
stripe test_helpers test_clocks advance --frozen-time <period end + 1d>   # expect subscription.deleted → STANDARD
# 4. Refund:   refund in the dashboard (test) → expect today: no app change (no charge.refunded handler) → S1
# 5. BAW:      custom NOIR with colour → expect today: charged $740 (R-03) → after S0B-2: card blocked, quote request
```

## 4. Status by risk (Stripe-related)

| Risk | Status this sprint |
|---|---|
| R-10 | **REHEARSED (local replica) · PASS**. Stripe test mode BLOCKED |
| R-05 | **UNVERIFIED in Stripe; code-level reproduction confirms the open application hole.** Containment = S0B-2 #5 |
| R-15 | **PREPARED** (scenario above). Containment = S0B-2 #3 (A4). Not testable without Stripe |
| R-03 | **Code-level reproduction confirms the undercharge.** Containment = S0B-2 #1 (A2) |
