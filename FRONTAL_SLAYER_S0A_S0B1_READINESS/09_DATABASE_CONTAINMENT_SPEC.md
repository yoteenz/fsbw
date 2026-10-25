# 09 — S0B-1 Database Containment Specification

**Status: REVIEW-READY. NOT EXECUTED.** This specifies the database half of P0A containment. The SQL is in `10_CANDIDATE_MIGRATIONS/`. The shared-database analysis is in doc 11, staging in doc 13, and validation and recovery in doc 14.

**Evidence basis.** A new read-only verification on **2026-10-25** (`evidence/L_live_readonly_2026-10-25.md`) re-confirmed every finding below. It used SELECT queries on system catalogs, aggregate counts, the migration list and the security advisor. No write, RPC execution or exploit was attempted. Earlier "live-confirmed" findings from the audit are now **re-verified**, not merely carried forward.

## 1. Scope

| In scope (S0B-1) | Out of scope (later, or another owner) |
|---|---|
| EXECUTE privileges on FRONTAL SLAYER SECURITY DEFINER value and quota functions (M1A) | SITE00-owned function and tables (doc 11 §5) |
| Legacy customer write policies on `orders`, `meetings`, `notifications`, `reviews` (M2) | New ledger, order and role tables (S1, S3, S4: additive, later) |
| Hair-analysis pack-size acceptance and all-or-nothing grant (M3) | Privileged-column trigger changes (R-18). BLOCKED until a SITE00/JURNL smoke test can run |
| Repo alignment: `psa_tool_events` RLS line (M2, a no-op live) | Any application code change (S0B-2, doc 15) |
| Pre- and post-verification SQL (V0, V1) | Auth dashboard settings (leaked-password protection): needs H3 acknowledgement |

## 2. Findings driving S0B-1 (live state on 2026-10-25)

### 2.1 SECURITY DEFINER functions executable by anyone

All 17 SECURITY DEFINER functions in `public` are executable by `anon` and `authenticated`. Nine also carry a `PUBLIC` grant.

| Function | Trusts a caller-supplied identifier? | Effect if called with the anon key | Class | Candidate |
|---|---|---|---|---|
| `hairstyle_analysis_grant_purchase_credits(uuid,text,int[])` | **Yes**: `p_user_id`; any `p_payment_intent_id` of 3+ characters; **no `auth.uid()` check** (body read) | Mint paid analysis credits for any user | Service-only | M1A |
| `hairstyle_analysis_try_consume(uuid,text,int)` | Yes: `p_user_id`, **and the caller sets `p_month_limit`** | Burn another member's allowance, or consume paid credits | Service-only | M1A |
| `hairstyle_analysis_refund_consume(uuid,text,text,int)` | Yes | Refund usage, which resets monthly caps | Service-only | M1A |
| `hairstyle_analysis_refund_consume(uuid,text)` (**legacy overload**, newly identified) | Yes | Same | Service-only | M1A |
| `psa_try_consume_message(uuid,text,text,int,int)` | Yes, including the limits | Burn any member's PSA quota | Service-only | M1A |
| `psa_consume_watch_if_qualified(uuid,uuid)` | Yes | Consume episode entitlements | Service-only | M1A |
| `lounge_toggle_helpful(text,text,uuid)` | Yes | Toggle "helpful" as any user | Service-only in practice | M1A |
| `lounge_record_qualified_view(...)` | Yes | Inflate view counts | Service-only in practice | M1A |
| `lounge_engagement_ensure_summary`, `lounge_engagement_recount_summary` | — | Recount summaries | Service-only (internal) | M1A |
| `studio_world_atomic_reserve_budget(...)` | Yes (billing owner, org) | Reserve or burn any organisation's generation budget | Service-only | M1B (BLOCKED) |
| `trend_intelligence_public_forecast_payload`, `trend_intelligence_public_report_signals`, `slay_forecast_public_broadcast_package` | Slug only | Read published content | Public by design, server-only callers | M1B (BLOCKED) |
| `site00_allocate_access_credential_code()` | — | Burns sequence numbers | **SITE00-owned** | Excluded (doc 11 §5) |
| `handle_new_user()`, `profiles_preserve_privileged_columns()` | n/a (trigger) | An RPC call fails, because trigger functions cannot be called directly | Trigger | Deferred (advisor cleanup only) |

### 2.2 Permissive customer write policies

Live policies: `orders` (insert, update own), `meetings` (insert, update, delete own), `notifications` (insert, update own), `reviews` (insert own). Every FRONTAL SLAYER write to these tables goes through the server (service role). The browser has no direct references to these tables, and SITE00 has none either (grep this sprint). Customers lose nothing legitimate when the policies are dropped.

### 2.3 Unauthorised value issuance: database side

- **Hair-analysis credits:** R-01 (via the RPC) and R-10 (the 4-pack is rejected: the body checks `IN (1, 3, 6)`).
- **Mixed-cart defect** (new; evidence S, Corrections 3): a 1-pack plus 4-pack cart grants the 1, drops the 4 and records the payment as granted, so a webhook replay cannot repair it.
- **Slay Tickets:** the issuance hole is in the application (`credit-order`), not the database. It belongs to S0B-2.
- **Balances on `profiles`:** guarded by `profiles_guard_privileged_columns` against user-token writes. The guard does **not** stop a service-role write made from client-supplied input (e.g. `stripe_customer_id`, evidence S, Corrections 4). That belongs to S0B-2.

### 2.4 Ownership boundaries and admin authorisation

- RLS ownership (`auth.uid() = user_id`) is correct on every policy inspected. The defect is that **write** commands are allowed, not that ownership is checked wrongly.
- Admin authorisation sits in the API (JWT plus email allow-list), not in the database. Admin tables have RLS on with no policies (deny-all to clients), which is correct for a service-only design. The `admin_roles` table belongs to S3.
- `profile_debug_log` and `trg_log_profile_changes`: a new finding, investigate only (doc 18 U-21).

### 2.5 Service-role exposure

- No service-role key is in either client bundle (source scan, evidence S Part 2; build scan, doc 12 §4).
- **The real exposure is the reverse:** server code falls back silently to the anon key when the service-role key is missing (`getSupabaseAdmin()` in both repos). M1A touches only functions whose callers **fail closed**. M1B is BLOCKED because its callers do not.

## 3. Candidate changes

| ID | Change | Rows affected | Expected user impact | SITE00 impact | Status |
|---|---|---|---|---|---|
| M1A | REVOKE EXECUTE … FROM PUBLIC, anon, authenticated; GRANT to service_role (10 signatures) | 0 (privileges only) | None. Every legitimate caller is server-side with a fail-closed service client | None (no SITE00 caller) | Ready for review |
| M1B | Same for 4 functions with anon-fallback callers | 0 | None if the key is present; feature outage if absent | None | BLOCKED (U-01) |
| M2 | DROP 8 write policies; keep SELECT | 0 | None (no client writes these tables) | None (SITE00 uses none of them) | Ready for review |
| M3 | Replace grant and 4-arg refund bodies (accept 1/3/4/6; all-or-nothing) | 0 today (0 grant rows) | 4-pack buyers receive credits | None | Ready for review |

## 4. Measurable containment criteria (release gate S0B-1)

| # | Criterion | Measured by | Pass |
|---|---|---|---|
| C1 | No FS value or quota function is executable by `anon` or `authenticated` | V1 A1 | 0 rows |
| C2 | `service_role` retains EXECUTE | V1 A2 | 0 rows |
| C3 | No write policy on orders, meetings, notifications, reviews | V1 A3 | 0 rows; SELECT policies ≥ 4 |
| C4 | 4-pack accepted | V1 A4 + staging probe | `IN (1, 3, 4, 6)`; probe grants `[4]` |
| C5 | Invalid count leaves no grant record | Staging probe | ok:false and no `purchase_grants` row |
| C6 | Advisor `anon_security_definer_function_executable` drops by 10 (17 → 7: the M1B set, the SITE00 function and 2 trigger functions) | `get_advisors` | 7 remaining, each with a documented owner |
| C7 | FS smoke tests pass (hair analysis generate, PSA chat, lounge helpful and view, Stripe webhook test event) | Staging E2E (doc 14 §3) | All pass |
| C8 | SITE00 and JURNL unaffected | SITE00 sign-in plus profile sync; JURNL signup (doc 11 §4) | Pass |
| C9 | Profile triggers unchanged | V0 P6 = V1 A5 | Identical |

## 5. Approvals required

| Step | Approval | Category |
|---|---|---|
| Rehearse M1A, M2, M3 on staging | **A1a** (founder) plus H2 staging configuration | 1 (production-risk acceptance starts here) |
| Apply to production | **A1b** (founder), after the staging evidence is attached | 1 |
| Cross-product acknowledgement | **H3**: SITE00 owner notified, smoke test scheduled | 2 (engineering default) |
| M1B | U-01 evidence plus Studio OS owner acknowledgement | 4 (blocked by evidence) |
