# 05 — Database Baseline

## 1. Live baseline (production, read-only)

All calls in this sprint against `hyycomvcaqxxvyrfupes` were read-only: catalog SELECTs (function definitions, columns, constraints, policies, grants), an aggregate log query and provider metadata. **No write, DDL, RPC execution or exploit.** The function ACLs come from the 2026-10-25 capture (S0A evidence L). Table definitions, policies, table grants and the remaining function bodies were captured on **2026-10-26**.

| Object class | Live state | Rehearsal file |
|---|---|---|
| In-scope tables (19) | Columns, defaults, PK/unique/check constraints captured. FKs to `auth.users` omitted in the replica | `22_…/sql/01_tables.sql` |
| SECURITY DEFINER functions in scope (12 incl. 2 refund overloads) + the debug trigger function | Bodies captured verbatim (`pg_get_functiondef`) | `02a_hairstyle_live.sql`, `02b_functions_live.sql` |
| Triggers | `auth.users → handle_new_user`; `profiles → profiles_guard_privileged_columns` (BEFORE INSERT/UPDATE); `profiles → trg_log_profile_changes` (AFTER UPDATE, out-of-band) | `02b_functions_live.sql` |
| RLS policies (in-scope tables) | 32 policies, including the 8 legacy write policies on orders, meetings, notifications, reviews | `03_policies_grants.sql` |
| Table grants | **anon and authenticated hold ALL** (SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER) on every in-scope table except the lounge views/summaries tables (read-only grants). **RLS is the only write barrier.** TRUNCATE is not exposed through PostgREST | `03_policies_grants.sql` |
| Function ACLs | All 17 SECURITY DEFINER functions executable by anon and authenticated; 9 also PUBLIC | `04_function_acls_live.sql` |
| Row counts (aggregate) | orders 0 · meetings 0 · analysis grants 0 · Slay Ticket transactions 0 · premium profiles 0 · Stripe subscriptions 0 (2026-10-25) | — |
| Remote migration history | Highest applied `20261011140245`; versions interleave both repos | — |

## 2. Local replica baseline (isolated)

| Item | Value |
|---|---|
| Engine | PostgreSQL **16.15** (production runs 17.6; no feature used here differs between 16 and 17) |
| Network | **Socket-only** (`listen_addresses=''`), ephemeral directory `/tmp/fsrehearsal_pg1`, superuser trust auth, no external connectivity |
| Supabase emulation | Roles `anon`, `authenticated`, `service_role` (BYPASSRLS); `auth.uid()`/`auth.jwt()` read `request.jwt.claims` exactly as PostgREST sets them; `auth.users` minimal |
| Data | Synthetic fixtures only (`05_fixtures.sql`): customers A and B, an admin identity, one order each, one meeting, notifications, one review, one PSA entitlement and watch session |
| Parity check | SECURITY DEFINER functions executable by anon: **12/12** in-scope (matches live). Legacy write policies: **8** (matches live). Pack check `IN (1, 3, 6)` (matches live) |

## 3. Baseline test results (before any migration)

| Suite | PASS | FAIL | Meaning |
|---|---|---|---|
| Unauthorized-action tests (31) | 15 | **16** | 16 exposures **reproduced**: 9 RPC abuses (credits minted by anonymous and customer, allowance burned, refunds, PSA quota, entitlement consumption, helpful-as-other-user, view inflation, recount) + 7 direct-write abuses (fabricated DELIVERED order, own-order rewrite, meeting with fake card IDs, meeting metadata rewrite, meeting deletion, forged notification, verified review) |
| Authorized-workflow tests (20) | 15 | **5** | REG-01/02/03/06 reproduce **R-10** (4-pack rejected; mixed cart drops the 4; invalid count still records the payment; 4-credit refund ignored). REG-18 reproduces **U-21** (customer cannot update own profile) |
| Information (1) | — | — | SEC-32: R-18 self-approval currently blocked only as a side effect of U-21 |

Full per-test rows: `08_SECURITY_TEST_MATRIX.csv`, `09_AUTHORIZED_WORKFLOW_REGRESSION.csv`; raw JSON in `evidence/results/baseline.json`.
