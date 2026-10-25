# 14 — Migration Validation and Recovery

This plan applies to every S0B-1 candidate (M1A, M2, M3), and to M1B once it is unblocked. Nothing here has been executed.

## 1. Preconditions (all must be true before staging rehearsal, and again before production)

| # | Precondition | Evidence required | M1A | M2 | M3 |
|---|---|---|---|---|---|
| P1 | Approved scope | Recorded A1a (rehearsal) or A1b (production) in the approval manifest (doc 17), committed | ✓ | ✓ | ✓ |
| P2 | Verified project target | Operator confirms the project ref in the SQL session (`V0` P1) and the expected environment | ✓ | ✓ | ✓ |
| P3 | Verified authorisation | Operator is a project owner or admin. The change is applied through MCP `apply_migration` or the SQL editor, never `db push` (doc 11 §3.6) | ✓ | ✓ | ✓ |
| P4 | Current schema inspection | `V0_PRECHECK` output attached, matching the 2026-10-25 capture for the objects in scope | ✓ | ✓ | ✓ |
| P5 | Dependency review | Doc 11 §2 re-run if any repo changed after 2026-10-25 (grep callers) | ✓ | ✓ | ✓ |
| P6 | Backup and recovery capability | Supabase PITR or daily backup confirmed for the project. M1A and M2 change no data. M3 changes function bodies only. Rollback files ready | ✓ | ✓ | ✓ |
| P7 | Staging rehearsal | Doc 13 workflow steps 2–5 passed and the evidence pack attached (production only) | ✓ | ✓ | ✓ |
| P8 | Service-role key | U-01 checks A1–A8 recorded (doc 12) | recommended | recommended | recommended |
| P9 | Change window | Off-peak. SITE00 owner informed (H3). Someone able to roll back is on hand for 1h after the apply | ✓ | ✓ | ✓ |

## 2. Execution rules

- **Narrow scope:** one file per concern. No unrelated statements.
- **Safe ordering:** `V0` → `M1A` → `M2` → `M3` → `V1-A`. M1A goes first so that M3's new body is never exposed to anon even for a moment (M3 also re-asserts its own grants).
- **Transactions:** each file is one `BEGIN … COMMIT` with in-transaction precondition and postcondition guards that `RAISE EXCEPTION` (rolling the whole file back) on drift.
- **Idempotency:** REVOKE, GRANT, DROP POLICY IF EXISTS and CREATE OR REPLACE are all re-runnable.
- **Permission verification:** `V1` Part A runs immediately after the apply. Advisor counts are compared with before.
- **Versioning:** assign the version at apply time (> `20261011140245`, unused in both repos), with names `s0b1_m1a_fs_value_rpc_execute`, `s0b1_m2_fs_legacy_write_policies`, `s0b1_m3_fs_analysis_pack_sizes`.

## 3. Postconditions (release gate)

| Postcondition | Test | Where |
|---|---|---|
| Unauthorised access denied | V1 A1, A3; Part B probes (anon and authenticated get "permission denied"; customer PATCH on orders is denied) | Staging (B), production (A) |
| Authorised customer workflows preserved | Hair analysis generate and usage; PSA chat message; lounge helpful and qualified view; booking request; alerts read; orders read | Staging E2E; production smoke with the founder's own account (read-only actions plus one PSA message) |
| Admin workflows preserved | Admin consult offer → notification; admin reviews publish; admin meetings list | Staging E2E |
| Payments unaffected | Stripe test webhook `payment_intent.succeeded` with an analysis 4-pack → credits granted once; replay → duplicate; membership test checkout → profile updated | Staging (Stripe CLI) |
| SITE00 and JURNL unaffected | Doc 11 §4 | Staging, then a production smoke by the SITE00 owner |
| Logging operational | Supabase API and Postgres logs show no new `permission denied` from service-role callers; webhook logs clean for 24h | Production log watch |
| Advisor | `anon_security_definer_function_executable` count goes 17 → 7 | Production |

## 4. Recovery

**Principle: forward-fix first.** Every rollback file restores a known vulnerability. Rolling back is justified only when a legitimate feature is broken **and** cannot be fixed forward within the incident window.

| Failure seen | Most likely cause | Forward fix (preferred) | Rollback (last resort) | Limitation of rollback |
|---|---|---|---|---|
| Hair analysis, PSA or lounge returns 500 or "permission denied" after M1A | A caller uses the anon or user client instead of the service role (none found in this sprint's grep), or the service key is missing in that deployment | Fix the env (add the key), or switch the caller to the service client | `M1A_ROLLBACK` | Re-opens R-01 for all 10 signatures |
| A customer flow that wrote orders, meetings, notifications or reviews now fails | An undiscovered direct client write | Route it through the API with the service role | `M2_ROLLBACK` | Re-opens R-04, including meeting metadata later used by autopay (R-09) |
| A 4-pack grant fails or behaves oddly after M3 | Logic regression | Corrected `CREATE OR REPLACE` | `M3_ROLLBACK` | Re-breaks R-10. Credits granted under M3 remain (intended) |
| SITE00 or JURNL signup or profile errors | Not expected from S0B-1 (no trigger or profile change). Investigate `trg_log_profile_changes` (U-21) | Fix in the owning product | None needed from FS | — |

**Rollback conditions:** a P1-severity customer-facing outage attributable to the migration, confirmed by logs, with no forward fix available within 60 minutes. The founder is told immediately, and the rollback is recorded in the manifest as an event.

**Data recovery:** M1A and M2 change privileges and policies only; no rows are touched. M3 changes function bodies; a row is written only when a legitimate (service-role) grant succeeds. PITR is not needed for any S0B-1 rollback. Its availability (P6) is still confirmed, in case an unrelated incident coincides.

## 5. What production-only application (option 3 in doc 13) cannot verify

Without staging, Part B role probes and the Stripe webhook replays cannot run without touching production. SITE00 and JURNL signups cannot be rehearsed either. Those postconditions would rest on read-only catalog checks plus log watching, which is why staging is recommended.
