# 10 — Candidate Migrations (REVIEW ONLY — NOT EXECUTED)

**Nothing in this folder has been applied to any database.** The files sit outside `supabase/migrations/` on purpose: the repo's AGENTS.md tells agents to auto-apply new files placed there, and these must not be applied without founder approval.

Every live fact used here comes from a new read-only check on 2026-10-25 (`../evidence/L_live_readonly_2026-10-25.md`): SELECT queries on system catalogs, aggregate counts, `list_migrations` and the security advisor. No write, no RPC call, no exploit.

| File | Purpose | Risk closed | Status | Gate |
|---|---|---|---|---|
| `V0_PRECHECK_readonly.sql` | Read-only state capture before applying | — | Ready | Run before every apply |
| `M1A_fs_value_rpc_execute_containment.sql` | Revoke EXECUTE on 10 FRONTAL SLAYER value/quota function signatures from `PUBLIC, anon, authenticated`; grant `service_role` | R-01 | **READY FOR REVIEW** | A1a → staging → A1b |
| `M1A_ROLLBACK_restore_prior_grants.sql` | Restores the exact 2026-10-25 ACLs (re-opens R-01) | — | Ready | Incident only |
| `M1B_shared_server_only_rpc_containment_BLOCKED.sql` | Same for Studio World budget + 3 public-content payload functions | R-01 (Studio), advisor | **BLOCKED** (U-01; callers silently fall back to anon) | U-01 evidence + Studio OS owner ack |
| `M2_fs_legacy_customer_write_policies.sql` | Drop 8 legacy customer write policies on orders, meetings, notifications, reviews | R-04 (and the R-09 metadata path) | **READY FOR REVIEW** | A1a → staging → A1b |
| `M2_ROLLBACK_recreate_policies.sql` | Re-creates them verbatim (re-opens R-04) | — | Ready | Incident only |
| `M3_fs_hairstyle_analysis_pack_sizes.sql` | Grant and refund accept the 4-pack; reject the whole grant if any count is invalid | R-10 (+ mixed-cart defect) | **READY FOR REVIEW** | A1a → staging → A1b |
| `M3_ROLLBACK_restore_prior_function_bodies.sql` | Restores the live bodies verbatim (re-breaks R-10) | — | Ready | Incident only |
| `V1_POSTCHECK_and_STAGING_role_tests.sql` | Part A read-only postconditions; Part B staging-only role probes | — | Ready | After apply |

## Not proposed as SQL (documented in 09 and 11)

| Item | Why no SQL |
|---|---|
| `site00_allocate_access_credential_code` revoke | SITE00-owned object. FRONTAL SLAYER must not alter it. Handed to the SITE00 owner (doc 11 §5). |
| Trigger functions `handle_new_user`, `profiles_preserve_privileged_columns` EXECUTE revoke | Calling them over RPC already fails (they are trigger functions), so the revoke only clears an advisor warning. These functions run on every SITE00 and JURNL signup, so the change is deferred to a later, separate migration with its own cross-product signup test. |
| Privileged-column guard extension (R-18: user-writable JSON columns) | Changes the trigger used by SITE00 profile sync and by all signups. **BLOCKED** until staging can run the SITE00 profile-sync and JURNL signup smoke tests. |
| `trg_log_profile_changes` / `profile_debug_log` (new finding) | Created out-of-band (in neither repo). It may break user-token profile updates. **INVESTIGATE**: owner unknown; staging test first (doc 18 U-21). |
| `ALTER DEFAULT PRIVILEGES` so future functions are not anon-executable | Project-wide; would change SITE00's future functions too. Needs H3 coordination. |
| Leaked-password protection | An Auth dashboard setting, not SQL. Project-wide (SITE00 and JURNL users too). Engineering default, but it needs the SITE00 owner's acknowledgement (H3). |
| SITE00 tables with RLS disabled (advisor ERROR) | SITE00-owned. Reported only. |

## Order of application (after approval)

`V0` → `M1A` → `M2` → `M3` → `V1 Part A`. Each is its own transaction with in-transaction postcondition guards, so a failed guard rolls that file back completely. Apply on staging first (doc 13), run the doc 14 test plan, then production in the same order. Version numbers are assigned at apply time: greater than `20261011140245`, unused in both repos, re-listed immediately before applying.
