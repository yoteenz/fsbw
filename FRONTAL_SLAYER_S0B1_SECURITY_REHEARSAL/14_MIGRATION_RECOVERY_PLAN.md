# 14 — Migration Recovery Plan

Status: **REHEARSED (local replica)** for the database objects. **Not rehearsed** on Supabase staging (BLOCKED) or production (not in scope).

## 1. Principles

1. **Forward-fix first.** Each rollback deliberately re-opens a CRITICAL exposure (R-01, R-04 or R-10). Use one only when the forward fix cannot ship within the incident window.
2. **Roll back one migration at a time, in reverse order** (M3 → M2 → M1A), and re-run the test suite after each.
3. **Data is not rolled back.** Credits granted after M3 stay granted. Rows written by the server after M2 stay written.
4. **No production rollback without the founder** (or a pre-agreed on-call rule recorded with A1b).

## 2. What was rehearsed

| Scenario | Method | Result | Evidence |
|---|---|---|---|
| Full rollback | M3_ROLLBACK → M2_ROLLBACK → M1A_ROLLBACK | rc 0 each; **catalog diff 0 lines** vs pre-migration; all 52 test verdicts identical to baseline | `recovery_log.txt`, `catalog_*`, `after_rollback.json` |
| Re-apply after rollback | M1A → M2 → M3 | rc 0; verdicts identical to post | `reapplied.json` |
| Accidental second run | Each migration run again | rc 0; no change (idempotent) | `idempotent.json` |
| Schema drift | One overload missing before M1A | Precondition guard aborts; **0 changes** | `drift_guard_output.txt` |
| Partial failure | Original M2 against a schema without `psa_tool_events` | Whole transaction rolled back; no partial state | `execution_log_run1_replica_gap.txt` |

## 3. Decision table (for Track S and, after A1b, Track P)

| Symptom after apply | First check | Action |
|---|---|---|
| A server feature returns 503 or "permission denied for function" | Is it using the service client? Is `SUPABASE_SERVICE_ROLE_KEY` present (U-01)? | Fix the caller or set the key (forward-fix). Only if impossible within the window: `M1A_ROLLBACK` |
| An integration outside both repos breaks (U-23) | Logs: anon calls to `/rest/v1/rpc/<fn>` | Accepted risk: move the integration to a server path. Rollback only by founder decision |
| A customer flow that wrote orders/meetings/notifications/reviews directly fails | Which client call? (none found in FS, SITE00 or JURNL) | Move it to the API (forward-fix). Last resort: `M2_ROLLBACK` |
| Hair-analysis grant or refund misbehaves | `hairstyle_analysis_purchase_grants` rows for the PI | Fix forward in a new function body. Last resort: `M3_ROLLBACK` (re-breaks R-10; granted credits remain) |
| SITE00 sign-in or profile page errors | Was it failing before? (U-21 is pre-existing: REG-18 fails in both phases) | Not caused by S0B-1; route to doc 20 B-07 |

## 4. Preconditions still open

| ID | Precondition | Status |
|---|---|---|
| U-22 | PITR or backups available on the shared project | **OPEN** (dashboard check by the operator) |
| P-S | The same rollback sequence rehearsed on Supabase staging | **BLOCKED** (H2, A1a) |
| P-L | 24h production log watch plan and owner | PREPARED (doc 16) |
| P-O | On-call person able to run the rollback files during the watch | **OPEN** (named at A1b) |

## 5. Limitations

- The replica does not exercise PostgREST, GoTrue, pooled connections or platform default privileges.
- The replica cannot show callers outside both repositories (U-23).
- The rollback files restore definitions and ACLs exactly as captured on 2026-10-26. If production drifts before A1b, re-run V0 and re-capture; the M1A guard aborts on drift but the rollback files have no guard.
