# 11 — Shared Supabase Impact Analysis

Project `hyycomvcaqxxvyrfupes` hosts **FRONTAL SLAYER**, **SITE00** (including JURNL) and **Studio OS** objects in one `public` schema, with one Auth instance and one migration history. This document treats the project as a **cross-product security boundary**. Sources: X2 (prior sprint), evidence S Part 2, the live read-only check (evidence L), and greps of both repos made this sprint. SITE00 was read only and not modified.

## 1. Ownership map of the objects S0B-1 touches

| Object | Defined in | Owner | FS callers | SITE00 callers |
|---|---|---|---|---|
| hairstyle_analysis_* (4 signatures) | fsbw `20260610120000`, `20260610140000` | FS | `api/_lib/hairstyleAnalysisUsage.ts` (service role, fail-closed) | none |
| psa_try_consume_message, psa_consume_watch_if_qualified | fsbw `20260605120000`, `20260809103000` | FS | `psaUsageLimit.ts`, `psaEntitlements.ts` (service role) | none |
| lounge_* (4) | fsbw `20260810180000` | FS | `loungeEngagement.ts` via `/api/lounge-tv/*` (inline service client, fail-closed) | none |
| studio_world_atomic_reserve_budget | fsbw `20260820190000` (**version collides with a different SITE00 file**) | Studio OS (fsbw) | `atomic-reserve.ts` via `getSupabaseAdmin()` (**anon fallback**) | none (Studio World over HTTP only) |
| trend_intelligence_*, slay_forecast_public_broadcast_package | fsbw `20260811*`, `20260812*` | FS | `getSupabaseAdmin()` (**anon fallback**) | none |
| site00_allocate_access_credential_code | SITE00 `20260820000000` | **SITE00** | none | `api/_lib/site00AccessCredentials/service.ts:219` (`getSupabaseAdmin()`, anon fallback) |
| policies on orders, meetings, notifications, reviews | fsbw `001`, `002` | FS | server writes via the service role only | **none** |
| profiles policies and triggers | fsbw | FS | `api/profile.ts` (user JWT) | **`api/profile.ts` fork upserts FS columns on every sign-in** |
| `on_auth_user_created` → `handle_new_user` | fsbw | FS | — | **every SITE00 and JURNL signup** |
| `trg_log_profile_changes` → `log_profile_changes` | **neither repo** (created out-of-band) | **Unknown** | — | possibly affects SITE00 profile upserts |

## 2. Per-candidate impact

| | M1A | M1B | M2 | M3 |
|---|---|---|---|---|
| Schema | public | public | public | public |
| Tables | none | none | orders, meetings, notifications, reviews (+ psa_tool_events RLS no-op) | hairstyle_analysis_usage, hairstyle_analysis_purchase_grants (written by function) |
| Functions | 10 signatures | 4 | none | 2 bodies replaced |
| Roles | PUBLIC, anon, authenticated (revoke); service_role (grant) | same | public (policy roles) | — |
| Grants | EXECUTE | EXECUTE | none | EXECUTE re-asserted |
| Policies | none | none | 8 dropped | none |
| Triggers | none | none | none | none |
| Dependent FS endpoints | hairstyle-analysis-generate, hairstyle-analysis-usage, stripe/webhook (grant), psa/chat, psa-today/watch-session, lounge-tv/engagement/* | trend-intelligence/public, slay-forecast-broadcast/public, admin/trend-desk, admin/slay-forecast-broadcast, Studio generation gateway | none (no client writes) | stripe/webhook, hairstyle-analysis-generate |
| SITE00 consumers | none | none | none | none |
| Possible cross-product failure | None identified. Not a trigger, not on profiles, no SITE00 caller | Studio budget reservation fails if the FS service key were absent | None identified | None |
| Verdict | **SAFE TO REHEARSE** | **BLOCKED** (U-01) | **SAFE TO REHEARSE** | **SAFE TO REHEARSE** |

## 3. Cross-product failure modes S0B-1 deliberately avoids

1. **No trigger or `profiles` change.** A failing trigger aborts signups for all three products ("Database error saving new user").
2. **No column drop or rename on `profiles`.** SITE00's `api/profile.ts` writes FS commerce columns on every sign-in.
3. **No change to a SITE00-owned object.** That includes the access-credential function and the two SITE00 tables with RLS off.
4. **No `ALTER DEFAULT PRIVILEGES`.** It would change future SITE00 functions.
5. **No Auth configuration change in S0B-1.** Site URL, redirect allow-list, email templates and leaked-password protection are all shared.
6. **Migration history.** The remote history interleaves both repos. Its versions are apply-time timestamps, not repo filenames: e.g. the repo's `20260820190000` is applied as `20260820170859`. Six repo versions collide between fsbw and SITE00. Rule: re-list remote migrations immediately before applying, use a version > `20261011140245` that neither repo uses, and apply via MCP `apply_migration` or the SQL editor. Never run `supabase db push` from either repo, because it would treat the other product's migrations as drift.
7. **Account deletion.** `jurnl_*` rows cascade-delete with `auth.users`. Not touched in S0B-1, but flagged for S2 (W-33 in the prior package).

## 4. SITE00 and JURNL verification required for S0B-1 (gate C8)

Run on staging, which carries a schema-only copy of all products' objects (doc 13), and repeat a non-destructive subset on production after the apply:

| Check | How | Pass |
|---|---|---|
| SITE00 sign-in plus profile sync | SITE00 local dev (unmodified source) pointed at staging env, sign in a synthetic user → `/api/profile` GET and upsert | 200, row updated |
| JURNL signup | Synthetic signup on staging → `auth.users` row + `profiles` row via `handle_new_user` | Success |
| SITE00 admin access-credential creation | SITE00 admin flow on staging | Unchanged (M1A/M2/M3 do not touch it) |
| SITE00 production smoke after the FS apply | SITE00 owner signs in on site00.com and opens one page that reads data | No new errors in Supabase logs |

**Who runs it:** the SITE00 owner, or an operator with SITE00 credentials. FRONTAL SLAYER work does not modify SITE00 source. Running SITE00 locally against staging is configuration only.

## 5. Hand-off note for the SITE00 owner (not acted on by FRONTAL SLAYER)

1. `public.site00_allocate_access_credential_code()` is SECURITY DEFINER and executable by `anon` and `authenticated` (PUBLIC grant). It is called only server-side through `getSupabaseAdmin()`, which falls back to the anon key. Recommendation for SITE00: confirm the service key in SITE00 production, then `REVOKE EXECUTE … FROM PUBLIC, anon, authenticated` in a SITE00 migration.
2. Advisor ERROR: `site00_production_invalidation_events` and `site00_production_dependency_edges` have RLS disabled in an exposed schema.
3. SITE00 CI (`site00-production-deploy.yml`, `jurnl-live-production-sync-proof.yml`) runs tests against the **shared production project** with the service-role key. Any FRONTAL SLAYER rehearsal must not rely on SITE00 CI as its staging.
4. `trg_log_profile_changes` on `public.profiles` (owner unknown, in neither repo) could make user-token profile updates fail (doc 18 U-21).

## 6. Unknown dependencies (each one blocks only the item named)

| Unknown | Blocks |
|---|---|
| Service-role key present in FS production (Vercel) and SITE00 production (Railway) | M1B; confirms M1A and M2 assumptions (U-01) |
| Who created `trg_log_profile_changes` and whether profile updates currently succeed with a user token | Any future `profiles` trigger change (R-18) |
| Whether any external integration (outside both repos) calls these RPCs with the anon key | M1A, very low likelihood. Mitigated by staging plus 24h production log watch (doc 14) |
| Whether the Supabase plan supports branching | Staging option choice (doc 13) |
