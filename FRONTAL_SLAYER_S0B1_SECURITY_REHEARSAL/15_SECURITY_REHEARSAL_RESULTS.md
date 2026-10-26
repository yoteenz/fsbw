# 15 — Security Rehearsal Results

**Rehearsal environment for every PASS below: the isolated local replica** (PostgreSQL 16.15, live-identical definitions, ACLs and policies captured read-only on 2026-10-26, synthetic data, Supabase role/JWT emulation). External Supabase staging was **BLOCKED**.

> A local or staging PASS does **not** mean production is fixed. Every production risk below remains **OPEN** until a separately approved production change (A1b) is applied and verified. The words FIXED and RESOLVED are not used for production risks.

Status vocabulary: PREPARED · BLOCKED · REHEARSED · PASS · FAIL · UNVERIFIED.

## 1. Totals

| Phase | Negative (31) | Authorized workflows (20) | Info (1) |
|---|---|---|---|
| Baseline | 15 PASS · **16 FAIL** (exposures reproduced) | 15 PASS · **5 FAIL** (R-10 ×4, U-21 ×1) | SEC-32 blocked only by the U-21 side effect |
| After M1A + M2 + M3 | **31 PASS · 0 FAIL** | **19 PASS · 1 FAIL** (REG-18 = U-21, pre-existing, unchanged) | unchanged |
| After rollback | = baseline | = baseline | = baseline |
| Re-applied; second run | = post | = post | = post |
| BLOCKED (not run) | Supabase staging HTTP probes, Stripe test mode, deployed app | same | — |

Per-test detail: `08_SECURITY_TEST_MATRIX.csv`, `09_AUTHORIZED_WORKFLOW_REGRESSION.csv`.

## 2. Per-risk results

### R-01 — Public-key access to value/quota RPCs

| Field | Result |
|---|---|
| RISK ID | R-01 |
| ORIGINAL SEVERITY | CRITICAL |
| ORIGINAL EVIDENCE | LIVE-REVERIFIED 2026-10-25/26: anon and authenticated EXECUTE on 10 value/quota signatures; bodies trust `p_user_id` |
| REHEARSAL ENVIRONMENT | Local replica |
| TEST PERFORMED | SEC-01…10, SEC-27 (anon and customer A minting credits, burning B's allowance, refund resets, PSA quota and entitlement, lounge helpful/views/recount); REG-05, 07, 08, 09, 10, 20 |
| BASELINE RESULT | **FAIL**: 9 of 11 attacks EXECUTED (e.g. SEC-01 anon granted credits to customer A). SEC-05 uncallable (42725 ambiguity); SEC-27 denied by RLS |
| MIGRATION APPLIED | M1A |
| POST-MIGRATION RESULT | **PASS**: 11/11 blocked (42501 permission denied; SEC-05 still ambiguous) |
| AUTHORIZED ACTION RESULT | **PASS**: service-role consume, PSA message, PSA watch, helpful toggle, qualified view all OK; own-row helpful via table policy OK |
| UNAUTHORIZED ACTION RESULT | **PASS**: blocked |
| REGRESSION RESULT | **PASS** (no regression) |
| CROSS-PRODUCT IMPACT | None: 0 SITE00/JURNL callers (doc 11) |
| REMAINING LIMITATIONS | Not tested through PostgREST or the deployed API; U-01 (service-role key presence in deployments) OPEN; U-23 (external anon callers) OPEN; M1B set (4 functions) still exposed, BLOCKED on U-01 |
| STATUS | **REHEARSED (LOCAL REPLICA) · PASS.** Staging BLOCKED. Production OPEN |
| NEXT ACTION | Track S on staging after A1a/H2/H3; then A1b |

### R-04 — Legacy customer write policies

| Field | Result |
|---|---|
| RISK ID | R-04 |
| ORIGINAL SEVERITY | HIGH |
| ORIGINAL EVIDENCE | LIVE-REVERIFIED: 8 INSERT/UPDATE/DELETE policies on orders, meetings, notifications, reviews |
| REHEARSAL ENVIRONMENT | Local replica |
| TEST PERFORMED | SEC-11…19 (fabricated DELIVERED order; own-order rewrite; B's order; meeting with client autopay card IDs; meeting metadata rewrite; meeting delete; forged notifications; review injection); REG-11…15 |
| BASELINE RESULT | **FAIL**: 7 of 9 EXECUTED (SEC-13 and SEC-18 already blocked by ownership) |
| MIGRATION APPLIED | M2 (original; rev2 proposed, same effect) |
| POST-MIGRATION RESULT | **PASS**: 9/9 blocked |
| AUTHORIZED ACTION RESULT | **PASS**: webhook/admin order write, booking meeting, admin notification, submissions review (service role) OK; customer reads own rows OK |
| UNAUTHORIZED ACTION RESULT | **PASS**: blocked |
| REGRESSION RESULT | **PASS** |
| CROSS-PRODUCT IMPACT | None (0 SITE00/JURNL references) |
| REMAINING LIMITATIONS | anon/authenticated keep table-level ALL grants; RLS is the only barrier (defence-in-depth proposal, doc 07). Not tested via PostgREST |
| STATUS | **REHEARSED (LOCAL REPLICA) · PASS.** Staging BLOCKED. Production OPEN |
| NEXT ACTION | Track S; use M2 rev2 |

### R-10 — Paid four-comparison pack grants nothing

| Field | Result |
|---|---|
| RISK ID | R-10 |
| ORIGINAL SEVERITY | CRITICAL |
| ORIGINAL EVIDENCE | LIVE-REVERIFIED: grant accepts `IN (1, 3, 6)`; app sells 1 and 4 |
| REHEARSAL ENVIRONMENT | Local replica (DB). Stripe test mode BLOCKED |
| TEST PERFORMED | REG-01 (4-pack), REG-02 (mixed 1+4), REG-03 (invalid count records nothing), REG-04 (webhook replay), REG-06 (refund of consumed 4); SEC-25/26 (direct customer writes) |
| BASELINE RESULT | **FAIL**: 4-pack rejected; mixed cart granted only `[1]` and marked paid; invalid count recorded the payment; 4-credit refund ignored |
| MIGRATION APPLIED | M3 |
| POST-MIGRATION RESULT | **PASS**: `[4]`; `[1,4]`; invalid → nothing recorded; replay `duplicate:true`; refund accepted |
| AUTHORIZED ACTION RESULT | **PASS** |
| UNAUTHORIZED ACTION RESULT | **PASS** (customers cannot write grant or queue rows; grant RPC is service-only after M1A) |
| REGRESSION RESULT | **PASS** |
| CROSS-PRODUCT IMPACT | None |
| REMAINING LIMITATIONS | No real Stripe event; customers already charged $60 before the fix are not compensated by M3 (remediation is founder decision A8) |
| STATUS | **REHEARSED (LOCAL REPLICA) · PASS.** Stripe test mode BLOCKED. Production OPEN |
| NEXT ACTION | Track S Stripe scenario 1–2 (doc 10 §3); count affected past purchases (read-only) for the founder |

### R-05 — Slay Tickets issued without verified payment

| Field | Result |
|---|---|
| RISK ID | R-05 |
| ORIGINAL SEVERITY | CRITICAL |
| ORIGINAL EVIDENCE | CODE-CONFIRMED: `credit-order` credits from client lines with no payment proof |
| REHEARSAL ENVIRONMENT | Local code execution (tsx) + local replica |
| TEST PERFORMED | `slayTicketsPurchasedForLineItems` with a forged pack line; SEC-24 (direct customer insert) |
| BASELINE RESULT | **FAIL (reproduced)**: 600 tickets derived from client-supplied lines. SEC-24 direct insert denied |
| MIGRATION APPLIED | None (application-level) |
| POST-MIGRATION RESULT | Unchanged: the endpoint writes with the service role |
| AUTHORIZED ACTION RESULT | UNVERIFIED (needs staging + Stripe) |
| UNAUTHORIZED ACTION RESULT | **FAIL** at the API level (by code); PASS at the direct-table level |
| REGRESSION RESULT | Not applicable |
| CROSS-PRODUCT IMPACT | None |
| REMAINING LIMITATIONS | Not exercised over HTTP |
| STATUS | **UNVERIFIED in staging · open hole confirmed by code-level reproduction.** Not addressed by S0B-1 |
| NEXT ACTION | S0B-2 #5 (`credit-order` → 410 for purchased packs) |

### R-15 — Cancellation does not stop Stripe billing

| Field | Result |
|---|---|
| RISK ID | R-15 |
| ORIGINAL SEVERITY | CRITICAL |
| ORIGINAL EVIDENCE | CODE-CONFIRMED: CANCEL sets a local flag; no portal or cancel endpoint |
| REHEARSAL ENVIRONMENT | Static scan only |
| TEST PERFORMED | Repository scan: 0 `cancel_at_period_end: true`, 0 `subscriptions.cancel`, 0 `billingPortal` |
| BASELINE RESULT | Gap confirmed statically |
| MIGRATION APPLIED | None |
| POST-MIGRATION RESULT | Not applicable |
| AUTHORIZED ACTION RESULT | REG-19 shows the webhook's service-role profile write still works (needed for reconciliation) |
| UNAUTHORIZED ACTION RESULT | Not applicable |
| REGRESSION RESULT | Not applicable |
| CROSS-PRODUCT IMPACT | None |
| REMAINING LIMITATIONS | No Stripe test-mode access (U-20) |
| STATUS | **PREPARED** (test-clock scenario, doc 10 §3) · Stripe execution **BLOCKED** |
| NEXT ACTION | S0B-2 #3 after founder decision A4 |

### R-03 — Build-A-Wig checkout omits option pricing

| Field | Result |
|---|---|
| RISK ID | R-03 |
| ORIGINAL SEVERITY | CRITICAL |
| ORIGINAL EVIDENCE | CODE-CONFIRMED: BAW lines resolve to catalogue base + cap |
| REHEARSAL ENVIRONMENT | Local code execution (tsx) |
| TEST PERFORMED | `resolveCheckoutQuoteLines([{id:'build-a-wig-…', name:'NOIR'}])` |
| BASELINE RESULT | **FAIL (reproduced)**: `fullyResolved: true`, 74,000 cents; options unpriced |
| MIGRATION APPLIED | None |
| POST-MIGRATION RESULT | Unchanged |
| AUTHORIZED ACTION RESULT | UNVERIFIED |
| UNAUTHORIZED ACTION RESULT | Not applicable (an undercharge, not an access-control gap) |
| REGRESSION RESULT | Not applicable |
| CROSS-PRODUCT IMPACT | None |
| REMAINING LIMITATIONS | No real PaymentIntent |
| STATUS | **UNVERIFIED in staging · undercharge confirmed by code-level reproduction.** Not addressed by S0B-1 |
| NEXT ACTION | S0B-2 #1 after founder decision A2 |

### R-11 — No authoritative server-side order record

| Field | Result |
|---|---|
| RISK ID | R-11 |
| ORIGINAL SEVERITY | CRITICAL |
| ORIGINAL EVIDENCE | CODE-CONFIRMED: the detailed order lives only in the buyer's browser; the webhook appends a generic JSON row by read-modify-write; live `orders` has 0 rows |
| REHEARSAL ENVIRONMENT | Dependency analysis + local replica coexistence checks |
| TEST PERFORMED | SEC-11/12 + REG-11/15 as coexistence evidence (doc 12) |
| BASELINE RESULT | Customers could forge order rows |
| MIGRATION APPLIED | M2 (prerequisite only) |
| POST-MIGRATION RESULT | Customers can no longer forge order rows; server writes still work. **No order of record exists yet** |
| AUTHORIZED ACTION RESULT | PASS for the coexistence checks |
| UNAUTHORIZED ACTION RESULT | PASS for forgery (M2) |
| REGRESSION RESULT | PASS |
| CROSS-PRODUCT IMPACT | None |
| REMAINING LIMITATIONS | The S1 model is a design, not a build |
| STATUS | **PREPARED** (dependency analysis complete; no conflict with S0B-1) |
| NEXT ACTION | S1 (doc 19) |

## 3. U-21 / R-18 coupling (experiment, not a candidate)

| Field | Result |
|---|---|
| Finding | Out-of-band trigger `trg_log_profile_changes` (SECURITY INVOKER) inserts into `profile_debug_log`, which has RLS on and no policies. Every user-token `UPDATE profiles` therefore fails (REG-18 FAIL in baseline and post) |
| Experiment | Post-migration replica (`fs_u21`) with that trigger disabled |
| Result | REG-18 **PASS** (profile edits work). SEC-20/21/22 **PRESERVED** by the guard trigger (role, balances, membership unchanged). **SEC-32 EXECUTED**: customer self-approves affiliate content JSON (R-18) |
| Meaning | R-18 is masked today only by the U-21 defect. Fixing U-21 alone would expose R-18 |
| Production impact | INFERRED, high confidence (identical definitions). Logs inconclusive: near-zero traffic in 24h (`u21_prod_logs.txt`) |
| STATUS | U-21 **REHEARSED (LOCAL REPLICA) · reproduced**. R-18 **OPEN**. Not part of S0B-1 |
| NEXT ACTION | Identify the trigger owner; founder decision on a joint fix (doc 20 B-07; doc 18 §3) |

Evidence: `evidence/results/u21_experiment.json`.
