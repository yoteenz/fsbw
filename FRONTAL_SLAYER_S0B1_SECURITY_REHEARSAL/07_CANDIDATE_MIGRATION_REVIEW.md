# 07 — Candidate Migration Review

Reviewed: the committed S0A candidates in `FRONTAL_SLAYER_S0A_S0B1_READINESS/10_CANDIDATE_MIGRATIONS/` (commit `d0d9e036`). Method: line review, plus execution on the isolated local replica (doc 06 Track L). **The originals are unchanged.** One revision is proposed as a separate file.

| File | sha256 (first 16) | Verdict | Findings |
|---|---|---|---|
| `V0_PRECHECK_readonly.sql` | `954578047f62ae2b` | **OK** | Read-only. Needs the `supabase_migrations` schema, which every Supabase project has; the replica needed it added |
| `M1A_fs_value_rpc_execute_containment.sql` | `e9e46e3f7fad3455` | **OK — rehearsed** | Revokes from `PUBLIC, anon, authenticated` (all three were needed: the live ACLs carry each). Precondition guard proven: a drifted schema aborts with 0 changes. Postcondition guard passes. Idempotent. Both refund overloads covered. |
| `M1A_ROLLBACK_restore_prior_grants.sql` | — | **OK — rehearsed** | Restores the exact baseline ACLs (catalog diff 0 lines). Re-opens R-01 by design |
| `M1B_shared_server_only_rpc_containment_BLOCKED.sql` | — | **Not rehearsed** | Still BLOCKED (U-01). Its functions are not in the replica (Studio and trend objects are out of scope) |
| `M2_fs_legacy_customer_write_policies.sql` | `1d10a7e7c4cca419` | **OK — rehearsed, with one revision proposed** | Drops exactly the 8 legacy write policies; the 5 SELECT policies remain. **Finding:** its unrelated line `ALTER TABLE public.psa_tool_events ENABLE ROW LEVEL SECURITY` makes the whole migration depend on that table existing. On the first replica run it was missing, and M2 rolled back atomically (no partial state; good) but did not apply. Production has the table, so the original works there. **Proposed `M2 rev2`** (`07_CANDIDATE_MIGRATION_REVISIONS/`) uses `ALTER TABLE IF EXISTS`; rehearsed without the table: exit 0, 0 write policies left |
| `M2_ROLLBACK_recreate_policies.sql` | — | **OK — rehearsed** | Recreates the 8 policies verbatim (catalog diff 0) |
| `M3_fs_hairstyle_analysis_pack_sizes.sql` | `957e8a45d218c7b7` | **OK — rehearsed** | 4-pack granted; mixed 1+4 granted fully; invalid count records **no** payment (replay possible); 4-credit refund accepted; webhook replay idempotent. Re-asserts its own grants |
| `M3_ROLLBACK_restore_prior_function_bodies.sql` | — | **OK — rehearsed** | Restores the exact live bodies (function-source md5 identical to baseline) |
| `V1_POSTCHECK_and_STAGING_role_tests.sql` | `a333f16f4cdb0f2b` | **OK** | Part A all expected (0 exposed, 0 lost, 0 write policies, 5 SELECT policies, `IN (1, 3, 4, 6)`, triggers unchanged). Part B is commented out by design (staging-only) |

## Review against the brief's checklist

| Concern | Finding |
|---|---|
| Public RPC EXECUTE grants | Closed by M1A for 10 signatures. Still open after M1A: the M1B set (4), the SITE00-owned function, and 2 trigger functions (calling them over RPC errors anyway) |
| SECURITY DEFINER functions | All keep `SET search_path = public` (safe). The out-of-band `log_profile_changes` is SECURITY **INVOKER** with a mutable search_path (advisor WARN); not touched |
| Function overloads | The legacy 2-arg `hairstyle_analysis_refund_consume(uuid,text)` is **ambiguous** with the 4-arg version, which has defaults. Calls with two arguments fail with 42725, so it is not separately exploitable and the app calls the 4-arg form with named parameters. M1A revokes it anyway. Dropping it later is optional hygiene |
| Privileged mutation paths | Every value-changing function now requires the service role. Customer writes to orders, meetings, notifications and reviews go only through the API |
| Unauthorized customer writes | Closed for the 4 tables (M2). **Still allowed by design:** cart, wishlist, user_activity, lounge helpful/comments (own rows, legitimate) |
| Missing ownership checks | The functions trust caller-supplied `p_user_id`. Acceptable once they are server-only (M1A); the server derives the user from the JWT |
| Role escalation | `profiles.role`, tier and balances are protected by the existing guard trigger; a customer cannot change them (SEC-20…22). Admin authority is API-side |
| **Defence in depth (proposal, not rehearsed)** | anon and authenticated keep **table-level ALL** (including INSERT/UPDATE/DELETE/TRUNCATE) on these tables; RLS is the only barrier. A later FS-only migration could `REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON orders, meetings, notifications, reviews FROM anon, authenticated` (FS-owned tables; no SITE00 use). Not in A1 scope |
| **Coupled pre-existing issue (U-21 / R-18)** | The out-of-band `trg_log_profile_changes` makes **every customer-token profile update fail** (reproduced locally). Disabling it restores profile edits **but exposes R-18** (customer self-approves affiliate JSON), which is masked today only by that failure (experiment in doc 15 §3). Any fix must ship U-21 and the R-18 guard extension together. It needs the trigger owner identified (SITE00 or other) and a founder decision. **Not part of S0B-1** |

## Recommendation

M1A, M2 (original or rev2) and M3 are **ready for staging rehearsal**. If H2 approves staging, use M2 rev2: identical effect, without the unrelated hard dependency. No change to the recorded approval scope (A1a/A1b) is needed.
