# 13 — Migration Execution Log

**Production: no migration executed. Staging: none exists, so none executed. All executions below ran on the isolated local replica** (PostgreSQL 16.15, socket-only cluster at `/tmp/fsrehearsal_pg1`, no TCP listener, synthetic data). Raw logs: `evidence/results/`.

## 1. Production calls this sprint (read-only)

| # | Call | Kind | Purpose | Mutation |
|---|---|---|---|---|
| 1 | Supabase `list_projects`, `list_organizations`, `get_organization`, `list_branches`, `get_project` | Metadata | Staging discovery (doc 01) | None |
| 2 | `execute_sql` × 4 | `SELECT` only on `pg_catalog` / `information_schema` | Function refs and ACLs; table columns and constraints; policies and grants; function definitions (doc 05) | None |
| 3 | `query_logs` × 2 | Aggregate log read | U-21 evidence (24h `profile_debug_log` errors; log volume) | None |
| 4 | Board decision store `list` (`decisions`) | Artifact store read | Approval state (doc 17) | None |

No DDL, DML, RPC execution, migration, branch, project, key or secret operation was issued against any provider.

## 2. Local replica runs

Databases (all in the local cluster): `fs_baseline` (baseline only), `fs_post` (apply), `fs_rt` (rollback / re-apply / idempotency), `fs_drift` (drift guard), `fs_u21` (experiment; not a candidate). Each was built by `22_…/harness/build.sh` from the same SQL files.

### Run 1 — replica gap (kept for honesty)

`evidence/results/execution_log_run1_replica_gap.txt`

| Step | Result | Cause |
|---|---|---|
| V0 | Error | `supabase_migrations.schema_migrations` missing in the replica (every Supabase project has it) |
| M1A | rc 0 | — |
| M2 | **rc 3, rolled back atomically**, 0 partial changes | `psa_tool_events` missing in the replica; M2's unrelated `ALTER TABLE … ENABLE ROW LEVEL SECURITY` hard-depends on it |
| Action | Replica gap fixed (both objects added to the emulation); database rebuilt; run 2. Led to the M2 rev2 proposal (doc 07) |

### Run 2 — authoritative

`evidence/results/execution_log.txt`. Files are the committed S0A candidates (commit `d0d9e036`), byte-for-byte.

| Order | File | sha256 (first 16) | Exit | Time |
|---|---|---|---|---|
| 1 | `V0_PRECHECK_readonly.sql` | `954578047f62ae2b` | 0 | 43 ms |
| 2 | `M1A_fs_value_rpc_execute_containment.sql` | `e9e46e3f7fad3455` | 0 | 42 ms |
| 3 | `M2_fs_legacy_customer_write_policies.sql` | `1d10a7e7c4cca419` | 0 | 40 ms |
| 4 | `M3_fs_hairstyle_analysis_pack_sizes.sql` | `957e8a45d218c7b7` | 0 | 38 ms |
| 5 | `V1_POSTCHECK_and_STAGING_role_tests.sql` | `a333f16f4cdb0f2b` | 0 | 40 ms |

V0 snapshot before apply: 12 functions with anon/authenticated EXECUTE; 8 legacy write policies; pack check `IN (1, 3, 6)`; 3 triggers.

V1 Part A after apply:

| Check | Expected | Observed |
|---|---|---|
| In-scope functions still executable by anon/authenticated | 0 | **0** |
| In-scope functions that lost service_role EXECUTE | 0 | **0** |
| Legacy write policies remaining | 0 | **0** |
| SELECT policies on the 4 tables | 5 | **5** |
| Hair-analysis pack check | `IN (1, 3, 4, 6)` | **`IN (1, 3, 4, 6)`** |
| Triggers (`on_auth_user_created`, `trg_log_profile_changes`, `profiles_guard_privileged_columns`) | unchanged | **unchanged** |

Part B (role probes) is commented out in V1 by design; the equivalent probes are the 52-test harness (docs 08, 09, 15).

### Recovery runs (`fs_rt`)

`evidence/results/recovery_log.txt`

| Step | Result | Test suite after the step |
|---|---|---|
| M3_ROLLBACK → M2_ROLLBACK → M1A_ROLLBACK | rc 0 each | `after_rollback.json` = baseline verdicts (16 NEG fail, 5 POS fail) |
| Catalog after rollback vs before | — | **0-line diff** (`catalog_before.txt` vs `catalog_after_rollback.txt`) |
| Re-apply M1A → M2 → M3 | rc 0 each | `reapplied.json` = post verdicts |
| Second run of M1A, M2, M3 (idempotency) | rc 0 each; M2 emits "does not exist, skipping" notices only | `idempotent.json` = post verdicts |

### Drift guard (`fs_drift`)

The legacy 2-arg refund overload was dropped to simulate drift, then M1A was applied.

```
ERROR:  S0B1-M1A precondition failed: public.hairstyle_analysis_refund_consume(uuid,text) not found
```

Catalog before vs after: **0-line diff** (`catalog_drift_before.txt`, `catalog_drift_after.txt`). The guard aborts with no partial change.

### M2 rev2 (`07_CANDIDATE_MIGRATION_REVISIONS/`)

Applied on a replica **without** `psa_tool_events`: rc 0, 0 write policies left. The original M2 on the same schema: rc 3 (rolled back).

## 3. Version numbers

No version was inserted in `supabase_migrations.schema_migrations` on the replica (the candidates are not in `supabase/migrations/`). Track S must assign fresh versions greater than the highest applied and unused in both repositories (doc 06).
